# Maintenance Module Implementation Guide

## Overview

The Maintenance Module is a comprehensive system for tracking train maintenance activities, analyzing performance metrics, and automatically assessing train readiness based on 6 key performance parameters.

## System Architecture

### Backend Components

#### 1. Database Schema (`backend/models/MaintenanceLog.js`)

**Mongoose Schema Features:**

- Train identification and tracking
- Service in/out time logging
- Maintenance type classification (scheduled, unscheduled, emergency, preventive, corrective)
- Priority levels (low, medium, high, critical)
- Components replaced tracking
- Technicians assignment
- **6 Performance Parameters:**
  1. **Braking Efficiency** (Critical) - 0-100%
  2. **Door Operation Score** - 0-100%
  3. **Traction Motor Health** (Critical) - 0-100%
  4. **HVAC System Status** - 0-100%
  5. **Signal Communication Quality** - 0-100%
  6. **Battery Health Status** - 0-100%
- Train status states: in-maintenance, ready, dropout, testing, pending-approval
- Alert generation and management
- Cost tracking

**Automated Performance Assessment:**

- Overall performance score calculation with weighted parameters
- Readiness thresholds:
  - **Ready**: Score ≥ 85% AND Critical params ≥ 70%
  - **Dropout**: Score < 60% OR Critical params < 70%
  - **Testing**: Score between 60-85%
- Automatic alert generation based on assessment

#### 2. API Routes (`backend/routes/maintenance.js`)

**Endpoints:**

| Method | Endpoint                                         | Description                                |
| ------ | ------------------------------------------------ | ------------------------------------------ |
| GET    | `/api/maintenance`                               | Get all maintenance logs with filters      |
| GET    | `/api/maintenance/:id`                           | Get single maintenance log                 |
| POST   | `/api/maintenance`                               | Create new maintenance log                 |
| PUT    | `/api/maintenance/:id/complete`                  | Complete maintenance with performance data |
| PUT    | `/api/maintenance/:id`                           | Update maintenance log                     |
| DELETE | `/api/maintenance/:id`                           | Delete maintenance log                     |
| GET    | `/api/maintenance/alerts/active`                 | Get active alerts                          |
| GET    | `/api/maintenance/stats`                         | Get maintenance statistics                 |
| GET    | `/api/maintenance/performance-trend/:trainsetId` | Get performance trend                      |

**Query Parameters:**

- `trainNumber`: Filter by train number
- `status`: Filter by train status
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Limit number of results (default: 50)

### Frontend Components

#### 1. Main Page (`src/pages/MaintenanceModulePage.tsx`)

**Features:**

- **Statistics Dashboard:**

  - Total maintenance logs
  - Trains in maintenance
  - Ready trains count
  - Dropout trains count
  - Average performance score

- **Active Alerts Panel:**

  - Real-time alert notifications
  - Color-coded by alert type (ready, dropout, warning)
  - Quick view of critical issues

- **Maintenance Log Creation:**

  - Train selection
  - Service in time picker
  - Maintenance type selection
  - Priority assignment
  - Work description
  - Technician assignment (future enhancement)

- **Maintenance Completion:**

  - Service out time recording
  - 6-parameter performance data entry
  - Cost tracking
  - Remarks and notes
  - **Automatic readiness assessment**

- **Maintenance Logs Table:**
  - Sortable and filterable
  - Status badges with color coding
  - Performance scores with color indicators
  - Quick actions (complete, download report)

#### 2. PDF Report Generator (`src/lib/maintenancePdfGenerator.ts`)

**Report Features:**

- Professional KMRL branding with dark teal theme
- Maintenance details summary
- Components replaced table
- Technicians assignment list
- **Before/After Performance Comparison:**
  - Side-by-side parameter comparison
  - Visual performance gauge
  - Color-coded indicators (green ≥85%, yellow ≥70%, red <70%)
- **Performance Assessment:**
  - Overall performance score display
  - Train readiness status
  - Alert box with recommendations
- Cost summary
- Remarks section
- Page headers and footers

### Performance Analysis Engine

#### Weighted Scoring System

```javascript
Weights:
- Braking Efficiency: 25%      (CRITICAL)
- Traction Motor Health: 25%   (CRITICAL)
- Door Operation: 15%
- Signal Communication: 15%
- HVAC System: 10%
- Battery Health: 10%
```

#### Readiness Algorithm

