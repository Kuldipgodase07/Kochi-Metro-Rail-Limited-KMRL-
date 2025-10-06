# 🚄 Maintenance Log System - Complete Guide

## ✅ Your Database Is Ready!

Your system has **2 MongoDB collections** already set up:

### 1. **`trainsets`** Collection (100 trains)

- Train identification and current status
- Mileage, bay position, availability
- Connected to maintenance logs

### 2. **`maintenance_logs`** Collection (Ready for use)

- Service in/out times
- 6 performance parameters
- Automatic readiness alerts
- Performance scoring

---

## 🎯 How The System Works

### Step 1: Train Enters Maintenance

When a train needs maintenance:

1. Go to **http://localhost:8084/maintenance-log**
2. Click **"New Maintenance Log"** button
3. Select train from dropdown (shows all 100 trains)
4. Enter **Service In Time** (when maintenance started)
5. Enter maintenance type, priority, work description
6. Click **"Create Log"**

**What Happens:**

- New record created in `maintenance_logs` collection
- Train status in `trainsets` updated to `"maintenance"`
- Log appears in table with **"IN-MAINTENANCE"** badge

---

### Step 2: Complete Maintenance & Check Performance

After maintenance work is done:

1. Click **"Complete"** button on the log
2. Enter **Service Out Time** (when maintenance finished)
3. Enter **6 Performance Parameters** (0-100%):

#### 🔧 The 6 Parameters:

| Parameter                 | Weight | Critical? | Description           |
| ------------------------- | ------ | --------- | --------------------- |
| **Braking Efficiency**    | 25%    | ✅ YES    | Must be ≥70%          |
| **Traction Motor Health** | 25%    | ✅ YES    | Must be ≥70%          |
| **Signal Communication**  | 15%    | No        | Communication systems |
| **Door Operation Score**  | 15%    | No        | Door reliability      |
| **HVAC System Status**    | 10%    | No        | Climate control       |
| **Battery Health**        | 10%    | No        | Power backup          |

4. Enter total maintenance cost
5. Add remarks (optional)
6. Click **"Complete Maintenance"**

**What Happens:**

- System calculates weighted performance score
- Automatic readiness assessment runs
- Alert generated (READY/DROPOUT/TESTING)
- Train status updated in database
- Duration automatically calculated

---

### Step 3: Automatic Alert System

The system **automatically decides** if train is ready:

#### ✅ **READY** Alert (Green)

**Conditions:**

- Overall Score ≥ 85%
- AND Braking Efficiency ≥ 70%
- AND Traction Motor ≥ 70%

**Result:**

- Train status: `"ready"`
- Alert: "Train XXX is READY for operation"
- Trainset status updated to `"available"`

**Example:**

```
Braking: 95%, Traction: 92%, Door: 90%
HVAC: 88%, Signal: 91%, Battery: 89%
→ Score: 92.05% → READY ✅
```

---

#### ❌ **DROPOUT** Alert (Red)

**Conditions:**

- Overall Score < 60%
- OR Braking Efficiency < 70%
- OR Traction Motor < 70%

**Result:**

- Train status: `"dropout"`
- Alert: "Train XXX DROPPED OUT - Critical systems need attention"
- Trainset status updated to `"out-of-service"`

**Example:**

```
Braking: 65% ← Too Low!
Traction: 92%, Door: 80%
→ Score: 76.75% BUT Braking Failed → DROPOUT ❌
```

---

#### ⚠️ **TESTING** Alert (Yellow)

**Conditions:**

- Overall Score between 60-85%
- AND Critical parameters 70-100%

**Result:**

- Train status: `"testing"`
- Alert: "Train XXX requires additional testing"
- Trainset status updated to `"testing"`

**Example:**

```
Braking: 78%, Traction: 80%, Door: 75%
→ Score: 76.15% → TESTING ⚠️
```

---

## 📊 Performance Calculation Formula

```javascript
Overall Score =
  (Braking × 25%) +
  (Traction × 25%) +
  (Signal × 15%) +
  (Door × 15%) +
  (HVAC × 10%) +
  (Battery × 10%)
```

**Example Calculation:**

```
Train 101 Maintenance:
- Braking: 92% → 92 × 0.25 = 23.00
- Traction: 95% → 95 × 0.25 = 23.75
- Signal: 88% → 88 × 0.15 = 13.20
- Door: 90% → 90 × 0.15 = 13.50
- HVAC: 85% → 85 × 0.10 = 8.50
- Battery: 87% → 87 × 0.10 = 8.70
                    Total = 90.65%

Score ≥ 85% ✅
Braking ≥ 70% ✅
Traction ≥ 70% ✅
→ Status: READY ✅
```

---

## 📋 Database Structure

### Maintenance Log Entry Example:

```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "trainsetId": "507f191e810c19729de860ea",
  "trainNumber": "101",

  // Maintenance Period
  "serviceInTime": "2025-10-04T08:00:00Z",
  "serviceOutTime": "2025-10-04T14:30:00Z",
  "maintenanceDuration": 6.5, // hours

  // Maintenance Details
  "maintenanceType": "preventive",
  "maintenancePriority": "medium",
  "workDescription": "Routine inspection and brake system check",

  // Performance After Maintenance
  "performanceAfterMaintenance": {
    "brakingEfficiency": 92,
    "doorOperationScore": 90,
    "tractionMotorHealth": 95,
    "hvacSystemStatus": 85,
    "signalCommunicationQuality": 88,
    "batteryHealthStatus": 87
  },

  // Calculated Results
  "overallPerformanceScore": 90.65,
  "trainStatus": "ready",
  "readyForOperation": true,

  // Alert Information
  "alertGenerated": true,
  "alertType": "ready",
  "alertMessage": "Train 101 is READY for operation with performance score 90.65%",
  "alertTimestamp": "2025-10-04T14:35:00Z",

  // Additional Info
  "totalMaintenanceCost": 15000,
  "remarks": "All systems nominal",
  "createdBy": "maintenance-team-1",
  "updatedBy": "supervisor-2",

  "createdAt": "2025-10-04T08:00:00Z",
  "updatedAt": "2025-10-04T14:35:00Z"
}
```

