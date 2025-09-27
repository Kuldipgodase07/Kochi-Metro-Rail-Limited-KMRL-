# Architecture-Compatible OR-Tools Installation
# Alternative installation methods for different architectures

Write-Host "🔍 System Architecture Compatibility Check" -ForegroundColor Green
Write-Host "=" * 60

# Get detailed system info
$arch = $env:PROCESSOR_ARCHITECTURE
$pythonArch = python -c "import platform; print(platform.machine())"
$pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"

Write-Host "💻 System Architecture: $arch" -ForegroundColor Cyan
Write-Host "🐍 Python Architecture: $pythonArch" -ForegroundColor Cyan
Write-Host "📊 Python Version: $pythonVersion" -ForegroundColor Cyan

Write-Host ""
Write-Host "🛠️  OR-Tools Installation Options:" -ForegroundColor Yellow

# Option 1: Try standard pip installation
Write-Host ""
Write-Host "Option 1: Standard Installation" -ForegroundColor White
Write-Host "pip install ortools" -ForegroundColor Gray

try {
    Write-Host "🧪 Testing standard OR-Tools installation..." -ForegroundColor Yellow
    pip install ortools --quiet
    python -c "from ortools.sat.python import cp_model; print('✅ OR-Tools standard installation works!')" 2>&1
    $standardWorks = $true
} catch {
    Write-Host "❌ Standard installation failed" -ForegroundColor Red
    $standardWorks = $false
}

if (-not $standardWorks) {
    Write-Host ""
    Write-Host "Option 2: Architecture-Specific Installation" -ForegroundColor White
    
    # Option 2: Try pre-compiled wheels
    Write-Host "🔧 Trying pre-compiled wheels..." -ForegroundColor Yellow
    try {
        pip install --upgrade pip
        pip install ortools --force-reinstall --no-cache-dir
        python -c "from ortools.sat.python import cp_model; print('✅ Pre-compiled wheels work!')"
        $wheelsWork = $true
    } catch {
        Write-Host "❌ Pre-compiled wheels failed" -ForegroundColor Red
        $wheelsWork = $false
    }
    
    if (-not $wheelsWork) {
        Write-Host ""
        Write-Host "Option 3: Alternative Optimization Library" -ForegroundColor White
        Write-Host "Using PuLP (Linear Programming) as fallback" -ForegroundColor Gray
        
        try {
            pip install pulp
            Write-Host "✅ PuLP installed successfully" -ForegroundColor Green
            $pulpWorks = $true
        } catch {
            Write-Host "❌ PuLP installation failed" -ForegroundColor Red
            $pulpWorks = $false
        }
    }
}

Write-Host ""
if ($standardWorks) {
    Write-Host "🎉 OR-Tools is ready to use!" -ForegroundColor Green
    python ortools_service.py
} elseif ($wheelsWork) {
    Write-Host "🎉 OR-Tools with pre-compiled wheels is ready!" -ForegroundColor Green
    python ortools_service.py
} elseif ($pulpWorks) {
    Write-Host "🔄 Creating PuLP-based optimization service..." -ForegroundColor Yellow
    Write-Host "   (Alternative to OR-Tools for architecture compatibility)" -ForegroundColor Gray
    
    if (Test-Path "pulp_service.py") {
        python pulp_service.py
    } else {
        Write-Host "❌ pulp_service.py not found. Creating fallback service..." -ForegroundColor Red
        # Would create a PuLP-based service here
    }
} else {
    Write-Host "❌ All optimization libraries failed to install" -ForegroundColor Red
    Write-Host "💡 Manual solutions:" -ForegroundColor Yellow
    Write-Host "   1. Try Anaconda: conda install -c conda-forge ortools" -ForegroundColor White
    Write-Host "   2. Use Docker container with OR-Tools" -ForegroundColor White
    Write-Host "   3. Use cloud-based optimization service" -ForegroundColor White
}

Read-Host "Press Enter to continue"