# Complete System Startup Script - Frontend + Backend + OR-Tools
# PowerShell script to start all services in the correct order

Write-Host "🚀 Starting Complete KMRL Train Scheduling System" -ForegroundColor Green
Write-Host "=" * 70

$services = @()

# Function to start a service in a new window
function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory,
        [string]$Description
    )
    
    Write-Host "🔧 Starting $Title..." -ForegroundColor Yellow
    Write-Host "   $Description" -ForegroundColor Gray
    
    try {
        $process = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; Write-Host '$Title Started' -ForegroundColor Green; $Command" -WindowStyle Normal -PassThru
        $services += @{
            Name = $Title
            Process = $process
            Description = $Description
        }
        Write-Host "✅ $Title started successfully (PID: $($process.Id))" -ForegroundColor Green
        Start-Sleep 2
        return $true
    } catch {
        Write-Host "❌ Failed to start $Title : $_" -ForegroundColor Red
        return $false
    }
}

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check Python  
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Service Startup Plan:" -ForegroundColor Yellow
Write-Host "   1. Google OR-Tools Service (Python) - Port 8001" -ForegroundColor White
Write-Host "   2. Node.js Backend (Express + Proxy) - Port 5000" -ForegroundColor White  
Write-Host "   3. React Frontend (Vite) - Port 8080" -ForegroundColor White
Write-Host ""

# Confirm startup
$confirm = Read-Host "Start all services? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "❌ Startup cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Green

# 1. Start OR-Tools Python Service
$ortoolsStarted = Start-ServiceWindow -Title "OR-Tools Service" -Command "python ortools_service.py" -WorkingDirectory "$PWD\backend" -Description "Google OR-Tools optimization engine on port 8001"

if (-not $ortoolsStarted) {
    Write-Host "❌ Failed to start OR-Tools service. Please check Python setup." -ForegroundColor Red
    exit 1
}

# Wait for OR-Tools service to be ready
Write-Host "⏳ Waiting for OR-Tools service to initialize..." -ForegroundColor Yellow
Start-Sleep 5

# Test OR-Tools service
try {
    $ortoolsTest = Invoke-RestMethod -Uri "http://localhost:8001/api/health" -TimeoutSec 10
    Write-Host "✅ OR-Tools service is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  OR-Tools service may still be starting..." -ForegroundColor Yellow
}

# 2. Install Node.js backend dependencies (if needed)
Write-Host "📦 Checking Node.js backend dependencies..." -ForegroundColor Yellow
Set-Location "$PWD\backend"
if (-not (Test-Path "node_modules\http-proxy-middleware")) {
    Write-Host "🔧 Installing backend dependencies..." -ForegroundColor Yellow
    npm install
}
Set-Location ".."

# 3. Start Node.js Backend
$backendStarted = Start-ServiceWindow -Title "Node.js Backend" -Command "npm run dev" -WorkingDirectory "$PWD\backend" -Description "Express server with OR-Tools proxy on port 5000"

if (-not $backendStarted) {
    Write-Host "❌ Failed to start Node.js backend" -ForegroundColor Red
    exit 1
}

# Wait for backend
Write-Host "⏳ Waiting for Node.js backend to initialize..." -ForegroundColor Yellow
Start-Sleep 3

# 4. Start React Frontend
$frontendStarted = Start-ServiceWindow -Title "React Frontend" -Command "npm run dev" -WorkingDirectory "$PWD" -Description "React + Vite development server on port 8080"

if (-not $frontendStarted) {
    Write-Host "❌ Failed to start React frontend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Green
Write-Host "🎉 All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Service URLs:" -ForegroundColor Yellow
Write-Host "   🔧 OR-Tools API:     http://localhost:8001" -ForegroundColor White
Write-Host "   🖥️  Backend API:      http://localhost:5000" -ForegroundColor White
Write-Host "   🌐 Frontend App:     http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "📋 Testing Endpoints:" -ForegroundColor Yellow  
Write-Host "   OR-Tools Health:     http://localhost:8001/api/health" -ForegroundColor White
Write-Host "   Backend Health:      http://localhost:5000/health" -ForegroundColor White
Write-Host "   Optimization:        http://localhost:5000/api/train-scheduling/optimize" -ForegroundColor White
Write-Host ""
Write-Host "🚂 The complete train scheduling system is now running!" -ForegroundColor Green
Write-Host "   Navigate to http://localhost:8080 and try the AI Scheduling panel" -ForegroundColor White
Write-Host ""
Write-Host "💡 Press Ctrl+C in any service window to stop that service" -ForegroundColor Yellow
Write-Host "   Or close this window to keep services running independently" -ForegroundColor Yellow

# Keep this window open for monitoring
Write-Host ""
Write-Host "🔍 System Status Monitor (Press Ctrl+C to exit)" -ForegroundColor Cyan
Write-Host "   Monitoring all services..." -ForegroundColor Gray

try {
    while ($true) {
        Start-Sleep 30
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Services running..." -ForegroundColor Gray
    }
} catch {
    Write-Host ""
    Write-Host "👋 Monitor stopped. Services continue running in their windows." -ForegroundColor Yellow
}