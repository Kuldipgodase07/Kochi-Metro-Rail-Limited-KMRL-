# Start OR-Tools Python Service
# Run this in a dedicated terminal

Write-Host "🚀 Starting Google OR-Tools Service" -ForegroundColor Green
Write-Host "=" * 50

# Check prerequisites
Write-Host "🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
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

# Check if OR-Tools service exists
if (-not (Test-Path "ortools_service.py")) {
    Write-Host "❌ ortools_service.py not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "requirements.txt")) {
    Write-Host "⚠️  requirements.txt not found, attempting to run service..." -ForegroundColor Yellow
} else {
    Write-Host "📦 Checking Python dependencies..." -ForegroundColor Yellow
    try {
        python -c "import ortools, flask, flask_cors" 2>&1 | Out-Null
        Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    } catch {
        Write-Host "🔧 Installing Python dependencies..." -ForegroundColor Yellow
        pip install -r requirements.txt
    }
}

Write-Host ""
Write-Host "🚂 Starting OR-Tools Train Scheduling Service..." -ForegroundColor Green
Write-Host "📊 Port: 8001" -ForegroundColor Cyan
Write-Host "🔗 Health Check: http://localhost:8001/api/health" -ForegroundColor Cyan
Write-Host "🔗 Optimization: http://localhost:8001/api/train-scheduling/optimize" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""

# Start the service
python ortools_service.py