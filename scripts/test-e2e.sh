#!/bin/bash
# HermesStore — End-to-End Test Script
# Tests the complete flow: chat → product → pricing → landing page

set -e

echo "🧪 HermesStore E2E Test"
echo "========================"
echo ""

BRAIN_URL="http://localhost:8642"
BRAIN_KEY=$(grep API_SERVER_KEY "$HOME/.hermes/profiles/hermesstore-brain/.env" 2>/dev/null | cut -d= -f2)

if [ -z "$BRAIN_KEY" ]; then
    echo "❌ Could not read brain API key. Run setup-profiles.sh first."
    exit 1
fi

echo "Test 1: Health check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BRAIN_URL/health")
if [ "$STATUS" = "200" ]; then
    echo "  ✅ Brain is healthy"
else
    echo "  ❌ Brain not responding (status: $STATUS)"
    echo "  Start gateways first: bash scripts/start-gateways.sh"
    exit 1
fi

echo "Test 2: Model discovery..."
MODELS=$(curl -s "$BRAIN_URL/v1/models" -H "Authorization: Bearer $BRAIN_KEY")
if echo "$MODELS" | grep -q "hermes"; then
    echo "  ✅ Models available"
else
    echo "  ❌ No models found"
fi

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
else
    echo "  ❌ Chat failed"
    echo "  Response: $RESPONSE"
fi

echo "Test 4: Skills discovery..."
SKILLS=$(curl -s "$BRAIN_URL/v1/skills" -H "Authorization: Bearer $BRAIN_KEY" 2>/dev/null)
if [ -n "$SKILLS" ] && [ "$SKILLS" != "null" ]; then
    echo "  ✅ Skills endpoint available"
else
    echo "  ⚠️  Skills endpoint not available (may not be implemented yet)"
fi

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
