"""
KMRL Train Scheduling Optimizer using Google OR-Tools
Optimizes selection of 24 trains based on 6 key criteria
"""

from ortools.linear_solver import pywraplp
from typing import Dict, List, Tuple, Any
import numpy as np
from datetime import datetime, timedelta
import json
from dataclasses import dataclass, asdict

from src.data.loader import KMRLDataLoader

@dataclass
class SchedulingResult:
    """Result structure for train scheduling optimization"""
    selected_trains: List[Dict[str, Any]]
    remaining_trains: List[Dict[str, Any]]
    optimization_score: float
    solution_status: str
    constraint_violations: List[str]
    execution_time: float
    bay_assignments: Dict[int, int]  # trainset_id -> bay_id
    scheduling_date: datetime

class KMRLTrainSchedulingOptimizer:
    def __init__(self):
        """Initialize the scheduling optimizer"""
        self.data_loader = KMRLDataLoader()
        self.solver = None
        self.variables = {}
        self.constraints = []
        
    def load_data(self, target_date: datetime = None) -> Dict[str, Any]:
        """Load all required data for optimization"""
        return self.data_loader.get_optimization_dataset(target_date)
    
    def create_solver(self):
        """Create the OR-Tools linear solver"""
        self.solver = pywraplp.Solver.CreateSolver('SCIP')
        if not self.solver:
            raise RuntimeError("Could not create solver")
    
    def create_decision_variables(self, trainset_count: int, bay_count: int):
        """Create binary decision variables"""
        # x[i] = 1 if train i is selected for service, 0 otherwise
        self.variables['x'] = {}
        for i in range(trainset_count):
            self.variables['x'][i] = self.solver.BoolVar(f'train_{i}_selected')
        
        # y[i][j] = 1 if train i is assigned to bay j, 0 otherwise
        self.variables['y'] = {}
        for i in range(trainset_count):
            self.variables['y'][i] = {}
            for j in range(bay_count):
                self.variables['y'][i][j] = self.solver.BoolVar(f'train_{i}_bay_{j}')
    
    def add_basic_constraints(self, trainset_count: int, bay_count: int):
        """Add basic scheduling constraints"""
        
        # Constraint 1: Select exactly 24 trains
        constraint = self.solver.Constraint(24, 24, 'select_24_trains')
        for i in range(trainset_count):
            constraint.SetCoefficient(self.variables['x'][i], 1)
        
        # Constraint 2: Each selected train must be assigned to exactly one bay
        for i in range(trainset_count):
            constraint = self.solver.Constraint(0, 1, f'train_{i}_bay_assignment')
            constraint.SetCoefficient(self.variables['x'][i], -1)  # -x[i]
            for j in range(bay_count):
                constraint.SetCoefficient(self.variables['y'][i][j], 1)  # +sum(y[i][j])
        
        # Constraint 3: Each bay can hold at most one train
        for j in range(bay_count):
            constraint = self.solver.Constraint(0, 1, f'bay_{j}_capacity')
            for i in range(trainset_count):
                constraint.SetCoefficient(self.variables['y'][i][j], 1)
    
    def add_fitness_constraints(self, data: Dict[str, Any]):
        """Add fitness certificate constraints"""
        trainset_ids = data['trainset_ids']
        fitness_constraints = data['fitness_constraints']
        
        for i, trainset_id in enumerate(trainset_ids):
            fitness_data = fitness_constraints[trainset_id]
            
            # Hard constraint: Only select trains with valid fitness certificates
            if not fitness_data['is_fitness_ok']:
                # Force this train to not be selected
                constraint = self.solver.Constraint(0, 0, f'fitness_invalid_train_{i}')
                constraint.SetCoefficient(self.variables['x'][i], 1)
    
    def add_job_card_constraints(self, data: Dict[str, Any]):
        """Add IBM Maximo job card constraints"""
        trainset_ids = data['trainset_ids']
        job_card_constraints = data['job_card_constraints']
        
        for i, trainset_id in enumerate(trainset_ids):
            job_data = job_card_constraints[trainset_id]
            
            # Hard constraint: Don't select trains with blocking jobs
            if not job_data['is_available_for_service']:
                constraint = self.solver.Constraint(0, 0, f'blocking_jobs_train_{i}')
                constraint.SetCoefficient(self.variables['x'][i], 1)
    
    def add_cleaning_constraints(self, data: Dict[str, Any]):
        """Add cleaning and detailing constraints"""
        trainset_ids = data['trainset_ids']
        cleaning_constraints = data['cleaning_constraints']
        
        for i, trainset_id in enumerate(trainset_ids):
            cleaning_data = cleaning_constraints[trainset_id]
            
            # Hard constraint: Don't select trains currently being cleaned
            if not cleaning_data['is_available_for_service']:
                constraint = self.solver.Constraint(0, 0, f'cleaning_unavailable_train_{i}')
                constraint.SetCoefficient(self.variables['x'][i], 1)
    
    def create_objective_function(self, data: Dict[str, Any]):
        """Create the multi-criteria objective function"""
        trainset_ids = data['trainset_ids']
        trainset_count = len(trainset_ids)
        bay_count = len(data['stabling_geometry']['bay_details'])
        
        # Get constraint data
        fitness_constraints = data['fitness_constraints']
        branding_requirements = data['branding_requirements']
        mileage_balancing = data['mileage_balancing']
        cleaning_constraints = data['cleaning_constraints']
        stabling_geometry = data['stabling_geometry']
        
        objective = self.solver.Objective()
        
        # Weight factors for different criteria
        weights = {
            'fitness_quality': 20.0,      # Higher weight for better fitness status
            'branding_priority': 25.0,    # High priority for urgent branding
            'mileage_balance': 20.0,      # Balance wear across fleet
            'cleaning_status': 15.0,      # Prefer recently cleaned trains
            'bay_accessibility': 10.0,    # Prefer easily accessible bays
            'wear_penalty': -10.0         # Penalty for high wear
        }
        
        for i, trainset_id in enumerate(trainset_ids):
            train_score = 0.0
            
            # 1. Fitness Certificate Quality Score
            fitness_data = fitness_constraints[trainset_id]
            if fitness_data['is_fitness_ok']:
                # Bonus for trains with longer validity periods
                min_expiry_days = fitness_data['min_expiry_days']
                fitness_score = min(100, max(0, min_expiry_days - 7) * 2)  # 0-100 scale
                train_score += weights['fitness_quality'] * fitness_score / 100
            
            # 2. Branding Priority Score
            branding_data = branding_requirements[trainset_id]
            if branding_data['has_branding_commitments']:
                branding_score = branding_data['priority_score']
                if branding_data['is_urgent']:
                    branding_score *= 2  # Double weight for urgent branding
                train_score += weights['branding_priority'] * min(branding_score / 100, 1.0)
            
            # 3. Mileage Balancing Score
            mileage_data = mileage_balancing[trainset_id]
            balance_score = mileage_data['balance_score']  # Higher score = needs more service
            train_score += weights['mileage_balance'] * balance_score / 100
            
            # 4. Cleaning Status Score
            cleaning_data = cleaning_constraints[trainset_id]
            cleaning_score = 100 - cleaning_data['cleaning_priority_score']  # Invert - lower priority is better
            train_score += weights['cleaning_status'] * cleaning_score / 100
            
            # 5. Wear Penalty (negative impact)
            wear_score = mileage_data['wear_score']
            train_score += weights['wear_penalty'] * wear_score / 100
            
            # Add train selection score to objective
            objective.SetCoefficient(self.variables['x'][i], train_score)
        
        # 6. Bay Accessibility Bonus
        bay_details = stabling_geometry['bay_details']
        for i, trainset_id in enumerate(trainset_ids):
            for j, bay in enumerate(bay_details):
                accessibility_score = bay.get('accessibility_score', 0)
                bay_bonus = weights['bay_accessibility'] * accessibility_score / 100
                objective.SetCoefficient(self.variables['y'][i][j], bay_bonus)
        
        objective.SetMaximization()
    
    def solve_optimization(self, data: Dict[str, Any]) -> SchedulingResult:
        """Solve the train scheduling optimization problem"""
        start_time = datetime.now()
        
        trainset_ids = data['trainset_ids']
        trainset_count = len(trainset_ids)
        bay_details = data['stabling_geometry']['bay_details']
        bay_count = len(bay_details)
        
        print(f"Starting optimization with {trainset_count} trains and {bay_count} bays...")
        
        # Create solver and variables
        self.create_solver()
        self.create_decision_variables(trainset_count, bay_count)
        
        # Add constraints
        self.add_basic_constraints(trainset_count, bay_count)
        self.add_fitness_constraints(data)
        self.add_job_card_constraints(data)
        self.add_cleaning_constraints(data)
        
        # Create objective function
        self.create_objective_function(data)
        
        # Solve the problem
        print("Solving optimization problem...")
        status = self.solver.Solve()
        
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        # Process results
        if status == pywraplp.Solver.OPTIMAL or status == pywraplp.Solver.FEASIBLE:
            return self._extract_solution(data, status, execution_time)
        else:
            return self._handle_infeasible_solution(data, status, execution_time)
    
    def _extract_solution(self, data: Dict[str, Any], status: int, execution_time: float) -> SchedulingResult:
        """Extract the optimal solution"""
        trainset_ids = data['trainset_ids']
        trainsets = data['trainsets']
        bay_details = data['stabling_geometry']['bay_details']
        
        selected_trains = []
        remaining_trains = []
        bay_assignments = {}
        
        # Extract selected trains and bay assignments
        for i, (trainset_id, trainset_data) in enumerate(zip(trainset_ids, trainsets)):
            if self.variables['x'][i].solution_value() > 0.5:  # Selected
                # Find assigned bay
                assigned_bay = None
                for j, bay in enumerate(bay_details):
                    if self.variables['y'][i][j].solution_value() > 0.5:
                        assigned_bay = bay['bay_id']
                        bay_assignments[trainset_id] = assigned_bay
                        break
                
                # Add scheduling metadata
                train_info = trainset_data.copy()
                train_info['assigned_bay_id'] = assigned_bay
                train_info['scheduling_score'] = self._calculate_train_score(trainset_id, data)
                train_info['selection_reason'] = self._get_selection_reason(trainset_id, data)
                
                selected_trains.append(train_info)
            else:  # Not selected
                train_info = trainset_data.copy()
                train_info['exclusion_reason'] = self._get_exclusion_reason(trainset_id, data)
                train_info['scheduling_score'] = self._calculate_train_score(trainset_id, data)
                
                remaining_trains.append(train_info)
        
        # Sort by scheduling score
        selected_trains.sort(key=lambda x: x.get('scheduling_score', 0), reverse=True)
        remaining_trains.sort(key=lambda x: x.get('scheduling_score', 0), reverse=True)
        
        solution_status = "OPTIMAL" if status == pywraplp.Solver.OPTIMAL else "FEASIBLE"
        
        return SchedulingResult(
            selected_trains=selected_trains,
            remaining_trains=remaining_trains,
            optimization_score=self.solver.Objective().Value(),
            solution_status=solution_status,
            constraint_violations=[],
            execution_time=execution_time,
            bay_assignments=bay_assignments,
            scheduling_date=data['target_date']
        )
    
    def _handle_infeasible_solution(self, data: Dict[str, Any], status: int, execution_time: float) -> SchedulingResult:
        """Handle infeasible solutions with fallback logic"""
        print("Optimization failed, using fallback selection...")
        
        trainset_ids = data['trainset_ids']
        trainsets = data['trainsets']
        
        # Simple fallback: select top 24 trains by fitness and availability
        available_trains = []
        unavailable_trains = []
        
        for i, (trainset_id, trainset_data) in enumerate(zip(trainset_ids, trainsets)):
            fitness_ok = data['fitness_constraints'][trainset_id]['is_fitness_ok']
            job_ok = data['job_card_constraints'][trainset_id]['is_available_for_service']
            cleaning_ok = data['cleaning_constraints'][trainset_id]['is_available_for_service']
            
            train_info = trainset_data.copy()
            train_info['scheduling_score'] = self._calculate_train_score(trainset_id, data)
            
            if fitness_ok and job_ok and cleaning_ok:
                available_trains.append(train_info)
            else:
                reasons = []
                if not fitness_ok:
                    reasons.append("Invalid fitness certificates")
                if not job_ok:
                    reasons.append("Blocking job cards")
                if not cleaning_ok:
                    reasons.append("Currently being cleaned")
                train_info['exclusion_reason'] = "; ".join(reasons)
                unavailable_trains.append(train_info)
        
        # Sort by score and select top 24
        available_trains.sort(key=lambda x: x.get('scheduling_score', 0), reverse=True)
        
        selected_trains = available_trains[:24]
        remaining_trains = available_trains[24:] + unavailable_trains
        
        # Simple bay assignment (first available)
        bay_assignments = {}
        available_bays = data['stabling_geometry']['bay_details']
        
        for i, train in enumerate(selected_trains):
            if i < len(available_bays):
                bay_id = available_bays[i]['bay_id']
                train['assigned_bay_id'] = bay_id
                bay_assignments[train['trainset_id']] = bay_id
            else:
                train['assigned_bay_id'] = None
        
        status_msg = {
            pywraplp.Solver.INFEASIBLE: "INFEASIBLE",
            pywraplp.Solver.UNBOUNDED: "UNBOUNDED",
            pywraplp.Solver.ABNORMAL: "ABNORMAL",
            pywraplp.Solver.NOT_SOLVED: "NOT_SOLVED"
        }.get(status, "UNKNOWN")
        
        return SchedulingResult(
            selected_trains=selected_trains,
            remaining_trains=remaining_trains,
            optimization_score=0.0,
            solution_status=status_msg,
            constraint_violations=["Optimization failed - using fallback selection"],
            execution_time=execution_time,
            bay_assignments=bay_assignments,
            scheduling_date=data['target_date']
        )
    
    def _calculate_train_score(self, trainset_id: int, data: Dict[str, Any]) -> float:
        """Calculate comprehensive score for a train"""
        fitness_data = data['fitness_constraints'][trainset_id]
        branding_data = data['branding_requirements'][trainset_id]
        mileage_data = data['mileage_balancing'][trainset_id]
        cleaning_data = data['cleaning_constraints'][trainset_id]
        
        score = 0.0
        
        # Fitness score
        if fitness_data['is_fitness_ok']:
            score += min(fitness_data['min_expiry_days'], 100)
        
        # Branding score
        if branding_data['has_branding_commitments']:
            score += branding_data['priority_score'] * (2 if branding_data['is_urgent'] else 1)
        
        # Mileage balance score
        score += mileage_data['balance_score']
        
        # Cleaning score
        score += (100 - cleaning_data['cleaning_priority_score'])
        
        # Wear penalty
        score -= mileage_data['wear_score']
        
        return round(score, 2)
    
    def _get_selection_reason(self, trainset_id: int, data: Dict[str, Any]) -> str:
        """Get human-readable reason for train selection"""
        reasons = []
        
        branding_data = data['branding_requirements'][trainset_id]
        if branding_data['is_urgent']:
            reasons.append("Urgent branding requirements")
        
        mileage_data = data['mileage_balancing'][trainset_id]
        if mileage_data['balance_score'] > 80:
            reasons.append("High mileage balance priority")
        
        fitness_data = data['fitness_constraints'][trainset_id]
        if fitness_data['min_expiry_days'] > 60:
            reasons.append("Long-term fitness validity")
        
        return "; ".join(reasons) if reasons else "Optimal combination of all criteria"
    
    def _get_exclusion_reason(self, trainset_id: int, data: Dict[str, Any]) -> str:
        """Get human-readable reason for train exclusion"""
        reasons = []
        
        fitness_data = data['fitness_constraints'][trainset_id]
        if not fitness_data['is_fitness_ok']:
            reasons.append("Expired or missing fitness certificates")
        
        job_data = data['job_card_constraints'][trainset_id]
        if not job_data['is_available_for_service']:
            reasons.append("Open high-priority maintenance jobs")
        
        cleaning_data = data['cleaning_constraints'][trainset_id]
        if not cleaning_data['is_available_for_service']:
            reasons.append("Currently undergoing cleaning/maintenance")
        
        return "; ".join(reasons) if reasons else "Lower optimization score"
    
    def generate_schedule_report(self, result: SchedulingResult) -> Dict[str, Any]:
        """Generate comprehensive scheduling report"""
        report = {
            'scheduling_summary': {
                'scheduling_date': result.scheduling_date.isoformat(),
                'selected_trains_count': len(result.selected_trains),
                'remaining_trains_count': len(result.remaining_trains),
                'optimization_score': result.optimization_score,
                'solution_status': result.solution_status,
                'execution_time_seconds': result.execution_time
            },
            'constraint_analysis': {
                'fitness_compliant': sum(1 for t in result.selected_trains if 'fitness' not in t.get('exclusion_reason', '')),
                'branding_priority': sum(1 for t in result.selected_trains if 'urgent branding' in t.get('selection_reason', '').lower()),
                'mileage_balanced': sum(1 for t in result.selected_trains if 'mileage balance' in t.get('selection_reason', '').lower()),
            },
            'selected_trains': result.selected_trains,
            'remaining_trains': result.remaining_trains,
            'bay_assignments': result.bay_assignments
        }
        
        return report
    
    def close(self):
        """Clean up resources"""
        if self.data_loader:
            self.data_loader.close_connection()

