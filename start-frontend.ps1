# Start React Frontend Service
# Run this in a dedicated terminal

Write-Host "🌐 Starting React Frontend Service" -ForegroundColor Green
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

# Navigate to project root
Set-Location $PSScriptRoot

Write-Host "📁 Working directory: $(Get-Location)" -ForegroundColor Cyan

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in project root!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🌐 Starting React Frontend with Vite..." -ForegroundColor Green
Write-Host "📊 Port: 8080" -ForegroundColor Cyan
Write-Host "🔗 Application: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 AI Scheduling: http://localhost:8080 → Dashboard → AI Scheduling" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Make sure backend services are running:" -ForegroundColor Yellow
Write-Host "   • OR-Tools Service: http://localhost:8001" -ForegroundColor White
Write-Host "   • Node.js Backend: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the frontend service
npm run dev