```
IF overallScore >= 85% AND
   brakingEfficiency >= 70% AND
   tractionMotorHealth >= 70%
THEN
  Status = READY
  Alert = "Train READY for operation"

ELSE IF overallScore < 60% OR
        brakingEfficiency < 70% OR
        tractionMotorHealth < 70%
THEN
  Status = DROPOUT
  Alert = "Train DROPPED OUT - Critical attention required"

ELSE
  Status = TESTING
  Alert = "Additional testing required"
```

### Alert System

**Alert Types:**

1. **READY** - Train passed all checks, operational
2. **DROPOUT** - Train failed critical checks, out of service
3. **WARNING** - Train requires additional testing
4. **ATTENTION-REQUIRED** - Manual intervention needed

**Alert Features:**

- Automatic generation on maintenance completion
- Real-time dashboard display
- PDF report inclusion
- Status tracking

## Integration with Existing System

### Navigation

- Added to `FuturisticNavigation.tsx` as "Maintenance Log"
- Orange theme with ClipboardList icon
- Route: `/maintenance-log`
- Accessible from main dashboard

### Translations

All three languages supported:

- **English**: "Maintenance Log"
- **Hindi**: "रखरखाव लॉग"
- **Malayalam**: "മെയിന്റനൻസ് ലോഗ്"

### Backend Integration

- Registered in `server.js`
- MongoDB integration via Mongoose
- Automatic trainset status updates

## Usage Workflow

### 1. Creating a Maintenance Log

```
1. Click "New Maintenance Log"
2. Enter train number (e.g., KMRL-001)
3. Select service in time
4. Choose maintenance type and priority
5. Describe work to be performed
6. Submit → Train status changes to "in-maintenance"
```

### 2. Completing Maintenance

```
1. Find the log in the table
2. Click complete button (✓)
3. Enter service out time
4. Fill in 6 performance parameters:
   - Braking Efficiency
   - Door Operation Score
   - Traction Motor Health
   - HVAC System Status
   - Signal Communication Quality
   - Battery Health Status
5. Enter total cost (optional)
6. Add remarks (optional)
7. Submit → Automatic performance assessment
8. Alert generated based on results
9. Train status updated automatically
```

### 3. Downloading Reports

```
1. Locate maintenance log in table
2. Click download button (⬇)
3. PDF report generates with:
   - Complete maintenance details
   - Performance metrics
   - Readiness assessment
   - Alert notifications
```

## Testing the Module

### Prerequisites

1. Backend server running on port 5000
2. Frontend server running on port 8084
3. MongoDB Atlas connection established

### Test Scenarios

#### Test 1: Create Maintenance Log

```javascript
// Navigate to: http://localhost:8084/maintenance-log
// Click: "New Maintenance Log"
// Fill in:
{
  trainNumber: "KMRL-TEST-001",
  serviceInTime: "2025-10-04T08:00",
  maintenanceType: "scheduled",
  maintenancePriority: "high",
  workDescription: "Routine inspection and brake system check"
}
// Expected: New log created, train status = "in-maintenance"
```

#### Test 2: Complete Maintenance (READY Status)

```javascript
// Performance data (all good):
{
  brakingEfficiency: 95,
  doorOperationScore: 92,
  tractionMotorHealth: 94,
  hvacSystemStatus: 88,
  signalCommunicationQuality: 90,
  batteryHealthStatus: 91
}
// Expected:
// - Overall score: ~92%
// - Status: "ready"
// - Alert: "Train READY for operation"
```

#### Test 3: Complete Maintenance (DROPOUT Status)

```javascript
// Performance data (critical issue):
{
  brakingEfficiency: 65,  // Below threshold!
  doorOperationScore: 85,
  tractionMotorHealth: 90,
  hvacSystemStatus: 80,
  signalCommunicationQuality: 88,
  batteryHealthStatus: 85
}
// Expected:
// - Overall score: ~83%
// - Status: "dropout"
// - Alert: "Train DROPPED OUT - Critical systems need attention"
```

#### Test 4: View Statistics

```javascript
// Navigate to: http://localhost:8084/maintenance-log
// Check dashboard cards display:
// - Total Logs
// - In Maintenance
// - Ready
// - Dropout
// - Avg Performance Score
```

#### Test 5: Download PDF Report

