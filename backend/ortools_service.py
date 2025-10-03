#!/usr/bin/env python3
"""
Google OR-Tools Train Scheduling Optimization Service
Provides REST API for intelligent train scheduling using constraint programming
"""

import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from flask import Flask, request, jsonify
from flask_cors import CORS
from ortools.sat.python import cp_model

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

class TrainSchedulingOptimizer:
    """Google OR-Tools based train scheduling optimizer"""
    
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        
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
    
    def optimize_schedule(self, target_date: str, num_trains_needed: int = 24) -> Dict[str, Any]:
        """
        Use Google OR-Tools to optimize train scheduling
        """
        start_time = time.time()
        
        # Get train fleet data
        trains = self.generate_train_fleet()
        
        # Calculate availability scores
        for train in trains:
            train.availability_score = self.calculate_availability_score(train, target_date)
        
        # Filter eligible trains (ready or standby status)
        eligible_trains = [t for t in trains if t.status in ['ready', 'standby']]
        
        # If we don't have enough eligible trains, include some maintenance trains with lower scores
        if len(eligible_trains) < num_trains_needed:
            # Add maintenance trains to reach the required number
            maintenance_trains = [t for t in trains if t.status == 'maintenance']
            # Sort maintenance trains by availability score (best first)
            maintenance_trains.sort(key=lambda x: x.availability_score, reverse=True)
            
            # Take as many maintenance trains as needed to reach 24 total
            needed_from_maintenance = num_trains_needed - len(eligible_trains)
            eligible_trains.extend(maintenance_trains[:needed_from_maintenance])
            
            # If still not enough, just take the best available trains regardless of status
            if len(eligible_trains) < num_trains_needed:
                all_trains_sorted = sorted(trains, key=lambda x: x.availability_score, reverse=True)
                eligible_trains = all_trains_sorted[:num_trains_needed]
        
        # OR-Tools Constraint Programming Model
        model = cp_model.CpModel()
        
        # Decision variables: which trains to select
        train_vars = {}
        for train in eligible_trains:
            train_vars[train.trainset_id] = model.NewBoolVar(f'train_{train.trainset_id}')
        
        # Constraint 1: Select exactly 24 trains (hard constraint)
        model.Add(sum(train_vars.values()) == 24)
        
        # Constraint 2: Depot load balancing (roughly equal distribution)
        depot_a_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot A']
        depot_b_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot B']
        
        if depot_a_trains and depot_b_trains:
            # Try to balance between depots (allow ±3 difference for 24 trains)
            depot_a_count = sum(depot_a_trains)
            depot_b_count = sum(depot_b_trains)
            model.Add(depot_a_count >= 9)  # At least 9 from Depot A
            model.Add(depot_a_count <= 15)  # At most 15 from Depot A
        
        # Constraint 3: Age diversity (prefer mix of old and new trains)
        new_trains = [train_vars[t.trainset_id] for t in eligible_trains if 2025 - t.year_commissioned <= 5]
        if len(new_trains) > 8:  # If we have enough newer trains
            model.Add(sum(new_trains) >= 8)  # At least 8 newer trains (1/3 of 24)
        
        # Constraint 4: Manufacturer diversity
        for make in ['Hyundai Rotem', 'Alstom', 'BEML']:
            make_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.make_model == make]
            if len(make_trains) >= 4:  # If we have enough trains from this manufacturer
                model.Add(sum(make_trains) >= 4)  # Select at least 4 from each manufacturer
        
        # Objective: Maximize total availability score
        objective_terms = []
        for train in eligible_trains:
            # Scale availability score to integer (OR-Tools works with integers)
            score_int = int(train.availability_score * 100)
            objective_terms.append(score_int * train_vars[train.trainset_id])
        
        model.Maximize(sum(objective_terms))
        
        # Solve the optimization problem
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 10.0  # 10 second timeout
        
        status = solver.Solve(model)
        execution_time = time.time() - start_time
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            # Extract solution
            selected_trains = []
            remaining_trains = []
            
            for train in trains:
                if train.trainset_id in train_vars and solver.Value(train_vars[train.trainset_id]):
                    # This train was selected
                    selected_trains.append({
                        'trainset_id': train.trainset_id,
                        'number': train.number,
                        'status': train.status,
                        'assigned_bay_id': len(selected_trains) + 1,  # Assign bay sequentially
                        'scheduling_score': round(train.availability_score, 1),
                        'selection_reason': f'OR-Tools optimized selection (Score: {train.availability_score:.1f})',
                        'make_model': train.make_model,
                        'year_commissioned': train.year_commissioned,
                        'home_depot': train.home_depot
                    })
                else:
                    # This train was not selected
                    exclusion_reason = 'Not selected by OR-Tools optimization'
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
            
            if depot_imbalance > 6:  # More than 3 trains difference per depot
                violations.append(f'Depot load imbalance: {depot_a_selected} vs {depot_b_selected}')
            
            return {
                'selected_trains': selected_trains,
                'remaining_trains': remaining_trains,
                'optimization_score': round(avg_score, 1),
                'solution_status': 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE',
                'constraint_violations': violations,
                'execution_time': round(execution_time, 2),
                'scheduling_date': target_date,
                'solver_stats': {
                    'total_constraints': len(model.Proto().constraints),
                    'total_variables': len(train_vars),
                    'objective_value': solver.ObjectiveValue() if status != cp_model.INFEASIBLE else 0
                }
            }
        else:
            return {
                'error': 'OR-Tools solver failed to find a feasible solution',
                'solution_status': 'INFEASIBLE',
                'execution_time': round(execution_time, 2),
                'constraint_violations': ['No feasible solution found']
            }

# Global optimizer instance
optimizer = TrainSchedulingOptimizer()

@app.route('/api/train-scheduling/optimize', methods=['POST'])
def optimize_train_schedule():
    """REST API endpoint for train scheduling optimization"""
    try:
        data = request.get_json()
        target_date = data.get('target_date', datetime.now().strftime('%Y-%m-%d'))
        num_trains = data.get('num_trains', 24)
        
        print(f"Optimizing schedule for {target_date} with {num_trains} trains...")
        
        result = optimizer.optimize_schedule(target_date, num_trains)
        
        if 'error' in result:
            return jsonify(result), 400
        
        print(f"Optimization completed: {result['solution_status']} in {result['execution_time']}s")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in optimization: {str(e)}")
        return jsonify({
            'error': f'Optimization service error: {str(e)}',
            'solution_status': 'ERROR'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'OR-Tools Train Scheduling',
        'timestamp': datetime.now().isoformat(),
        'ortools_available': True
    })

@app.route('/', methods=['GET'])
def root():
    """Service information endpoint"""
    return jsonify({
        'service': 'Google OR-Tools Train Scheduling Optimization',
        'version': '1.0.0',
        'endpoints': {
            'optimize': 'POST /api/train-scheduling/optimize',
            'health': 'GET /api/health'
        },
        'description': 'Constraint programming based train scheduling using Google OR-Tools'
    })

if __name__ == '__main__':
    print("Starting Google OR-Tools Train Scheduling Service...")
    print("Loading OR-Tools constraint programming solver...")
    print("Initializing train fleet optimization...")
    print("Service will be available at: http://localhost:8001")
    print("Frontend should connect to: http://localhost:8001/api/train-scheduling/optimize")
    
    app.run(host='0.0.0.0', port=8001, debug=True)