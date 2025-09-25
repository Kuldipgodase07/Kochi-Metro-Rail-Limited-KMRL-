"""
Advanced Deep Reinforcement Learning Environment for Kochi Metro Rail Limited (KMRL)

This module implements a comprehensive multi-train scheduling environment supporting:
- Multi-train operations across stations
- Multiple passenger types with different priorities  
- Real-time passenger arrivals
- Complex reward function balancing multiple objectives
- Modular design for easy extension

Author: KMRL Development Team
Version: 1.0.0
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
import logging
from dataclasses import dataclass, field
from enum import Enum
import random
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PassengerType(Enum):
    """Enumeration of passenger types with different priorities"""
    REGULAR = "regular"
    SENIOR = "senior" 
    DISABLED = "disabled"


class TrainStatus(Enum):
    """Train operational status"""
    READY = "ready"
    IN_SERVICE = "in_service"
    MAINTENANCE = "maintenance" 
    STANDBY = "standby"


@dataclass
class PassengerGroup:
    """Represents a group of passengers at a station"""
    passenger_type: PassengerType
    count: int
    arrival_time: float
    priority_weight: float
    waiting_penalty: float = 1.0


@dataclass 
class Station:
    """Metro station with passenger management"""
    id: int
    name: str
    position: float  # Position along the route (0.0 to 1.0)
    passengers: List[PassengerGroup] = field(default_factory=list)
    capacity: int = 500  # Platform capacity
    
    def add_passengers(self, group: PassengerGroup):
        """Add passenger group to station"""
        self.passengers.append(group)
        
    def remove_passengers(self, passenger_type: PassengerType, count: int) -> int:
        """Remove passengers when train arrives, returns actual removed count"""
        removed = 0
        remaining_groups = []
        
        for group in self.passengers:
            if group.passenger_type == passenger_type and removed < count:
                take = min(group.count, count - removed)
                removed += take
                group.count -= take
                if group.count > 0:
                    remaining_groups.append(group)
            else:
                remaining_groups.append(group)
                
        self.passengers = remaining_groups
        return removed


@dataclass
class Train:
    """Metro train with operational parameters"""
    id: int
    name: str
    position: float  # Current position (0.0 to 1.0)
    capacity: int
    current_load: int = 0
    energy_level: float = 100.0  # Energy percentage
    status: TrainStatus = TrainStatus.READY
    target_station: Optional[int] = None
    speed: float = 1.0  # Speed multiplier
    maintenance_due: float = 1000.0  # Distance until maintenance needed
    
    @property
    def is_available(self) -> bool:
        """Check if train is available for scheduling"""
        return self.status in [TrainStatus.READY, TrainStatus.IN_SERVICE]
        
    @property 
    def load_factor(self) -> float:
        """Current load as percentage of capacity"""
        return self.current_load / self.capacity if self.capacity > 0 else 0.0
        
    def update_energy(self, distance: float, load_factor: float = 0.5):
        """Update energy based on distance traveled and load"""
        base_consumption = distance * 2.0  # Base energy per unit distance
        load_penalty = load_factor * 1.5  # Additional consumption for higher loads
        self.energy_level = max(0, self.energy_level - (base_consumption + load_penalty))
        
    def needs_maintenance(self) -> bool:
        """Check if train needs maintenance"""
        return self.maintenance_due <= 0 or self.energy_level < 10.0


class KMRLMetroEnvironment(gym.Env):
    """
    Advanced Deep RL Environment for Multi-Train Metro Scheduling
    
    Observation Space:
    - Train states: position, energy, load, status for each train
    - Station states: passenger counts by type, waiting times
    - System state: time, schedule adherence, energy efficiency
    
    Action Space:
    - For each train: target station, speed adjustment, service/maintenance decision
    """
    
    metadata = {"render_modes": ["human", "rgb_array"], "render_fps": 30}
    
    def __init__(self, 
                 num_trains: int = 3,
                 num_stations: int = 10,
                 max_episode_steps: int = 1000,
                 passenger_arrival_rates: Optional[Dict[str, float]] = None,
                 reward_weights: Optional[Dict[str, float]] = None,
                 render_mode: Optional[str] = None):
        """
        Initialize the KMRL Metro environment
        
        Args:
            num_trains: Number of trains in the system
            num_stations: Number of stations on the route
            max_episode_steps: Maximum steps per episode
            passenger_arrival_rates: Arrival rates for each passenger type
            reward_weights: Weights for different reward components
            render_mode: Rendering mode for visualization
        """
        super().__init__()
        
        self.num_trains = num_trains
        self.num_stations = num_stations
        self.max_episode_steps = max_episode_steps
        self.current_step = 0
        self.render_mode = render_mode
        
        # Default passenger arrival rates (passengers per time step)
        self.passenger_arrival_rates = passenger_arrival_rates or {
            PassengerType.REGULAR.value: 2.0,
            PassengerType.SENIOR.value: 0.5, 
            PassengerType.DISABLED.value: 0.2
        }
        
        # Default reward weights
        self.reward_weights = reward_weights or {
            "passenger_satisfaction": 0.4,
            "schedule_adherence": 0.25,
            "energy_efficiency": 0.2,
            "high_priority_penalty": 0.15
        }
        
        # Priority weights for different passenger types
        self.passenger_priorities = {
            PassengerType.REGULAR: 1.0,
            PassengerType.SENIOR: 1.5,
            PassengerType.DISABLED: 2.0
        }
        
        # Initialize stations
        self.stations = [
            Station(
                id=i,
                name=f"Station_{i+1}",
                position=i / (num_stations - 1)
            ) for i in range(num_stations)
        ]
        
        # Initialize trains
        self.trains = [
            Train(
                id=i,
                name=f"KMRL-{str(i+1).zfill(3)}",
                position=random.random(),
                capacity=200,
                energy_level=random.uniform(80, 100)
            ) for i in range(num_trains)
        ]
        
        # Define observation and action spaces
        self._setup_spaces()
        
        # Performance tracking
        self.performance_history = {
            "passenger_satisfaction": [],
            "energy_efficiency": [],
            "schedule_adherence": [],
            "total_passengers_served": 0,
            "total_waiting_time": 0.0
        }
        
        logger.info(f"Initialized KMRL Metro Environment with {num_trains} trains and {num_stations} stations")
    
    def _setup_spaces(self):
        """Setup observation and action spaces"""
        # Observation space: train states + station states + system state
        train_features = 6  # position, energy, load, status, target_station, speed
        station_features = 4  # regular, senior, disabled passenger counts, avg_waiting_time
        system_features = 3  # current_time, schedule_score, energy_efficiency
        
        obs_size = (
            self.num_trains * train_features + 
            self.num_stations * station_features + 
            system_features
        )
        
        self.observation_space = spaces.Box(
            low=0.0, high=1.0, shape=(obs_size,), dtype=np.float32
        )
        
        # Action space: for each train [target_station, speed_multiplier, service_decision]
        # target_station: 0 to num_stations-1
        # speed_multiplier: 0.5 to 1.5 
        # service_decision: 0 (continue), 1 (maintenance), 2 (standby)
        self.action_space = spaces.MultiDiscrete([
            self.num_stations,  # target_station for train 1
            3,                  # speed (0:slow, 1:normal, 2:fast) for train 1
            3,                  # service_decision for train 1
        ] * self.num_trains)
        
    def reset(self, seed: Optional[int] = None, options: Optional[Dict] = None) -> Tuple[np.ndarray, Dict]:
        """Reset the environment to initial state"""
        super().reset(seed=seed)
        
        if seed is not None:
            random.seed(seed)
            np.random.seed(seed)
            
        self.current_step = 0
        
        # Reset stations
        for station in self.stations:
            station.passengers = []
            
        # Reset trains  
        for i, train in enumerate(self.trains):
            train.position = i / len(self.trains)  # Distribute evenly
            train.energy_level = random.uniform(80, 100)
            train.current_load = 0
            train.status = TrainStatus.READY
            train.target_station = None
            train.speed = 1.0
            train.maintenance_due = random.uniform(800, 1200)
            
        # Reset performance tracking
        for key in self.performance_history:
            if isinstance(self.performance_history[key], list):
                self.performance_history[key] = []
            else:
                self.performance_history[key] = 0
                
        # Generate initial passengers
        self._generate_passengers()
        
        observation = self._get_observation()
        info = self._get_info()
        
        logger.info("Environment reset completed")
        return observation, info
    
    def step(self, action: np.ndarray) -> Tuple[np.ndarray, float, bool, bool, Dict]:
        """Execute one environment step"""
        self.current_step += 1
        
        # Parse actions for each train
        actions = self._parse_actions(action)
        
        # Execute train movements and decisions
        for i, train in enumerate(self.trains):
            if train.is_available:
                self._execute_train_action(train, actions[i])
                
        # Update train positions and energy
        self._update_trains()
        
        # Generate new passengers
        self._generate_passengers()
        
        # Handle passenger boarding/alighting
        self._handle_passenger_transfers()
        
        # Calculate reward
        reward = self._calculate_reward()
        
        # Check termination conditions
        terminated = self.current_step >= self.max_episode_steps
        truncated = self._check_emergency_conditions()
        
        # Get observation and info
        observation = self._get_observation()
        info = self._get_info()
        
        return observation, reward, terminated, truncated, info
    
    def _parse_actions(self, action: np.ndarray) -> List[Dict]:
        """Parse action array into individual train actions"""
        actions = []
        action = action.reshape(-1)  # Flatten if needed
        
        for i in range(self.num_trains):
            base_idx = i * 3
            actions.append({
                "target_station": int(action[base_idx]),
                "speed": [0.5, 1.0, 1.5][int(action[base_idx + 1])],
                "service_decision": int(action[base_idx + 2])
            })
            
        return actions
    
    def _execute_train_action(self, train: Train, action: Dict):
        """Execute action for a specific train"""
        # Set target station
        train.target_station = action["target_station"]
        train.speed = action["speed"]
        
        # Handle service decisions
        if action["service_decision"] == 1:  # Maintenance
            if train.needs_maintenance():
                train.status = TrainStatus.MAINTENANCE
                train.energy_level = 100.0  # Refuel during maintenance
                train.maintenance_due = random.uniform(800, 1200)
        elif action["service_decision"] == 2:  # Standby
            train.status = TrainStatus.STANDBY
        else:  # Continue service
            if train.status != TrainStatus.MAINTENANCE:
                train.status = TrainStatus.IN_SERVICE
    
    def _update_trains(self):
        """Update train positions and states"""
        for train in self.trains:
            if train.status == TrainStatus.IN_SERVICE and train.target_station is not None:
                # Calculate movement toward target
                target_pos = self.stations[train.target_station].position
                distance = abs(target_pos - train.position)
                
                # Move toward target
                move_distance = min(distance, 0.02 * train.speed)  # Max movement per step
                direction = 1 if target_pos > train.position else -1
                train.position += direction * move_distance
                
                # Update energy based on movement and load
                train.update_energy(move_distance, train.load_factor)
                
                # Update maintenance counter
                train.maintenance_due -= move_distance * 100
    
    def _generate_passengers(self):
        """Generate new passengers at stations based on arrival rates"""
        for station in self.stations:
            for passenger_type, rate in self.passenger_arrival_rates.items():
                if random.random() < rate / 10.0:  # Scale rate
                    passenger_enum = PassengerType(passenger_type)
                    count = np.random.poisson(max(1, rate))
                    
                    group = PassengerGroup(
                        passenger_type=passenger_enum,
                        count=count,
                        arrival_time=self.current_step,
                        priority_weight=self.passenger_priorities[passenger_enum]
                    )
                    station.add_passengers(group)
    
    def _handle_passenger_transfers(self):
        """Handle passenger boarding and alighting"""
        for train in self.trains:
            if train.status == TrainStatus.IN_SERVICE:
                # Find nearest station
                nearest_station_idx = min(
                    range(len(self.stations)),
                    key=lambda i: abs(self.stations[i].position - train.position)
                )
                
                # If close enough to station, handle transfers
                if abs(self.stations[nearest_station_idx].position - train.position) < 0.01:
                    station = self.stations[nearest_station_idx]
                    
                    # Alighting (random percentage of current passengers)
                    if train.current_load > 0:
                        alighting = int(train.current_load * random.uniform(0.1, 0.3))
                        train.current_load -= alighting
                        self.performance_history["total_passengers_served"] += alighting
                    
                    # Boarding (prioritize by passenger type)
                    available_capacity = train.capacity - train.current_load
                    
                    # Sort passenger groups by priority (disabled > senior > regular)
                    sorted_groups = sorted(
                        station.passengers, 
                        key=lambda g: g.priority_weight,
                        reverse=True
                    )
                    
                    for group in sorted_groups:
                        if available_capacity <= 0:
                            break
                            
                        boarding = min(group.count, available_capacity)
                        station.remove_passengers(group.passenger_type, boarding)
                        train.current_load += boarding
                        available_capacity -= boarding
    
    def _calculate_reward(self) -> float:
        """Calculate comprehensive reward based on multiple objectives"""
        rewards = {}
        
        # 1. Passenger Satisfaction (based on waiting times and priorities)
        total_weighted_waiting = 0.0
        total_passengers = 0
        
        for station in self.stations:
            for group in station.passengers:
                waiting_time = self.current_step - group.arrival_time
                weighted_waiting = waiting_time * group.priority_weight
                total_weighted_waiting += weighted_waiting * group.count
                total_passengers += group.count
        
        if total_passengers > 0:
            avg_weighted_waiting = total_weighted_waiting / total_passengers
            passenger_satisfaction = max(0, 1.0 - avg_weighted_waiting / 100.0)
        else:
            passenger_satisfaction = 1.0
            
        rewards["passenger_satisfaction"] = passenger_satisfaction
        
        # 2. Schedule Adherence (trains maintaining service)
        active_trains = sum(1 for t in self.trains if t.status == TrainStatus.IN_SERVICE)
        schedule_adherence = active_trains / len(self.trains)
        rewards["schedule_adherence"] = schedule_adherence
        
        # 3. Energy Efficiency
        total_energy = sum(t.energy_level for t in self.trains)
        avg_energy = total_energy / len(self.trains) / 100.0
        rewards["energy_efficiency"] = avg_energy
        
        # 4. High Priority Penalty (severe penalty for leaving disabled/senior waiting too long)
        high_priority_penalty = 0.0
        for station in self.stations:
            for group in station.passengers:
                if group.passenger_type in [PassengerType.DISABLED, PassengerType.SENIOR]:
                    waiting_time = self.current_step - group.arrival_time
                    if waiting_time > 50:  # Long wait threshold
                        high_priority_penalty += group.count * (waiting_time - 50) * 0.01
                        
        rewards["high_priority_penalty"] = -min(high_priority_penalty, 1.0)
        
        # Combine rewards with weights
        total_reward = sum(
            self.reward_weights[key] * value 
            for key, value in rewards.items()
        )
        
        # Update performance history
        for key, value in rewards.items():
            if key in self.performance_history:
                self.performance_history[key].append(value)
        
        return total_reward
    
    def _check_emergency_conditions(self) -> bool:
        """Check for emergency conditions that require episode truncation"""
        # All trains out of energy or in maintenance
        available_trains = sum(1 for t in self.trains if t.is_available and t.energy_level > 5)
        
        # Too many high-priority passengers waiting too long
        critical_waiting = 0
        for station in self.stations:
            for group in station.passengers:
                if group.passenger_type == PassengerType.DISABLED:
                    waiting_time = self.current_step - group.arrival_time
                    if waiting_time > 100:
                        critical_waiting += group.count
        
        return available_trains == 0 or critical_waiting > 20
    
    def _get_observation(self) -> np.ndarray:
        """Get current observation state"""
        obs = []
        
        # Train states
        for train in self.trains:
            obs.extend([
                train.position,
                train.energy_level / 100.0,
                train.load_factor,
                float(train.status.value == "in_service"),
                (train.target_station or 0) / self.num_stations,
                train.speed / 1.5  # Normalize speed
            ])
        
        # Station states  
        for station in self.stations:
            passenger_counts = {pt: 0 for pt in PassengerType}
            total_waiting_time = 0.0
            total_passengers = 0
            
            for group in station.passengers:
                passenger_counts[group.passenger_type] += group.count
                waiting_time = self.current_step - group.arrival_time
                total_waiting_time += waiting_time * group.count
                total_passengers += group.count
            
            avg_waiting = total_waiting_time / max(1, total_passengers) / 100.0
            
            obs.extend([
                passenger_counts[PassengerType.REGULAR] / 50.0,  # Normalize
                passenger_counts[PassengerType.SENIOR] / 20.0,
                passenger_counts[PassengerType.DISABLED] / 10.0,
                min(avg_waiting, 1.0)
            ])
        
        # System state
        schedule_score = sum(1 for t in self.trains if t.status == TrainStatus.IN_SERVICE) / len(self.trains)
        energy_efficiency = sum(t.energy_level for t in self.trains) / len(self.trains) / 100.0
        
        obs.extend([
            self.current_step / self.max_episode_steps,
            schedule_score,
            energy_efficiency
        ])
        
        return np.array(obs, dtype=np.float32)
    
    def _get_info(self) -> Dict:
        """Get additional information about the environment state"""
        total_passengers = sum(
            sum(group.count for group in station.passengers) 
            for station in self.stations
        )
        
        return {
            "step": self.current_step,
            "total_passengers_waiting": total_passengers,
            "active_trains": sum(1 for t in self.trains if t.status == TrainStatus.IN_SERVICE),
            "average_energy": sum(t.energy_level for t in self.trains) / len(self.trains),
            "performance_history": self.performance_history.copy()
        }
    
    def render(self):
        """Render the environment state"""
        if self.render_mode == "human":
            print(f"\n=== KMRL Metro System - Step {self.current_step} ===")
            
            # Train status
            print("\nTrain Status:")
            for train in self.trains:
                print(f"  {train.name}: Pos={train.position:.2f}, "
                      f"Energy={train.energy_level:.1f}%, Load={train.current_load}/{train.capacity}, "
                      f"Status={train.status.value}")
            
            # Station passenger counts
            print("\nStation Passengers:")
            for station in self.stations:
                passenger_counts = {pt: 0 for pt in PassengerType}
                for group in station.passengers:
                    passenger_counts[group.passenger_type] += group.count
                
                if sum(passenger_counts.values()) > 0:
                    print(f"  {station.name}: Regular={passenger_counts[PassengerType.REGULAR]}, "
                          f"Senior={passenger_counts[PassengerType.SENIOR]}, "
                          f"Disabled={passenger_counts[PassengerType.DISABLED]}")
            
            # Performance metrics
            if self.performance_history["passenger_satisfaction"]:
                latest_satisfaction = self.performance_history["passenger_satisfaction"][-1]
                latest_energy = self.performance_history["energy_efficiency"][-1]
                print(f"\nPerformance: Satisfaction={latest_satisfaction:.3f}, "
                      f"Energy Efficiency={latest_energy:.3f}")
    
    def close(self):
        """Clean up environment resources"""
        logger.info("KMRL Metro Environment closed")


# Configuration utilities
def create_environment_config(
    scenario: str = "standard",
    **kwargs
) -> Dict[str, Any]:
    """
    Create environment configuration for different scenarios
    
    Args:
        scenario: Predefined scenario ("standard", "rush_hour", "maintenance", "accessibility_focus")
        **kwargs: Override parameters
        
    Returns:
        Configuration dictionary
    """
    configs = {
        "standard": {
            "num_trains": 3,
            "num_stations": 10,
            "max_episode_steps": 1000,
            "passenger_arrival_rates": {
                "regular": 2.0,
                "senior": 0.5,
                "disabled": 0.2
            },
            "reward_weights": {
                "passenger_satisfaction": 0.4,
                "schedule_adherence": 0.25, 
                "energy_efficiency": 0.2,
                "high_priority_penalty": 0.15
            }
        },
        "rush_hour": {
            "num_trains": 5,
            "num_stations": 12,
            "max_episode_steps": 1500,
            "passenger_arrival_rates": {
                "regular": 5.0,
                "senior": 1.0,
                "disabled": 0.4
            },
            "reward_weights": {
                "passenger_satisfaction": 0.5,
                "schedule_adherence": 0.3,
                "energy_efficiency": 0.1,
                "high_priority_penalty": 0.1
            }
        },
        "accessibility_focus": {
            "num_trains": 4,
            "num_stations": 8,
            "max_episode_steps": 1200,
            "passenger_arrival_rates": {
                "regular": 1.5,
                "senior": 1.5,
                "disabled": 1.0
            },
            "reward_weights": {
                "passenger_satisfaction": 0.3,
                "schedule_adherence": 0.2,
                "energy_efficiency": 0.1,
                "high_priority_penalty": 0.4
            }
        }
    }
    
    config = configs.get(scenario, configs["standard"]).copy()
    config.update(kwargs)
    
    return config


if __name__ == "__main__":
    # Example usage and testing
    print("Testing KMRL Metro RL Environment...")
    
    # Create environment with standard configuration
    config = create_environment_config("standard")
    env = KMRLMetroEnvironment(**config, render_mode="human")
    
    # Test basic functionality
    obs, info = env.reset()
    print(f"Initial observation shape: {obs.shape}")
    print(f"Action space: {env.action_space}")
    
    # Run a few steps
    for step in range(5):
        action = env.action_space.sample()
        obs, reward, terminated, truncated, info = env.step(action)
        print(f"Step {step+1}: Reward = {reward:.3f}")
        env.render()
        
        if terminated or truncated:
            break
    
    env.close()
    print("Environment test completed successfully!")