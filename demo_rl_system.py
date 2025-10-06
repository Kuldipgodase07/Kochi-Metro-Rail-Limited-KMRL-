#!/usr/bin/env python3
"""
KMRL Deep RL System Demo - No Dependencies Required

This script demonstrates the architecture and design of the Deep RL system
without requiring any external dependencies. It shows the core concepts and
structure of the multi-train metro scheduling environment.

Run with: python3 demo_rl_system.py
"""

import json
import random
import time
from typing import Dict, List, Any
from dataclasses import dataclass, asdict


class PassengerType:
    REGULAR = "regular"
    SENIOR = "senior" 
    DISABLED = "disabled"


class TrainStatus:
    READY = "ready"
    IN_SERVICE = "in_service"
    MAINTENANCE = "maintenance"
    STANDBY = "standby"


@dataclass
class PassengerGroup:
    passenger_type: str
    count: int
    arrival_time: int
    priority_weight: float


@dataclass
class Station:
    id: int
    name: str
    position: float
    passengers: List[PassengerGroup]
    capacity: int = 500


@dataclass 
class Train:
    id: int
    name: str
    position: float
    capacity: int
    current_load: int
    energy_level: float
    status: str
    target_station: int
    speed: float


class KMRLMetroDemo:
    """
    Simplified demo version of the KMRL Metro RL Environment
    Demonstrates core concepts without external dependencies
    """
    
    def __init__(self, num_trains: int = 3, num_stations: int = 10):
        self.num_trains = num_trains
        self.num_stations = num_stations
        self.current_step = 0
        
        # Passenger arrival rates (per step)
        self.passenger_rates = {
            PassengerType.REGULAR: 2.0,
            PassengerType.SENIOR: 0.5,
            PassengerType.DISABLED: 0.2
        }
        
        # Priority weights
        self.passenger_priorities = {
            PassengerType.REGULAR: 1.0,
            PassengerType.SENIOR: 1.5,
            PassengerType.DISABLED: 2.0
        }
        
        # Reward weights
        self.reward_weights = {
            "passenger_satisfaction": 0.4,
            "schedule_adherence": 0.25,
            "energy_efficiency": 0.2, 
            "high_priority_penalty": 0.15
        }
        
        self._initialize_system()
        
    def _initialize_system(self):
        """Initialize stations and trains"""
        # Create stations
        self.stations = []
        for i in range(self.num_stations):
            station = Station(
                id=i,
                name=f"Station_{i+1}",
                position=i / (self.num_stations - 1),
                passengers=[]
            )
            self.stations.append(station)
        
        # Create trains  
        self.trains = []
        for i in range(self.num_trains):
            train = Train(
                id=i,
                name=f"KMRL-{str(i+1).zfill(3)}",
                position=random.random(),
                capacity=200,
                current_load=0,
                energy_level=random.uniform(80, 100),
                status=TrainStatus.READY,
                target_station=0,
                speed=1.0
            )
            self.trains.append(train)
    
    def reset(self):
        """Reset the environment"""
        self.current_step = 0
        self._initialize_system()
        return self._get_state()
    
    def step(self, actions: Dict[int, Dict[str, Any]]):
        """Execute one environment step"""
        self.current_step += 1
        
        # Execute train actions
        for train_id, action in actions.items():
            if train_id < len(self.trains):
                train = self.trains[train_id]
                self._execute_train_action(train, action)
        
        # Update system
        self._update_trains()
        self._generate_passengers()
        self._handle_passenger_transfers()
        
        # Calculate reward
        reward = self._calculate_reward()
        
        return self._get_state(), reward
    
    def _execute_train_action(self, train: Train, action: Dict[str, Any]):
        """Execute action for a specific train"""
        train.target_station = action.get("target_station", 0)
        train.speed = action.get("speed", 1.0)
        
        service_decision = action.get("service_decision", 0)
        if service_decision == 1:  # Maintenance
            train.status = TrainStatus.MAINTENANCE
            train.energy_level = 100.0
        elif service_decision == 2:  # Standby
            train.status = TrainStatus.STANDBY
        else:  # Continue service
            train.status = TrainStatus.IN_SERVICE
    
    def _update_trains(self):
        """Update train positions and energy"""
        for train in self.trains:
            if train.status == TrainStatus.IN_SERVICE:
                # Move toward target station
                target_pos = self.stations[train.target_station].position
                distance = abs(target_pos - train.position)
                
                move_distance = min(distance, 0.02 * train.speed)
                direction = 1 if target_pos > train.position else -1
                train.position += direction * move_distance
                
                # Update energy
                energy_consumption = move_distance * (1 + train.current_load / train.capacity)
                train.energy_level = max(0, train.energy_level - energy_consumption * 5)
    
    def _generate_passengers(self):
        """Generate passengers at stations"""
        for station in self.stations:
            for passenger_type, rate in self.passenger_rates.items():
                if random.random() < rate / 10:  # Scaled probability
                    count = max(1, int(random.random() * rate * 2))
                    group = PassengerGroup(
                        passenger_type=passenger_type,
                        count=count,
                        arrival_time=self.current_step,
                        priority_weight=self.passenger_priorities[passenger_type]
                    )
                    station.passengers.append(group)
    
    def _handle_passenger_transfers(self):
        """Handle passenger boarding at stations"""
        for train in self.trains:
            if train.status == TrainStatus.IN_SERVICE:
                # Find nearest station
                nearest_idx = min(
                    range(len(self.stations)),
                    key=lambda i: abs(self.stations[i].position - train.position)
                )
                
                if abs(self.stations[nearest_idx].position - train.position) < 0.05:
                    station = self.stations[nearest_idx]
                    
                    # Alighting
                    if train.current_load > 0:
                        alighting = int(train.current_load * random.uniform(0.1, 0.3))
                        train.current_load -= alighting
                    
                    # Boarding (prioritize high-priority passengers)
                    available_capacity = train.capacity - train.current_load
                    
                    # Sort by priority
                    sorted_groups = sorted(
                        station.passengers, 
                        key=lambda g: g.priority_weight, 
                        reverse=True
                    )
                    
                    for group in sorted_groups[:]:  # Copy to avoid modification during iteration
                        if available_capacity <= 0:
                            break
                        
                        boarding = min(group.count, available_capacity)
                        group.count -= boarding
                        train.current_load += boarding
                        available_capacity -= boarding
                        
                        if group.count <= 0:
                            station.passengers.remove(group)
    
    def _calculate_reward(self) -> float:
        """Calculate multi-objective reward"""
        rewards = {}
        
        # Passenger satisfaction (based on waiting times)
        total_weighted_waiting = 0
        total_passengers = 0
        
        for station in self.stations:
            for group in station.passengers:
                waiting_time = self.current_step - group.arrival_time
                weighted_waiting = waiting_time * group.priority_weight
                total_weighted_waiting += weighted_waiting * group.count
                total_passengers += group.count
        
        if total_passengers > 0:
            avg_waiting = total_weighted_waiting / total_passengers
            passenger_satisfaction = max(0, 1.0 - avg_waiting / 50.0)
        else:
            passenger_satisfaction = 1.0
        
        rewards["passenger_satisfaction"] = passenger_satisfaction
        
        # Schedule adherence
        active_trains = sum(1 for t in self.trains if t.status == TrainStatus.IN_SERVICE)
        schedule_adherence = active_trains / len(self.trains)
        rewards["schedule_adherence"] = schedule_adherence
        
        # Energy efficiency
        avg_energy = sum(t.energy_level for t in self.trains) / len(self.trains) / 100.0
        rewards["energy_efficiency"] = avg_energy
        
        # High priority penalty
        high_priority_penalty = 0
        for station in self.stations:
            for group in station.passengers:
                if group.passenger_type in [PassengerType.DISABLED, PassengerType.SENIOR]:
                    waiting_time = self.current_step - group.arrival_time
                    if waiting_time > 25:
                        high_priority_penalty += group.count * (waiting_time - 25) * 0.02
        
        rewards["high_priority_penalty"] = -min(high_priority_penalty, 1.0)
        
        # Combine rewards
        total_reward = sum(
            self.reward_weights[key] * value 
            for key, value in rewards.items()
        )
        
        return total_reward
    
    def _get_state(self) -> Dict[str, Any]:
        """Get current system state"""
        return {
            "step": self.current_step,
            "trains": [asdict(train) for train in self.trains],
            "stations": [
                {
                    "id": station.id,
                    "name": station.name,
                    "position": station.position,
                    "passenger_counts": {
                        PassengerType.REGULAR: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.REGULAR),
                        PassengerType.SENIOR: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.SENIOR),
                        PassengerType.DISABLED: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.DISABLED)
                    }
                }
                for station in self.stations
            ]
        }
    
    def render(self):
        """Display current system state"""
        print(f"\n{'='*60}")
        print(f"KMRL Metro System - Step {self.current_step}")
        print(f"{'='*60}")
        
        print("\n🚄 Train Status:")
        for train in self.trains:
            load_pct = (train.current_load / train.capacity) * 100
            status_emoji = {
                TrainStatus.IN_SERVICE: "🟢",
                TrainStatus.READY: "🔵", 
                TrainStatus.MAINTENANCE: "🟠",
                TrainStatus.STANDBY: "🟡"
            }.get(train.status, "⚪")
            
            print(f"  {status_emoji} {train.name}: "
                  f"Pos={train.position:.2f}, "
                  f"Energy={train.energy_level:.1f}%, "
                  f"Load={train.current_load}/{train.capacity} ({load_pct:.0f}%), "
                  f"Target=Station_{train.target_station + 1}")
        
        print("\n🚇 Station Passengers:")
        total_passengers = 0
        for station in self.stations:
            passenger_counts = {
                PassengerType.REGULAR: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.REGULAR),
                PassengerType.SENIOR: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.SENIOR), 
                PassengerType.DISABLED: sum(g.count for g in station.passengers if g.passenger_type == PassengerType.DISABLED)
            }
            
            total_at_station = sum(passenger_counts.values())
            total_passengers += total_at_station
            
            if total_at_station > 0:
                print(f"  📍 {station.name}: "
                      f"Regular={passenger_counts[PassengerType.REGULAR]}, "
                      f"Senior={passenger_counts[PassengerType.SENIOR]}, "
                      f"Disabled={passenger_counts[PassengerType.DISABLED]} "
                      f"(Total: {total_at_station})")
        
        if total_passengers == 0:
            print("  ✨ No passengers waiting at any station")
        
        print(f"\n📊 System Metrics:")
        active_trains = sum(1 for t in self.trains if t.status == TrainStatus.IN_SERVICE)
        avg_energy = sum(t.energy_level for t in self.trains) / len(self.trains)
        print(f"  Active Trains: {active_trains}/{len(self.trains)}")
        print(f"  Average Energy: {avg_energy:.1f}%")
        print(f"  Total Waiting Passengers: {total_passengers}")


