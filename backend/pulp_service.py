#!/usr/bin/env python3
"""
PuLP-based Train Scheduling Optimization Service
Fallback solution for systems where OR-Tools doesn't work
Uses Linear Programming instead of Constraint Programming
"""

import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import pulp
    PULP_AVAILABLE = True
except ImportError:
    PULP_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

@dataclass
class TrainInfo:
    trainset_id: int
    number: str
    status: str
    make_model: str
    year_commissioned: int
    home_depot: str
    last_maintenance_date: str
    mileage: int
    fitness_expiry: str
    availability_score: float

class PuLPTrainSchedulingOptimizer:
    """PuLP-based train scheduling optimizer (OR-Tools alternative)"""
    
    def __init__(self):
        if not PULP_AVAILABLE:
            raise ImportError("PuLP is not installed. Run: pip install pulp")
        
    def generate_train_fleet(self) -> List[TrainInfo]:
        """Generate realistic train fleet data"""
        trains = []
        
        # Generate 50 trains with realistic characteristics
        for i in range(1, 51):
            # Realistic status distribution
            if i <= 30:
                status = 'ready'
            elif i <= 42:
                status = 'standby'  
            else:
                status = 'maintenance'
                
            # Realistic make/model distribution
            makes = ['Hyundai Rotem', 'Alstom', 'BEML']
            make_model = makes[i % 3]
            
            # Age distribution (newer trains more likely to be ready)
            if status == 'ready':
                year = 2018 + (i % 7)  # Newer trains
            else:
                year = 2015 + (i % 10)  # Mix of ages
                
            # Depot distribution
            depot = 'Depot A' if i % 2 == 0 else 'Depot B'
            
            # Maintenance and fitness data
            last_maint = (datetime.now() - timedelta(days=(i * 3) % 90)).strftime('%Y-%m-%d')
            fitness_exp = (datetime.now() + timedelta(days=(i * 5) % 180)).strftime('%Y-%m-%d')
            
            trains.append(TrainInfo(
                trainset_id=i,
                number=f'KMRL-{str(i).zfill(3)}',
                status=status,
                make_model=make_model,
                year_commissioned=year,
                home_depot=depot,
                last_maintenance_date=last_maint,
                mileage=50000 + (i * 1200) % 100000,
                fitness_expiry=fitness_exp,
                availability_score=0.0  # Will be calculated
            ))
            
        return trains
    
    def calculate_availability_score(self, train: TrainInfo, target_date: str) -> float:
        """Calculate comprehensive availability score for a train"""
        score = 0.0
        
        # 1. Operational Status (40 points max)
        if train.status == 'ready':
            score += 40.0
        elif train.status == 'standby':
            score += 25.0
        else:  # maintenance
            score += 5.0
            
        # 2. Age and Reliability (25 points max)
        age = 2025 - train.year_commissioned
        if age <= 3:
            score += 25.0
        elif age <= 6:
            score += 20.0
        elif age <= 10:
            score += 15.0
        else:
            score += 8.0
            
        # 3. Make/Model reliability (20 points max)
        reliability_scores = {
            'Alstom': 20.0,
            'Hyundai Rotem': 18.0,
            'BEML': 16.0
        }
        score += reliability_scores.get(train.make_model, 10.0)
        
        # 4. Maintenance freshness (10 points max)
        try:
            last_maint = datetime.strptime(train.last_maintenance_date, '%Y-%m-%d')
            days_since_maint = (datetime.now() - last_maint).days
            if days_since_maint < 30:
                score += 10.0
            elif days_since_maint < 60:
                score += 7.0
            else:
                score += 4.0
        except:
            score += 5.0
            
        # 5. Fitness certificate validity (5 points max)
        try:
            fitness_exp = datetime.strptime(train.fitness_expiry, '%Y-%m-%d')
            days_to_expiry = (fitness_exp - datetime.now()).days
            if days_to_expiry > 90:
                score += 5.0
            elif days_to_expiry > 30:
                score += 3.0
            else:
                score += 1.0
        except:
            score += 1.0
            
        return min(100.0, score)  # Cap at 100
    
    def optimize_schedule_pulp(self, target_date: str, num_trains_needed: int = 24) -> Dict[str, Any]:
        """
        Use PuLP Linear Programming to optimize train scheduling
        """
        start_time = time.time()
        
        # Get train fleet data
        trains = self.generate_train_fleet()
        
        # Calculate availability scores
        for train in trains:
            train.availability_score = self.calculate_availability_score(train, target_date)
        
        # Filter eligible trains (ready or standby status)
        eligible_trains = [t for t in trains if t.status in ['ready', 'standby']]
        
        if len(eligible_trains) < num_trains_needed:
            return {
                'error': f'Insufficient trains available. Need {num_trains_needed}, have {len(eligible_trains)} eligible.',
                'execution_time': time.time() - start_time
            }
        
        # PuLP Linear Programming Model
        prob = pulp.LpProblem("Train_Scheduling", pulp.LpMaximize)
        
        # Decision variables: which trains to select (binary)
        train_vars = {}
        for train in eligible_trains:
            train_vars[train.trainset_id] = pulp.LpVariable(
                f'train_{train.trainset_id}', 
                cat='Binary'
            )
        
        # Objective: Maximize total availability score
        prob += pulp.lpSum([
            train.availability_score * train_vars[train.trainset_id] 
            for train in eligible_trains
        ])
        
        # Constraint 1: Select exactly num_trains_needed trains
        prob += pulp.lpSum(train_vars.values()) == num_trains_needed
        
        # Constraint 2: Depot load balancing
        depot_a_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot A']
        depot_b_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot B']
        
        if depot_a_trains and depot_b_trains:
            # Try to balance between depots (allow ±3 difference)
            prob += pulp.lpSum(depot_a_trains) >= (num_trains_needed // 2) - 3
            prob += pulp.lpSum(depot_a_trains) <= (num_trains_needed // 2) + 3
        
        # Constraint 3: Age diversity (prefer mix of old and new trains)
        new_trains = [train_vars[t.trainset_id] for t in eligible_trains if 2025 - t.year_commissioned <= 5]
        if len(new_trains) > num_trains_needed // 3:
            prob += pulp.lpSum(new_trains) >= num_trains_needed // 3
        
        # Solve the optimization problem
        prob.solve(pulp.PULP_CBC_CMD(msg=0))  # Silent solver
        execution_time = time.time() - start_time
        
        status = pulp.LpStatus[prob.status]
        
        if status == 'Optimal':
            # Extract solution
            selected_trains = []
            remaining_trains = []
            
            for train in trains:
                if train.trainset_id in train_vars and pulp.value(train_vars[train.trainset_id]) == 1:
                    # This train was selected
                    selected_trains.append({
                        'trainset_id': train.trainset_id,
                        'number': train.number,
                        'status': train.status,
                        'assigned_bay_id': len(selected_trains) + 1,  # Assign bay sequentially
                        'scheduling_score': round(train.availability_score, 1),
                        'selection_reason': f'PuLP LP optimized selection (Score: {train.availability_score:.1f})',
                        'make_model': train.make_model,
                        'year_commissioned': train.year_commissioned,
                        'home_depot': train.home_depot
                    })
                else:
                    # This train was not selected
                    exclusion_reason = 'Not selected by PuLP optimization'
                    if train.status == 'maintenance':
                        exclusion_reason = 'Under maintenance - excluded from scheduling'
                    elif train.availability_score < 50:
                        exclusion_reason = f'Low availability score: {train.availability_score:.1f}'
                    
                    remaining_trains.append({
                        'trainset_id': train.trainset_id,
                        'number': train.number,
                        'status': train.status,
                        'scheduling_score': round(train.availability_score, 1),
                        'exclusion_reason': exclusion_reason,
                        'make_model': train.make_model,
                        'year_commissioned': train.year_commissioned,
                        'home_depot': train.home_depot
                    })
            
            # Sort by score (highest first)
            selected_trains.sort(key=lambda x: x['scheduling_score'], reverse=True)
            remaining_trains.sort(key=lambda x: x['scheduling_score'], reverse=True)
            
            # Calculate optimization metrics
            total_score = sum(t['scheduling_score'] for t in selected_trains)
            avg_score = total_score / len(selected_trains) if selected_trains else 0
            
            # Constraint violation checking
            violations = []
            depot_a_selected = len([t for t in selected_trains if t['home_depot'] == 'Depot A'])
            depot_b_selected = len([t for t in selected_trains if t['home_depot'] == 'Depot B'])
            depot_imbalance = abs(depot_a_selected - depot_b_selected)
            
            if depot_imbalance > 6:
                violations.append(f'Depot load imbalance: {depot_a_selected} vs {depot_b_selected}')
            
            return {
                'selected_trains': selected_trains,
                'remaining_trains': remaining_trains,
                'optimization_score': round(avg_score, 1),
                'solution_status': 'OPTIMAL',
                'constraint_violations': violations,
                'execution_time': round(execution_time, 2),
                'scheduling_date': target_date,
                'solver_stats': {
                    'optimizer': 'PuLP Linear Programming',
                    'solver': 'CBC',
                    'objective_value': pulp.value(prob.objective) if prob.objective else 0
                }
            }
        else:
            return {
                'error': f'PuLP solver failed to find optimal solution: {status}',
                'solution_status': status,
                'execution_time': round(execution_time, 2),
                'constraint_violations': ['No optimal solution found']
            }

# Global optimizer instance
optimizer = None

@app.route('/api/train-scheduling/optimize', methods=['POST'])
def optimize_train_schedule():
    """REST API endpoint for train scheduling optimization"""
    global optimizer
    
    try:
        if not PULP_AVAILABLE:
            return jsonify({
                'error': 'PuLP optimization library not available',
                'solution_status': 'ERROR',
                'message': 'Please install PuLP: pip install pulp'
            }), 500
        
        if optimizer is None:
            optimizer = PuLPTrainSchedulingOptimizer()
        
        data = request.get_json()
        target_date = data.get('target_date', datetime.now().strftime('%Y-%m-%d'))
        num_trains = data.get('num_trains', 24)
        
        print(f"Optimizing schedule for {target_date} with {num_trains} trains using PuLP...")
        
        result = optimizer.optimize_schedule_pulp(target_date, num_trains)
        
        if 'error' in result:
            return jsonify(result), 400
        
        print(f"Optimization completed: {result['solution_status']} in {result['execution_time']}s")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in optimization: {str(e)}")
        return jsonify({
            'error': f'PuLP optimization service error: {str(e)}',
            'solution_status': 'ERROR'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'PuLP Train Scheduling (OR-Tools Alternative)',
        'timestamp': datetime.now().isoformat(),
        'pulp_available': PULP_AVAILABLE,
        'optimization_engine': 'Linear Programming (CBC Solver)'
    })

@app.route('/', methods=['GET'])
def root():
    """Service information endpoint"""
    return jsonify({
        'service': 'PuLP Linear Programming Train Scheduling Optimization',
        'version': '1.0.0',
        'alternative_to': 'Google OR-Tools (for architecture compatibility)',
        'endpoints': {
            'optimize': 'POST /api/train-scheduling/optimize',
            'health': 'GET /api/health'
        },
        'description': 'Linear programming based train scheduling using PuLP library'
    })

if __name__ == '__main__':
    if not PULP_AVAILABLE:
        print("❌ PuLP is not installed!")
        print("📦 Install with: pip install pulp")
        exit(1)
    
    print("🚀 Starting PuLP Train Scheduling Service (OR-Tools Alternative)...")
    print("📊 Loading PuLP linear programming solver...")
    print("🚂 Initializing train fleet optimization...")
    print("🌐 Service will be available at: http://localhost:8001")
    print("📡 Frontend should connect to: http://localhost:8001/api/train-scheduling/optimize")
    print("💡 Using Linear Programming instead of Constraint Programming")
    
    app.run(host='0.0.0.0', port=8001, debug=True)