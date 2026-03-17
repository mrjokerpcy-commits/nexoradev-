// setup.js — Run once to initialize database
// Usage: node setup.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setup() {
  console.log('🔧 Setting up NexoraDev Panel database...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // ── USERS TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('owner','worker')),
        specialty VARCHAR(100),
        color VARCHAR(20) DEFAULT '#7b6cff',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_login TIMESTAMPTZ
      );
    `);

    // ── REFRESH TOKENS TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        ip_address VARCHAR(45),
        user_agent TEXT
      );
    `);

    // ── TASKS TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(100),
        service_type VARCHAR(100),
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        priority VARCHAR(10) DEFAULT 'med' CHECK (priority IN ('low','med','high')),
        deadline DATE,
        budget VARCHAR(50),
        description TEXT,
        reference_link VARCHAR(500),
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new','in-progress','review','done','blocked')),
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── NOTES TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── ATTACHMENTS TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        original_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── AUDIT LOG TABLE ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id UUID,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ── INDEXES ──
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notes_task ON notes(task_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_attachments_task ON attachments(task_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);`);

    // ── UPDATED_AT TRIGGER ──
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_tasks_updated ON tasks;
      CREATE TRIGGER trigger_tasks_updated
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);

    // ── CREATE OWNER ACCOUNT ──
    const ownerExists = await client.query(`SELECT id FROM users WHERE username = $1`, [process.env.OWNER_USERNAME]);
    if (!ownerExists.rows.length) {
      const hash = await bcrypt.hash(process.env.OWNER_PASSWORD, 12);
      await client.query(`
        INSERT INTO users (username, password_hash, name, role, color)
        VALUES ($1, $2, 'Owner', 'owner', '#00f0a0')
      `, [process.env.OWNER_USERNAME, hash]);
      console.log(`✅ Owner account created: ${process.env.OWNER_USERNAME}`);
    } else {
      console.log(`ℹ️  Owner account already exists`);
    }

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully');
    console.log('✅ Indexes created');
    console.log('✅ Triggers created');
    console.log('\n🚀 Setup complete! Run: npm start\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
