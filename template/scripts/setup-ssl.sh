#!/bin/bash
# =============================================================================
# SSL Setup Script for Hostinger Subdomains
# Uses Let's Encrypt with Certbot
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load configuration
if [ -f "$SCRIPT_DIR/deploy-config.sh" ]; then
    source "$SCRIPT_DIR/deploy-config.sh"
else
    echo -e "${RED}Error: deploy-config.sh not found!${NC}"
    exit 1
fi

print_status() {
    echo -e "${BLUE}[SSL]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# SSH into Hostinger and run certbot
setup_ssl() {
    print_status "Connecting to Hostinger to setup SSL..."

    ssh -t -p "$HOSTINGER_PORT" "$HOSTINGER_USER@$HOSTINGER_HOST" << 'REMOTE_SCRIPT'
# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Get domains from environment or use defaults
WEB_DOMAIN="${WEB_SUBDOMAIN:-web-test}.${DOMAIN_BASE:-digilist.no}"
BACKOFFICE_DOMAIN="${BACKOFFICE_SUBDOMAIN:-backoffice-test}.${DOMAIN_BASE:-digilist.no}"
MINSIDE_DOMAIN="${MINSIDE_SUBDOMAIN:-minside-test}.${DOMAIN_BASE:-digilist.no}"

echo "Setting up SSL for:"
echo "  - $WEB_DOMAIN"
echo "  - $BACKOFFICE_DOMAIN"
echo "  - $MINSIDE_DOMAIN"

# Request certificates
sudo certbot --nginx -d "$WEB_DOMAIN" -d "$BACKOFFICE_DOMAIN" -d "$MINSIDE_DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email admin@digilist.no \
    --redirect

echo "SSL setup complete!"
REMOTE_SCRIPT

    print_success "SSL certificates installed!"
    echo ""
    echo "Your sites are now available via HTTPS:"
    echo "  - https://${WEB_SUBDOMAIN}.${DOMAIN_BASE}"
    echo "  - https://${BACKOFFICE_SUBDOMAIN}.${DOMAIN_BASE}"
    echo "  - https://${MINSIDE_SUBDOMAIN}.${DOMAIN_BASE}"
}

# Main
main() {
    print_status "SSL Setup for Hostinger Subdomains"
    echo ""
    print_warning "This script requires:"
    echo "  1. Sudo access on the Hostinger VPS"
    echo "  2. Nginx installed as web server"
    echo "  3. A records already pointing to server IP"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    else
        echo "Aborted."
        exit 0
    fi
}

main "$@"
