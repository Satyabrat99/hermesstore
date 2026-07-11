#!/bin/bash
# HermesStore — Create All Cron Jobs
# Run this AFTER all 4 gateways are started
# Jobs are created in PAUSED state (user enables from UI)

echo "⏰ Creating HermesStore Cron Jobs..."
echo ""

BRAIN_KEY="hermesstore-brain-2026-secret-key-32c"
STOREOPS_KEY="hermesstore-storeops-2026-secret-32c"
MARKETING_KEY="hermesstore-marketing-2026-secret-32c"
CUSTOMER_KEY="hermesstore-customer-2026-secret-32c"

create_job() {
  local port=$1
  local key=$2
  local name=$3
  local schedule=$4
  local prompt=$5
  local dept=$6

  echo "  Creating: $name ($dept) — schedule: $schedule"

  response=$(curl -s --max-time 10 -X POST "http://127.0.0.1:$port/api/jobs" \
    -H "Authorization: Bearer $key" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"schedule\": \"$schedule\",
      \"prompt\": \"$prompt\",
      \"metadata\": {\"department\": \"$dept\", \"enabled\": false}
    }" 2>&1)

  if echo "$response" | grep -q "job_id\|id\|success"; then
    echo "    ✅ Created"
  else
    echo "    ⚠️  Response: $response"
  fi
}

# ═══════════════════════════════════════
# STORE OPS CRON JOBS (port 8643)
# ═══════════════════════════════════════
echo "📦 Store Ops (port 8643):"

create_job 8643 "$STOREOPS_KEY" "store-health-monitor" "every 30m" \
  "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies, and SEO issues. Generate a health score 0-100. Report any issues found with suggested fixes." \
  "storeops"

create_job 8643 "$STOREOPS_KEY" "competitor-price-monitor" "every 2h" \
  "Search for competitor pricing on our top selling products. Use web search to find competitor stores selling similar products. Compare prices and alert if any competitor has dropped price more than 5%. Recommend pricing action." \
  "storeops"

create_job 8643 "$STOREOPS_KEY" "inventory-tracker" "every 6h" \
  "Check inventory levels for all products. Identify products with less than 10 units (low stock) and products with 0 units (out of stock). Calculate days until stockout based on recent sales velocity. Suggest reorder quantities." \
  "storeops"

create_job 8643 "$STOREOPS_KEY" "analytics-digest" "0 9 * * *" \
  "Generate daily analytics digest: total revenue, order count, conversion rate, top 5 products by revenue, top traffic sources. Compare with previous day. Highlight any anomalies (sudden drops or spikes)." \
  "storeops"

create_job 8643 "$STOREOPS_KEY" "revenue-tracker" "0 22 * * *" \
  "Reconcile today's revenue: total orders, total revenue, refunds processed, net revenue. Calculate profit margins. Flag any discrepancies between expected and actual numbers." \
  "storeops"

# ═══════════════════════════════════════
# MARKETING CRON JOBS (port 8644)
# ═══════════════════════════════════════
echo ""
echo "📣 Marketing (port 8644):"

create_job 8644 "$MARKETING_KEY" "social-media-scheduler" "0 9 * * *" \
  "Plan today's social media content: identify 2-3 products to feature, generate platform-specific posts (Instagram caption with hashtags, Twitter thread, LinkedIn post). Use current trends and brand voice. Save as drafts for approval." \
  "marketing"

create_job 8644 "$MARKETING_KEY" "engagement-responder" "every 30m" \
  "Check for new comments, mentions, and DMs on social media platforms. Draft contextual replies that match brand voice. High confidence replies (>0.9) can be auto-queued. Flag any negative comments for human review." \
  "marketing"

create_job 8644 "$MARKETING_KEY" "content-calendar" "0 8 * * 1" \
  "Plan the week's content calendar: themes, topics, product features, promotional angles. Align with any upcoming sales events or holidays. Suggest posting schedule for each platform." \
  "marketing"

# ═══════════════════════════════════════
# CUSTOMER/BRAND CRON JOBS (port 8645)
# ═══════════════════════════════════════
echo ""
echo "💬 Customer/Brand (port 8645):"

create_job 8645 "$CUSTOMER_KEY" "support-watcher" "every 15m" \
  "Check for new customer support messages. Categorize each: order status, return request, product question, complaint, general inquiry. Draft responses using store policies and brand voice. High confidence drafts auto-queue. Low confidence escalate to human." \
  "customer"

create_job 8645 "$CUSTOMER_KEY" "review-manager" "0 10 * * *" \
  "Check for new product reviews. Analyze sentiment (positive/neutral/negative). Draft thank-you replies for positive reviews. Draft empathetic resolution offers for negative reviews. Flag any reviews mentioning legal issues for human escalation." \
  "customer"

create_job 8645 "$CUSTOMER_KEY" "brand-audit" "0 12 * * 1" \
  "Audit all customer-facing content from the past week: social posts, email campaigns, support responses, product descriptions. Check for brand voice consistency. Flag any content that deviates from brand guidelines. Suggest corrections." \
  "customer"

echo ""
echo "=========================================="
echo "✅ All cron jobs created!"
echo ""
echo "All jobs are PAUSED by default."
echo "Enable them from the Cron Management page in the UI."
echo "=========================================="
