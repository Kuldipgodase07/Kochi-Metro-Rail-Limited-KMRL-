# Test Maintenance Module Workflow
Write-Host "🧪 Testing Maintenance Module Complete Workflow" -ForegroundColor Cyan
Write-Host "=" * 60

# Test 1: Get Trainsets
Write-Host "`n📋 Test 1: Fetching Trainsets..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/data/trainsets" -Method GET -UseBasicParsing
    $trainsets = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ SUCCESS: Found $($trainsets.Count) trainsets" -ForegroundColor Green
    $sampleTrain = $trainsets[0]
    Write-Host "   Sample: Train $($sampleTrain.number) - Status: $($sampleTrain.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Get Maintenance Stats
Write-Host "`n📊 Test 2: Fetching Maintenance Stats..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/maintenance/stats" -Method GET -UseBasicParsing
    $stats = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ SUCCESS: Stats retrieved" -ForegroundColor Green
    Write-Host "   Total Logs: $($stats.totalLogs)" -ForegroundColor Gray
    Write-Host "   In Maintenance: $($stats.inMaintenance)" -ForegroundColor Gray
    Write-Host "   Ready: $($stats.ready)" -ForegroundColor Gray
    Write-Host "   Dropout: $($stats.dropout)" -ForegroundColor Gray
    Write-Host "   Avg Score: $([math]::Round($stats.averageScore, 2))%" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get Active Alerts
Write-Host "`n🚨 Test 3: Fetching Active Alerts..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/maintenance/alerts/active" -Method GET -UseBasicParsing
    $alerts = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ SUCCESS: Found $($alerts.Count) active alerts" -ForegroundColor Green
    if ($alerts.Count -gt 0) {
        $alert = $alerts[0]
        Write-Host "   Sample: Train $($alert.trainNumber) - $($alert.alertType) - $($alert.alertMessage)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Create Test Maintenance Log
Write-Host "`n📝 Test 4: Creating Test Maintenance Log..." -ForegroundColor Yellow
try {
    # Get first trainset
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/data/trainsets?limit=1" -Method GET -UseBasicParsing
    $trainset = (($response.Content | ConvertFrom-Json).data)[0]
    
    $body = @{
        trainsetId = $trainset._id
        trainNumber = $trainset.number
        serviceInTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        maintenanceType = "Preventive"
        maintenancePriority = "medium"
        workDescription = "Test maintenance workflow - Routine inspection and brake system check"
        createdBy = "test-automation"
        remarks = "Automated test created by test-maintenance-workflow.ps1"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/maintenance" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
    $log = ($response.Content | ConvertFrom-Json).data
    $logId = $log._id
    
    Write-Host "✅ SUCCESS: Created maintenance log ID: $logId" -ForegroundColor Green
    Write-Host "   Train: $($log.trainNumber) - Status: $($log.trainStatus)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Test 5: Complete Maintenance with Performance Data
Write-Host "`n✅ Test 5: Completing Maintenance..." -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 2  # Simulate maintenance time
    
    $body = @{
        serviceOutTime = (Get-Date).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss")
        performanceAfterMaintenance = @{
            brakingEfficiency = 92.5
            doorOperationScore = 88.0
            tractionMotorHealth = 95.0
            hvacSystemStatus = 85.5
            signalCommunicationQuality = 90.0
            batteryHealthStatus = 87.5
        }
        totalMaintenanceCost = 15000
        updatedBy = "test-automation"
        remarks = "All systems checked and performing within acceptable parameters"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/maintenance/$logId/complete" -Method PUT -Body $body -ContentType "application/json" -UseBasicParsing
    $completedLog = ($response.Content | ConvertFrom-Json).data
    $readiness = ($response.Content | ConvertFrom-Json).readiness
    
    Write-Host "✅ SUCCESS: Maintenance completed" -ForegroundColor Green
    Write-Host "   Performance Score: $([math]::Round($completedLog.overallPerformanceScore, 2))%" -ForegroundColor Gray
    Write-Host "   Train Status: $($completedLog.trainStatus)" -ForegroundColor Gray
    Write-Host "   Ready for Operation: $($readiness.ready)" -ForegroundColor $(if($readiness.ready){"Green"}else{"Red"})
    Write-Host "   Alert Type: $($readiness.alertType)" -ForegroundColor Gray
    Write-Host "   Alert Message: $($readiness.message)" -ForegroundColor Gray
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
}

# Test 6: Get Updated Maintenance Logs
Write-Host "`n📋 Test 6: Fetching Updated Maintenance Logs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/maintenance?limit=5" -Method GET -UseBasicParsing
    $logs = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ SUCCESS: Found $($logs.Count) recent logs" -ForegroundColor Green
    foreach ($log in $logs | Select-Object -First 3) {
        Write-Host "   Train $($log.trainNumber): $($log.trainStatus) - Score: $([math]::Round($log.overallPerformanceScore, 1))%" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60)
Write-Host "🎉 Maintenance Module Workflow Test Complete!" -ForegroundColor Cyan
Write-Host "`n💡 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open http://localhost:8084/maintenance-log in browser" -ForegroundColor White
Write-Host "   2. View the test maintenance log created above" -ForegroundColor White
Write-Host "   3. Download PDF report to verify document generation" -ForegroundColor White
Write-Host "   4. Check statistics dashboard for updated numbers" -ForegroundColor White
Write-Host ""
