# PROMPT 10: Hermes Profile Setup Script + E2E Verification

> Feed this to Command Code after Prompt 9 is verified.

---

In C:\Users\satya\HermesStore, create a setup script that creates all 4 Hermes profiles, configures them, and starts the gateways. Also create an E2E test script.

## Context

Read C:\Users\satya\HermesStore\CONTEXT.md for project context.

We need 4 Hermes profiles:
- hermesstore-brain (port 8642) — orchestrator
- hermesstore-storeops (port 8643) — products, pricing, inventory
- hermesstore-marketing (port 8644) — social, content, promos
- hermesstore-customer-brand (port 8645) — support, copywriting, brand

## What to Build

### 1. Create setup script

Create `scripts/setup-profiles.sh`:

```bash
#!/bin/bash
# HermesStore — Profile Setup Script
# Creates and configures all 4 Hermes profiles for the ecommerce store

set -e

echo "🚀 HermesStore Profile Setup"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check hermes is installed
if ! command -v hermes &> /dev/null; then
    echo -e "${RED}❌ hermes command not found. Install Hermes Agent first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Hermes Agent found${NC}"
echo ""

# Generate API keys
BRAIN_KEY=$(openssl rand -hex 32)
STOREOPS_KEY=$(openssl rand -hex 32)
MARKETING_KEY=$(openssl rand -hex 32)
CUSTOMER_KEY=$(openssl rand -hex 32)

# Profile definitions
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

# Create profiles
for profile in "${!PROFILES[@]}"; do
    port="${PROFILES[$profile]}"
    key="${KEYS[$profile]}"

    echo "📦 Creating profile: $profile (port $port)"

    # Create profile
    hermes profile create "$profile" 2>/dev/null || echo "  (already exists)"

    # Configure .env
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

# Copy skills to profiles
echo "📋 Copying skills to profiles..."

SKILLS_DIR="$(dirname "$0")/../skills"

# StoreOps skills
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
echo "1. Edit each profile's .env file with your API keys:"
echo "   - OPENAI_API_KEY (for AI)"
echo "   - SHOPIFY_* credentials (for store operations)"
echo ""
echo "2. Start the gateways:"
echo "   hermes -p hermesstore-brain gateway"
echo "   hermes -p hermesstore-storeops gateway"
echo "   hermes -p hermesstore-marketing gateway"
echo "   hermes -p hermesstore-customer-brand gateway"
echo ""
echo "3. Or run all at once:"
echo "   bash scripts/start-gateways.sh"
echo ""
echo "4. Test the brain:"
echo "   curl http://localhost:8642/health"
echo ""
echo "API Keys (save these!):"
echo "  Brain:     $BRAIN_KEY"
echo "  StoreOps:  $STOREOPS_KEY"
echo "  Marketing: $MARKETING_KEY"
echo "  Customer:  $CUSTOMER_KEY"
```

### 2. Create gateway start script

Create `scripts/start-gateways.sh`:

```bash
#!/bin/bash
# Start all 4 Hermes gateways for HermesStore

echo "🚀 Starting HermesStore gateways..."
echo ""

# Kill any existing gateways on these ports
for port in 8642 8643 8644 8645; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "⚠️  Killing existing process on port $port (PID: $pid)"
        kill $pid 2>/dev/null
    fi
done

sleep 1

# Start gateways
echo "Starting brain (port 8642)..."
hermes -p hermesstore-brain gateway &
BRAIN_PID=$!

echo "Starting storeops (port 8643)..."
hermes -p hermesstore-storeops gateway &
STOREOPS_PID=$!

echo "Starting marketing (port 8644)..."
hermes -p hermesstore-marketing gateway &
MARKETING_PID=$!

echo "Starting customer-brand (port 8645)..."
hermes -p hermesstore-customer-brand gateway &
CUSTOMER_PID=$!

sleep 5

echo ""
echo "✅ All gateways started!"
echo ""
echo "Ports:"
echo "  Brain:          http://localhost:8642"
echo "  StoreOps:       http://localhost:8643"
echo "  Marketing:      http://localhost:8644"
echo "  Customer-Brand: http://localhost:8645"
echo ""
echo "PIDs: $BRAIN_PID, $STOREOPS_PID, $MARKETING_PID, $CUSTOMER_PID"
echo ""
echo "To stop all: kill $BRAIN_PID $STOREOPS_PID $MARKETING_PID $CUSTOMER_PID"
echo ""
echo "Health checks:"
for port in 8642 8643 8644 8645; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health 2>/dev/null || echo "000")
    if [ "$status" = "200" ]; then
        echo "  ✅ Port $port: healthy"
    else
        echo "  ❌ Port $port: not responding (may still be starting)"
    fi
done

# Keep script running
wait
```

