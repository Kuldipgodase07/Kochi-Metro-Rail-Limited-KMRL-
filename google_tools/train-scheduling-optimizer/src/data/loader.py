"""
KMRL Train Scheduling Data Loader
Loads data from MongoDB for Google OR-Tools optimization
"""

from typing import List, Dict, Any, Optional, Tuple
from pymongo import MongoClient
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

class KMRLDataLoader:
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", db_name: str = "kmrl_train_scheduling"):
        """Initialize MongoDB connection for data loading"""
        self.client = MongoClient(connection_string)
        self.db = self.client[db_name]
    
    def get_available_trainsets(self) -> List[Dict[str, Any]]:
        """Get all available trainsets for scheduling"""
        # Get trainsets that are in service or standby (not in maintenance)
        pipeline = [
            {
                '$match': {
                    'current_status': {'$in': ['in_service', 'standby']}
                }
            },
            {
                '$lookup': {
                    'from': 'mileage_records',
                    'localField': 'trainset_id',
                    'foreignField': 'trainset_id',
                    'as': 'mileage_info'
                }
            },
            {
                '$unwind': {
                    'path': '$mileage_info',
                    'preserveNullAndEmptyArrays': True
                }
            }
        ]
        
        trainsets = list(self.db.trainsets.aggregate(pipeline))
        return trainsets
    
    def check_fitness_constraints(self, trainset_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """Check fitness certificate constraints for given trainsets"""
        fitness_data = {}
        
        # Get valid fitness certificates
        certificates = list(self.db.fitness_certificates.find({
            'trainset_id': {'$in': trainset_ids},
            'is_valid': True
        }))
        
        for trainset_id in trainset_ids:
            trainset_certs = [cert for cert in certificates if cert['trainset_id'] == trainset_id]
            
            # Check if all required certificates are present and valid
            required_certs = ['rolling_stock', 'signalling', 'telecom']
            valid_cert_types = [cert['certificate_type'] for cert in trainset_certs]
            
            fitness_data[trainset_id] = {
                'has_all_certificates': all(cert_type in valid_cert_types for cert_type in required_certs),
                'missing_certificates': [cert for cert in required_certs if cert not in valid_cert_types],
                'min_expiry_days': min([cert['days_until_expiry'] for cert in trainset_certs]) if trainset_certs else 0,
                'is_fitness_ok': len(trainset_certs) >= 3 and all(cert['days_until_expiry'] > 7 for cert in trainset_certs)
            }
        
        return fitness_data
    
    def check_job_card_constraints(self, trainset_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """Check job card constraints from IBM Maximo"""
        job_card_data = {}
        
        # Get open/in-progress job cards
        job_cards = list(self.db.job_cards.find({
            'trainset_id': {'$in': trainset_ids},
            'status': {'$in': ['open', 'in-progress']}
        }))
        
        for trainset_id in trainset_ids:
            trainset_jobs = [job for job in job_cards if job['trainset_id'] == trainset_id]
            
            # Check for blocking jobs (emergency/high priority)
            blocking_jobs = [job for job in trainset_jobs if job.get('is_blocking', False)]
            
            job_card_data[trainset_id] = {
                'open_job_count': len(trainset_jobs),
                'has_blocking_jobs': len(blocking_jobs) > 0,
                'blocking_job_types': [job['fault_category'] for job in blocking_jobs],
                'max_priority_score': max([job.get('priority_score', 0) for job in trainset_jobs]) if trainset_jobs else 0,
                'is_available_for_service': len(blocking_jobs) == 0
            }
        
        return job_card_data
    
    def get_branding_requirements(self, trainset_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """Get branding priority requirements"""
        branding_data = {}
        
        # Get active branding commitments
        current_date = datetime.now()
        branding_commitments = list(self.db.branding_commitments.find({
            'trainset_id': {'$in': trainset_ids},
            'campaign_end': {'$gte': current_date}
        }))
        
        for trainset_id in trainset_ids:
            trainset_branding = [brand for brand in branding_commitments if brand['trainset_id'] == trainset_id]
            
            if trainset_branding:
                # Get the highest priority branding
                highest_priority = max(trainset_branding, key=lambda x: x.get('branding_priority_score', 0))
                
                branding_data[trainset_id] = {
                    'has_branding_commitments': True,
                    'priority_score': highest_priority.get('branding_priority_score', 0),
                    'exposure_deficit': highest_priority.get('exposure_deficit', 0),
                    'is_urgent': highest_priority.get('is_urgent_branding', False),
                    'advertiser': highest_priority.get('advertiser_name', ''),
                    'penalty_risk': highest_priority.get('penalty_clause') == 'Y'
                }
            else:
                branding_data[trainset_id] = {
                    'has_branding_commitments': False,
                    'priority_score': 0,
                    'exposure_deficit': 0,
                    'is_urgent': False,
                    'advertiser': '',
                    'penalty_risk': False
                }
        
        return branding_data
    
    def get_mileage_balancing_data(self, trainset_ids: List[int]) -> Dict[int, Dict[str, Any]]:
        """Get mileage data for balancing optimization"""
        mileage_data = {}
        
        # Get mileage records
        mileage_records = list(self.db.mileage_records.find({
            'trainset_id': {'$in': trainset_ids}
        }))
        
        for trainset_id in trainset_ids:
            trainset_mileage = next((rec for rec in mileage_records if rec['trainset_id'] == trainset_id), None)
            
            if trainset_mileage:
                mileage_data[trainset_id] = {
                    'total_km': trainset_mileage.get('total_km_run', 0),
                    'balance_score': trainset_mileage.get('mileage_balance_score', 50),
                    'wear_score': trainset_mileage.get('wear_score', 0),
                    'needs_poh': trainset_mileage.get('poh_urgency') == 'high',
                    'needs_ioh': trainset_mileage.get('ioh_urgency') == 'high',
                    'bogie_condition': trainset_mileage.get('bogie_condition_index', 50),
                    'brake_wear': trainset_mileage.get('brake_pad_wear_level', 50),
                    'hvac_hours': trainset_mileage.get('hvac_runtime_hours', 0)
                }
            else:
                # Default values if no mileage data
                mileage_data[trainset_id] = {
                    'total_km': 0,
                    'balance_score': 50,
                    'wear_score': 0,
                    'needs_poh': False,
                    'needs_ioh': False,
                    'bogie_condition': 50,
                    'brake_wear': 50,
                    'hvac_hours': 0
                }
        
        return mileage_data
    
    def get_cleaning_constraints(self, trainset_ids: List[int], target_date: datetime = None) -> Dict[int, Dict[str, Any]]:
        """Get cleaning and detailing constraints"""
        if target_date is None:
            target_date = datetime.now()
        
        cleaning_data = {}
        
        # Get cleaning schedules
        cleaning_schedules = list(self.db.cleaning_schedule.find({
            'trainset_id': {'$in': trainset_ids}
        }))
        
        for trainset_id in trainset_ids:
            trainset_cleaning = [clean for clean in cleaning_schedules if clean['trainset_id'] == trainset_id]
            
            # Check if train is available for service (not being cleaned)
            current_cleaning = [clean for clean in trainset_cleaning 
                              if clean.get('status') in ['in-progress', 'scheduled']]
            
            # Check if cleaning is overdue
            overdue_cleaning = [clean for clean in trainset_cleaning 
                              if clean.get('is_overdue', False)]
            
            cleaning_data[trainset_id] = {
                'is_available_for_service': len(current_cleaning) == 0,
                'has_overdue_cleaning': len(overdue_cleaning) > 0,
                'cleaning_priority_score': max([clean.get('cleaning_priority_score', 0) 
                                              for clean in trainset_cleaning]) if trainset_cleaning else 0,
                'scheduled_cleaning_count': len(current_cleaning),
                'next_cleaning_type': current_cleaning[0].get('cleaning_type', '') if current_cleaning else ''
            }
        
        return cleaning_data
    
    def get_stabling_geometry_data(self) -> Dict[str, Any]:
        """Get bay positions and geometry data"""
        # Get all bay information
        bays = list(self.db.stabling_geometry.find({}))
        
        # Available bays for assignment
        available_bays = [bay for bay in bays if bay.get('is_available', False)]
        
        # Group by depot and line
        depot_data = {}
        for bay in available_bays:
            depot_name = bay.get('depot_name', 'Unknown')
            line_name = bay.get('line_name', 'Unknown')
            
            if depot_name not in depot_data:
                depot_data[depot_name] = {}
            
            if line_name not in depot_data[depot_name]:
                depot_data[depot_name][line_name] = []
            
            depot_data[depot_name][line_name].append({
                'bay_id': bay.get('bay_id'),
                'position_order': bay.get('position_order'),
                'accessibility_score': bay.get('accessibility_score', 0),
                'current_trainset': bay.get('trainset_id') if bay.get('is_occupied') else None
            })
        
        return {
            'available_bay_count': len(available_bays),
            'total_bay_count': len(bays),
            'depot_data': depot_data,
            'bay_details': available_bays
        }
    
    def get_optimization_dataset(self, target_date: datetime = None, max_trains: int = None) -> Dict[str, Any]:
        """Get complete dataset for OR-Tools optimization"""
        if target_date is None:
            target_date = datetime.now()
        
        print("Loading optimization dataset from MongoDB...")
        
        # Get available trainsets
        trainsets = self.get_available_trainsets()
        trainset_ids = [t['trainset_id'] for t in trainsets]
        
        if max_trains:
            trainset_ids = trainset_ids[:max_trains]
            trainsets = trainsets[:max_trains]
        
        print(f"Found {len(trainsets)} available trainsets")
        
        # Load all constraint data
        fitness_constraints = self.check_fitness_constraints(trainset_ids)
        job_card_constraints = self.check_job_card_constraints(trainset_ids)
        branding_requirements = self.get_branding_requirements(trainset_ids)
        mileage_balancing = self.get_mileage_balancing_data(trainset_ids)
        cleaning_constraints = self.get_cleaning_constraints(trainset_ids, target_date)
        stabling_geometry = self.get_stabling_geometry_data()
        
        # Create comprehensive dataset
        dataset = {
            'target_date': target_date,
            'trainsets': trainsets,
            'trainset_count': len(trainsets),
            'trainset_ids': trainset_ids,
            
            # Constraint data
            'fitness_constraints': fitness_constraints,
            'job_card_constraints': job_card_constraints,
            'branding_requirements': branding_requirements,
            'mileage_balancing': mileage_balancing,
            'cleaning_constraints': cleaning_constraints,
            'stabling_geometry': stabling_geometry,
            
            # Summary statistics
            'available_for_scheduling': sum(1 for tid in trainset_ids 
                                          if fitness_constraints[tid]['is_fitness_ok'] 
                                          and job_card_constraints[tid]['is_available_for_service']
                                          and cleaning_constraints[tid]['is_available_for_service']),
            'high_priority_branding': sum(1 for tid in trainset_ids 
                                        if branding_requirements[tid]['is_urgent']),
            'available_bays': stabling_geometry['available_bay_count']
        }
        
        print(f"Dataset ready: {dataset['available_for_scheduling']} trains available for scheduling")
        
        return dataset
    
    def close_connection(self):
        """Close MongoDB connection"""
        self.client.close()

# Legacy compatibility functions
def load_train_data(file_path: str = None) -> List[Dict]:
    """Legacy function - now loads from MongoDB"""
    loader = KMRLDataLoader()
    try:
        trainsets = loader.get_available_trainsets()
        return trainsets
    finally:
        loader.close_connection()

def load_additional_data(data_type: str) -> List[Dict]:
    """Legacy function - now loads from MongoDB based on type"""
    loader = KMRLDataLoader()
    try:
        if data_type == 'optimization':
            return loader.get_optimization_dataset()
        else:
            return []
    finally:
        loader.close_connection()