def demo_simple_agent(env: KMRLMetroDemo, steps: int = 30):
    """Run a simple rule-based agent for demonstration"""
    print("🤖 Running Simple Rule-Based Agent Demo")
    print("=" * 60)
    
    state = env.reset()
    
    for step in range(steps):
        # Simple rule-based actions
        actions = {}
        
        for i, train in enumerate(env.trains):
            if train.status == TrainStatus.IN_SERVICE:
                # Find station with most high-priority passengers
                best_station = 0
                max_priority_score = 0
                
                for j, station in enumerate(env.stations):
                    priority_score = 0
                    for group in station.passengers:
                        if group.passenger_type == PassengerType.DISABLED:
                            priority_score += group.count * 3
                        elif group.passenger_type == PassengerType.SENIOR:
                            priority_score += group.count * 2
                        else:
                            priority_score += group.count
                    
                    if priority_score > max_priority_score:
                        max_priority_score = priority_score
                        best_station = j
                
                actions[i] = {
                    "target_station": best_station,
                    "speed": 1.2 if max_priority_score > 5 else 1.0,
                    "service_decision": 1 if train.energy_level < 15 else 0  # Maintenance if low energy
                }
            else:
                actions[i] = {
                    "target_station": 0,
                    "speed": 1.0,
                    "service_decision": 0
                }
        
        state, reward = env.step(actions)
        
        if step % 5 == 0 or step < 3:  # Show first few steps and every 5th step
            env.render()
            print(f"🎯 Step Reward: {reward:.3f}")
            
            if step < steps - 1:
                print("\nPress Enter to continue...")
                input()
    
    print(f"\n✅ Demo completed after {steps} steps!")


