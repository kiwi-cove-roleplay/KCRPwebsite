#!/usr/bin/env bash
# Installs the portal API as a systemd service on a Linux VPS - same shape
# as the main SFOS repo's services/discord-bot/deploy/install.sh.
#
# Run from anywhere on the VPS:
#   sudo bash portal-api/deploy/install.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_DIR="$REPO_ROOT/portal-api"
SERVICE_NAME="sfos-portal-api"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
RUN_AS_USER="${SUDO_USER:-$(whoami)}"
NODE_PATH="$(command -v node || true)"

if [ "$EUID" -ne 0 ]; then
    echo "Run this with sudo (it writes to /etc/systemd/system)." >&2
    exit 1
fi

if [ -z "$NODE_PATH" ]; then
    echo "node not found on PATH for this shell - install Node.js first." >&2
    exit 1
fi

if [ ! -f "$API_DIR/.env" ]; then
    echo "Missing $API_DIR/.env - copy .env.example and fill it in before installing the service." >&2
    exit 1
fi

if [ ! -f "$API_DIR/dist/index.js" ]; then
    echo "$API_DIR/dist/index.js not found - building now..."
    (cd "$REPO_ROOT" && pnpm --filter sfos-portal-api build)
fi

echo "Installing $SERVICE_FILE (WorkingDirectory=$API_DIR, user=$RUN_AS_USER, node=$NODE_PATH)"
sed \
    -e "s#__REPO_PATH__#$REPO_ROOT#g" \
    -e "s#__NODE_PATH__#$NODE_PATH#g" \
    -e "s#__SERVICE_USER__#$RUN_AS_USER#g" \
    "$SCRIPT_DIR/sfos-portal-api.service" > "$SERVICE_FILE"

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"

echo ""
echo "Installed and started. Useful commands:"
echo "  systemctl status $SERVICE_NAME"
echo "  journalctl -u $SERVICE_NAME -f"
echo "  sudo systemctl restart $SERVICE_NAME   # after a git pull + rebuild"
echo ""
echo "Don't forget to put a reverse proxy with real TLS in front of this"
echo "(see README.md) - the web app calls this over the public internet."
