#!/bin/bash
# Deploy Self-Hosted Convex to Hostinger VPS
# VPS IP: 72.61.23.56
# Domain: digilist.no

set -e

echo "🚀 Deploying Self-Hosted Convex to 72.61.23.56..."

# Create deployment directory
ssh root@72.61.23.56 "mkdir -p /opt/convex"

# Copy configuration files
echo "📦 Copying configuration files..."
scp docker-compose.yml root@72.61.23.56:/opt/convex/
scp .env root@72.61.23.56:/opt/convex/
scp nginx-convex.conf root@72.61.23.56:/opt/convex/

# Stop existing containers if any
echo "🛑 Stopping existing containers..."
ssh root@72.61.23.56 "cd /opt/convex && docker-compose down 2>/dev/null || true"

# Start services
echo "🐳 Starting Docker services..."
ssh root@72.61.23.56 "cd /opt/convex && docker-compose pull && docker-compose up -d"

# Configure nginx
echo "🔧 Configuring nginx..."
ssh root@72.61.23.56 "cp /opt/convex/nginx-convex.conf /etc/nginx/sites-available/convex && \
    ln -sf /etc/nginx/sites-available/convex /etc/nginx/sites-enabled/convex && \
    nginx -t && systemctl reload nginx"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 15

# Check backend health
echo "🏥 Checking backend health..."
ssh root@72.61.23.56 "curl -sf http://127.0.0.1:3210/health && echo ' Backend healthy!'"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add DNS records (A records) for:"
echo "   - convex-api.digilist.no -> 72.61.23.56"
echo "   - convex.digilist.no -> 72.61.23.56"
echo "   - convex-dashboard.digilist.no -> 72.61.23.56"
echo ""
echo "2. Setup SSL with certbot:"
echo "   ssh root@72.61.23.56 'certbot --nginx -d convex-api.digilist.no -d convex.digilist.no -d convex-dashboard.digilist.no'"
echo ""
echo "3. Update your local .env.local with:"
echo "   CONVEX_URL='https://convex-api.digilist.no'"
echo "   VITE_CONVEX_URL='https://convex-api.digilist.no'"
echo ""
echo "4. Access dashboard at: http://convex-dashboard.digilist.no (or https after SSL)"
echo "5. Run: npx convex dev --url https://convex-api.digilist.no"
