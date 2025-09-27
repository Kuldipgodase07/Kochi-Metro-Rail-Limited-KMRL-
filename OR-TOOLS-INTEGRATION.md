# 🚂 Google OR-Tools Integration Guide

Complete setup guide for connecting Frontend + Backend + Google OR-Tools for intelligent train scheduling.

## 🎯 System Architecture

```
React Frontend (Port 8080)
    ↓ API Calls
Node.js Backend (Port 5000)
    ↓ Proxy
Google OR-Tools Service (Port 8001)
```

## 📋 Prerequisites

### Required Software:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Git** (optional) - For cloning repository

### Python Dependencies:

- Google OR-Tools (Constraint Programming)
- Flask (Web API)
- Flask-CORS (Cross-origin requests)

## 🚀 Quick Start (Automated)

### Option 1: Complete System Startup

```powershell
# Run from project root directory
.\start-system.ps1
```

This will:

1. Check prerequisites
2. Install Python dependencies
3. Start OR-Tools service (Port 8001)
4. Start Node.js backend (Port 5000)
5. Start React frontend (Port 8080)

### Option 2: Step-by-Step Manual Setup

#### 1. Setup Python OR-Tools Service

```powershell
cd backend
.\setup_ortools.ps1
# OR manually:
# pip install -r requirements.txt
# python ortools_service.py
```

#### 2. Setup Node.js Backend

```powershell
cd backend
npm install
npm run dev
```

#### 3. Setup React Frontend

```powershell
# From project root
npm install
npm run dev
```

## 🧪 Testing the Integration

### 1. Test OR-Tools Service

```bash
curl http://localhost:8001/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "OR-Tools Train Scheduling",
  "ortools_available": true
}
```

### 2. Test Backend Proxy

```bash
curl http://localhost:5000/health
```

### 3. Test Complete Integration

1. Open browser: `http://localhost:8080`
2. Login to the system
3. Navigate to: **AI Scheduling Panel**
4. Click: **"Connect to OR-Tools Service"**
5. Verify optimization results appear

## 🔧 OR-Tools Features Implemented

### Constraint Programming Model:

1. **Decision Variables**: Binary selection of trains (0/1)
2. **Constraints**:
   - Exactly 24 trains selected
   - Depot load balancing (±3 trains difference)
   - Age diversity (minimum 1/3 newer trains)
   - Manufacturer diversity (minimum 2 per brand)

### Optimization Objectives:

1. **Operational Status** (40%) - Ready > Standby > Maintenance
2. **Age & Reliability** (25%) - Newer trains preferred
3. **Make/Model** (20%) - Alstom > Hyundai Rotem > BEML
4. **Maintenance Freshness** (10%) - Recently maintained preferred
5. **Fitness Certificate** (5%) - Valid certificates required

### Real-Time Metrics:

- **Execution Time**: Actual OR-Tools solver duration
- **Solution Status**: OPTIMAL/FEASIBLE/INFEASIBLE
- **Constraint Violations**: Detected and reported
- **Optimization Score**: Weighted average of selected trains

## 🐛 Troubleshooting

### OR-Tools Service Issues:

```powershell
# Check Python installation
python --version

# Test OR-Tools import
python -c "from ortools.sat.python import cp_model; print('OR-Tools OK')"

# Reinstall dependencies
pip install --force-reinstall ortools flask flask-cors
```

### Backend Proxy Issues:

```powershell
# Install proxy middleware
npm install http-proxy-middleware

# Check backend logs
npm run dev
```

### Frontend Connection Issues:

- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure API endpoint is `http://localhost:5000/api/train-scheduling/optimize`

## 📊 Service Endpoints

### OR-Tools Service (Port 8001):

- `GET /` - Service info
- `GET /api/health` - Health check
- `POST /api/train-scheduling/optimize` - Optimization endpoint

### Node.js Backend (Port 5000):

- `GET /health` - Backend health
- `POST /api/train-scheduling/optimize` - Proxied to OR-Tools
- `POST /api/auth/login` - Authentication
- Other existing API routes...

### Frontend (Port 8080):

- Main application
- AI Scheduling Panel: `/dashboard` → AI Scheduling module

## 🔍 Monitoring & Logs

### Check Service Status:

```powershell
# OR-Tools service
curl http://localhost:8001/api/health

# Backend service
curl http://localhost:5000/health

# Frontend
# Open http://localhost:8080 in browser
```

### View Logs:

- **OR-Tools**: Check terminal running `python ortools_service.py`
- **Backend**: Check terminal running `npm run dev` in backend folder
- **Frontend**: Check browser developer console

## 🎉 Success Verification

When everything is working correctly, you should see:

1. ✅ OR-Tools service responding on port 8001
2. ✅ Node.js backend proxying on port 5000
3. ✅ React frontend loading on port 8080
4. ✅ AI Scheduling Panel connects and shows optimization results
5. ✅ Real constraint programming with depot balancing, age diversity, etc.
6. ✅ Actual Google OR-Tools solver execution times and status

## 📈 Next Steps

- Customize constraints in `ortools_service.py`
- Add more optimization criteria
- Implement train availability from database
- Add real-time constraint updates
- Scale to multiple depots/regions

---

**🚂 Enjoy your intelligent train scheduling system powered by Google OR-Tools!**
