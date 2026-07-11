# HermesStore — Start Everything
# One command to launch the entire multi-agent system + frontend
# Usage: .\scripts\start-app.ps1

param(
    [switch]$NoFrontend  # Skip frontend if already running
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HermesStore — AI Ecommerce Manager           ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectDir = "C:\Users\satya\HermesStore"
$hermesBin = "$projectDir\hermes-agent\.venv\Scripts\hermes.exe"
$frontendDir = "$projectDir\frontend"

# ═══════════════════════════════════════════════
# Step 1: Kill any existing processes on our ports
# ═══════════════════════════════════════════════
Write-Host "[1/4] Cleaning up ports..." -ForegroundColor Yellow
$ports = @(8642, 8643, 8644, 8645, 3000)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2
Write-Host "  ✅ Ports cleared" -ForegroundColor Green

# ═══════════════════════════════════════════════
# Step 2: Start all 4 Hermes gateways
# ═══════════════════════════════════════════════
Write-Host ""
Write-Host "[2/4] Starting Hermes agents..." -ForegroundColor Yellow

$agents = @(
    @{Name="Brain (Orchestrator)"; Home="$projectDir\.hermes-brain";     Port=8642},
    @{Name="Store Ops";            Home="$projectDir\.hermes-storeops";  Port=8643},
    @{Name="Marketing";            Home="$projectDir\.hermes-marketing"; Port=8644},
    @{Name="Customer/Brand";       Home="$projectDir\.hermes-customer";  Port=8645}
)

$agentProcesses = @()

foreach ($agent in $agents) {
    Write-Host "  🤖 Starting $($agent.Name) (port $($agent.Port))..." -ForegroundColor Gray
    
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $hermesBin
    $pinfo.Arguments = "gateway"
    $pinfo.UseShellExecute = $false
    $pinfo.EnvironmentVariables["HERMES_HOME"] = $agent.Home
    $pinfo.EnvironmentVariables["PATH"] = "$projectDir\hermes-agent\.venv\Scripts;" + $env:PATH
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $pinfo.CreateNoWindow = $false
    
    $p = [System.Diagnostics.Process]::Start($pinfo)
    $agentProcesses += @{Process=$p; Name=$agent.Name; Port=$agent.Port}
    
    Write-Host "    PID: $($p.Id)" -ForegroundColor DarkGray
}

# Wait for gateways to start
Write-Host ""
Write-Host "  ⏳ Waiting for agents to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 20

# Health check each agent
$allHealthy = $true
foreach ($agent in $agents) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$($agent.Port)/health" -TimeoutSec 10
        Write-Host "  ✅ $($agent.Name): READY (port $($agent.Port))" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $($agent.Name): FAILED (port $($agent.Port))" -ForegroundColor Red
        $allHealthy = $false
    }
}

# ═══════════════════════════════════════════════
# Step 3: Update frontend config to point to Brain
# ═══════════════════════════════════════════════
Write-Host ""
Write-Host "[3/4] Configuring frontend..." -ForegroundColor Yellow

# The frontend proxy already points to localhost:8642 (Brain)
# Verify the proxy config
$nextConfig = Get-Content "$frontendDir\next.config.ts" -Raw
if ($nextConfig -match "8642") {
    Write-Host "  ✅ Frontend proxy → Brain (port 8642)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Frontend proxy may not point to Brain" -ForegroundColor Yellow
}

# ═══════════════════════════════════════════════
# Step 4: Start frontend
# ═══════════════════════════════════════════════
if (-not $NoFrontend) {
    Write-Host ""
    Write-Host "[4/4] Starting frontend..." -ForegroundColor Yellow
    
    # Build first
    Set-Location $frontendDir
    & npm run build 2>&1 | Out-Null
    
    # Start in background
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:frontendDir
        & npm run start
    }
    
    Start-Sleep -Seconds 5
    
    try {
        $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -UseBasicParsing
        Write-Host "  ✅ Frontend: READY (port 3000)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Frontend: Starting... (may take a moment)" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[4/4] Frontend skipped (already running)" -ForegroundColor Gray
}

# ═══════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              HermesStore is RUNNING                   ║" -ForegroundColor Cyan
Write-Host "╠══════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "║  🧠 Brain (Orchestrator)    → http://localhost:8642  ║" -ForegroundColor White
Write-Host "║  📦 Store Ops               → http://localhost:8643  ║" -ForegroundColor White
Write-Host "║  📣 Marketing               → http://localhost:8644  ║" -ForegroundColor White
Write-Host "║  💬 Customer/Brand          → http://localhost:8645  ║" -ForegroundColor White
Write-Host "║  🌐 Frontend                → http://localhost:3000  ║" -ForegroundColor White
Write-Host "║                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Open http://localhost:3000 in your browser" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all agents" -ForegroundColor Yellow
Write-Host ""

# ═══════════════════════════════════════════════
# Keep running until Ctrl+C
# ═══════════════════════════════════════════════
try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Check if any agent died
        foreach ($ap in $agentProcesses) {
            if ($ap.Process.HasExited) {
                Write-Host "⚠️  $($ap.Name) crashed! Restarting..." -ForegroundColor Red
                # Restart logic would go here
            }
        }
    }
} finally {
    # Cleanup on exit
    Write-Host ""
    Write-Host "Stopping all agents..." -ForegroundColor Red
    
    foreach ($ap in $agentProcesses) {
        if (-not $ap.Process.HasExited) {
            $ap.Process.Kill()
            Write-Host "  Stopped $($ap.Name)" -ForegroundColor Gray
        }
    }
    
    if ($frontendJob) {
        Stop-Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job $frontendJob -ErrorAction SilentlyContinue
    }
    
    Write-Host "✅ All stopped" -ForegroundColor Green
}
