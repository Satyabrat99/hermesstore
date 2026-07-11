# HermesStore — Start All Gateways + Create Cron Jobs (PowerShell)
# Run this every time to start the app. Jobs are recreated if missing.

$HERMES_BIN = "C:\Users\satya\HermesStore\hermes-agent\.venv\Scripts\hermes.exe"
$PROJECT = "C:\Users\satya\HermesStore"

$DEPTS = @{
    brain    = @{ port = 8642; key = "hermesstore-brain-2026-secret-key-32c" }
    storeops = @{ port = 8643; key = "hermesstore-storeops-2026-secret-32c" }
    marketing = @{ port = 8644; key = "hermesstore-marketing-2026-secret-32c" }
    customer = @{ port = 8645; key = "hermesstore-customer-2026-secret-32c" }
}

function Create-Job {
    param($Port, $Key, $Name, $Schedule, $Prompt)
    $body = @{ name = $Name; schedule = $Schedule; prompt = $Prompt } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/jobs" -Method Post `
            -Headers @{ Authorization = "Bearer $Key"; "Content-Type" = "application/json" } `
            -Body $body -TimeoutSec 10 | Out-Null
        Write-Host "  Created: $Name" -ForegroundColor Gray
    } catch {}
}

Write-Host "Starting HermesStore Gateways..." -ForegroundColor Cyan

foreach ($dept in $DEPTS.Keys) {
    $port = $DEPTS[$dept].port
    $home = "$PROJECT\.hermes-$dept"
    
    # Kill existing on port
    try { Get-Process -Id (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force } catch {}
    
    # Start gateway
    $env:HERMES_HOME = $home
    Start-Process -FilePath $HERMES_BIN -ArgumentList "gateway" -WindowStyle Hidden -PassThru | Out-Null
    Write-Host "  Started $dept on port $port" -ForegroundColor Green
}

Write-Host ""
Write-Host "Waiting for gateways to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 25

# Health check
Write-Host ""
foreach ($dept in $DEPTS.Keys) {
    $port = $DEPTS[$dept].port
    try {
        $r = Invoke-RestMethod -Uri "http://127.0.0.1:$port/health" -TimeoutSec 5
        Write-Host "  $dept (port $port): OK" -ForegroundColor Green
    } catch {
        Write-Host "  $dept (port $port): FAILED" -ForegroundColor Red
    }
}

# Create cron jobs
Write-Host ""
Write-Host "Creating cron jobs..." -ForegroundColor Cyan

# Store Ops
Create-Job 8643 $DEPTS.storeops.key "store-health-monitor" "every 30m" "Check store health: scan all products for missing descriptions, missing images, pricing inconsistencies."
Create-Job 8643 $DEPTS.storeops.key "competitor-price-monitor" "every 2h" "Search for competitor pricing on top products. Alert if competitor dropped price more than 5%."
Create-Job 8643 $DEPTS.storeops.key "inventory-tracker" "every 6h" "Check inventory levels. Alert if less than 10 units."
Create-Job 8643 $DEPTS.storeops.key "analytics-digest" "0 9 * * *" "Daily analytics: revenue, orders, conversion, top products."
Create-Job 8643 $DEPTS.storeops.key "revenue-tracker" "0 22 * * *" "Reconcile today revenue, refunds, net revenue."

# Marketing
Create-Job 8644 $DEPTS.marketing.key "social-media-scheduler" "0 9 * * *" "Plan today social content: 2-3 products, platform-specific posts, hashtags."
Create-Job 8644 $DEPTS.marketing.key "engagement-responder" "every 30m" "Check new comments and DMs. Draft replies matching brand voice."
Create-Job 8644 $DEPTS.marketing.key "content-calendar" "0 8 * * 1" "Plan week content: themes, topics, products, posting schedule."

# Customer
Create-Job 8645 $DEPTS.customer.key "support-watcher" "every 15m" "Check new support messages. Categorize and draft responses."
Create-Job 8645 $DEPTS.customer.key "review-manager" "0 10 * * *" "Check new reviews. Analyze sentiment. Draft replies."
Create-Job 8645 $DEPTS.customer.key "brand-audit" "0 12 * * 1" "Audit week content for brand voice consistency."

# Pause all
Write-Host ""
Write-Host "Pausing all jobs (enable from UI)..." -ForegroundColor Yellow
foreach ($dept in @("storeops", "marketing", "customer")) {
    $port = $DEPTS[$dept].port
    $key = $DEPTS[$dept].key
    try {
        $jobs = (Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/jobs" -Headers @{ Authorization = "Bearer $key" }).jobs
        foreach ($job in $jobs) {
            Invoke-RestMethod -Uri "http://127.0.0.1:$port/api/jobs/$($job.id)/pause" -Method Post -Headers @{ Authorization = "Bearer $key" } -TimeoutSec 5 | Out-Null
        }
        Write-Host "  Paused all $dept jobs" -ForegroundColor Gray
    } catch {}
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  HermesStore is READY" -ForegroundColor Green
Write-Host ""
Write-Host "  Brain:     http://localhost:8642"
Write-Host "  Store Ops: http://localhost:8643"
Write-Host "  Marketing: http://localhost:8644"
Write-Host "  Customer:  http://localhost:8645"
Write-Host "  Frontend:  http://localhost:3000"
Write-Host ""
Write-Host "  11 cron jobs created (all paused)"
Write-Host "  Enable from: http://localhost:3000/cron"
Write-Host "=========================================="