```javascript
// Click download button on any completed log
// Verify PDF contains:
// ✓ KMRL branding
// ✓ Maintenance details
// ✓ Performance metrics
// ✓ Before/after comparison
// ✓ Overall score gauge
// ✓ Alert box
// ✓ Cost information
```

## Performance Metrics Color Coding

### Score Ranges:

- **85-100%**: 🟢 Green (Excellent) - Light green background
- **70-84%**: 🟡 Yellow (Good) - Light yellow background
- **60-69%**: 🟠 Orange (Fair) - Light orange background
- **0-59%**: 🔴 Red (Poor) - Light red background

### Status Badges:

- **In Maintenance**: 🔵 Blue badge with Clock icon
- **Ready**: 🟢 Green badge with CheckCircle icon
- **Dropout**: 🔴 Red badge with AlertTriangle icon
- **Testing**: 🟡 Yellow badge with TrendingUp icon
- **Pending Approval**: 🟣 Purple badge with FileText icon

## API Response Examples

### GET /api/maintenance/stats

```json
{
  "success": true,
  "data": {
    "totalMaintenanceLogs": 45,
    "trainsInMaintenance": 3,
    "readyTrains": 38,
    "dropoutTrains": 4,
    "averagePerformanceScore": 87.5,
    "maintenanceByType": {
      "scheduled": 30,
      "preventive": 10,
      "emergency": 5
    }
  }
}
```

### PUT /api/maintenance/:id/complete

```json
{
  "success": true,
  "message": "Maintenance completed and performance assessed",
  "data": {
    "_id": "...",
    "trainNumber": "KMRL-001",
    "overallPerformanceScore": 92.5,
    "trainStatus": "ready",
    "readyForOperation": true
  },
  "readiness": {
    "status": "ready",
    "ready": true,
    "score": 92.5,
    "alertType": "ready",
    "alertMessage": "Train KMRL-001 is READY for operation with performance score 92.5%"
  }
}
```

## Future Enhancements

### Planned Features:

1. **Predictive Maintenance AI:**

   - Machine learning model to predict maintenance needs
   - Anomaly detection in performance trends
   - Optimal maintenance scheduling

2. **Mobile App Integration:**

   - Technician mobile interface
   - Real-time status updates
   - Photo uploads for components

3. **Advanced Analytics:**

   - Performance trend analysis
   - Cost optimization insights
   - Maintenance efficiency metrics

4. **Integration with IBM Maximo:**

   - Bidirectional sync
   - Work order automation
   - Parts inventory management

5. **Notifications:**

   - Email alerts for critical issues
   - SMS notifications for supervisors
   - Push notifications for mobile app

6. **Approval Workflow:**
   - Multi-level approval process
   - Digital signatures
   - Audit trail

## Troubleshooting

### Issue: Maintenance logs not loading

**Solution:**

- Check backend server is running: `http://localhost:5000/api/maintenance`
- Verify MongoDB connection in terminal logs
- Check browser console for API errors

### Issue: Performance assessment not working

**Solution:**

- Ensure all 6 parameters are filled (0-100 range)
- Verify serviceOutTime is after serviceInTime
- Check backend logs for calculation errors

### Issue: PDF download failing

**Solution:**

- Check jsPDF library is installed
- Verify file-saver package is available
- Check browser console for errors

### Issue: Train status not updating

**Solution:**

- Verify trainsetId exists in database
- Check Trainset model has status field
- Review backend logs for update errors

## Security Considerations

1. **Authentication:** All routes protected with AuthContext
2. **Input Validation:** Server-side validation for all fields
3. **SQL Injection Prevention:** Mongoose parameterized queries
4. **XSS Protection:** React auto-escapes all user input
5. **Rate Limiting:** Applied via express-rate-limit middleware

## Support

For issues or questions:

- Check backend logs: `backend/server.js` console output
- Review frontend console: Browser DevTools (F12)
- Verify API endpoints: Use `/debug` route for API testing
- Contact system administrator for database access

## Changelog

### Version 1.0.0 (2025-10-04)

- Initial implementation
- 6-parameter performance analysis
- Automatic readiness assessment
- PDF report generation
- Multi-language support (EN, HI, ML)
- Alert system integration
- Statistics dashboard
- Navigation integration

---

**Document Version:** 1.0.0  
**Last Updated:** October 4, 2025  
**Author:** KMRL Development Team  
**System:** Train Plan Wise - Maintenance Module
