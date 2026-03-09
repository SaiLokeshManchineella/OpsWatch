#!/bin/bash

# ==============================================================================
# OpsWatch Pro - Interactive EC2 Deployment Script
# This script configures environment variables and starts the Docker containers.
# ==============================================================================

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Welcome to the OpsWatch EC2 Deployment Wizard!"
echo "----------------------------------------------------"
echo "This script will configure your environment and start the application."
echo ""

# 1. Ask for required variables via prompts
read -p "1. Enter this EC2 Instance's Public IP Address (e.g. 54.123.45.67): " EC2_IP
if [[ -z "$EC2_IP" ]]; then
    echo "Error: IP Address cannot be empty."
    exit 1
fi

read -p "2. Enter your PostreSQL/Supabase Database URL (starts with postgresql://): " DB_URL
if [[ -z "$DB_URL" ]]; then
    echo "Error: Database URL cannot be empty."
    exit 1
fi

read -p "3. Enter a JWT Secret Key (or press Enter to use a default generated one): " JWT_SECRET
if [[ -z "$JWT_SECRET" ]]; then
    # Generate a random 64-character hex string as a fallback
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "4e8f1b2c9a3d7e6f0b5a8c1d4e2f9b0a5c7d8e1f2a6b3c0d9e8f7a6b5c4d3e2f")
    echo "   -> Using generated default secret."
fi

echo ""
echo "⚙️ Configuring environment files..."

# 2. Configure Frontend .env
cat <<EOF > .env
VITE_API_URL=http://$EC2_IP:8000/api/v1
EOF
echo "   ✅ Frontend .env created."

# 3. Configure Backend .env
cat <<EOF > backend/.env
DATABASE_URL=$DB_URL
JWT_SECRET_KEY=$JWT_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_DAYS=7
PORT=8000
NODE_ENV=production
CORS_ORIGINS=http://$EC2_IP,http://localhost:5173
EOF
echo "   ✅ Backend .env created."

echo ""
echo "🐳 Starting Docker containers..."

# 4. Export the VITE_API_URL for docker-compose build context
export VITE_API_URL="http://$EC2_IP:8000/api/v1"

# 5. Build and bring up the containers
docker-compose up --build -d

echo ""
echo "🎉 Deployment successful!"
echo "----------------------------------------------------"
echo "🌐 Frontend URL: http://$EC2_IP"
echo "🔌 Backend API:  http://$EC2_IP:8000/api/v1/insights"
echo ""
echo "To view live logs, run: docker-compose logs -f"