def show_system_architecture():
    """Display the system architecture information"""
    print("🏗️  KMRL Deep RL System Architecture")
    print("=" * 60)
    
    architecture = {
        "Environment Components": {
            "Multi-Train Management": "Simultaneous control of multiple trains with individual states",
            "Station Network": "Configurable stations with passenger management",
            "Passenger Types": "Regular, Senior, Disabled with different priorities",
            "Dynamic Arrivals": "Real-time passenger generation", 
            "Complex State Space": "Train positions, energy, passenger distributions",
            "Multi-Objective Rewards": "Balance satisfaction, energy, schedule adherence"
        },
        "Training System": {
            "PPO Algorithm": "Proximal Policy Optimization for stable learning",
            "Parallel Training": "Multiple environment instances for efficiency",
            "Scenario Support": "standard, rush_hour, accessibility_focus",
            "Progress Monitoring": "TensorBoard integration and logging",
            "Model Checkpointing": "Automatic saving and best model selection"
        },
        "Testing & Analysis": {
            "Multi-Scenario Testing": "Comprehensive evaluation across scenarios", 
            "Visualization Suite": "Performance plots and learning curves",
            "Live Demonstrations": "Real-time environment rendering",
            "Statistical Analysis": "Detailed performance statistics",
            "Export Capabilities": "Results in JSON, CSV, PNG formats"
        }
    }
    
    for category, components in architecture.items():
        print(f"\n📋 {category}:")
        for name, description in components.items():
            print(f"  • {name}: {description}")
    
    print(f"\n🚀 Quick Start Commands:")
    print(f"  pip install -r requirements.txt")
    print(f"  python train_agent.py --scenario standard")
    print(f"  python test_agent.py models/best_model.zip --live_demo")


