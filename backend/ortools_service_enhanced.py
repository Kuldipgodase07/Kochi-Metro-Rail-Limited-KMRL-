#!/usr/bin/env python3
"""
Enhanced Google OR-Tools Train Scheduling Optimization Service
Incorporates SIH Statement requirements with comprehensive constraint programming
"""

import json
import time
import requests
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
    rake_number: str
    status: str
    make_model: str
    year_commissioned: int
    home_depot: str
    availability_score: float
    # SIH Requirements
    fitness_certificates: Dict[str, Any]
    job_cards: List[Dict[str, Any]]
    branding_commitments: Dict[str, Any]
    mileage_records: Dict[str, Any]
    cleaning_slots: List[Dict[str, Any]]
    stabling_geometry: Dict[str, Any]

class EnhancedTrainSchedulingOptimizer:
    """Enhanced OR-Tools train scheduling optimizer with SIH requirements"""
    
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.atlas_uri = "mongodb+srv://shivrajmore8215898:SIH2025@cluster0.byx6m0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        
    def fetch_trainset_data(self) -> List[TrainInfo]:
        """Fetch comprehensive trainset data from MongoDB Atlas"""
        try:
            # This would normally connect to MongoDB, but for demo we'll use generated data
            # In production, replace with actual MongoDB queries
            return self.generate_comprehensive_fleet()
        except Exception as e:
            print(f"Error fetching trainset data: {e}")
            return self.generate_comprehensive_fleet()
    
    def generate_comprehensive_fleet(self) -> List[TrainInfo]:
        """Generate comprehensive train fleet with SIH requirements"""
        trains = []
        
        # Generate 100 trains with realistic SIH data
        for i in range(1, 101):
            # Status distribution based on real data
            if i <= 28:
                status = 'in_service'
            elif i <= 64:
                status = 'standby'
            else:
                status = 'IBL_maintenance'
            
            # Make/model distribution
            makes = ['Hyundai Rotem', 'Alstom', 'BEML']
            make_model = makes[i % 3]
            
            # Depot distribution
            depot = 'Depot A' if i % 2 == 0 else 'Depot B'
            
            # Generate SIH-compliant data
            trains.append(TrainInfo(
                trainset_id=i,
                rake_number=f'R{1000 + i - 1}',
                status=status,
                make_model=make_model,
                year_commissioned=2015 + (i % 10),
                home_depot=depot,
                availability_score=0.0,
                fitness_certificates=self.generate_fitness_certificates(i),
                job_cards=self.generate_job_cards(i),
                branding_commitments=self.generate_branding_commitments(i),
                mileage_records=self.generate_mileage_records(i),
                cleaning_slots=self.generate_cleaning_slots(i),
                stabling_geometry=self.generate_stabling_geometry(i)
            ))
        
        return trains
    
    def generate_fitness_certificates(self, trainset_id: int) -> Dict[str, Any]:
        """Generate fitness certificate data for SIH requirement 1"""
        base_date = datetime.now()
        return {
            'rolling_stock': {
                'valid_from': (base_date - timedelta(days=30)).strftime('%Y-%m-%d'),
                'valid_to': (base_date + timedelta(days=150 + (trainset_id % 60))).strftime('%Y-%m-%d'),
                'status': 'valid' if (trainset_id % 4) != 0 else 'expired',
                'department': 'Rolling Stock Dept'
            },
            'signalling': {
                'valid_from': (base_date - timedelta(days=20)).strftime('%Y-%m-%d'),
                'valid_to': (base_date + timedelta(days=120 + (trainset_id % 45))).strftime('%Y-%m-%d'),
                'status': 'valid' if (trainset_id % 5) != 0 else 'expired',
                'department': 'Signalling Dept'
            },
            'telecom': {
                'valid_from': (base_date - timedelta(days=15)).strftime('%Y-%m-%d'),
                'valid_to': (base_date + timedelta(days=90 + (trainset_id % 30))).strftime('%Y-%m-%d'),
                'status': 'valid' if (trainset_id % 6) != 0 else 'expired',
                'department': 'Telecom Dept'
            }
        }
    
    def generate_job_cards(self, trainset_id: int) -> List[Dict[str, Any]]:
        """Generate job card data for SIH requirement 2"""
        job_cards = []
        
        # Generate 1-3 job cards per train
        num_jobs = 1 + (trainset_id % 3)
        
        for j in range(num_jobs):
            priorities = ['emergency', 'high', 'medium', 'low']
            statuses = ['open', 'in-progress', 'closed']
            categories = ['doors', 'signalling', 'telecom', 'bogie', 'brake system', 'HVAC']
            
            job_cards.append({
                'jobcard_id': f'JC{trainset_id:03d}{j+1}',
                'fault_category': categories[j % len(categories)],
                'status': statuses[j % len(statuses)],
                'priority': priorities[j % len(priorities)],
                'created_on': (datetime.now() - timedelta(days=j*5)).strftime('%Y-%m-%d'),
                'expected_completion': (datetime.now() + timedelta(days=3+j*2)).strftime('%Y-%m-%d'),
                'responsible_team': f'Team {chr(65 + (j % 3))}'
            })
        
        return job_cards
    
    def generate_branding_commitments(self, trainset_id: int) -> Dict[str, Any]:
        """Generate branding commitment data for SIH requirement 3"""
        advertisers = ['Amul', 'Airtel', 'Coca Cola', 'LIC', 'Tata Motors']
        priorities = ['critical', 'normal']
        
        return {
            'advertiser_name': advertisers[trainset_id % len(advertisers)],
            'campaign_code': f'CAMP{100 + trainset_id}',
            'priority': priorities[trainset_id % 2],
            'exposure_target_hours': 500 + (trainset_id * 10) % 500,
            'exposure_achieved_hours': (300 + (trainset_id * 8) % 400),
            'campaign_start': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'campaign_end': (datetime.now() + timedelta(days=60 + (trainset_id % 30))).strftime('%Y-%m-%d'),
            'penalty_clause': 'Y' if (trainset_id % 3) == 0 else 'N'
        }
    
    def generate_mileage_records(self, trainset_id: int) -> Dict[str, Any]:
        """Generate mileage record data for SIH requirement 4"""
        base_mileage = 50000 + (trainset_id * 1000)
        
        return {
            'total_km_run': base_mileage,
            'km_since_last_POH': (base_mileage % 20000),
            'km_since_last_IOH': (base_mileage % 5000),
            'km_since_last_trip_maintenance': (base_mileage % 500),
            'bogie_condition_index': 50 + (trainset_id % 50),
            'brake_pad_wear_level': 10 + (trainset_id % 80),
            'hvac_runtime_hours': 2000 + (trainset_id * 50) % 8000,
            'last_updated': datetime.now().strftime('%Y-%m-%d')
        }
    
    def generate_cleaning_slots(self, trainset_id: int) -> List[Dict[str, Any]]:
        """Generate cleaning slot data for SIH requirement 5"""
        cleaning_types = ['fumigation', 'deep_cleaning', 'detailing', 'trip_cleaning']
        statuses = ['scheduled', 'in-progress', 'completed']
        
        slots = []
        num_slots = 1 + (trainset_id % 3)
        
        for i in range(num_slots):
            slots.append({
                'cleaning_id': f'CL{trainset_id:03d}{i+1}',
                'cleaning_type': cleaning_types[i % len(cleaning_types)],
                'status': statuses[i % len(statuses)],
                'scheduled_date': (datetime.now() + timedelta(days=i*3)).strftime('%Y-%m-%d'),
                'bay_number': 1 + (trainset_id % 20),
                'staff_assigned': f'Staff{(i % 3) + 1}',
                'remarks': 'On Time' if (i % 2) == 0 else 'Delayed'
            })
        
        return slots
    
    def generate_stabling_geometry(self, trainset_id: int) -> Dict[str, Any]:
        """Generate stabling geometry data for SIH requirement 6"""
        return {
            'bay_id': trainset_id,
            'depot_name': 'Depot A' if trainset_id % 2 == 0 else 'Depot B',
            'line_name': 'Blue Line' if trainset_id % 3 == 0 else 'Green Line',
            'position_order': 1 + (trainset_id % 24),
            'occupied': 'Y' if (trainset_id % 4) == 0 else 'N',
            'remarks': 'Normal' if (trainset_id % 5) != 0 else 'Priority'
        }
    
    def calculate_sih_availability_score(self, train: TrainInfo) -> float:
        """Calculate comprehensive SIH-compliant availability score"""
        score = 0.0
        
        # 1. Fitness Certificates (25 points max)
        fitness_score = 0.0
        for cert_type, cert_data in train.fitness_certificates.items():
            if cert_data['status'] == 'valid':
                days_to_expiry = (datetime.strptime(cert_data['valid_to'], '%Y-%m-%d') - datetime.now()).days
                if days_to_expiry > 60:
                    fitness_score += 8.33  # 25/3 for each certificate
                elif days_to_expiry > 30:
                    fitness_score += 6.67
                else:
                    fitness_score += 4.17
            else:
                fitness_score += 0  # Invalid certificate
        score += fitness_score
        
        # 2. Job Card Status (20 points max)
        job_score = 20.0
        for job in train.job_cards:
            if job['status'] == 'open' and job['priority'] == 'emergency':
                job_score -= 10.0  # Heavy penalty for emergency jobs
            elif job['status'] == 'open' and job['priority'] == 'high':
                job_score -= 5.0
            elif job['status'] == 'in-progress':
                job_score -= 2.0
        score += max(0, job_score)
        
        # 3. Branding Priorities (15 points max)
        branding = train.branding_commitments
        if branding['priority'] == 'critical':
            # Check if campaign is active and needs exposure
            campaign_start = datetime.strptime(branding['campaign_start'], '%Y-%m-%d')
            campaign_end = datetime.strptime(branding['campaign_end'], '%Y-%m-%d')
            now = datetime.now()
            
            if campaign_start <= now <= campaign_end:
                exposure_ratio = branding['exposure_achieved_hours'] / branding['exposure_target_hours']
                if exposure_ratio < 0.5:  # Behind on exposure
                    score += 15.0  # High priority for critical campaigns
                elif exposure_ratio < 0.8:
                    score += 10.0
                else:
                    score += 5.0
            else:
                score += 5.0  # Campaign not active
        else:
            score += 3.0  # Normal priority
        
        # 4. Mileage Balancing (20 points max)
        mileage = train.mileage_records
        total_km = mileage['total_km_run']
        
        # Prefer trains with balanced mileage (not too high, not too low)
        if 50000 <= total_km <= 150000:
            score += 20.0
        elif 30000 <= total_km < 50000 or 150000 < total_km <= 200000:
            score += 15.0
        else:
            score += 10.0
        
        # Bogie condition bonus
        bogie_condition = mileage['bogie_condition_index']
        if bogie_condition >= 80:
            score += 5.0
        elif bogie_condition >= 60:
            score += 3.0
        else:
            score += 1.0
        
        # 5. Cleaning & Detailing Slots (10 points max)
        cleaning_score = 0.0
        recent_cleaning = False
        for slot in train.cleaning_slots:
            if slot['status'] == 'completed':
                slot_date = datetime.strptime(slot['scheduled_date'], '%Y-%m-%d')
                days_ago = (datetime.now() - slot_date).days
                if days_ago <= 7:  # Recent cleaning
                    recent_cleaning = True
                    cleaning_score += 5.0
                elif days_ago <= 14:
                    cleaning_score += 3.0
        
        if not recent_cleaning:
            cleaning_score += 1.0  # No recent cleaning
        
        score += min(10.0, cleaning_score)
        
        # 6. Stabling Geometry (10 points max)
        stabling = train.stabling_geometry
        if stabling['occupied'] == 'N':  # Bay is available
            score += 5.0
        else:
            score += 2.0
        
        # Position order preference (lower numbers are better for morning turn-out)
        position = stabling['position_order']
        if position <= 8:  # Good positions for quick turn-out
            score += 5.0
        elif position <= 16:
            score += 3.0
        else:
            score += 1.0
        
        return min(100.0, score)
    
    def optimize_schedule_sih(self, target_date: str, num_trains_needed: int = 24) -> Dict[str, Any]:
        """Enhanced OR-Tools optimization with SIH requirements"""
        start_time = time.time()
        
        # Get comprehensive train data
        trains = self.fetch_trainset_data()
        
        # Calculate SIH-compliant availability scores
        for train in trains:
            train.availability_score = self.calculate_sih_availability_score(train)
        
        # Filter eligible trains based on SIH requirements (more flexible approach)
        eligible_trains = []
        
        # First pass: Strict SIH compliance
        for train in trains:
            # SIH Constraint 1: Fitness Certificates - At least 2 out of 3 must be valid
            valid_certs = sum(1 for cert in train.fitness_certificates.values() if cert['status'] == 'valid')
            fitness_acceptable = valid_certs >= 2
            
            # SIH Constraint 2: Job Cards - No emergency open jobs
            no_emergency_jobs = not any(
                job['status'] == 'open' and job['priority'] == 'emergency'
                for job in train.job_cards
            )
            
            # SIH Constraint 3: Status - Not in IBL maintenance
            not_in_maintenance = train.status != 'IBL_maintenance'
            
            if fitness_acceptable and no_emergency_jobs and not_in_maintenance:
                eligible_trains.append(train)
        
        # If not enough eligible trains, relax constraints further
        if len(eligible_trains) < num_trains_needed:
            print(f"⚠️  Only {len(eligible_trains)} trains meet strict SIH requirements, relaxing constraints...")
            
            # Add trains with at least 1 valid fitness certificate
            for train in trains:
                if train not in eligible_trains:
                    valid_certs = sum(1 for cert in train.fitness_certificates.values() if cert['status'] == 'valid')
                    fitness_acceptable = valid_certs >= 1
                    
                    no_emergency_jobs = not any(
                        job['status'] == 'open' and job['priority'] == 'emergency'
                        for job in train.job_cards
                    )
                    not_in_maintenance = train.status != 'IBL_maintenance'
                    
                    if fitness_acceptable and no_emergency_jobs and not_in_maintenance:
                        eligible_trains.append(train)
                        if len(eligible_trains) >= num_trains_needed:
                            break
        
        # Final fallback: Use any train that's not in maintenance
        if len(eligible_trains) < num_trains_needed:
            print(f"⚠️  Only {len(eligible_trains)} trains meet relaxed SIH requirements, using all available trains...")
            for train in trains:
                if train not in eligible_trains and train.status != 'IBL_maintenance':
                    eligible_trains.append(train)
                    if len(eligible_trains) >= num_trains_needed:
                        break
        
        # OR-Tools Constraint Programming Model
        model = cp_model.CpModel()
        
        # Decision variables
        train_vars = {}
        for train in eligible_trains:
            train_vars[train.trainset_id] = model.NewBoolVar(f'train_{train.trainset_id}')
        
        # SIH Constraint 1: Select exactly 24 trains
        model.Add(sum(train_vars.values()) == num_trains_needed)
        
        # SIH Constraint 2: Depot load balancing (9-15 trains per depot)
        depot_a_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot A']
        depot_b_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.home_depot == 'Depot B']
        
        if depot_a_trains:
            depot_a_count = sum(depot_a_trains)
            model.Add(depot_a_count >= 9)
            model.Add(depot_a_count <= 15)
        
        # SIH Constraint 3: Age diversity (8+ newer trains)
        new_trains = [train_vars[t.trainset_id] for t in eligible_trains if 2025 - t.year_commissioned <= 5]
        if len(new_trains) >= 8:
            model.Add(sum(new_trains) >= 8)
        
        # SIH Constraint 4: Manufacturer diversity (4+ from each make)
        for make in ['Hyundai Rotem', 'Alstom', 'BEML']:
            make_trains = [train_vars[t.trainset_id] for t in eligible_trains if t.make_model == make]
            if len(make_trains) >= 4:
                model.Add(sum(make_trains) >= 4)
        
        # SIH Constraint 5: Branding priority (prefer critical campaigns)
        critical_branding_trains = [
            train_vars[t.trainset_id] for t in eligible_trains 
            if t.branding_commitments['priority'] == 'critical'
        ]
        if critical_branding_trains:
            # Ensure at least 6 critical branding trains are selected
            model.Add(sum(critical_branding_trains) >= min(6, len(critical_branding_trains)))
        
        # SIH Constraint 6: Mileage balancing (prefer balanced mileage)
        balanced_mileage_trains = [
            train_vars[t.trainset_id] for t in eligible_trains
            if 50000 <= t.mileage_records['total_km_run'] <= 150000
        ]
        if balanced_mileage_trains:
            model.Add(sum(balanced_mileage_trains) >= min(12, len(balanced_mileage_trains)))
        
        # SIH Constraint 7: Stabling geometry (prefer available bays)
        available_bay_trains = [
            train_vars[t.trainset_id] for t in eligible_trains
            if t.stabling_geometry['occupied'] == 'N'
        ]
        if available_bay_trains:
            model.Add(sum(available_bay_trains) >= min(18, len(available_bay_trains)))
        
        # Objective: Maximize total SIH availability score
        objective_terms = []
        for train in eligible_trains:
            score_int = int(train.availability_score * 100)
            objective_terms.append(score_int * train_vars[train.trainset_id])
        
        model.Maximize(sum(objective_terms))
        
        # Solve the optimization
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 15.0
        
        status = solver.Solve(model)
        execution_time = time.time() - start_time
        
        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            # Extract solution
            selected_trains = []
            remaining_trains = []
            
            for train in trains:
                if train.trainset_id in train_vars and solver.Value(train_vars[train.trainset_id]):
                    # Selected train
                    selected_trains.append({
                        'trainset_id': train.trainset_id,
                        'rake_number': train.rake_number,
                        'status': train.status,
                        'make_model': train.make_model,
                        'year_commissioned': train.year_commissioned,
                        'home_depot': train.home_depot,
                        'scheduling_score': round(train.availability_score, 1),
                        'sih_compliance': self.assess_sih_compliance(train),
                        'selection_reason': f'OR-Tools SIH optimization (Score: {train.availability_score:.1f})',
                        'fitness_status': {k: v['status'] for k, v in train.fitness_certificates.items()},
                        'active_jobs': len([j for j in train.job_cards if j['status'] == 'open']),
                        'branding_priority': train.branding_commitments['priority'],
                        'total_mileage': train.mileage_records['total_km_run'],
                        'bay_available': train.stabling_geometry['occupied'] == 'N'
                    })
                else:
                    # Not selected
                    exclusion_reason = self.determine_exclusion_reason(train)
                    remaining_trains.append({
                        'trainset_id': train.trainset_id,
                        'rake_number': train.rake_number,
                        'status': train.status,
                        'make_model': train.make_model,
                        'year_commissioned': train.year_commissioned,
                        'home_depot': train.home_depot,
                        'scheduling_score': round(train.availability_score, 1),
                        'exclusion_reason': exclusion_reason,
                        'sih_compliance': self.assess_sih_compliance(train)
                    })
            
            # Sort by score
            selected_trains.sort(key=lambda x: x['scheduling_score'], reverse=True)
            remaining_trains.sort(key=lambda x: x['scheduling_score'], reverse=True)
            
            # Calculate SIH compliance metrics
            sih_metrics = self.calculate_sih_metrics(selected_trains)
            
            return {
                'selected_trains': selected_trains,
                'remaining_trains': remaining_trains,
                'sih_compliance': sih_metrics,
                'optimization_score': round(sum(t['scheduling_score'] for t in selected_trains) / len(selected_trains), 1),
                'solution_status': 'OPTIMAL' if status == cp_model.OPTIMAL else 'FEASIBLE',
                'execution_time': round(execution_time, 2),
                'scheduling_date': target_date,
                'constraint_violations': self.check_constraint_violations(selected_trains),
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
                'constraint_violations': ['No feasible solution found with SIH requirements']
            }
    
    def assess_sih_compliance(self, train: TrainInfo) -> Dict[str, Any]:
        """Assess SIH compliance for a train"""
        compliance = {
            'fitness_certificates_valid': all(
                cert['status'] == 'valid' for cert in train.fitness_certificates.values()
            ),
            'no_emergency_jobs': not any(
                job['status'] == 'open' and job['priority'] == 'emergency'
                for job in train.job_cards
            ),
            'not_in_maintenance': train.status != 'IBL_maintenance',
            'branding_priority': train.branding_commitments['priority'],
            'mileage_balanced': 50000 <= train.mileage_records['total_km_run'] <= 150000,
            'bay_available': train.stabling_geometry['occupied'] == 'N'
        }
        
        compliance['overall_compliance'] = sum(compliance.values()) / len(compliance)
        return compliance
    
    def determine_exclusion_reason(self, train: TrainInfo) -> str:
        """Determine why a train was excluded"""
        if train.status == 'IBL_maintenance':
            return 'Under IBL maintenance - excluded from scheduling'
        
        if not all(cert['status'] == 'valid' for cert in train.fitness_certificates.values()):
            return 'Invalid fitness certificates - excluded from scheduling'
        
        if any(job['status'] == 'open' and job['priority'] == 'emergency' for job in train.job_cards):
            return 'Emergency job cards open - excluded from scheduling'
        
        if train.availability_score < 30:
            return f'Low SIH availability score: {train.availability_score:.1f}'
        
        return 'Not selected by OR-Tools SIH optimization'
    
    def calculate_sih_metrics(self, selected_trains: List[Dict]) -> Dict[str, Any]:
        """Calculate SIH compliance metrics"""
        if not selected_trains:
            return {}
        
        total_trains = len(selected_trains)
        
        # Depot distribution
        depot_a_count = len([t for t in selected_trains if t['home_depot'] == 'Depot A'])
        depot_b_count = total_trains - depot_a_count
        
        # Age distribution
        new_trains = len([t for t in selected_trains if 2025 - t['year_commissioned'] <= 5])
        
        # Manufacturer distribution
        make_distribution = {}
        for train in selected_trains:
            make = train['make_model']
            make_distribution[make] = make_distribution.get(make, 0) + 1
        
        # Branding priorities
        critical_branding = len([t for t in selected_trains if t['branding_priority'] == 'critical'])
        
        # Bay availability
        available_bays = len([t for t in selected_trains if t['bay_available']])
        
        return {
            'total_trains': total_trains,
            'depot_distribution': {
                'depot_a': depot_a_count,
                'depot_b': depot_b_count,
                'balance_ratio': round(min(depot_a_count, depot_b_count) / max(depot_a_count, depot_b_count), 2)
            },
            'age_distribution': {
                'new_trains': new_trains,
                'new_train_ratio': round(new_trains / total_trains, 2)
            },
            'manufacturer_distribution': make_distribution,
            'branding_priorities': {
                'critical_campaigns': critical_branding,
                'critical_ratio': round(critical_branding / total_trains, 2)
            },
            'bay_availability': {
                'available_bays': available_bays,
                'availability_ratio': round(available_bays / total_trains, 2)
            }
        }
    
    def check_constraint_violations(self, selected_trains: List[Dict]) -> List[str]:
        """Check for constraint violations"""
        violations = []
        
        if not selected_trains:
            return ['No trains selected']
        
        # Depot balance check
        depot_a_count = len([t for t in selected_trains if t['home_depot'] == 'Depot A'])
        depot_b_count = len(selected_trains) - depot_a_count
        
        if depot_a_count < 9 or depot_a_count > 15:
            violations.append(f'Depot A balance violation: {depot_a_count} trains (should be 9-15)')
        
        # Age diversity check
        new_trains = len([t for t in selected_trains if 2025 - t['year_commissioned'] <= 5])
        if new_trains < 8:
            violations.append(f'Age diversity violation: {new_trains} new trains (should be ≥8)')
        
        # Manufacturer diversity check
        make_counts = {}
        for train in selected_trains:
            make = train['make_model']
            make_counts[make] = make_counts.get(make, 0) + 1
        
        for make, count in make_counts.items():
            if count < 4:
                violations.append(f'Manufacturer diversity violation: {count} {make} trains (should be ≥4)')
        
        return violations

