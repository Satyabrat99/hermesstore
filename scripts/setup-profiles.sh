#!/bin/bash
# HermesStore — Profile Setup Script
# Creates and configures all 4 Hermes profiles for the ecommerce store

set -e

echo "🚀 HermesStore Profile Setup"
echo "============================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if ! command -v hermes &> /dev/null; then
    echo -e "${RED}❌ hermes command not found. Install Hermes Agent first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Hermes Agent found${NC}"
echo ""

BRAIN_KEY=$(openssl rand -hex 32)
STOREOPS_KEY=$(openssl rand -hex 32)
MARKETING_KEY=$(openssl rand -hex 32)
CUSTOMER_KEY=$(openssl rand -hex 32)

declare -A PROFILES
PROFILES[hermesstore-brain]="8642"
PROFILES[hermesstore-storeops]="8643"
PROFILES[hermesstore-marketing]="8644"
PROFILES[hermesstore-customer-brand]="8645"

declare -A KEYS
KEYS[hermesstore-brain]=$BRAIN_KEY
KEYS[hermesstore-storeops]=$STOREOPS_KEY
KEYS[hermesstore-marketing]=$MARKETING_KEY
KEYS[hermesstore-customer-brand]=$CUSTOMER_KEY

for profile in "${!PROFILES[@]}"; do
    port="${PROFILES[$profile]}"
    key="${KEYS[$profile]}"

    echo "📦 Creating profile: $profile (port $port)"

    hermes profile create "$profile" 2>/dev/null || echo "  (already exists)"

    PROFILE_DIR="$HOME/.hermes/profiles/$profile"
    ENV_FILE="$PROFILE_DIR/.env"

    cat > "$ENV_FILE" << EOF
# HermesStore — $profile
API_SERVER_ENABLED=true
API_SERVER_KEY=$key
API_SERVER_PORT=$port
API_SERVER_HOST=127.0.0.1

# Model (set your OpenAI key here)
# OPENAI_API_KEY=sk-xxx
# OPENAI_MODEL=gpt-4o

# Shopify (set for storeops, marketing, customer-brand)
# SHOPIFY_STORE_DOMAIN=hermesstore-demo.myshopify.com
# SHOPIFY_CLIENT_ID=xxx
# SHOPIFY_CLIENT_SECRET=xxx
EOF

    echo -e "  ${GREEN}✅ Profile created${NC}"
    echo "  📁 Config: $ENV_FILE"
    echo "  🔑 API Key: ${key:0:16}..."
    echo ""
done

echo "📋 Copying skills to profiles..."

SKILLS_DIR="$(dirname "$0")/../skills"

if [ -d "$SKILLS_DIR" ]; then
    for profile in hermesstore-storeops hermesstore-marketing hermesstore-customer-brand; do
        PROFILE_SKILLS="$HOME/.hermes/profiles/$profile/skills"
        mkdir -p "$PROFILE_SKILLS"
        cp "$SKILLS_DIR"/*.md "$PROFILE_SKILLS/" 2>/dev/null || true
        echo "  ✅ Skills copied to $profile"
    done
fi

echo ""
echo "============================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit each profile's .env file with your API keys"
echo "2. Start the gateways: bash scripts/start-gateways.sh"
echo "3. Test: curl http://localhost:8642/health"
echo ""
echo "API Keys (save these!):"
echo "  Brain:     $BRAIN_KEY"
echo "  StoreOps:  $STOREOPS_KEY"
echo "  Marketing: $MARKETING_KEY"
echo "  Customer:  $CUSTOMER_KEY"
