# KMRL Atlas System Startup Script
# This script starts the complete system with MongoDB Atlas

Write-Host "🚀 Starting KMRL Atlas System..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Test Atlas connection
Write-Host "🔗 Testing Atlas connection..." -ForegroundColor Yellow
node scripts/atlasStatus.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Atlas connection failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Atlas connection successful!" -ForegroundColor Green
Write-Host ""

# Start the backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host "   • Database: MongoDB Atlas" -ForegroundColor Gray
Write-Host "   • Port: 5000" -ForegroundColor Gray
Write-Host "   • Environment: Development" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Login Credentials:" -ForegroundColor Yellow
Write-Host "   • Super Admin: super_admin / super_admin" -ForegroundColor White
Write-Host "   • KMRL Admin: kmrl_admin / kmrl2025" -ForegroundColor White
Write-Host "   • Operations: operations_manager / ops2025" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "   • Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   • Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host "   • Frontend: http://localhost:5173 (start separately)" -ForegroundColor White
Write-Host ""

Write-Host "🎯 System Features:" -ForegroundColor Yellow
Write-Host "   • Multi-objective train scheduling" -ForegroundColor White
Write-Host "   • What-if scenario simulation" -ForegroundColor White
Write-Host "   • Performance analytics" -ForegroundColor White
Write-Host "   • User management" -ForegroundColor White
Write-Host "   • Real-time optimization" -ForegroundColor White
Write-Host ""

# Start the server
npm run dev