### 3. Create E2E test script

Create `scripts/test-e2e.sh`:

```bash
#!/bin/bash
# HermesStore — End-to-End Test Script
# Tests the complete flow: chat → product → pricing → landing page

set -e

echo "🧪 HermesStore E2E Test"
echo "========================"
echo ""

BRAIN_URL="http://localhost:8642"
BRAIN_KEY=$(grep API_SERVER_KEY "$HOME/.hermes/profiles/hermesstore-brain/.env" | cut -d= -f2)

if [ -z "$BRAIN_KEY" ]; then
    echo "❌ Could not read brain API key. Run setup-profiles.sh first."
    exit 1
fi

# Test 1: Health check
echo "Test 1: Health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BRAIN_URL/health")
if [ "$STATUS" = "200" ]; then
    echo "  ✅ Brain is healthy"
else
    echo "  ❌ Brain not responding (status: $STATUS)"
    echo "  Start gateways first: bash scripts/start-gateways.sh"
    exit 1
fi

# Test 2: Model discovery
echo "Test 2: Model discovery..."
MODELS=$(curl -s "$BRAIN_URL/v1/models" -H "Authorization: Bearer $BRAIN_KEY")
if echo "$MODELS" | grep -q "hermes"; then
    echo "  ✅ Models available"
else
    echo "  ❌ No models found"
fi

# Test 3: Chat completion
echo "Test 3: Chat completion..."
RESPONSE=$(curl -s "$BRAIN_URL/v1/chat/completions" \
    -H "Authorization: Bearer $BRAIN_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "model": "hermesstore",
        "messages": [{"role": "user", "content": "Say hello in 5 words"}],
        "stream": false
    }')

if echo "$RESPONSE" | grep -q "choices"; then
    echo "  ✅ Chat works"
    CONTENT=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['choices'][0]['message']['content'][:100])" 2>/dev/null || echo "(could not parse)")
    echo "  📝 Response: $CONTENT"
else
    echo "  ❌ Chat failed"
    echo "  Response: $RESPONSE"
fi

# Test 4: Skills discovery
echo "Test 4: Skills discovery..."
SKILLS=$(curl -s "$BRAIN_URL/v1/skills" -H "Authorization: Bearer $BRAIN_KEY" 2>/dev/null)
if [ -n "$SKILLS" ] && [ "$SKILLS" != "null" ]; then
    echo "  ✅ Skills endpoint available"
else
    echo "  ⚠️  Skills endpoint not available (may not be implemented yet)"
fi

# Test 5: Frontend
echo "Test 5: Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "  ✅ Frontend running at http://localhost:3000"
else
    echo "  ❌ Frontend not running (start with: cd frontend && npm run start)"
fi

echo ""
echo "========================"
echo "🏁 Test complete!"
```

### 4. Make scripts executable

```bash
chmod +x scripts/setup-profiles.sh
chmod +x scripts/start-gateways.sh
chmod +x scripts/test-e2e.sh
```

## Verification

Check:
- [ ] `scripts/setup-profiles.sh` exists and is executable
- [ ] `scripts/start-gateways.sh` exists and is executable
- [ ] `scripts/test-e2e.sh` exists and is executable
- [ ] All scripts have proper shebang lines (#!/bin/bash)
- [ ] Setup script creates 4 profiles with unique API keys
- [ ] Setup script copies skills to profile directories
- [ ] Start script starts all 4 gateways on correct ports
- [ ] Test script checks health, models, chat, skills, frontend

## Git Commit

```bash
cd C:\Users\satya\HermesStore
git add scripts/
git commit -m "feat: profile setup script, gateway start script, E2E test script"
```
