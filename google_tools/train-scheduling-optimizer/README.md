# KMRL Train Scheduling System

## AI-Powered Optimization using Google OR-Tools

A comprehensive train scheduling system that optimizes the selection of 24 trains from the KMRL fleet based on 6 key criteria using Google OR-Tools optimization engine.

## 🎯 Features

### Core Optimization Engine

- **Google OR-Tools Integration**: Advanced constraint programming for optimal train selection
- **Multi-Criteria Decision Making**: Considers 6 different factors simultaneously
- **Real-time Processing**: Results delivered in seconds
- **Scalable Architecture**: MongoDB backend with FastAPI REST API

### 6 Optimization Criteria

1. **Fitness Certificates** 🏥

   - Rolling-Stock department validity windows
   - Signalling department certifications
   - Telecom department approvals
   - Automatic expiry date tracking

2. **Job-Card Status** 🔧

   - IBM Maximo work order integration
   - Open vs. closed job differentiation
   - Priority-based blocking (emergency/high priority jobs block trains)
   - Real-time maintenance status

3. **Branding Priorities** 🎨

   - Contractual advertising commitments
   - Exterior wrap exposure hour tracking
   - Penalty clause consideration
   - Revenue optimization

4. **Mileage Balancing** ⚖️

   - Bogie wear equalization
   - Brake-pad usage balancing
   - HVAC runtime distribution
   - Fleet longevity optimization

5. **Cleaning & Detailing Slots** ✨

   - Available manpower consideration
   - Bay occupancy scheduling
   - Deep-cleaning cycle management
   - Resource allocation optimization

6. **Stabling Geometry** 🏭
   - Physical bay position optimization
   - Shunting time minimization
   - Morning turn-out efficiency
   - Depot layout consideration

### User Interface

- **Modern React Frontend**: Clean, intuitive interface
- **Real-time Updates**: Live status and progress tracking
- **Dual Display**: Selected trains (24) + remaining trains for review
- **Export Functionality**: Download results in JSON format
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **MongoDB** (local or Atlas)
- **Node.js 16+** with npm
- **CSV Data Files** in `C:\Project\Kochi-Metro-Rail-Limited-KMRL-\csv_data_files\`

### One-Click Setup

```bash
cd C:\Project\Kochi-Metro-Rail-Limited-KMRL-\google_tools\train-scheduling-optimizer
python setup_complete_system.py
```

This script will:

1. ✅ Install Python dependencies
2. ✅ Check MongoDB connection
3. ✅ Migrate CSV data to MongoDB
4. ✅ Test optimization engine
5. ✅ Start FastAPI backend server
6. ✅ Provide React integration instructions

### Manual Setup

#### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update connection string in code)
```

#### 3. Migrate CSV Data

```bash
python src/data/mongodb_csv_migrator.py
```

#### 4. Start Backend Server

```bash
python api_server.py
```

Server runs at: http://localhost:8000

#### 5. Start React Frontend

```bash
cd C:\Project\Kochi-Metro-Rail-Limited-KMRL-
npm run dev
```

#### 6. Access the Application

- Open browser: http://localhost:3000 (or your React dev server port)
- Navigate to "Train Scheduling (OR-Tools)" in the app
- Click "Run Optimization" to schedule trains

## 🧪 Testing

### Run Complete System Test

```bash
python test_complete_system.py
```

Tests include:

- ✅ CSV data migration
- ✅ MongoDB connectivity
- ✅ Data loading and validation
- ✅ Constraint analysis
- ✅ Optimization engine
- ✅ API endpoints

## 🔧 API Endpoints

### Main Endpoints

- `GET /health` - System health check
- `POST /api/train-scheduling/optimize` - Run optimization
- `GET /api/train-scheduling/status` - Get scheduling status
- `POST /api/data/migrate` - Migrate CSV data
- `GET /api/data/summary` - Get data summary

## 📞 Support

For support and questions:

- 🐛 Issues: Create GitHub issue
- 📚 Documentation: See project wiki

---

**🎉 Ready to optimize your train scheduling with AI! 🚂✨**
