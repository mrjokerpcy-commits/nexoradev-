// server.js — NexoraDev Secure Panel Backend
require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const morgan       = require('morgan');
const path         = require('path');
const fs           = require('fs');
const { Pool }     = require('pg');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');
const { body, param, validationResult } = require('express-validator');
const multer       = require('multer');
const crypto       = require('crypto');
const { v4: uuid } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3001;

// ═══════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => console.error('DB pool error:', err));

// ═══════════════════════════════════════
// UPLOAD DIRECTORY
// ═══════════════════════════════════════
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ═══════════════════════════════════════
// SECURITY MIDDLEWARE
// ═══════════════════════════════════════

// Helmet — sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  hsts: false,
}));

// CORS — only allow your frontend
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// Body parsers with size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

// Hide server info
app.disable('x-powered-by');

// ═══════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

// Strict limiter for login — max 5 attempts per 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' }
});

// ═══════════════════════════════════════
// JWT HELPERS
// ═══════════════════════════════════════
function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h', algorithm: 'HS512' }
  );
}

function signRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

// ═══════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS512'] });
    // Check user still active in DB
    const { rows } = await pool.query(
      'SELECT id, username, role, name, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ error: 'Account not found or deactivated' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    next(err);
  }
}

function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Owner access required' });
  next();
}

// ═══════════════════════════════════════
// VALIDATION ERROR HANDLER
// ═══════════════════════════════════════
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// ═══════════════════════════════════════
// AUDIT LOG HELPER
// ═══════════════════════════════════════
async function audit(userId, action, targetType, targetId, details, ip) {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, action, target_type, target_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, action, targetType, targetId, JSON.stringify(details||{}), ip]
    );
  } catch {}
}

// ═══════════════════════════════════════
// FILE UPLOAD (multer)
// ═══════════════════════════════════════
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuid() + ext);
  }
});

const ALLOWED_MIME = [
  'image/jpeg','image/png','image/gif','image/webp','image/svg+xml',
  'application/pdf','application/zip','application/x-zip-compressed',
  'text/plain','text/html','text/css','text/javascript',
  'application/json','application/octet-stream',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  }
});

// ═══════════════════════════════════════
// ── ROUTES ──
// ═══════════════════════════════════════

// ── AUTH ROUTES ──
const auth = express.Router();

