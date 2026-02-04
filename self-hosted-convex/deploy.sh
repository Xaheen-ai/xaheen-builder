#!/bin/bash
# Deploy Self-Hosted Convex to Hostinger VPS
# VPS IP: 31.97.77.81
# Domain: xaheen.io

set -e

echo "🚀 Deploying Self-Hosted Convex to 31.97.77.81..."

# Create deployment directory
ssh root@31.97.77.81 "mkdir -p /opt/convex"

# Copy configuration files
echo "📦 Copying configuration files..."
scp docker-compose.yml root@31.97.77.81:/opt/convex/
scp .env root@31.97.77.81:/opt/convex/
scp Caddyfile root@31.97.77.81:/opt/convex/

# Start services
echo "🐳 Starting Docker services..."
ssh root@31.97.77.81 "cd /opt/convex && docker compose pull && docker compose up -d"

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 10

# Generate admin key
echo "🔑 Generating admin key..."
ssh root@31.97.77.81 "cd /opt/convex && docker compose exec -T backend ./generate_admin_key.sh"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the admin key shown above"
echo "2. Update your local .env.local with:"
echo "   CONVEX_SELF_HOSTED_URL='https://convex-api.xaheen.io'"
echo "   CONVEX_SELF_HOSTED_ADMIN_KEY='<paste-admin-key>'"
echo "   VITE_CONVEX_URL='https://convex-api.xaheen.io'"
echo ""
echo "3. Access dashboard at: https://convex-dashboard.xaheen.io"
echo "4. Run: npx convex dev"
