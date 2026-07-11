#!/bin/bash
# HermesStore — Start Everything
# Starts Hermes gateway + Next.js frontend together

set -e

echo "🚀 Starting HermesStore..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Config
HERMES_PROFILE="hermesstore-test"
HERMES_PORT=8642
FRONTEND_PORT=3000
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Step 1: Kill anything on our ports
echo "🧹 Cleaning up ports..."
for port in $HERMES_PORT $FRONTEND_PORT; do
    pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill $pid 2>/dev/null || true
        echo "  Killed process on port $port"
    fi
done
sleep 1

# Step 2: Start Hermes gateway in background
echo "🤖 Starting Hermes gateway (port $HERMES_PORT)..."
hermes -p "$HERMES_PROFILE" gateway &
HERMES_PID=$!

# Wait for Hermes to be ready
echo "  Waiting for Hermes to start..."
for i in $(seq 1 30); do
    if curl -s "http://127.0.0.1:$HERMES_PORT/health" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Hermes gateway ready${NC}"
        break
    fi
    sleep 1
done

# Step 3: Start Next.js frontend
echo "🌐 Starting frontend (port $FRONTEND_PORT)..."
cd "$PROJECT_DIR/frontend"
npm run start &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "  Waiting for frontend to start..."
for i in $(seq 1 30); do
    if curl -s "http://127.0.0.1:$FRONTEND_PORT" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ Frontend ready${NC}"
        break
    fi
    sleep 1
done

echo ""
echo "=============================="
echo -e "${GREEN}✅ HermesStore is running!${NC}"
echo ""
echo "  Frontend:  http://localhost:$FRONTEND_PORT"
echo "  Hermes:    http://localhost:$HERMES_PORT"
echo ""
echo "  Hermes PID: $HERMES_PID"
echo "  Frontend PID: $FRONTEND_PID"
echo ""
echo "  To stop: kill $HERMES_PID $FRONTEND_PID"
echo "  Or press Ctrl+C"
echo "=============================="
echo ""

# Keep running until interrupted
trap "echo ''; echo 'Stopping...'; kill $HERMES_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
