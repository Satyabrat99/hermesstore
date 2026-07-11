#!/bin/bash
# HermesStore — Start All Gateways + Create Cron Jobs
# Run this every time to start the app. Jobs are recreated if missing.
# Usage: bash scripts/start-gateways.sh

set -e

HERMES_BIN="C:/Users/satya/HermesStore/hermes-agent/.venv/Scripts/hermes.exe"
PROJECT="C:/Users/satya/HermesStore"

declare -A PROFILES=(
  ["brain"]="8642:hermesstore-brain-2026-secret-key-32c"
  ["storeops"]="8643:hermesstore-storeops-2026-secret-32c"
  ["marketing"]="8644:hermesstore-marketing-2026-secret-32c"
  ["customer"]="8645:hermesstore-customer-2026-secret-32c"
)

echo "Starting HermesStore Gateways..."

# Start each gateway
for dept in brain storeops marketing customer; do
  IFS=':' read -r port key <<< "${PROFILES[$dept]}"
  home="$PROJECT/.hermes-$dept"

  # Kill existing process on port
  lsof -ti:$port 2>/dev/null | xargs kill 2>/dev/null || true

  # Start gateway in background
  cd "$PROJECT"
  HERMES_HOME="$home" "$HERMES_BIN" gateway &>/dev/null &
  echo "  Started $dept on port $port (PID $!)"
done

echo ""
echo "Waiting for gateways to initialize..."
sleep 20

# Health check
echo ""
for dept in brain storeops marketing customer; do
  IFS=':' read -r port key <<< "${PROFILES[$dept]}"
  if curl -s --max-time 5 "http://127.0.0.1:$port/health" | grep -q "ok"; then
    echo "  $dept (port $port): OK"
  else
    echo "  $dept (port $port): FAILED"
  fi
done

# Create cron jobs
echo ""
echo "Creating cron jobs..."

create_job() {
  local port=$1 key=$2 name=$3 schedule=$4 prompt=$5
  curl -s --max-time 10 -X POST "http://127.0.0.1:$port/api/jobs" \
    -H "Authorization: Bearer $key" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$name\",\"schedule\":\"$schedule\",\"prompt\":\"$prompt\"}" > /dev/null 2>&1
  echo "  Created: $name"
}

# Store Ops jobs
create_job 8643 "${PROFILES[storeops]##*:}" "store-health-monitor" "every 30m" "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies, SEO issues."
create_job 8643 "${PROFILES[storeops]##*:}" "competitor-price-monitor" "every 2h" "Search for competitor pricing on top products. Alert if competitor dropped price more than 5%."
create_job 8643 "${PROFILES[storeops]##*:}" "inventory-tracker" "every 6h" "Check inventory levels. Alert if less than 10 units. Calculate days until stockout."
create_job 8643 "${PROFILES[storeops]##*:}" "analytics-digest" "0 9 * * *" "Daily analytics: revenue, orders, conversion, top products."
create_job 8643 "${PROFILES[storeops]##*:}" "revenue-tracker" "0 22 * * *" "Reconcile today revenue, refunds, net revenue, margins."

# Marketing jobs
create_job 8644 "${PROFILES[marketing]##*:}" "social-media-scheduler" "0 9 * * *" "Plan today social content: 2-3 products, platform-specific posts, hashtags."
create_job 8644 "${PROFILES[marketing]##*:}" "engagement-responder" "every 30m" "Check new comments and DMs. Draft replies matching brand voice."
create_job 8644 "${PROFILES[marketing]##*:}" "content-calendar" "0 8 * * 1" "Plan week content: themes, topics, products, posting schedule."

# Customer jobs
create_job 8645 "${PROFILES[customer]##*:}" "support-watcher" "every 15m" "Check new support messages. Categorize and draft responses."
create_job 8645 "${PROFILES[customer]##*:}" "review-manager" "0 10 * * *" "Check new reviews. Analyze sentiment. Draft replies."
create_job 8645 "${PROFILES[customer]##*:}" "brand-audit" "0 12 * * 1" "Audit week content for brand voice consistency."

# Pause all jobs (user enables from UI)
echo ""
echo "Pausing all jobs (enable from UI)..."
for dept in storeops marketing customer; do
  IFS=':' read -r port key <<< "${PROFILES[$dept]}"
  for id in $(curl -s "http://127.0.0.1:$port/api/jobs" -H "Authorization: Bearer $key" | grep -o '"id":"[^"]*"' | cut -d'"' -f4); do
    curl -s --max-time 5 -X POST "http://127.0.0.1:$port/api/jobs/$id/pause" \
      -H "Authorization: Bearer $key" > /dev/null 2>&1
  done
  echo "  Paused all $dept jobs"
done

echo ""
echo "=========================================="
echo "  HermesStore is READY"
echo ""
echo "  Brain:     http://localhost:8642"
echo "  Store Ops: http://localhost:8643"
echo "  Marketing: http://localhost:8644"
echo "  Customer:  http://localhost:8645"
echo "  Frontend:  http://localhost:3000"
echo ""
echo "  11 cron jobs created (all paused)"
echo "  Enable from: http://localhost:3000/cron"
echo "=========================================="
