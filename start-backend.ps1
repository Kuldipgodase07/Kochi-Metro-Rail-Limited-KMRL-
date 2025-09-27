# Start Node.js Backend Service with OR-Tools Proxy
# Run this in a dedicated terminal

Write-Host "🖥️  Starting Node.js Backend Service" -ForegroundColor Green
Write-Host "=" * 50

# Check prerequisites
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to backend directory
Set-Location $PSScriptRoot
if (Test-Path "backend") {
    Set-Location "backend"
} elseif (Test-Path "../backend") {
    Set-Location "../backend"
} else {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check for proxy middleware
Write-Host "🔍 Checking proxy middleware..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules/http-proxy-middleware")) {
    Write-Host "🔧 Installing proxy middleware..." -ForegroundColor Yellow
    npm install http-proxy-middleware
} else {
    Write-Host "✅ Proxy middleware ready" -ForegroundColor Green
}

Write-Host ""
Write-Host "🖥️  Starting Node.js Backend with OR-Tools Proxy..." -ForegroundColor Green
Write-Host "📊 Port: 5000" -ForegroundColor Cyan
Write-Host "🔗 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "🔗 OR-Tools Proxy: http://localhost:5000/api/train-scheduling/optimize" -ForegroundColor Cyan
Write-Host "📡 Proxies to: http://localhost:8001/api/train-scheduling/optimize" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Make sure OR-Tools service is running on port 8001 first!" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the backend service
npm run dev