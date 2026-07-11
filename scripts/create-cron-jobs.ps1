# HermesStore — Create All Cron Jobs (PowerShell)
# Run this AFTER all 4 gateways are started
# Jobs are created in PAUSED state (user enables from UI)

Write-Host "Creating HermesStore Cron Jobs..." -ForegroundColor Cyan
Write-Host ""

$headers = @{"Content-Type"="application/json"}

function Create-Job {
    param($Port, $Key, $Name, $Schedule, $Prompt, $Dept)
    
    Write-Host "  Creating: $Name ($Dept) - $Schedule" -ForegroundColor Gray
    
    $body = @{
        name = $Name
        schedule = $Schedule
        prompt = $Prompt
        metadata = @{department=$Dept; enabled=$false}
    } | ConvertTo-Json -Depth 5
    
    try {
        $headers["Authorization"] = "Bearer $Key"
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/jobs" -Method Post -Headers $headers -Body $body -TimeoutSec 10
        Write-Host "    Created" -ForegroundColor Green
    } catch {
        Write-Host "    Failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Store Ops
Write-Host "Store Ops (port 8643):" -ForegroundColor Yellow
Create-Job 8643 "hermesstore-storeops-2026-secret-32c" "store-health-monitor" "every 30m" "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies, SEO issues. Generate health score 0-100." "storeops"
Create-Job 8643 "hermesstore-storeops-2026-secret-32c" "competitor-price-monitor" "every 2h" "Search for competitor pricing on top products. Alert if competitor dropped price >5%. Recommend pricing action." "storeops"
Create-Job 8643 "hermesstore-storeops-2026-secret-32c" "inventory-tracker" "every 6h" "Check inventory levels. Alert if <10 units. Calculate days until stockout." "storeops"
Create-Job 8643 "hermesstore-storeops-2026-secret-32c" "analytics-digest" "0 9 * * *" "Daily analytics: revenue, orders, conversion, top products. Compare with previous day." "storeops"
Create-Job 8643 "hermesstore-storeops-2026-secret-32c" "revenue-tracker" "0 22 * * *" "Reconcile today's revenue, refunds, net revenue, margins." "storeops"

# Marketing
Write-Host ""
Write-Host "Marketing (port 8644):" -ForegroundColor Yellow
Create-Job 8644 "hermesstore-marketing-2026-secret-32c" "social-media-scheduler" "0 9 * * *" "Plan today's social content: 2-3 products, platform-specific posts, hashtags. Save as drafts." "marketing"
Create-Job 8644 "hermesstore-marketing-2026-secret-32c" "engagement-responder" "every 30m" "Check new comments/DMs. Draft replies matching brand voice. Flag negatives for review." "marketing"
Create-Job 8644 "hermesstore-marketing-2026-secret-32c" "content-calendar" "0 8 * * 1" "Plan week's content: themes, topics, products, posting schedule." "marketing"

# Customer
Write-Host ""
Write-Host "Customer (port 8645):" -ForegroundColor Yellow
Create-Job 8645 "hermesstore-customer-2026-secret-32c" "support-watcher" "every 15m" "Check new support messages. Categorize and draft responses. Escalate low confidence." "customer"
Create-Job 8645 "hermesstore-customer-2026-secret-32c" "review-manager" "0 10 * * *" "Check new reviews. Analyze sentiment. Draft replies." "customer"
Create-Job 8645 "hermesstore-customer-2026-secret-32c" "brand-audit" "0 12 * * 1" "Audit week's content for brand voice consistency." "customer"

Write-Host ""
Write-Host "All cron jobs created (PAUSED by default)" -ForegroundColor Green
Write-Host "Enable from the Cron Management page in the UI" -ForegroundColor Cyan
