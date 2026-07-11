# HermesStore — Start All 4 Department Gateways
# Run this in PowerShell to start the entire multi-agent system

Write-Host "🚀 Starting HermesStore Multi-Agent System..." -ForegroundColor Cyan
Write-Host ""

$projectDir = "C:\Users\satya\HermesStore"
$hermesBin = "$projectDir\hermes-agent\.venv\Scripts\hermes.exe"

# Kill anything on our ports
$ports = @(8642, 8643, 8644, 8645)
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "  Killed process on port $port" -ForegroundColor Yellow
    }
}
Start-Sleep -Seconds 1

# Define profiles
$profiles = @(
    @{Name="brain";     Port=8642; Home="$projectDir\.hermes-brain"},
    @{Name="storeops";  Port=8643; Home="$projectDir\.hermes-storeops"},
    @{Name="marketing"; Port=8644; Home="$projectDir\.hermes-marketing"},
    @{Name="customer";  Port=8645; Home="$projectDir\.hermes-customer"}
)

# Start each gateway
foreach ($p in $profiles) {
    Write-Host "🤖 Starting $($p.Name) on port $($p.Port)..." -ForegroundColor Green
    
    $env:HERMES_HOME = $p.Home
    Start-Process -FilePath $hermesBin -ArgumentList "gateway" -NoNewWindow -PassThru | Out-Null
    
    Write-Host "  ✅ $($p.Name) starting..." -ForegroundColor Green
}

# Wait for all to be ready
Write-Host ""
Write-Host "⏳ Waiting for gateways to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Health check
foreach ($p in $profiles) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$($p.Port)/health" -TimeoutSec 5
        Write-Host "  ✅ $($p.Name): $($health.status) (port $($p.Port))" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($p.Name): NOT RESPONDING (port $($p.Port))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ HermesStore Multi-Agent System Ready" -ForegroundColor Green
Write-Host ""
Write-Host "  Brain (Frontend):     http://localhost:8642" -ForegroundColor White
Write-Host "  Store Ops:            http://localhost:8643" -ForegroundColor White
Write-Host "  Marketing:            http://localhost:8644" -ForegroundColor White
Write-Host "  Customer/Brand:       http://localhost:8645" -ForegroundColor White
Write-Host ""
Write-Host "  Frontend:             http://localhost:3000" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all gateways" -ForegroundColor Yellow

# Keep running
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host "Stopping all gateways..." -ForegroundColor Red
    foreach ($port in $ports) {
        $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    }
}
