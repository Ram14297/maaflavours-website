#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Maa Flavours — n8n Server Setup Script
# Run this on your Oracle Cloud VM (Ubuntu 22.04) as:
#   bash setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Maa Flavours — n8n Setup Starting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. System update ──────────────────────────────────────────────────────────
echo "[1/6] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# ── 2. Install Docker ─────────────────────────────────────────────────────────
echo "[2/6] Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# ── 3. Install Docker Compose ─────────────────────────────────────────────────
echo "[3/6] Installing Docker Compose..."
sudo apt-get install -y docker-compose-plugin
docker compose version

# ── 4. Create directories ─────────────────────────────────────────────────────
echo "[4/6] Creating directories..."
mkdir -p /opt/n8n/caddy_data
mkdir -p /opt/n8n/n8n_data

# ── 5. Copy config files ──────────────────────────────────────────────────────
echo "[5/6] Copying config files..."
# These files should be in the same directory as setup.sh
cp docker-compose.yml /opt/n8n/docker-compose.yml
cp Caddyfile /opt/n8n/Caddyfile
cp n8n.env /opt/n8n/.env

# ── 6. Open firewall ports ────────────────────────────────────────────────────
echo "[6/6] Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP  (Caddy needs this for Let's Encrypt)
sudo ufw allow 443/tcp   # HTTPS (n8n will be served here)
sudo ufw --force enable

# ── Oracle Cloud: also open ports in iptables (OCI uses this by default) ──────
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# ── Start n8n ─────────────────────────────────────────────────────────────────
echo "Starting n8n..."
cd /opt/n8n
sudo docker compose up -d

# ── Enable auto-restart on reboot ─────────────────────────────────────────────
echo "Enabling auto-start on reboot..."
sudo systemctl enable docker

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup complete!"
echo "  n8n will be available at:"
echo "  https://n8n.maaflavours.com"
echo ""
echo "  Check status: docker compose -f /opt/n8n/docker-compose.yml ps"
echo "  View logs:    docker compose -f /opt/n8n/docker-compose.yml logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
