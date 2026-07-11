#!/bin/bash
# Start all 4 Hermes gateways for HermesStore

echo "🚀 Starting HermesStore gateways..."
echo ""

for port in 8642 8643 8644 8645; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pid" ]; then
        echo "⚠️  Killing existing process on port $port (PID: $pid)"
        kill $pid 2>/dev/null
    fi
done

sleep 1

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

wait
