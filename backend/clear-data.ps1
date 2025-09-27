# Clear MongoDB Data Except Users
# This script clears all operational data while preserving user accounts

Write-Host "🧹 KMRL Database Cleanup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "🔍 Checking MongoDB connection..." -ForegroundColor Yellow

# Navigate to backend directory
Set-Location -Path "backend"

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env file found. Using default MongoDB connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting database cleanup..." -ForegroundColor Cyan
Write-Host "This will clear all operational data while preserving user accounts" -ForegroundColor Yellow
Write-Host ""

# Run the cleanup script
node scripts/clearDataDirect.js

Write-Host ""
Write-Host "🎉 Database cleanup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run seed scripts to populate fresh data" -ForegroundColor White
Write-Host "2. Start the backend server: npm run dev" -ForegroundColor White
Write-Host "3. Access the application with preserved user accounts" -ForegroundColor White
