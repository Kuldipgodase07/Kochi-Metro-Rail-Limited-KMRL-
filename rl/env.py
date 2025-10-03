import gymnasium as gym
from gymnasium import spaces
import numpy as np
from datetime import datetime, timedelta
from database_connector import KMRLDatabaseConnector
from typing import List, Dict, Any, Optional, Tuple

class KMRLSchedulingEnv(gym.Env):
    """
    Enhanced RL environment for Kochi Metro train induction scheduling.
    
    Implements 6 SIH parameters:
    1. Fitness Certificates (Rolling-Stock, Signalling, Telecom)
    2. Job-Card Status (IBM Maximo integration)
    3. Branding Priorities (Contractual commitments)
    4. Mileage Balancing (Wear equalization)
    5. Cleaning & Detailing Slots (Manpower management)
    6. Stabling Geometry (Physical bay positions)
    
    - State: Real fleet feature matrix from database
    - Action: Assignment for each train (service, standby, IBL)
    - Reward: Composite based on all 6 SIH parameters
    """
    metadata = {"render.modes": ["human"]}

    def __init__(self, num_trains=25, target_date: str = None):
        super().__init__()
        self.num_trains = num_trains
        self.target_date = target_date or datetime.now().strftime("%Y-%m-%d")
        
        # Enhanced state dimensions for 6 SIH parameters
        # [fitness_rolling, fitness_signalling, fitness_telecom, job_card_status, 
        #  branding_priority, mileage_balance, cleaning_due, stabling_position]
        self.state_dim = 8
        
        # Observation space: (num_trains, state_dim)
        self.observation_space = spaces.Box(low=0, high=1, shape=(num_trains, self.state_dim), dtype=np.float32)
        
        # Action space: 0=service, 1=standby, 2=IBL per train
        self.action_space = spaces.MultiDiscrete([3] * num_trains)
        
        # Database connector
        self.db_connector = KMRLDatabaseConnector()
        
        # Current state and metadata
        self.current_state = None
        self.trainset_data = None
        self.schedule_templates = None
        
        # SIH parameter weights
        self.sih_weights = {
            'fitness_certificates': 0.25,
            'job_card_status': 0.20,
            'branding_priorities': 0.15,
            'mileage_balancing': 0.15,
            'cleaning_slots': 0.10,
            'stabling_geometry': 0.15
        }

    def reset(self, seed=None, options=None):
        """Reset environment with real database data for the target date"""
        if seed is not None:
            np.random.seed(seed)
        
        # Fetch real trainset data from database
        self.trainset_data = self.db_connector.get_trainsets_for_date(self.target_date)
        self.schedule_templates = self.db_connector.get_train_schedule_templates()
        
        # Limit to num_trains if we have more data
        if len(self.trainset_data) > self.num_trains:
            self.trainset_data = self.trainset_data[:self.num_trains]
        
        # Initialize state matrix with real data
        self.current_state = np.zeros((self.num_trains, self.state_dim), dtype=np.float32)
        
        # Process each trainset and extract SIH parameters
        for i, train in enumerate(self.trainset_data):
            if i >= self.num_trains:
                break
                
            # 1. Fitness Certificates (3 dimensions)
            fitness_scores = self._calculate_fitness_scores(train.get('fitness_certs', []))
            self.current_state[i, 0] = fitness_scores['rolling_stock']
            self.current_state[i, 1] = fitness_scores['signalling']
            self.current_state[i, 2] = fitness_scores['telecom']
            
            # 2. Job Card Status
            self.current_state[i, 3] = self._calculate_job_card_status(train.get('job_cards', []))
            
            # 3. Branding Priorities
            self.current_state[i, 4] = self._calculate_branding_priority(train.get('branding', []))
            
            # 4. Mileage Balancing
            self.current_state[i, 5] = self._calculate_mileage_balance(train.get('mileage', []))
            
            # 5. Cleaning & Detailing Slots
            self.current_state[i, 6] = self._calculate_cleaning_status(train.get('cleaning', []))
            
            # 6. Stabling Geometry
            self.current_state[i, 7] = self._calculate_stabling_position(train.get('stabling', []))
        
        return self.current_state, {}

    def step(self, action):
        # Apply action, calculate reward
        reward, info = self._calculate_reward(action)
        terminated = True  # Single step per episode (nightly scheduling)
        truncated = False
        next_state = self.current_state  # No transition for demo
        return next_state, reward, terminated, truncated, info

    def _calculate_reward(self, action):
        """Enhanced reward function based on 6 SIH parameters"""
        service_trains = np.where(np.array(action) == 0)[0]
        standby_trains = np.where(np.array(action) == 1)[0]
        ibl_trains = np.where(np.array(action) == 2)[0]
        
        total_reward = 0
        info = {
            "service_count": len(service_trains),
            "standby_count": len(standby_trains),
            "ibl_count": len(ibl_trains),
            "sih_scores": {}
        }
        
        # Calculate reward for each SIH parameter
        for param, weight in self.sih_weights.items():
            if param == 'fitness_certificates':
                score = self._calculate_fitness_reward(service_trains)
            elif param == 'job_card_status':
                score = self._calculate_job_card_reward(service_trains)
            elif param == 'branding_priorities':
                score = self._calculate_branding_reward(service_trains)
            elif param == 'mileage_balancing':
                score = self._calculate_mileage_reward(service_trains)
            elif param == 'cleaning_slots':
                score = self._calculate_cleaning_reward(service_trains)
            elif param == 'stabling_geometry':
                score = self._calculate_stabling_reward(service_trains)
            
            total_reward += score * weight
            info["sih_scores"][param] = score
        
        return total_reward, info

    def _calculate_fitness_scores(self, fitness_certs: List[Dict]) -> Dict[str, float]:
        """Calculate fitness certificate scores for all three departments"""
        scores = {'rolling_stock': 0.0, 'signalling': 0.0, 'telecom': 0.0}
        
        for cert in fitness_certs:
            dept = cert.get('department', '')
            is_valid = cert.get('is_valid', False)
            days_to_expiry = cert.get('days_to_expiry', 0)
            
            # Score based on validity and days to expiry
            if is_valid and days_to_expiry > 30:
                score = 1.0
            elif is_valid and days_to_expiry > 7:
                score = 0.8
            elif is_valid:
                score = 0.5
            else:
                score = 0.0
                
            if dept == 'rolling_stock':
                scores['rolling_stock'] = score
            elif dept == 'signalling':
                scores['signalling'] = score
            elif dept == 'telecom':
                scores['telecom'] = score
                
        return scores
    
    def _calculate_job_card_status(self, job_cards: List[Dict]) -> float:
        """Calculate job card status score (0-1, higher is better)"""
        if not job_cards:
            return 1.0  # No open jobs is good
        
        # Check for emergency or high priority jobs
        for job in job_cards:
            priority = job.get('priority', 'low')
            status = job.get('status', 'closed')
            
            if status == 'open' and priority in ['emergency', 'high']:
                return 0.0  # Critical jobs block service
            elif status == 'open' and priority in ['medium', 'low']:
                return 0.5  # Medium/low priority jobs reduce score
        
        return 1.0  # All jobs closed
    
    def _calculate_branding_priority(self, branding: List[Dict]) -> float:
        """Calculate branding priority score"""
        if not branding:
            return 0.5  # Neutral if no branding data
        
        brand = branding[0]  # Assume one branding campaign per train
        priority = brand.get('priority', 'normal')
        exposure_hours = brand.get('exposure_hours', 0)
        target_hours = brand.get('target_hours', 100)
        
        # Score based on priority and exposure needs
        if priority == 'critical':
            return 1.0 if exposure_hours < target_hours else 0.8
        elif priority == 'high':
            return 0.8 if exposure_hours < target_hours else 0.6
        else:
            return 0.6 if exposure_hours < target_hours else 0.4
    
    def _calculate_mileage_balance(self, mileage: List[Dict]) -> float:
        """Calculate mileage balance score (prefer balanced mileage)"""
        if not mileage:
            return 0.5
        
        mile_data = mileage[0]
        total_km = mile_data.get('total_km_run', 0)
        bogie_condition = mile_data.get('bogie_condition_index', 50)
        brake_wear = mile_data.get('brake_pad_wear_level', 50)
        
        # Prefer trains with balanced mileage (50k-150k km)
        if 50000 <= total_km <= 150000:
            mileage_score = 1.0
        elif 30000 <= total_km < 50000 or 150000 < total_km <= 200000:
            mileage_score = 0.7
        else:
            mileage_score = 0.3
        
        # Factor in component condition
        component_score = (bogie_condition + (100 - brake_wear)) / 200
        
        return (mileage_score + component_score) / 2
    
    def _calculate_cleaning_status(self, cleaning: List[Dict]) -> float:
        """Calculate cleaning status score"""
        if not cleaning:
            return 0.5
        
        # Check if cleaning is due or overdue
        for clean in cleaning:
            status = clean.get('status', 'completed')
            days_since_cleaning = clean.get('days_since_cleaning', 0)
            cleaning_type = clean.get('type', 'trip_cleaning')
            
            if status == 'overdue':
                return 0.0  # Overdue cleaning is bad
            elif status == 'scheduled' and days_since_cleaning > 7:
                return 0.3  # Scheduled but delayed
            elif status == 'completed' and days_since_cleaning < 3:
                return 1.0  # Recently cleaned
            elif status == 'completed':
                return 0.7  # Cleaned but not recent
        
        return 0.5
    
    def _calculate_stabling_position(self, stabling: List[Dict]) -> float:
        """Calculate stabling position efficiency score"""
        if not stabling:
            return 0.5
        
        stable = stabling[0]
        position_order = stable.get('position_order', 12)  # Default middle position
        depot = stable.get('depot_name', 'Depot A')
        
        # Prefer trains in positions 1-6 or 19-24 (easier to access)
        if 1 <= position_order <= 6 or 19 <= position_order <= 24:
            return 1.0
        elif 7 <= position_order <= 12 or 13 <= position_order <= 18:
            return 0.7
        else:
            return 0.5
    
    # Reward calculation methods for each SIH parameter
    def _calculate_fitness_reward(self, service_trains: np.ndarray) -> float:
        """Calculate fitness certificate reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            # Check all three fitness certificates
            rolling_score = self.current_state[train_idx, 0]
            signalling_score = self.current_state[train_idx, 1]
            telecom_score = self.current_state[train_idx, 2]
            
            # All three must be valid for full score
            if rolling_score > 0.5 and signalling_score > 0.5 and telecom_score > 0.5:
                total_score += 1.0
            elif rolling_score > 0.3 and signalling_score > 0.3 and telecom_score > 0.3:
                total_score += 0.5
            else:
                total_score -= 1.0  # Penalty for invalid certificates
        
        return total_score / len(service_trains)
    
    def _calculate_job_card_reward(self, service_trains: np.ndarray) -> float:
        """Calculate job card status reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            job_card_score = self.current_state[train_idx, 3]
            total_score += job_card_score
        
        return total_score / len(service_trains)
    
    def _calculate_branding_reward(self, service_trains: np.ndarray) -> float:
        """Calculate branding priority reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            branding_score = self.current_state[train_idx, 4]
            total_score += branding_score
        
        return total_score / len(service_trains)
    
    def _calculate_mileage_reward(self, service_trains: np.ndarray) -> float:
        """Calculate mileage balancing reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            mileage_score = self.current_state[train_idx, 5]
            total_score += mileage_score
        
        return total_score / len(service_trains)
    
    def _calculate_cleaning_reward(self, service_trains: np.ndarray) -> float:
        """Calculate cleaning status reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            cleaning_score = self.current_state[train_idx, 6]
            total_score += cleaning_score
        
        return total_score / len(service_trains)
    
    def _calculate_stabling_reward(self, service_trains: np.ndarray) -> float:
        """Calculate stabling geometry reward"""
        if len(service_trains) == 0:
            return 0.0
        
        total_score = 0.0
        for train_idx in service_trains:
            stabling_score = self.current_state[train_idx, 7]
            total_score += stabling_score
        
        return total_score / len(service_trains)
    
    def generate_schedule(self, target_date: str) -> Dict[str, Any]:
        """Generate train schedule for a specific date"""
        self.target_date = target_date
        state, _ = self.reset()
        
        # This would be called by the trained RL agent
        # For now, return a placeholder structure
        return {
            "date": target_date,
            "trains": [],
            "schedule": [],
            "arrival_times": [],
            "departure_times": []
        }
    
    def render(self, mode="human"):
        print(f"State: {self.current_state}")
        print(f"Target Date: {self.target_date}")
        print(f"SIH Weights: {self.sih_weights}")

    def close(self):
        if self.db_connector:
            self.db_connector.close_connection()