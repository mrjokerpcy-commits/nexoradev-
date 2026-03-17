# NexoraDev Panel — Deployment Guide
# =====================================
# Follow these steps IN ORDER on your VPS

# ─────────────────────────────────────────
# STEP 1 — Upload files to your VPS
# ─────────────────────────────────────────
# On your LOCAL machine, run:
scp -r nexora-panel/ root@YOUR_SERVER_IP:/opt/nexora-panel

# ─────────────────────────────────────────
# STEP 2 — Install dependencies on VPS
# ─────────────────────────────────────────
# SSH into your VPS first:
ssh root@YOUR_SERVER_IP

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# ─────────────────────────────────────────
# STEP 3 — Setup PostgreSQL
# ─────────────────────────────────────────
sudo -u postgres psql << 'EOF'
CREATE USER nexora_user WITH PASSWORD 'CHOOSE_STRONG_PASSWORD_HERE';
CREATE DATABASE nexora_panel OWNER nexora_user;
GRANT ALL PRIVILEGES ON DATABASE nexora_panel TO nexora_user;
\q
EOF

# ─────────────────────────────────────────
# STEP 4 — Configure environment
# ─────────────────────────────────────────
cd /opt/nexora-panel/backend
cp .env.example .env
nano .env
# Fill in ALL values — especially:
#   DB_PASSWORD (same as what you set above)
#   JWT_SECRET (run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
#   OWNER_PASSWORD (strong password for your owner account)
#   FRONTEND_URL (your domain e.g. https://panel.nexoradev.com)

# ─────────────────────────────────────────
# STEP 5 — Install & Setup
# ─────────────────────────────────────────
cd /opt/nexora-panel/backend
npm install
node setup.js
# Should print: ✅ Setup complete!

# ─────────────────────────────────────────
# STEP 6 — Start with PM2
# ─────────────────────────────────────────
pm2 start server.js --name nexora-panel --env production
pm2 save
pm2 startup
# Run the command PM2 prints to make it start on reboot

# Check it's running:
pm2 status
pm2 logs nexora-panel --lines 20

# ─────────────────────────────────────────
# STEP 7 — Nginx + SSL
# ─────────────────────────────────────────
# Copy nginx config
sudo cp /opt/nexora-panel/nginx.conf /etc/nginx/sites-available/nexora-panel
sudo ln -s /etc/nginx/sites-available/nexora-panel /etc/nginx/sites-enabled/
sudo nginx -t   # Should say: syntax is ok

# Get SSL certificate (free, from Let's Encrypt)
sudo certbot --nginx -d panel.nexoradev.com
# Follow prompts — it fills in the SSL paths automatically

# Reload nginx
sudo systemctl reload nginx

# ─────────────────────────────────────────
# STEP 8 — Firewall
# ─────────────────────────────────────────
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw deny 3001   # Block direct Node.js port — only nginx accesses it
sudo ufw enable
sudo ufw status

# ─────────────────────────────────────────
# STEP 9 — Test
# ─────────────────────────────────────────
# Visit: https://panel.nexoradev.com
# Login with: owner / (your OWNER_PASSWORD from .env)

# ─────────────────────────────────────────
# USEFUL COMMANDS
# ─────────────────────────────────────────
pm2 restart nexora-panel     # Restart the server
pm2 logs nexora-panel        # View live logs
pm2 stop nexora-panel        # Stop
sudo nginx -t && sudo systemctl reload nginx   # Reload nginx after config change
sudo -u postgres psql nexora_panel             # Access database directly