def run_optimization(target_date: datetime = None, output_file: str = None) -> SchedulingResult:
    """Main function to run train scheduling optimization"""
    if target_date is None:
        target_date = datetime.now()
    
    print("=" * 60)
    print("KMRL TRAIN SCHEDULING OPTIMIZATION")
    print("=" * 60)
    print(f"Target Date: {target_date.strftime('%Y-%m-%d %H:%M:%S')}")
    
    optimizer = KMRLTrainSchedulingOptimizer()
    
    try:
        # Load data
        print("\nLoading data from MongoDB...")
        data = optimizer.load_data(target_date)
        
        print(f"Available trains: {data['available_for_scheduling']}")
        print(f"High-priority branding: {data['high_priority_branding']}")
        print(f"Available bays: {data['available_bays']}")
        
        # Run optimization
        result = optimizer.solve_optimization(data)
        
        # Generate report
        report = optimizer.generate_schedule_report(result)
        
        # Save to file if specified
        if output_file:
            with open(output_file, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"\nReport saved to: {output_file}")
        
        # Print summary
        print(f"\nOptimization completed:")
        print(f"  Status: {result.solution_status}")
        print(f"  Selected trains: {len(result.selected_trains)}")
        print(f"  Execution time: {result.execution_time:.2f} seconds")
        print(f"  Optimization score: {result.optimization_score:.2f}")
        
        return result
        
    except Exception as e:
        print(f"Error during optimization: {e}")
        raise
    finally:
        optimizer.close()

if __name__ == "__main__":
    # Example usage
    result = run_optimization(
        target_date=datetime(2025, 9, 26, 6, 0, 0),  # 6 AM tomorrow
        output_file="train_schedule_optimization_result.json"
    )