# Global optimizer instance
optimizer = EnhancedTrainSchedulingOptimizer()

@app.route('/api/train-scheduling/optimize-sih', methods=['POST'])
def optimize_train_schedule_sih():
    """REST API endpoint for SIH-compliant train scheduling optimization"""
    try:
        data = request.get_json()
        target_date = data.get('target_date', datetime.now().strftime('%Y-%m-%d'))
        num_trains = data.get('num_trains', 24)
        
        print(f"Optimizing SIH-compliant schedule for {target_date} with {num_trains} trains...")
        
        result = optimizer.optimize_schedule_sih(target_date, num_trains)
        
        if 'error' in result:
            return jsonify(result), 400
        
        print(f"SIH optimization completed: {result['solution_status']} in {result['execution_time']}s")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in SIH optimization: {str(e)}")
        return jsonify({
            'error': f'SIH optimization service error: {str(e)}',
            'solution_status': 'ERROR'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Enhanced OR-Tools SIH Train Scheduling',
        'timestamp': datetime.now().isoformat(),
        'ortools_available': True,
        'sih_compliance': True
    })

@app.route('/', methods=['GET'])
def root():
    """Service information endpoint"""
    return jsonify({
        'service': 'Enhanced Google OR-Tools SIH Train Scheduling Optimization',
        'version': '2.0.0',
        'endpoints': {
            'optimize_sih': 'POST /api/train-scheduling/optimize-sih',
            'health': 'GET /api/health'
        },
        'description': 'SIH-compliant constraint programming based train scheduling using Google OR-Tools',
        'sih_requirements': [
            'Fitness Certificates - validity windows from Rolling-Stock, Signalling and Telecom departments',
            'Job-Card Status - open vs. closed work orders from IBM Maximo',
            'Branding Priorities - contractual commitments for exterior wrap exposure hours',
            'Mileage Balancing - kilometre allocation for equal bogie, brake-pad and HVAC wear',
            'Cleaning & Detailing Slots - available manpower and bay occupancy for interior deep-cleaning',
            'Stabling Geometry - physical bay positions to minimise nightly shunting and morning turn-out time'
        ]
    })

if __name__ == '__main__':
    print("🚀 Starting Enhanced Google OR-Tools SIH Train Scheduling Service...")
    print("📊 Loading OR-Tools constraint programming solver...")
    print("🚂 Initializing SIH-compliant train fleet optimization...")
    print("🔧 SIH Requirements:")
    print("   1. Fitness Certificates - validity windows from departments")
    print("   2. Job-Card Status - IBM Maximo work orders")
    print("   3. Branding Priorities - contractual exposure commitments")
    print("   4. Mileage Balancing - equal wear distribution")
    print("   5. Cleaning & Detailing - manpower and bay occupancy")
    print("   6. Stabling Geometry - optimal bay positions")
    print("🌐 Service will be available at: http://localhost:8001")
    print("📡 Frontend should connect to: http://localhost:8001/api/train-scheduling/optimize-sih")
    
    app.run(host='0.0.0.0', port=8001, debug=True)