def main():
    """Main demo function"""
    print("🚄 KMRL Deep Reinforcement Learning System Demo")
    print("=" * 60)
    print("This demo shows the core architecture and functionality")
    print("of the KMRL Deep RL system without requiring external dependencies.\n")
    
    while True:
        print("Select an option:")
        print("1. 🏗️  Show System Architecture")
        print("2. 🤖 Run Interactive Agent Demo")
        print("3. 📊 Show Environment Configuration")
        print("4. 🚪 Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            show_system_architecture()
            
        elif choice == "2":
            print("\n🚀 Starting Interactive Demo...")
            env = KMRLMetroDemo(num_trains=3, num_stations=8)
            demo_simple_agent(env, steps=15)
            
        elif choice == "3":
            print("\n📊 Environment Configuration Options:")
            
            scenarios = {
                "standard": {
                    "trains": 3, "stations": 10,
                    "passenger_rates": {"regular": 2.0, "senior": 0.5, "disabled": 0.2},
                    "focus": "Balanced performance"
                },
                "rush_hour": {
                    "trains": 5, "stations": 12, 
                    "passenger_rates": {"regular": 5.0, "senior": 1.0, "disabled": 0.4},
                    "focus": "High throughput"
                },
                "accessibility_focus": {
                    "trains": 4, "stations": 8,
                    "passenger_rates": {"regular": 1.5, "senior": 1.5, "disabled": 1.0},
                    "focus": "Priority service for disabled/senior"
                }
            }
            
            for name, config in scenarios.items():
                print(f"\n  🎯 {name.replace('_', ' ').title()}:")
                print(f"     Trains: {config['trains']}, Stations: {config['stations']}")
                print(f"     Focus: {config['focus']}")
                print(f"     Passenger Rates: {config['passenger_rates']}")
                
        elif choice == "4":
            print("\n👋 Thank you for exploring the KMRL Deep RL System!")
            print("For full functionality, install dependencies: pip install -r requirements.txt")
            break
            
        else:
            print("❌ Invalid choice. Please select 1-4.")
        
        print("\n" + "-" * 60)


if __name__ == "__main__":
    main()