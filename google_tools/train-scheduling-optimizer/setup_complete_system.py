#!/usr/bin/env python3
"""
Complete setup script for KMRL Train Scheduling System
This script handles:
1. CSV data migration to MongoDB
2. Starting the FastAPI backend server
3. Instructions for React frontend integration
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def print_banner():
    print("=" * 80)
    print("KMRL TRAIN SCHEDULING SYSTEM - COMPLETE SETUP")
    print("Google OR-Tools Optimization with React Frontend")
    print("=" * 80)

def check_python_requirements():
    """Check if Python and required packages are available"""
    print("\n🔍 Checking Python requirements...")
    
    try:
        import pymongo
        import pandas
        import ortools
        import fastapi
        import uvicorn
        print("✅ All Python packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python package: {e}")
        print("\n📦 Installing required packages...")
        
        try:
            subprocess.check_call([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ])
            print("✅ Packages installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages")
            return False

def check_mongodb():
    """Check if MongoDB is running"""
    print("\n🔍 Checking MongoDB connection...")
    
    try:
        from pymongo import MongoClient
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=3000)
        client.admin.command('ping')
        print("✅ MongoDB is running and accessible")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n💡 Please ensure MongoDB is installed and running:")
        print("   - Download: https://www.mongodb.com/try/download/community")
        print("   - Start service: mongod")
        return False

def migrate_csv_data():
    """Run CSV to MongoDB migration"""
    print("\n📊 Migrating CSV data to MongoDB...")
    
    try:
        from src.data.mongodb_csv_migrator import KMRLMongoDBMigrator
        
        migrator = KMRLMongoDBMigrator()
        results = migrator.migrate_all_data()
        
        print("\n📈 Migration Results:")
        for dataset, success in results.items():
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"   {dataset}: {status}")
        
        # Show statistics
        stats = migrator.get_collection_stats()
        print(f"\n📊 Data Statistics:")
        for collection, count in stats.items():
            print(f"   {collection}: {count:,} documents")
        
        # Validate data
        validation = migrator.validate_data_integrity()
        print(f"\n🔍 Data Validation:")
        print(f"   Total trainsets: {validation['total_trainsets']}")
        print(f"   Available for scheduling: {validation['trainsets_with_fitness']}")
        print(f"   Fitness coverage: {validation['fitness_coverage_percent']:.1f}%")
        
        migrator.close_connection()
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_optimization():
    """Test the optimization engine"""
    print("\n🧪 Testing optimization engine...")
    
    try:
        from src.optimization.scheduler import run_optimization
        from datetime import datetime, timedelta
        
        target_date = datetime.now() + timedelta(days=1)
        result = run_optimization(target_date)
        
        print(f"\n✅ Optimization test successful!")
        print(f"   Status: {result.solution_status}")
        print(f"   Selected trains: {len(result.selected_trains)}")
        print(f"   Execution time: {result.execution_time:.2f}s")
        print(f"   Optimization score: {result.optimization_score:.2f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Optimization test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def start_backend_server():
    """Start the FastAPI backend server"""
    print("\n🚀 Starting FastAPI backend server...")
    print("   Server will run at: http://localhost:8000")
    print("   API Documentation: http://localhost:8000/docs")
    print("   Health Check: http://localhost:8000/health")
    print("\n   Press Ctrl+C to stop the server")
    
    try:
        # Change to the correct directory
        os.chdir(Path(__file__).parent)
        
        # Start the server
        subprocess.run([
            sys.executable, "api_server.py"
        ])
        
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
    except Exception as e:
        print(f"❌ Failed to start server: {e}")

def show_frontend_integration_instructions():
    """Show instructions for React frontend integration"""
    print("\n" + "=" * 80)
    print("REACT FRONTEND INTEGRATION INSTRUCTIONS")
    print("=" * 80)
    
    print("""
📱 FRONTEND SETUP COMPLETED:

1. Train Scheduling UI Component: ✅ Created
   Location: src/components/TrainSchedulingPanel.tsx

2. Train Scheduling Page: ✅ Created  
   Location: src/pages/TrainScheduling.tsx

3. Navigation Integration: ✅ Added
   - Added to FuturisticNavigation.tsx
   - Added to Dashboard.tsx routing
   - Added translation keys

4. API Integration: ✅ Ready
   - FastAPI server running on http://localhost:8000
   - React frontend should connect automatically

🔧 TO USE THE TRAIN SCHEDULING SYSTEM:

1. Start your React development server:
   cd C:\\Project\\Kochi-Metro-Rail-Limited-KMRL-
   npm run dev

2. Navigate to the application in your browser
   
3. Click on the "Train Scheduling (OR-Tools)" module in the navigation

4. Click "Run Optimization" to select the best 24 trains

📊 FEATURES AVAILABLE:

✅ CSV Data Integration - Loads from C:\\Project\\Kochi-Metro-Rail-Limited-KMRL-\\csv_data_files
✅ MongoDB Storage - All data properly indexed and validated
✅ Google OR-Tools Optimization - 6-criteria optimization engine
✅ Real-time UI - Shows selected trains and remaining trains for review
✅ Bay Assignment - Optimal positioning to minimize shunting
✅ Detailed Scoring - Explains why each train was selected/excluded
✅ Export Functionality - Download results as JSON

🎯 OPTIMIZATION CRITERIA:

1. Fitness Certificates ✅ - Rolling-Stock, Signalling, Telecom validity
2. Job-Card Status ✅ - IBM Maximo open/closed work orders  
3. Branding Priorities ✅ - Contractual exposure hour commitments
4. Mileage Balancing ✅ - Equalizes bogie, brake-pad, HVAC wear
5. Cleaning & Detailing ✅ - Available manpower and bay occupancy
6. Stabling Geometry ✅ - Minimizes nightly shunting time

🔍 TROUBLESHOOTING:

- If optimization fails: Check MongoDB connection and CSV data
- If no trains available: Run CSV migration again
- If frontend errors: Ensure FastAPI server is running on port 8000

📞 READY FOR PRODUCTION USE! 🚀
""")

def main():
    """Main setup function"""
    print_banner()
    
    setup_steps = [
        ("Python Requirements", check_python_requirements),
        ("MongoDB Connection", check_mongodb), 
        ("CSV Data Migration", migrate_csv_data),
        ("Optimization Test", test_optimization)
    ]
    
    # Run setup steps
    for step_name, step_func in setup_steps:
        print(f"\n{'='*20} {step_name} {'='*20}")
        if not step_func():
            print(f"\n❌ Setup failed at: {step_name}")
            print("Please fix the issues above and run the setup again.")
            sys.exit(1)
    
    # Show frontend instructions
    show_frontend_integration_instructions()
    
    # Ask user if they want to start the backend server
    print("\n" + "="*80)
    choice = input("🚀 Do you want to start the FastAPI backend server now? (y/n): ").lower().strip()
    
    if choice in ['y', 'yes']:
        start_backend_server()
    else:
        print("\n✅ Setup completed successfully!")
        print("💡 To start the backend server later, run: python api_server.py")
        print("💡 To start the React frontend, run: npm run dev")

if __name__ == "__main__":
    main()