#!/usr/bin/env python3
"""
Setup and Installation Script for OR-Tools Service
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout.strip():
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"   Error: {e.stderr.strip()}")
        return False

def main():
    print("🚀 Google OR-Tools Train Scheduling Service Setup")
    print("=" * 60)
    
    # Check Python version
    python_version = sys.version_info
    print(f"🐍 Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("\n💡 Alternative installation methods:")
        print("   pip install --user -r requirements.txt")
        print("   python -m pip install -r requirements.txt")
        return False
    
    # Test OR-Tools installation
    print("\n🧪 Testing OR-Tools installation...")
    try:
        from ortools.sat.python import cp_model
        print("✅ OR-Tools successfully imported")
        
        # Quick test
        model = cp_model.CpModel()
        solver = cp_model.CpSolver()
        print("✅ OR-Tools solver ready")
        
    except ImportError as e:
        print(f"❌ OR-Tools import failed: {e}")
        return False
    
    # Test Flask installation
    print("\n🌐 Testing Flask installation...")
    try:
        import flask
        from flask_cors import CORS
        print(f"✅ Flask {flask.__version__} ready")
        print("✅ Flask-CORS ready")
    except ImportError as e:
        print(f"❌ Flask import failed: {e}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("   1. Run the service: python ortools_service.py")
    print("   2. Service will start on: http://localhost:8001")
    print("   3. Test endpoint: http://localhost:8001/api/health")
    print("   4. Start your frontend application")
    print("\n🚂 The OR-Tools service is ready for train scheduling optimization!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)