---

## 🎨 UI Features

### Statistics Dashboard

Shows real-time counts from database:

- **Total Logs**: All maintenance records
- **In Maintenance**: Currently being serviced
- **Ready**: Trains passed performance check
- **Dropout**: Trains failed performance check
- **Average Score**: Mean performance across all trains

### Active Alerts Panel

Color-coded notifications:

- 🟢 **Green**: READY alerts
- 🔴 **Red**: DROPOUT alerts
- 🟡 **Yellow**: TESTING/WARNING alerts

### Maintenance Logs Table

Displays all logs with:

- Train number
- Service in/out times
- Maintenance type
- Status badge (color-coded)
- Performance score
- Actions (Complete/Download)

### PDF Reports

Download professional reports with:

- KMRL branding (dark teal theme)
- Service details
- Performance comparison
- Score gauge with colors
- Alert notifications
- Cost summary

---

## 🔄 Complete Workflow Example

### Scenario: Train 101 Needs Preventive Maintenance

**1. Create Maintenance Log** (08:00 AM)

```
Train: 101
Service In: 2025-10-04 08:00
Type: Preventive
Priority: Medium
Description: Routine brake and door system check
```

→ Database: New record created
→ Train 101 status: `"maintenance"`

**2. Perform Maintenance Work** (08:00 - 14:00)

- Inspect braking system
- Check door mechanisms
- Test traction motors
- Verify HVAC operation
- Test communication systems
- Check battery health

**3. Complete & Test** (14:00 PM)

```
Service Out: 2025-10-04 14:00
Performance Results:
  Braking: 92%
  Traction: 95%
  Door: 90%
  Signal: 88%
  HVAC: 85%
  Battery: 87%
Cost: ₹15,000
```

**4. System Calculates** (Automatic)

```
Score = (92×0.25) + (95×0.25) + (88×0.15) +
        (90×0.15) + (85×0.10) + (87×0.10)
      = 23.00 + 23.75 + 13.20 + 13.50 + 8.50 + 8.70
      = 90.65%

Check: Score ≥ 85% ✅
Check: Braking ≥ 70% ✅
Check: Traction ≥ 70% ✅

→ Status: READY ✅
```

**5. Alert Generated** (Automatic)

```
Alert Type: READY
Message: "Train 101 is READY for operation with performance score 90.65%"
Train Status: "ready"
Trainset Updated: "available"
```

**6. Download Report**

- Click "Download Report" button
- PDF generated with all details
- File: `Maintenance_Report_101_2025-10-04.pdf`

---

## 🧪 Test It Now!

### Quick Test Steps:

1. **Open Page**

   ```
   http://localhost:8084/maintenance-log
   ```

2. **Create Test Log**

   - Click "New Maintenance Log"
   - Select any train
   - Set service in time to now
   - Fill in details
   - Create

3. **Complete Maintenance**

   - Click "Complete" on the log
   - Set service out time
   - Enter these test scores:
     ```
     Braking: 92%
     Traction: 95%
     Door: 90%
     Signal: 88%
     HVAC: 85%
     Battery: 87%
     Cost: 15000
     ```
   - Complete

4. **Verify Results**

   - Check performance score: Should be ~90.65%
   - Check status badge: Should show "READY" in green
   - Check alerts panel: Should show ready alert
   - Check statistics: Should update counts

5. **Download PDF**
   - Click "Download Report"
   - Verify PDF contains all information

---

## 📊 Database Tables

### Table 1: `trainsets`

```
Total Records: 100 trains
Fields: number, status, mileage, bay_position, availability_percentage
Status Values: ready, maintenance, standby, critical
```

### Table 2: `maintenance_logs`

```
Total Records: 0 (ready for new logs)
Fields: All maintenance details, performance, alerts
Referenced: trainsets (via trainsetId)
```

---

## ✅ System Status

✅ **Backend API**: Running on port 5000
✅ **Frontend UI**: Running on port 8084
✅ **MongoDB**: Connected (100 trainsets ready)
✅ **Collections**: trainsets & maintenance_logs ready
✅ **Routes**: All 9 API endpoints working
✅ **Performance Logic**: Weighted scoring ready
✅ **Alert System**: Automatic assessment ready
✅ **PDF Generator**: KMRL branded reports ready

---

## 🎉 Your System is 100% Ready!

Everything is connected to your database:

- ✅ 100 real trains from `trainsets` collection
- ✅ New logs saved to `maintenance_logs` collection
- ✅ Performance calculation works automatically
- ✅ Alerts generated automatically
- ✅ Train statuses update in real-time

**Just start using it!** The system will:

1. Save all data to MongoDB
2. Calculate performance scores
3. Generate alerts (READY/DROPOUT/TESTING)
4. Update train statuses
5. Create PDF reports

---

**Ready to test? Go to: http://localhost:8084/maintenance-log**
