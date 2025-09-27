# Launch All Services in Separate Terminals
# Master script to start OR-Tools + Backend + Frontend

Write-Host "🚀 KMRL Train Scheduling System - Multi-Terminal Launcher" -ForegroundColor Green
Write-Host "=" * 70

Write-Host "📋 System Architecture:" -ForegroundColor Yellow
Write-Host "   🐍 OR-Tools Service (Python) → Port 8001" -ForegroundColor White
Write-Host "   🖥️  Backend Service (Node.js) → Port 5000" -ForegroundColor White
Write-Host "   🌐 Frontend Service (React)   → Port 8080" -ForegroundColor White
Write-Host ""

$projectPath = $PSScriptRoot
Write-Host "📁 Project Path: $projectPath" -ForegroundColor Cyan

# Check if scripts exist
$scripts = @(
    @{Name="OR-Tools"; File="start-ortools.ps1"; Description="Python Google OR-Tools service"},
    @{Name="Backend"; File="start-backend.ps1"; Description="Node.js Express + Proxy"},
    @{Name="Frontend"; File="start-frontend.ps1"; Description="React + Vite development server"}
)

Write-Host "🔍 Checking startup scripts..." -ForegroundColor Yellow
foreach ($script in $scripts) {
    if (Test-Path $script.File) {
        Write-Host "✅ $($script.Name): $($script.File)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($script.Name): $($script.File) not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting all services in separate terminals..." -ForegroundColor Green
Write-Host "   Each service will run in its own PowerShell window" -ForegroundColor Gray

# Function to start service in new terminal
function Start-ServiceTerminal {
    param(
        [string]$Title,
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Host "🔧 Starting $Title..." -ForegroundColor Yellow
    
    try {
        $fullScriptPath = Join-Path $projectPath $ScriptPath
        Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", $fullScriptPath -WindowStyle Normal
        Write-Host "✅ $Title terminal opened" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to start $Title : $_" -ForegroundColor Red
        return $false
    }
}

# Start services in order (with delays for proper startup sequence)
Write-Host ""

# 1. Start OR-Tools Service first
if (Start-ServiceTerminal -Title "OR-Tools Service" -ScriptPath "start-ortools.ps1" -Description "Google OR-Tools optimization") {
    Write-Host "⏳ Waiting 8 seconds for OR-Tools service to initialize..." -ForegroundColor Yellow
    Start-Sleep 8
} else {
    Write-Host "❌ Failed to start OR-Tools service" -ForegroundColor Red
    exit 1
}

# 2. Start Backend Service second
if (Start-ServiceTerminal -Title "Backend Service" -ScriptPath "start-backend.ps1" -Description "Node.js backend with proxy") {
    Write-Host "⏳ Waiting 5 seconds for backend service to initialize..." -ForegroundColor Yellow
    Start-Sleep 5
} else {
    Write-Host "❌ Failed to start backend service" -ForegroundColor Red
    exit 1
}

# 3. Start Frontend Service third
if (Start-ServiceTerminal -Title "Frontend Service" -ScriptPath "start-frontend.ps1" -Description "React frontend application") {
    Write-Host "⏳ Waiting 3 seconds for frontend service to initialize..." -ForegroundColor Yellow
    Start-Sleep 3
} else {
    Write-Host "❌ Failed to start frontend service" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "🎉 All services started in separate terminals!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service Status Check:" -ForegroundColor Yellow
Write-Host "   🐍 OR-Tools:  http://localhost:8001/api/health" -ForegroundColor White
Write-Host "   🖥️  Backend:   http://localhost:5000/health" -ForegroundColor White
Write-Host "   🌐 Frontend:  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Testing Endpoints:" -ForegroundColor Yellow

# Test OR-Tools service
Write-Host "🔍 Testing OR-Tools service..." -ForegroundColor Yellow
Start-Sleep 2
try {
    $ortoolsResponse = Invoke-RestMethod -Uri "http://localhost:8001/api/health" -TimeoutSec 5
    Write-Host "✅ OR-Tools service responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  OR-Tools service may still be starting..." -ForegroundColor Yellow
}

# Test Backend service
Write-Host "🔍 Testing backend service..." -ForegroundColor Yellow
Start-Sleep 2
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
    Write-Host "✅ Backend service responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend service may still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚂 KMRL Train Scheduling System is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 How to use:" -ForegroundColor Yellow
Write-Host "   1. Open browser: http://localhost:8080" -ForegroundColor White
Write-Host "   2. Login to the system" -ForegroundColor White
Write-Host "   3. Navigate to Dashboard → AI Scheduling" -ForegroundColor White
Write-Host "   4. Click 'Connect to OR-Tools Service'" -ForegroundColor White
Write-Host "   5. View real Google OR-Tools optimization results!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   • Each service runs in its own terminal window" -ForegroundColor White
Write-Host "   • Close terminal windows to stop individual services" -ForegroundColor White
Write-Host "   • Check terminal outputs for detailed logs" -ForegroundColor White
Write-Host "   • OR-Tools uses constraint programming for optimization" -ForegroundColor White
Write-Host ""
Write-Host "👋 This launcher window can be closed safely." -ForegroundColor Gray
Write-Host "   All services continue running in their own terminals." -ForegroundColor Gray

Read-Host "`nPress Enter to close this launcher"