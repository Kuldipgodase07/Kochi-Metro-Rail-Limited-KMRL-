# Google OR-Tools Train Scheduling Service Setup Script
# PowerShell script for Windows setup

Write-Host "🚀 Google OR-Tools Train Scheduling Service Setup" -ForegroundColor Green
Write-Host "=" * 60

# Check Python installation
Write-Host "🐍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8 or higher" -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check pip
Write-Host "📦 Checking pip installation..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ Found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip not found. Please install pip" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host "📁 Navigating to backend directory..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

# Install Python dependencies
Write-Host "🔧 Installing Python dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "💡 Try alternative installation:" -ForegroundColor Yellow
    Write-Host "   pip install --user -r requirements.txt" -ForegroundColor Yellow
    Write-Host "   python -m pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Test OR-Tools installation
Write-Host "🧪 Testing OR-Tools installation..." -ForegroundColor Yellow
$testScript = @"
try:
    from ortools.sat.python import cp_model
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()
    print('OR-Tools test passed')
except Exception as e:
    print(f'OR-Tools test failed: {e}')
    exit(1)
"@

$testResult = python -c $testScript 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ OR-Tools ready" -ForegroundColor Green
} else {
    Write-Host "❌ OR-Tools test failed: $testResult" -ForegroundColor Red
    exit 1
}

# Test Flask installation  
Write-Host "🌐 Testing Flask installation..." -ForegroundColor Yellow
$flaskTest = @"
try:
    import flask
    from flask_cors import CORS
    print(f'Flask {flask.__version__} ready')
except Exception as e:
    print(f'Flask test failed: {e}')
    exit(1)
"@

$flaskResult = python -c $flaskTest 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Flask ready" -ForegroundColor Green
} else {
    Write-Host "❌ Flask test failed: $flaskResult" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run the service: python ortools_service.py" -ForegroundColor White
Write-Host "   2. Service will start on: http://localhost:8001" -ForegroundColor White  
Write-Host "   3. Test endpoint: http://localhost:8001/api/health" -ForegroundColor White
Write-Host "   4. Start your frontend application" -ForegroundColor White
Write-Host ""
Write-Host "🚂 The OR-Tools service is ready for train scheduling optimization!" -ForegroundColor Green

# Option to start service immediately
Write-Host ""
$startNow = Read-Host "Start the OR-Tools service now? (y/n)"
if ($startNow -eq 'y' -or $startNow -eq 'Y') {
    Write-Host "🚀 Starting OR-Tools service..." -ForegroundColor Yellow
    python ortools_service.py
}