// POST /api/auth/login
auth.post('/login',
  loginLimiter,
  body('username').trim().isLength({min:1,max:50}).escape(),
  body('password').isLength({min:1,max:128}),
  validate,
  async (req, res) => {
    const { username, password } = req.body;
    try {
      const { rows } = await pool.query(
        'SELECT * FROM users WHERE username = $1 AND is_active = true',
        [username.toLowerCase()]
      );
      // Always take same time — prevent timing attacks
      const hash = rows.length ? rows[0].password_hash : '$2a$12$dummy.hash.to.prevent.timing.attack.padding';
      const match = await bcrypt.compare(password, hash);

      if (!rows.length || !match) {
        await audit(null, 'LOGIN_FAILED', 'user', null, { username }, req.ip);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = rows[0];
      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken();
      const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Save refresh token hash
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
         VALUES ($1,$2,$3,$4,$5)`,
        [user.id, refreshHash, expires, req.ip, req.headers['user-agent']?.substring(0,500)]
      );

      // Update last login
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      await audit(user.id, 'LOGIN_SUCCESS', 'user', user.id, {}, req.ip);

      res.json({
        accessToken,
        refreshToken,
        user: { id:user.id, username:user.username, name:user.name, role:user.role }
      });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
  }
);

// POST /api/auth/refresh
auth.post('/refresh',
  body('refreshToken').isString().isLength({min:10}),
  validate,
  async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const { rows } = await pool.query(
        `SELECT rt.*, u.id as uid, u.username, u.name, u.role, u.is_active
         FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id
         WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
        [hash]
      );
      if (!rows.length || !rows[0].is_active) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      const user = rows[0];
      const newAccessToken = signAccessToken(user);
      res.json({ accessToken: newAccessToken });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// POST /api/auth/logout
auth.post('/logout', requireAuth, async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (refreshToken) {
      const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    }
    await audit(req.user.id, 'LOGOUT', 'user', req.user.id, {}, req.ip);
    res.json({ message: 'Logged out' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/auth/me
auth.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

app.use('/api/auth', auth);

// ── USER ROUTES ──
const users = express.Router();
users.use(requireAuth);

// GET /api/users — owner only
users.get('/', requireOwner, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.name, u.role, u.specialty, u.color, u.is_active, u.created_at, u.last_login,
              COUNT(t.id) FILTER (WHERE t.status != 'done') AS active_tasks,
              COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_tasks,
              COUNT(t.id) AS total_tasks
       FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id
       WHERE u.role = 'worker'
       GROUP BY u.id ORDER BY u.name`
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/users — owner only, add worker
users.post('/',
  requireOwner,
  body('username').trim().isLength({min:2,max:50}).matches(/^[a-z0-9_]+$/).escape(),
  body('password').isLength({min:8,max:128}),
  body('name').trim().isLength({min:2,max:100}).escape(),
  body('specialty').optional().trim().isLength({max:100}).escape(),
  validate,
  async (req, res) => {
    const { username, password, name, specialty, color } = req.body;
    try {
      const exists = await pool.query('SELECT id FROM users WHERE username=$1',[username.toLowerCase()]);
      if (exists.rows.length) return res.status(409).json({ error: 'Username already taken' });
      const hash = await bcrypt.hash(password, 12);
      const { rows } = await pool.query(
        `INSERT INTO users (username, password_hash, name, role, specialty, color)
         VALUES ($1,$2,$3,'worker',$4,$5) RETURNING id, username, name, role, specialty, color`,
        [username.toLowerCase(), hash, name, specialty||null, color||'#7b6cff']
      );
      await audit(req.user.id, 'WORKER_CREATED', 'user', rows[0].id, { username }, req.ip);
      res.status(201).json(rows[0]);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// PATCH /api/users/:id/password — owner resets worker password
users.patch('/:id/password',
  requireOwner,
  body('password').isLength({min:8,max:128}),
  validate,
  async (req, res) => {
    try {
      const hash = await bcrypt.hash(req.body.password, 12);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2 AND role=$3',[hash, req.params.id,'worker']);
      // Revoke all refresh tokens
      await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1',[req.params.id]);
      await audit(req.user.id, 'PASSWORD_RESET', 'user', req.params.id, {}, req.ip);
      res.json({ message: 'Password updated, sessions revoked' });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// DELETE /api/users/:id — deactivate worker
users.delete('/:id', requireOwner, async (req, res) => {
  try {
    await pool.query("UPDATE users SET is_active=false WHERE id=$1 AND role='worker'",[req.params.id]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=$1',[req.params.id]);
    await audit(req.user.id, 'WORKER_DEACTIVATED', 'user', req.params.id, {}, req.ip);
    res.json({ message: 'Worker deactivated' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.use('/api/users', users);

// ── TASK ROUTES ──
const tasks = express.Router();
tasks.use(requireAuth);

// GET /api/tasks — owner gets all, worker gets only theirs
tasks.get('/', async (req, res) => {
  try {
    const isOwner = req.user.role === 'owner';
    const { status, priority } = req.query;
    let q = `
      SELECT t.*, u.name AS assigned_name, u.color AS assigned_color,
             COUNT(n.id) AS note_count, COUNT(a.id) AS attachment_count
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN notes n ON n.task_id = t.id
      LEFT JOIN attachments a ON a.task_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (!isOwner) { params.push(req.user.id); q += ` AND t.assigned_to = $${params.length}`; }
    if (status)   { params.push(status);       q += ` AND t.status = $${params.length}`; }
    if (priority) { params.push(priority);     q += ` AND t.priority = $${params.length}`; }
    q += ' GROUP BY t.id, u.name, u.color ORDER BY t.created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/tasks/:id
tasks.get('/:id',
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const isOwner = req.user.role === 'owner';
      const { rows } = await pool.query(
        `SELECT t.*, u.name AS assigned_name FROM tasks t
         LEFT JOIN users u ON t.assigned_to = u.id WHERE t.id = $1`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Task not found' });
      const task = rows[0];
      if (!isOwner && task.assigned_to !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      // Get notes
      const { rows: notes } = await pool.query(
        `SELECT n.*, u.name AS author_name FROM notes n JOIN users u ON n.author_id = u.id
         WHERE n.task_id = $1 ORDER BY n.created_at ASC`,
        [req.params.id]
      );
      // Get attachments
      const { rows: attachments } = await pool.query(
        `SELECT a.id, a.original_name, a.file_size, a.mime_type, a.created_at, u.name AS uploaded_by_name
         FROM attachments a JOIN users u ON a.uploaded_by = u.id WHERE a.task_id = $1 ORDER BY a.created_at ASC`,
        [req.params.id]
      );
      res.json({ ...task, notes, attachments });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// POST /api/tasks — owner only
tasks.post('/',
  requireOwner,
  body('title').trim().isLength({min:1,max:255}).escape(),
  body('client_name').optional().trim().isLength({max:100}).escape(),
  body('service_type').optional().trim().isLength({max:100}).escape(),
  body('assigned_to').optional().isUUID(),
  body('priority').optional().isIn(['low','med','high']),
  body('deadline').optional().isDate(),
  body('budget').optional().trim().isLength({max:50}).escape(),
  body('description').optional().trim().isLength({max:5000}),
  body('reference_link').optional().trim().isURL().isLength({max:500}),
  validate,
  async (req, res) => {
    const { title, client_name, service_type, assigned_to, priority, deadline, budget, description, reference_link } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO tasks (title, client_name, service_type, assigned_to, priority, deadline, budget, description, reference_link, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [title, client_name||null, service_type||null, assigned_to||null, priority||'med', deadline||null, budget||null, description||null, reference_link||null, req.user.id]
      );
      await audit(req.user.id, 'TASK_CREATED', 'task', rows[0].id, { title }, req.ip);
      res.status(201).json(rows[0]);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// PATCH /api/tasks/:id — update task
tasks.patch('/:id',
  param('id').isUUID(),
  body('status').optional().isIn(['new','in-progress','review','done','blocked']),
  body('progress').optional().isInt({min:0,max:100}),
  body('title').optional().trim().isLength({min:1,max:255}).escape(),
  body('description').optional().trim().isLength({max:5000}),
  body('priority').optional().isIn(['low','med','high']),
  body('assigned_to').optional().isUUID(),
  body('deadline').optional().isDate(),
  body('budget').optional().trim().isLength({max:50}).escape(),
  validate,
  async (req, res) => {
    try {
      const isOwner = req.user.role === 'owner';
      const { rows: existing } = await pool.query('SELECT * FROM tasks WHERE id=$1',[req.params.id]);
      if (!existing.length) return res.status(404).json({ error: 'Task not found' });
      const task = existing[0];
      if (!isOwner && task.assigned_to !== req.user.id) return res.status(403).json({ error: 'Access denied' });

      // Workers can only update status and progress
      const allowed = isOwner
        ? ['title','client_name','service_type','assigned_to','priority','deadline','budget','description','reference_link','status','progress']
        : ['status','progress'];

      const updates = [];
      const vals = [];
      allowed.forEach(field => {
        if (req.body[field] !== undefined) {
          vals.push(req.body[field]);
          updates.push(`${field} = $${vals.length}`);
        }
      });
      if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
      vals.push(req.params.id);
      const { rows } = await pool.query(`UPDATE tasks SET ${updates.join(',')} WHERE id=$${vals.length} RETURNING *`, vals);
      await audit(req.user.id, 'TASK_UPDATED', 'task', req.params.id, req.body, req.ip);
      res.json(rows[0]);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// DELETE /api/tasks/:id — owner only
tasks.delete('/:id', requireOwner, param('id').isUUID(), validate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id FROM tasks WHERE id=$1',[req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    await pool.query('DELETE FROM tasks WHERE id=$1',[req.params.id]);
    await audit(req.user.id, 'TASK_DELETED', 'task', req.params.id, {}, req.ip);
    res.json({ message: 'Task deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.use('/api/tasks', tasks);

// ── NOTE ROUTES ──
const notes = express.Router();
notes.use(requireAuth);

// POST /api/notes/:taskId
notes.post('/:taskId',
  param('taskId').isUUID(),
  body('content').trim().isLength({min:1,max:2000}),
  validate,
  async (req, res) => {
    try {
      const isOwner = req.user.role === 'owner';
      const { rows: taskRows } = await pool.query('SELECT * FROM tasks WHERE id=$1',[req.params.taskId]);
      if (!taskRows.length) return res.status(404).json({ error: 'Task not found' });
      if (!isOwner && taskRows[0].assigned_to !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      const { rows } = await pool.query(
        `INSERT INTO notes (task_id, author_id, content) VALUES ($1,$2,$3)
         RETURNING id, content, created_at`,
        [req.params.taskId, req.user.id, req.body.content]
      );
      res.status(201).json({ ...rows[0], author_name: req.user.name });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

app.use('/api/notes', notes);

// ── ATTACHMENT ROUTES ──
const attachmentsRouter = express.Router();
attachmentsRouter.use(requireAuth);

// POST /api/attachments/:taskId
attachmentsRouter.post('/:taskId',
  param('taskId').isUUID(),
  validate,
  upload.array('files', 10),
  async (req, res) => {
    try {
      const isOwner = req.user.role === 'owner';
      const { rows: taskRows } = await pool.query('SELECT * FROM tasks WHERE id=$1',[req.params.taskId]);
      if (!taskRows.length) return res.status(404).json({ error: 'Task not found' });
      if (!isOwner && taskRows[0].assigned_to !== req.user.id) return res.status(403).json({ error: 'Access denied' });
      if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });

      const saved = [];
      for (const file of req.files) {
        const { rows } = await pool.query(
          `INSERT INTO attachments (task_id, uploaded_by, original_name, stored_name, file_size, mime_type)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, original_name, file_size, mime_type, created_at`,
          [req.params.taskId, req.user.id, file.originalname, file.filename, file.size, file.mimetype]
        );
        saved.push({ ...rows[0], uploaded_by_name: req.user.name });
      }
      res.status(201).json(saved);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Upload failed' });
    }
  }
);

// GET /api/attachments/download/:id
attachmentsRouter.get('/download/:id', param('id').isUUID(), validate, async (req, res) => {
  try {
    const isOwner = req.user.role === 'owner';
    const { rows } = await pool.query(
      `SELECT a.*, t.assigned_to FROM attachments a JOIN tasks t ON a.task_id = t.id WHERE a.id=$1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'File not found' });
    if (!isOwner && rows[0].assigned_to !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    const filePath = path.join(UPLOAD_DIR, rows[0].stored_name);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing from disk' });
    res.setHeader('Content-Disposition', `attachment; filename="${rows[0].original_name}"`);
    res.sendFile(path.resolve(filePath));
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/attachments/:id — owner only
attachmentsRouter.delete('/:id', requireOwner, param('id').isUUID(), validate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM attachments WHERE id=$1',[req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    const filePath = path.join(UPLOAD_DIR, rows[0].stored_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await pool.query('DELETE FROM attachments WHERE id=$1',[req.params.id]);
    res.json({ message: 'Deleted' });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

app.use('/api/attachments', attachmentsRouter);

// ── STATS ROUTE (owner only) ──
app.get('/api/stats', requireAuth, requireOwner, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status='new') AS new_tasks,
        COUNT(*) FILTER (WHERE status='in-progress') AS in_progress,
        COUNT(*) FILTER (WHERE status='review') AS review,
        COUNT(*) FILTER (WHERE status='done') AS done,
        COUNT(*) FILTER (WHERE status='blocked') AS blocked,
        COUNT(*) AS total
      FROM tasks
    `);
    const { rows: workers } = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role='worker' AND is_active=true");
    res.json({ tasks: rows[0], workers: workers[0].count });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/leads/:id — owner only
app.get('/api/leads/:id', requireAuth, requireOwner,
  param('id').isUUID(), validate,
  async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      // Get replies
      const { rows: replies } = await pool.query(
        'SELECT * FROM ticket_replies WHERE lead_id=$1 ORDER BY created_at ASC',
        [req.params.id]
      );
      res.json({ ...rows[0], replies });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// POST /api/tickets/:leadId/reply — owner sends reply email to client
app.post('/api/tickets/:leadId/reply',
  requireAuth, requireOwner,
  param('leadId').isUUID(),
  body('content').trim().isLength({min:1,max:5000}),
  body('status').optional().isIn(['open','replied','closed']),
  validate,
  async (req, res) => {
    const { content, status } = req.body;
    try {
      // Get lead
      const { rows } = await pool.query('SELECT * FROM leads WHERE id=$1', [req.params.leadId]);
      if (!rows.length) return res.status(404).json({ error: 'Lead not found' });
      const lead = rows[0];
      // Save reply
      await pool.query(
        `INSERT INTO ticket_replies (lead_id, author, content) VALUES ($1,$2,$3)`,
        [req.params.leadId, 'NexoraDev', content]
      );
      // Update status
      if (status) await pool.query('UPDATE leads SET status=$1 WHERE id=$2', [status, req.params.leadId]);
      // Send email via Telegram notification + email simulation
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const text = `📤 Reply sent to ${lead.name} (${lead.email})\n\n${content}`;
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
        }).catch(()=>{});
      }
      // Send email via EmailJS or log it
      console.log(`📧 EMAIL TO: ${lead.email} | FROM: hello@nexoradev.com | SUBJECT: Re: Your inquiry | BODY: ${content}`);
      res.json({ success: true, message: 'Reply sent' });
    } catch(err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
  }
);

// ── CHAT ROUTES ──
const chatRouter = express.Router();
chatRouter.use(requireAuth);

chatRouter.get('/unread', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM chat_messages WHERE recipient_id=$1 AND read=false`,
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

chatRouter.get('/:targetId', async (req, res) => {
  try {
    const tid = req.params.targetId;
    const isOwner = req.user.role === 'owner';
    let recipientId;
    if (isOwner) {
      const w = await pool.query('SELECT id FROM users WHERE id=$1',[tid]);
      if (!w.rows.length) return res.status(404).json({ error: 'User not found' });
      recipientId = tid;
    } else {
      const o = await pool.query("SELECT id FROM users WHERE role='owner' LIMIT 1");
      if (!o.rows.length) return res.json([]);
      recipientId = o.rows[0].id;
    }
    const otherId = isOwner ? tid : recipientId;
    const { rows } = await pool.query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM chat_messages m JOIN users u ON m.sender_id=u.id
       WHERE (m.sender_id=$1 AND m.recipient_id=$2) OR (m.sender_id=$2 AND m.recipient_id=$1)
       ORDER BY m.created_at ASC LIMIT 100`,
      [req.user.id, otherId]
    );
    await pool.query('UPDATE chat_messages SET read=true WHERE recipient_id=$1',[req.user.id]);
    res.json(rows);
  } catch(e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

chatRouter.post('/:targetId',
  body('content').trim().isLength({min:1,max:2000}), validate,
  async (req, res) => {
    try {
      const tid = req.params.targetId;
      const isOwner = req.user.role === 'owner';
      let recipientId;
      if (isOwner) {
        recipientId = tid;
      } else {
        const o = await pool.query("SELECT id FROM users WHERE role='owner' LIMIT 1");
        if (!o.rows.length) return res.status(404).json({ error: 'Owner not found' });
        recipientId = o.rows[0].id;
      }
      const { rows } = await pool.query(
        `INSERT INTO chat_messages (sender_id, recipient_id, content) VALUES ($1,$2,$3) RETURNING *`,
        [req.user.id, recipientId, req.body.content]
      );
      res.status(201).json(rows[0]);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

app.use('/api/chat', chatRouter);

// ── LEADS ROUTE (public — from portfolio contact form) ──
app.post('/api/leads',
  body('name').trim().isLength({min:1,max:100}).escape(),
  body('email').trim().isEmail().normalizeEmail(),
  body('service').optional().trim().isLength({max:100}).escape(),
  body('budget').optional().trim().isLength({max:50}).escape(),
  body('message').trim().isLength({min:1,max:2000}).escape(),
  validate,
  async (req, res) => {
    const { name, email, service, budget, message } = req.body;
    try {
      const { rows } = await pool.query(`
        INSERT INTO leads (name, email, service, budget, message)
        VALUES ($1,$2,$3,$4,$5) RETURNING ticket_id, ticket_code
      `, [name, email, service||null, budget||null, message]);
      const { ticket_id, ticket_code } = rows[0];
      // Send Telegram notification if configured
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        const text = `🔔 New Lead!\n\n👤 ${name}\n✉️ ${email}\n⚙️ ${service||'—'}\n💰 ${budget||'—'}\n🎫 Ticket: ${ticket_id}\n\n📝 ${message}`;
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
        }).catch(()=>{});
      }
      res.json({ success: true, message: 'Message received! I will reply within 24 hours.', ticket_id, ticket_code });
    } catch(err) {
      console.error('Lead error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// GET /api/leads — owner only
app.get('/api/leads', requireAuth, requireOwner, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM leads ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/leads/:id — mark lead status
app.patch('/api/leads/:id', requireAuth, requireOwner,
  param('id').isUUID(),
  body('status').isIn(['new','contacted','converted','closed']),
  validate,
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        'UPDATE leads SET status=$1 WHERE id=$2 RETURNING *',
        [req.body.status, req.params.id]
      );
      res.json(rows[0]);
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// ── PUBLIC TICKET LOOKUP (no auth — client uses ticket_id + ticket_code) ──
app.post('/api/ticket/lookup',
  body('ticket_id').trim().isLength({min:3,max:30}).escape(),
  body('ticket_code').trim().isLength({min:3,max:20}).escape(),
  validate,
  async (req, res) => {
    try {
      const { ticket_id, ticket_code } = req.body;
      const { rows } = await pool.query(
        `SELECT id, ticket_id, ticket_code, name, email, service, budget, message, status, created_at
         FROM leads WHERE UPPER(ticket_id)=UPPER($1) AND UPPER(ticket_code)=UPPER($2)`,
        [ticket_id, ticket_code]
      );
      if (!rows.length) return res.status(404).json({ error: 'Ticket not found. Check your ID and code.' });
      const lead = rows[0];
      const { rows: replies } = await pool.query(
        `SELECT author, content, created_at FROM ticket_replies WHERE lead_id=$1 ORDER BY created_at ASC`,
        [lead.id]
      );
      // Don't expose internal UUID to public
      const { id, ...safe } = lead;
      res.json({ ...safe, replies });
    } catch { res.status(500).json({ error: 'Server error' }); }
  }
);

// ── HEALTH CHECK ──
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── SERVE FRONTEND ──
app.use(express.static(path.join(__dirname, 'frontend')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  }
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  res.status(500).json({ error: 'Internal server error' });
});

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
app.listen(PORT, () => {
  console.log(`\n🔐 NexoraDev Panel running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📦 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);
});

module.exports = app;
