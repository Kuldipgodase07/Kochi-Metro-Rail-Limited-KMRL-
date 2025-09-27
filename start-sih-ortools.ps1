# SIH-Enhanced OR-Tools Service Startup Script
# This script starts the enhanced OR-Tools service with SIH compliance requirements

Write-Host "🚀 Starting SIH-Enhanced OR-Tools Train Scheduling Service..." -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
Write-Host "📦 Checking required packages..." -ForegroundColor Yellow

$requiredPackages = @(
    "flask",
    "flask-cors", 
    "ortools",
    "requests"
)

foreach ($package in $requiredPackages) {
    try {
        $result = python -c "import $package" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $package is installed" -ForegroundColor Green
        } else {
            Write-Host "❌ $package is missing" -ForegroundColor Red
            Write-Host "Installing $package..." -ForegroundColor Yellow
            pip install $package
        }
    } catch {
        Write-Host "❌ Error checking $package" -ForegroundColor Red
    }
}

# Navigate to backend directory
Set-Location "backend"

# Check if enhanced OR-Tools service exists
if (Test-Path "ortools_service_enhanced.py") {
    Write-Host "✅ Enhanced OR-Tools service found" -ForegroundColor Green
} else {
    Write-Host "❌ Enhanced OR-Tools service not found" -ForegroundColor Red
    Write-Host "Please ensure ortools_service_enhanced.py exists in the backend directory" -ForegroundColor Yellow
    exit 1
}

# Display SIH Requirements
Write-Host "`n🔧 SIH Requirements Implementation:" -ForegroundColor Cyan
Write-Host "1. Fitness Certificates - Validity windows from Rolling-Stock, Signalling & Telecom departments" -ForegroundColor White
Write-Host "2. Job-Card Status - Open vs. closed work orders from IBM Maximo" -ForegroundColor White
Write-Host "3. Branding Priorities - Contractual commitments for exterior wrap exposure hours" -ForegroundColor White
Write-Host "4. Mileage Balancing - Kilometre allocation for equal bogie, brake-pad & HVAC wear" -ForegroundColor White
Write-Host "5. Cleaning & Detailing - Available manpower and bay occupancy for interior deep-cleaning" -ForegroundColor White
Write-Host "6. Stabling Geometry - Physical bay positions to minimise shunting and turn-out time" -ForegroundColor White

Write-Host "`n🚂 Starting Enhanced OR-Tools Service..." -ForegroundColor Green
Write-Host "Service will be available at: http://localhost:8001" -ForegroundColor Cyan
Write-Host "SIH Endpoint: http://localhost:8001/api/train-scheduling/optimize-sih" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8001/api/health" -ForegroundColor Cyan

Write-Host "`n📡 Frontend Integration:" -ForegroundColor Yellow
Write-Host "Navigate to /sih-scheduling in the application to access the SIH dashboard" -ForegroundColor White

# Start the enhanced OR-Tools service
try {
    Write-Host "`n🚀 Launching SIH-Enhanced OR-Tools Service..." -ForegroundColor Green
    python ortools_service_enhanced.py
} catch {
    Write-Host "❌ Error starting the service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error message above and ensure all dependencies are installed" -ForegroundColor Yellow
}

Write-Host "`n🔌 Service stopped. Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
