"""
Database connector for KMRL RL model
Connects to MongoDB Atlas to fetch real train data for RL training
"""

import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
import pandas as pd

class KMRLDatabaseConnector:
    def __init__(self):
        """Initialize MongoDB connection for RL model"""
        # MongoDB Atlas connection string
        self.connection_string = os.getenv(
            "MONGODB_URI", 
            "mongodb+srv://kmrl:kmrl123@cluster0.abc123.mongodb.net/kmrl_train_scheduling?retryWrites=true&w=majority"
        )
        self.client = MongoClient(self.connection_string)
        self.db = self.client.kmrl_train_scheduling
    
    def get_trainsets_for_date(self, target_date: str) -> List[Dict[str, Any]]:
        """
        Get all trainsets with their complete data for a specific date
        Returns data needed for RL state representation
        """
        try:
            # Get trainsets that are available for scheduling
            pipeline = [
                {
                    '$match': {
                        'current_status': {'$in': ['in_service', 'standby']}
                    }
                },
                {
                    '$lookup': {
                        'from': 'fitness_certificates',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'fitness_certs'
                    }
                },
                {
                    '$lookup': {
                        'from': 'job_cards',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'job_cards'
                    }
                },
                {
                    '$lookup': {
                        'from': 'branding_commitments',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'branding'
                    }
                },
                {
                    '$lookup': {
                        'from': 'mileage_records',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'mileage'
                    }
                },
                {
                    '$lookup': {
                        'from': 'cleaning_schedule',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'cleaning'
                    }
                },
                {
                    '$lookup': {
                        'from': 'stabling_geometry',
                        'localField': 'trainset_id',
                        'foreignField': 'trainset_id',
                        'as': 'stabling'
                    }
                }
            ]
            
            trainsets = list(self.db.trainsets.aggregate(pipeline))
            return trainsets
            
        except Exception as e:
            print(f"Error fetching trainsets: {e}")
            return []
    
    def get_historical_schedules(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get historical scheduling data for training"""
        try:
            schedules = list(self.db.daily_schedules.find({
                'schedule_date': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }))
            return schedules
        except Exception as e:
            print(f"Error fetching historical schedules: {e}")
            return []
    
    def get_passenger_flow_data(self, target_date: str) -> Dict[str, Any]:
        """Get passenger flow data for the target date"""
        try:
            # Get passenger flow data for the specific date
            flow_data = self.db.passenger_flow_variable_capacity.find_one({
                'date': target_date
            })
            return flow_data or {}
        except Exception as e:
            print(f"Error fetching passenger flow data: {e}")
            return {}
    
    def save_rl_decision(self, decision_data: Dict[str, Any]):
        """Save RL model decision for future learning"""
        try:
            self.db.rl_decisions.insert_one({
                'timestamp': datetime.now(),
                'decision_data': decision_data
            })
        except Exception as e:
            print(f"Error saving RL decision: {e}")
    
    def get_train_schedule_templates(self) -> List[Dict[str, Any]]:
        """Get train schedule templates for different time periods"""
        try:
            # Get schedule templates for different operational scenarios
            templates = list(self.db.schedule_templates.find())
            return templates
        except Exception as e:
            print(f"Error fetching schedule templates: {e}")
            return []
    
    def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
