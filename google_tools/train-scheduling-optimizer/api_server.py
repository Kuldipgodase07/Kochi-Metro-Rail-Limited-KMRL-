"""
FastAPI backend service for KMRL Train Scheduling
Provides API endpoints to connect React frontend with Python optimization engine
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List
import sys
import os
import json
import asyncio
import uvicorn

# Add the optimization module to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.optimization.scheduler import KMRLTrainSchedulingOptimizer, SchedulingResult
from src.data.loader import KMRLDataLoader
from src.data.mongodb_csv_migrator import KMRLMongoDBMigrator

app = FastAPI(
    title="KMRL Train Scheduling API",
    description="AI-powered train scheduling optimization using Google OR-Tools",
    version="1.0.0"
)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OptimizationRequest(BaseModel):
    target_date: Optional[str] = None
    max_trains: Optional[int] = None
    force_refresh_data: bool = False

class DataMigrationRequest(BaseModel):
    clear_existing: bool = True

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    mongodb_connected: bool
    optimization_ready: bool

# Global state for caching
optimization_cache = {}
last_optimization_time = None

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "KMRL Train Scheduling API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "optimize": "/api/train-scheduling/optimize",
            "status": "/api/train-scheduling/status",
            "migrate": "/api/data/migrate"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    mongodb_connected = False
    optimization_ready = False
    
    try:
        # Test MongoDB connection
        loader = KMRLDataLoader()
        data = loader.get_optimization_dataset()
        loader.close_connection()
        
        mongodb_connected = True
        optimization_ready = data['available_for_scheduling'] >= 24
        
    except Exception as e:
        print(f"Health check failed: {e}")
    
    return HealthResponse(
        status="healthy" if mongodb_connected else "unhealthy",
        timestamp=datetime.now().isoformat(),
        mongodb_connected=mongodb_connected,
        optimization_ready=optimization_ready
    )

@app.post("/api/data/migrate")
async def migrate_csv_data(request: DataMigrationRequest, background_tasks: BackgroundTasks):
    """Migrate CSV data to MongoDB"""
    try:
        def run_migration():
            migrator = KMRLMongoDBMigrator()
            
            if request.clear_existing:
                migrator.clear_existing_data()
            
            results = migrator.migrate_all_data()
            stats = migrator.get_collection_stats()
            validation = migrator.validate_data_integrity()
            migrator.close_connection()
            
            return {
                "results": results,
                "statistics": stats,
                "validation": validation
            }
        
        # Run migration in background
        background_tasks.add_task(run_migration)
        
        return JSONResponse(
            status_code=202,
            content={
                "message": "Migration started",
                "status": "processing"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")

@app.get("/api/train-scheduling/status")
async def get_scheduling_status():
    """Get current scheduling system status"""
    try:
        loader = KMRLDataLoader()
        data = loader.get_optimization_dataset()
        loader.close_connection()
        
        return {
            "status": "ready",
            "total_trainsets": data['trainset_count'],
            "available_for_scheduling": data['available_for_scheduling'],
            "high_priority_branding": data['high_priority_branding'],
            "available_bays": data['available_bays'],
            "last_optimization": last_optimization_time.isoformat() if last_optimization_time else None,
            "data_freshness": data['target_date'].isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")

@app.post("/api/train-scheduling/optimize")
async def optimize_train_schedule(request: OptimizationRequest):
    """Run train scheduling optimization"""
    global optimization_cache, last_optimization_time
    
    try:
        # Parse target date
        target_date = datetime.now()
        if request.target_date:
            try:
                target_date = datetime.fromisoformat(request.target_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid target_date format")
        
        # Create cache key
        cache_key = f"{target_date.isoformat()}_{request.max_trains}"
        
        # Return cached result if available and not forcing refresh
        if not request.force_refresh_data and cache_key in optimization_cache:
            return optimization_cache[cache_key]
        
        print(f"Running optimization for {target_date}")
        
        # Initialize optimizer
        optimizer = KMRLTrainSchedulingOptimizer()
        
        try:
            # Load data
            data = optimizer.load_data(target_date)
            
            # Check if we have enough trains
            if data['available_for_scheduling'] < 24:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient trains available for scheduling. "
                           f"Need 24, have {data['available_for_scheduling']}"
                )
            
            # Run optimization
            result = optimizer.solve_optimization(data)
            
            # Generate comprehensive report
            report = optimizer.generate_schedule_report(result)
            
            # Add API-specific metadata
            api_response = {
                **report,
                "api_metadata": {
                    "optimization_timestamp": datetime.now().isoformat(),
                    "request_parameters": {
                        "target_date": target_date.isoformat(),
                        "max_trains": request.max_trains,
                        "force_refresh": request.force_refresh_data
                    },
                    "system_info": {
                        "total_trains_analyzed": data['trainset_count'],
                        "constraints_applied": [
                            "fitness_certificates",
                            "job_cards", 
                            "branding_priorities",
                            "mileage_balancing",
                            "cleaning_constraints",
                            "stabling_geometry"
                        ]
                    }
                }
            }
            
            # Cache the result
            optimization_cache[cache_key] = api_response
            last_optimization_time = datetime.now()
            
            # Limit cache size
            if len(optimization_cache) > 10:
                oldest_key = min(optimization_cache.keys())
                del optimization_cache[oldest_key]
            
            return api_response
            
        finally:
            optimizer.close()
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Optimization error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/api/train-scheduling/history")
async def get_optimization_history():
    """Get optimization history"""
    return {
        "cached_optimizations": len(optimization_cache),
        "last_optimization": last_optimization_time.isoformat() if last_optimization_time else None,
        "available_results": list(optimization_cache.keys())
    }

@app.delete("/api/train-scheduling/cache")
async def clear_optimization_cache():
    """Clear optimization cache"""
    global optimization_cache, last_optimization_time
    
    cache_size = len(optimization_cache)
    optimization_cache.clear()
    last_optimization_time = None
    
    return {
        "message": f"Cleared {cache_size} cached results",
        "status": "success"
    }

@app.get("/api/data/summary")
async def get_data_summary():
    """Get summary of available data"""
    try:
        loader = KMRLDataLoader()
        data = loader.get_optimization_dataset()
        
        # Get constraint breakdown
        constraint_summary = {}
        
        if data['trainset_ids']:
            sample_ids = data['trainset_ids']
            
            # Fitness constraints summary
            fitness_data = data['fitness_constraints']
            constraint_summary['fitness'] = {
                'valid_certificates': sum(1 for tid in sample_ids if fitness_data[tid]['is_fitness_ok']),
                'total_trains': len(sample_ids),
                'avg_expiry_days': sum(fitness_data[tid]['min_expiry_days'] for tid in sample_ids) / len(sample_ids)
            }
            
            # Job cards summary
            job_data = data['job_card_constraints'] 
            constraint_summary['job_cards'] = {
                'available_for_service': sum(1 for tid in sample_ids if job_data[tid]['is_available_for_service']),
                'total_trains': len(sample_ids),
                'total_open_jobs': sum(job_data[tid]['open_job_count'] for tid in sample_ids)
            }
            
            # Branding summary
            branding_data = data['branding_requirements']
            constraint_summary['branding'] = {
                'urgent_branding': sum(1 for tid in sample_ids if branding_data[tid]['is_urgent']),
                'has_commitments': sum(1 for tid in sample_ids if branding_data[tid]['has_branding_commitments']),
                'total_trains': len(sample_ids)
            }
        
        loader.close_connection()
        
        return {
            "summary": {
                "total_trainsets": data['trainset_count'],
                "available_for_scheduling": data['available_for_scheduling'],
                "available_bays": data['available_bays'],
                "high_priority_branding": data['high_priority_branding']
            },
            "constraints": constraint_summary,
            "data_timestamp": data['target_date'].isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data summary failed: {str(e)}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    print("Starting KMRL Train Scheduling API Server...")
    print("API Documentation: http://localhost:8001/docs")
    print("Health Check: http://localhost:8001/health")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        reload=True,
        reload_dirs=["src"],
        log_level="info"
    )