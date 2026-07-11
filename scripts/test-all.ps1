# HermesStore — Test All 4 Department Gateways
# Run this after start-all.ps1 to verify everything works

Write-Host "🧪 Testing HermesStore Multi-Agent System..." -ForegroundColor Cyan
Write-Host ""

$pass = 0
$fail = 0

$departments = @(
    @{Name="Brain";     Port=8642; Key="hermesstore-brain-2026-secret-key-32c"},
    @{Name="Store Ops"; Port=8643; Key="hermesstore-storeops-2026-secret-32c"},
    @{Name="Marketing"; Port=8644; Key="hermesstore-marketing-2026-secret-32c"},
    @{Name="Customer";  Port=8645; Key="hermesstore-customer-2026-secret-32c"}
)

# Test 1: Health checks
Write-Host "Test 1: Health checks..." -ForegroundColor Yellow
foreach ($d in $departments) {
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:$($d.Port)/health" -TimeoutSec 5
        Write-Host "  ✅ $($d.Name): $($health.status)" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "  ❌ $($d.Name): NOT RESPONDING" -ForegroundColor Red
        $fail++
    }
}

# Test 2: Auth checks (wrong key should fail)
Write-Host ""
Write-Host "Test 2: Auth checks..." -ForegroundColor Yellow
foreach ($d in $departments) {
    try {
        $headers = @{"Authorization"="Bearer wrong-key"}
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$($d.Port)/v1/models" -Headers $headers -TimeoutSec 5
        Write-Host "  ❌ $($d.Name): Wrong key accepted (security issue)" -ForegroundColor Red
        $fail++
    } catch {
        Write-Host "  ✅ $($d.Name): Wrong key rejected" -ForegroundColor Green
        $pass++
    }
}

# Test 3: Chat test (with correct key)
Write-Host ""
Write-Host "Test 3: Chat tests..." -ForegroundColor Yellow
foreach ($d in $departments) {
    try {
        $headers = @{
            "Authorization"="Bearer $($d.Key)"
            "Content-Type"="application/json"
        }
        $body = @{
            model="hermes-agent"
            messages=@(@{role="user"; content="Say your department name in one word"})
            stream=$false
        } | ConvertTo-Json -Depth 5
        
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:$($d.Port)/v1/chat/completions" -Method Post -Headers $headers -Body $body -TimeoutSec 60
        $content = $response.choices[0].message.content
        Write-Host "  ✅ $($d.Name): $content" -ForegroundColor Green
        $pass++
    } catch {
        Write-Host "  ❌ $($d.Name): Chat failed - $($_.Exception.Message)" -ForegroundColor Red
        $fail++
    }
}

# Summary
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Results: $pass passed, $fail failed" -ForegroundColor $(if ($fail -eq 0) {"Green"} else {"Yellow"})
Write-Host "======================================" -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host "🎉 All tests passed! Multi-agent system is ready." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the gateways." -ForegroundColor Yellow
}
