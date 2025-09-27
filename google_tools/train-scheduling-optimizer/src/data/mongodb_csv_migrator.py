"""
MongoDB CSV Data Migrator for KMRL Train Scheduling System
This script clears existing train data from MongoDB and inserts fresh data from CSV files
"""

import pandas as pd
import pymongo
from pymongo import MongoClient
import os
from pathlib import Path
from datetime import datetime
import json
from typing import Dict, List, Any
import numpy as np

class KMRLMongoDBMigrator:
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", db_name: str = "kmrl_train_scheduling"):
        """Initialize MongoDB connection"""
        self.client = MongoClient(connection_string)
        self.db = self.client[db_name]
        self.csv_data_path = Path(r"C:\Project\Kochi-Metro-Rail-Limited-KMRL-\csv_data_files")
        
        if not self.csv_data_path.exists():
            raise FileNotFoundError(f"CSV data directory not found: {self.csv_data_path}")
    
    def clean_data_for_mongodb(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Clean pandas DataFrame for MongoDB insertion"""
        # Convert DataFrame to dict
        data = df.to_dict('records')
        
        # Clean each record
        cleaned_data = []
        for record in data:
            cleaned_record = {}
            for key, value in record.items():
                # Handle NaN values
                if pd.isna(value):
                    cleaned_record[key] = None
                # Convert numpy types to Python types
                elif hasattr(value, 'item'):
                    cleaned_record[key] = value.item()
                # Handle datetime objects
                elif isinstance(value, pd.Timestamp):
                    cleaned_record[key] = value.to_pydatetime()
                else:
                    cleaned_record[key] = value
            
            # Add insertion timestamp
            cleaned_record['inserted_at'] = datetime.now()
            cleaned_data.append(cleaned_record)
        
        return cleaned_data
    
    def parse_date_columns(self, df: pd.DataFrame, date_columns: List[str]) -> pd.DataFrame:
        """Parse date columns with flexible format handling"""
        for col in date_columns:
            if col in df.columns:
                try:
                    # Try different date formats
                    df[col] = pd.to_datetime(df[col], format='%d-%m-%Y', errors='coerce')
                    if df[col].isna().all():  # If all failed, try other formats
                        df[col] = pd.to_datetime(df[col], errors='coerce')
                except:
                    print(f"Warning: Could not parse date column {col}")
        return df
    
    def clear_existing_data(self):
        """Clear all existing train-related data from MongoDB"""
        print("Clearing existing data from MongoDB...")
        
        collections_to_clear = [
            'trainsets',
            'fitness_certificates', 
            'job_cards',
            'branding_commitments',
            'mileage_records',
            'cleaning_schedule',
            'stabling_geometry',
            'induction_history'
        ]
        
        for collection_name in collections_to_clear:
            result = self.db[collection_name].delete_many({})
            print(f"  Cleared {result.deleted_count} documents from {collection_name}")
    
    def insert_trainset_master(self) -> bool:
        """Insert trainset master data"""
        try:
            file_path = self.csv_data_path / "1 trainset_master.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Rename columns for consistency
            column_mapping = {
                'rake_number': 'number',
                'current_status': 'status'
            }
            df = df.rename(columns=column_mapping)
            
            # Add additional fields for scheduling
            df['availability_percentage'] = 100  # Default availability
            df['last_cleaning'] = datetime.now()
            df['branding_priority'] = 5  # Default priority
            df['bay_position'] = None  # Will be assigned during scheduling
            df['mileage'] = 0  # Will be updated from mileage records
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.trainsets.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} trainset records")
            return True
            
        except Exception as e:
            print(f"Error inserting trainset master data: {e}")
            return False
    
    def insert_fitness_certificates(self) -> bool:
        """Insert fitness certificates data"""
        try:
            file_path = self.csv_data_path / "2 fitness_certificates.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Parse date columns
            df = self.parse_date_columns(df, ['valid_from', 'valid_to'])
            
            # Add validity check
            current_date = datetime.now()
            df['is_valid'] = df['valid_to'] >= current_date
            df['days_until_expiry'] = (df['valid_to'] - current_date).dt.days
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.fitness_certificates.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} fitness certificate records")
            return True
            
        except Exception as e:
            print(f"Error inserting fitness certificates: {e}")
            return False
    
    def insert_job_cards(self) -> bool:
        """Insert job cards data from IBM Maximo"""
        try:
            file_path = self.csv_data_path / "3 job_cards.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Parse date columns
            df = self.parse_date_columns(df, ['created_on', 'expected_completion_date'])
            
            # Add priority scoring for optimization
            priority_scores = {
                'emergency': 100,
                'high': 75,
                'medium': 50,
                'low': 25
            }
            df['priority_score'] = df['priority'].map(priority_scores).fillna(25)
            
            # Add blocking status (trains with open emergency/high priority jobs should be avoided)
            df['is_blocking'] = (df['status'].isin(['open', 'in-progress']) & 
                                df['priority'].isin(['emergency', 'high']))
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.job_cards.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} job card records")
            return True
            
        except Exception as e:
            print(f"Error inserting job cards: {e}")
            return False
    
    def insert_branding_commitments(self) -> bool:
        """Insert branding commitments data"""
        try:
            file_path = self.csv_data_path / "4 branding_commitments.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Parse date columns
            df = self.parse_date_columns(df, ['campaign_start', 'campaign_end'])
            
            # Calculate exposure deficit
            df['exposure_deficit'] = df['exposure_target_hours'] - df['exposure_achieved_hours']
            df['exposure_percentage'] = (df['exposure_achieved_hours'] / df['exposure_target_hours'] * 100).round(2)
            
            # Priority scoring based on deficit and penalty clause
            df['branding_priority_score'] = np.where(
                df['penalty_clause'] == 'Y',
                df['exposure_deficit'] * 2,  # Double weight for penalty clauses
                df['exposure_deficit']
            )
            
            # Mark urgent branding needs
            df['is_urgent_branding'] = (df['exposure_deficit'] > 100) & (df['penalty_clause'] == 'Y')
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.branding_commitments.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} branding commitment records")
            return True
            
        except Exception as e:
            print(f"Error inserting branding commitments: {e}")
            return False
    
    def insert_mileage_records(self) -> bool:
        """Insert mileage records for balancing"""
        try:
            file_path = self.csv_data_path / "5 mileage_records.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Parse date columns
            df = self.parse_date_columns(df, ['last_updated'])
            
            # Calculate balancing scores
            # Higher scores indicate need for more service to balance wear
            max_km = df['total_km_run'].max()
            df['mileage_balance_score'] = (max_km - df['total_km_run']) / max_km * 100
            
            # Calculate maintenance urgency
            df['poh_urgency'] = np.where(df['km_since_last_POH'] > 60000, 'high', 'normal')
            df['ioh_urgency'] = np.where(df['km_since_last_IOH'] > 15000, 'high', 'normal')
            
            # Overall wear score (higher = more worn, should be avoided)
            df['wear_score'] = (
                df['bogie_condition_index'] * 0.4 +
                df['brake_pad_wear_level'] * 0.4 +
                (df['hvac_runtime_hours'] / 10000) * 0.2  # Normalize HVAC hours
            ).round(2)
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.mileage_records.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} mileage records")
            return True
            
        except Exception as e:
            print(f"Error inserting mileage records: {e}")
            return False
    
    def insert_cleaning_schedule(self) -> bool:
        """Insert cleaning schedule data"""
        try:
            file_path = self.csv_data_path / "6 cleaning_schedule.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Parse date columns
            df = self.parse_date_columns(df, ['scheduled_date_time'])
            
            # Add cleaning priority score
            cleaning_type_scores = {
                'fumigation': 100,
                'deep_cleaning': 80,
                'routine_cleaning': 50,
                'inspection': 30
            }
            df['cleaning_priority_score'] = df['cleaning_type'].map(cleaning_type_scores).fillna(50)
            
            # Check if cleaning is overdue
            current_date = datetime.now()
            df['is_overdue'] = (df['scheduled_date_time'] < current_date) & (df['status'] != 'completed')
            
            # Availability for scheduling (not currently being cleaned)
            df['is_available_for_service'] = ~df['status'].isin(['in-progress', 'scheduled'])
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.cleaning_schedule.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} cleaning schedule records")
            return True
            
        except Exception as e:
            print(f"Error inserting cleaning schedule: {e}")
            return False
    
    def insert_stabling_geometry(self) -> bool:
        """Insert stabling geometry data"""
        try:
            file_path = self.csv_data_path / "7 stabling_geometry.csv"
            if not file_path.exists():
                print(f"File not found: {file_path}")
                return False
            
            df = pd.read_csv(file_path)
            
            # Convert occupied status to boolean
            df['is_occupied'] = df['occupied'] == 'Y'
            
            # Priority scoring for bay positions
            # Lower position_order generally means easier access
            df['accessibility_score'] = 100 - df['position_order']  # Lower position = higher score
            
            # Mark blocked bays
            df['is_blocked'] = df['remarks'] == 'Blocked'
            
            # Available for new assignments
            df['is_available'] = ~df['is_occupied'] & ~df['is_blocked']
            
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.stabling_geometry.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} stabling geometry records")
            return True
            
        except Exception as e:
            print(f"Error inserting stabling geometry: {e}")
            return False
    
    def insert_induction_history(self) -> bool:
        """Insert induction history data (optional)"""
        try:
            file_path = self.csv_data_path / "8 induction_history.csv"
            if not file_path.exists():
                print(f"File not found: {file_path} (optional)")
                return True  # Not critical for scheduling
            
            df = pd.read_csv(file_path)
            cleaned_data = self.clean_data_for_mongodb(df)
            
            result = self.db.induction_history.insert_many(cleaned_data)
            print(f"Inserted {len(result.inserted_ids)} induction history records")
            return True
            
        except Exception as e:
            print(f"Error inserting induction history: {e}")
            return False
    
    def create_indexes(self):
        """Create indexes for better query performance"""
        print("\nCreating database indexes...")
        
        # Trainsets indexes
        self.db.trainsets.create_index([("trainset_id", 1)], unique=True)
        self.db.trainsets.create_index([("number", 1)])
        self.db.trainsets.create_index([("status", 1)])
        
        # Fitness certificates indexes
        self.db.fitness_certificates.create_index([("trainset_id", 1)])
        self.db.fitness_certificates.create_index([("valid_to", 1)])
        self.db.fitness_certificates.create_index([("is_valid", 1)])
        
        # Job cards indexes
        self.db.job_cards.create_index([("trainset_id", 1)])
        self.db.job_cards.create_index([("status", 1)])
        self.db.job_cards.create_index([("is_blocking", 1)])
        
        # Branding commitments indexes
        self.db.branding_commitments.create_index([("trainset_id", 1)])
        self.db.branding_commitments.create_index([("is_urgent_branding", 1)])
        self.db.branding_commitments.create_index([("branding_priority_score", -1)])
        
        # Mileage records indexes
        self.db.mileage_records.create_index([("trainset_id", 1)])
        self.db.mileage_records.create_index([("mileage_balance_score", -1)])
        self.db.mileage_records.create_index([("wear_score", 1)])
        
        # Cleaning schedule indexes
        self.db.cleaning_schedule.create_index([("trainset_id", 1)])
        self.db.cleaning_schedule.create_index([("is_available_for_service", 1)])
        
        # Stabling geometry indexes
        self.db.stabling_geometry.create_index([("trainset_id", 1)])
        self.db.stabling_geometry.create_index([("is_available", 1)])
        self.db.stabling_geometry.create_index([("accessibility_score", -1)])
        
        print("Indexes created successfully!")
    
    def migrate_all_data(self) -> Dict[str, bool]:
        """Complete migration process"""
        print("="*60)
        print("KMRL TRAIN SCHEDULING - CSV TO MONGODB MIGRATION")
        print("="*60)
        
        # Clear existing data
        self.clear_existing_data()
        
        print("\nInserting CSV data...")
        
        results = {}
        
        # Insert all datasets
        results['trainset_master'] = self.insert_trainset_master()
        results['fitness_certificates'] = self.insert_fitness_certificates()
        results['job_cards'] = self.insert_job_cards()
        results['branding_commitments'] = self.insert_branding_commitments()
        results['mileage_records'] = self.insert_mileage_records()
        results['cleaning_schedule'] = self.insert_cleaning_schedule()
        results['stabling_geometry'] = self.insert_stabling_geometry()
        results['induction_history'] = self.insert_induction_history()
        
        # Create indexes
        self.create_indexes()
        
        return results
    
    def get_collection_stats(self) -> Dict[str, int]:
        """Get document count for each collection"""
        collections = [
            'trainsets', 'fitness_certificates', 'job_cards',
            'branding_commitments', 'mileage_records', 'cleaning_schedule', 
            'stabling_geometry', 'induction_history'
        ]
        
        stats = {}
        for collection_name in collections:
            stats[collection_name] = self.db[collection_name].count_documents({})
        
        return stats
    
    def validate_data_integrity(self) -> Dict[str, Any]:
        """Validate data integrity after migration"""
        print("\nValidating data integrity...")
        
        validation_results = {}
        
        # Check if all trainsets have related data
        trainset_count = self.db.trainsets.count_documents({})
        validation_results['total_trainsets'] = trainset_count
        
        # Check fitness certificates coverage
        trainsets_with_fitness = self.db.fitness_certificates.distinct('trainset_id')
        validation_results['trainsets_with_fitness'] = len(trainsets_with_fitness)
        validation_results['fitness_coverage_percent'] = (len(trainsets_with_fitness) / trainset_count * 100) if trainset_count > 0 else 0
        
        # Check for blocking job cards
        blocking_trainsets = self.db.job_cards.count_documents({'is_blocking': True})
        validation_results['trainsets_with_blocking_jobs'] = blocking_trainsets
        
        # Check urgent branding needs
        urgent_branding = self.db.branding_commitments.count_documents({'is_urgent_branding': True})
        validation_results['trainsets_with_urgent_branding'] = urgent_branding
        
        # Check available bays
        available_bays = self.db.stabling_geometry.count_documents({'is_available': True})
        validation_results['available_stabling_bays'] = available_bays
        
        return validation_results
    
    def close_connection(self):
        """Close MongoDB connection"""
        self.client.close()

def main():
    """Main function to execute migration"""
    try:
        migrator = KMRLMongoDBMigrator()
        
        # Execute migration
        results = migrator.migrate_all_data()
        
        # Show results
        print("\n" + "="*60)
        print("MIGRATION RESULTS")
        print("="*60)
        
        for dataset, success in results.items():
            status = "✓ SUCCESS" if success else "✗ FAILED"
            print(f"{dataset}: {status}")
        
        # Show collection statistics
        print("\nCOLLECTION STATISTICS")
        print("-" * 40)
        stats = migrator.get_collection_stats()
        for collection, count in stats.items():
            print(f"{collection}: {count:,} documents")
        
        # Validate data integrity
        validation = migrator.validate_data_integrity()
        print("\nDATA VALIDATION")
        print("-" * 40)
        print(f"Total Trainsets: {validation['total_trainsets']:,}")
        print(f"Fitness Coverage: {validation['fitness_coverage_percent']:.1f}%")
        print(f"Blocking Job Cards: {validation['trainsets_with_blocking_jobs']:,}")
        print(f"Urgent Branding: {validation['trainsets_with_urgent_branding']:,}")
        print(f"Available Bays: {validation['available_stabling_bays']:,}")
        
        migrator.close_connection()
        
        print("\n" + "="*60)
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("Ready for Google OR-Tools optimization")
        print("="*60)
        
    except Exception as e:
        print(f"Critical error during migration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()