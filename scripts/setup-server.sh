#!/bin/bash
# ── StudyHub VPS Setup Script ─────────────────────────────────────────────────
# Run once on a fresh Ubuntu 22.04 / 24.04 VPS:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/studyhub/main/scripts/setup-server.sh | bash
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "=== StudyHub Server Setup ==="

# 1. Update system
apt-get update && apt-get upgrade -y

# 2. Install Docker
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. Enable Docker
systemctl enable docker
systemctl start docker

# 4. Clone repo
mkdir -p /opt/studyhub
cd /opt/studyhub

if [ ! -d ".git" ]; then
  git clone https://github.com/YOUR_ORG/studyhub.git .
fi

# 5. Create .env files
echo ""
echo "=== Environment Setup ==="
echo "Create /opt/studyhub/.env with your Vite frontend variables:"
echo "  VITE_BASE_URL=https://studyhub.kz"
echo "  VITE_YM_ID=108249103"
echo ""
echo "Create /opt/studyhub/docker-compose.env (or add to docker-compose.yml environment):"
echo "  DB_PASSWORD=your_strong_password"
echo "  JWT_SECRET=\$(openssl rand -base64 32)"
echo "  TELEGRAM_BOT_TOKEN=..."
echo "  ANTHROPIC_API_KEY=..."
echo ""
echo "Then run:"
echo "  cd /opt/studyhub && docker compose up -d --build"

# 6. UFW Firewall
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

echo ""
echo "=== Setup complete! ==="
echo "Next: configure .env and run 'docker compose up -d --build'"
