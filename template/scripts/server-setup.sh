#!/bin/bash
# =============================================================================
# Server Setup Script for Hostinger VPS
# Run this ONCE on the server to set up directories and nginx
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[SETUP]${NC} Setting up Hostinger VPS for Xala apps..."

# Configuration
DOMAIN_BASE="digilist.no"
USER=$(whoami)
BASE_DIR="/home/$USER/domains"

# Subdomains
SUBDOMAINS=("web-test" "backoffice-test" "minside-test")

# Create directories for each subdomain
for subdomain in "${SUBDOMAINS[@]}"; do
    dir="$BASE_DIR/$subdomain.$DOMAIN_BASE/public_html"
    echo -e "${BLUE}[SETUP]${NC} Creating: $dir"
    mkdir -p "$dir"

    # Create placeholder index.html
    cat > "$dir/index.html" << EOF
<!DOCTYPE html>
<html>
<head><title>$subdomain.$DOMAIN_BASE</title></head>
<body>
<h1>$subdomain.$DOMAIN_BASE</h1>
<p>Deployment pending...</p>
</body>
</html>
EOF
done

echo -e "${GREEN}[SUCCESS]${NC} Directories created!"
echo ""
echo "Directory structure:"
ls -la "$BASE_DIR"
echo ""

# Check if nginx is installed
if command -v nginx &> /dev/null; then
    echo -e "${BLUE}[SETUP]${NC} Nginx detected. Copy nginx config:"
    echo ""
    echo "  sudo cp nginx-subdomains.conf /etc/nginx/sites-available/digilist-apps"
    echo "  sudo ln -s /etc/nginx/sites-available/digilist-apps /etc/nginx/sites-enabled/"
    echo "  sudo nginx -t"
    echo "  sudo systemctl reload nginx"
else
    echo -e "${BLUE}[INFO]${NC} Nginx not found. Install with:"
    echo "  sudo apt update && sudo apt install nginx"
fi

echo ""
echo -e "${GREEN}[DONE]${NC} Server setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure A records pointing to this server"
echo "  2. Upload nginx config and enable sites"
echo "  3. Run './scripts/deploy.sh all' from local machine"
echo "  4. Run './scripts/setup-ssl.sh' to set up HTTPS"
