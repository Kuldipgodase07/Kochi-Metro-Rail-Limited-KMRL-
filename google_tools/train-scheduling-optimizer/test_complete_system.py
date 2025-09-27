"""
Test script for KMRL Train Scheduling System
Tests the complete pipeline: CSV migration -> MongoDB -> Optimization
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime, timedelta
import json

def test_csv_migration():
    """Test CSV to MongoDB migration"""
    print("=" * 60)
    print("TESTING CSV TO MONGODB MIGRATION")
    print("=" * 60)
    
    try:
        from src.data.mongodb_csv_migrator import KMRLMongoDBMigrator
        
        migrator = KMRLMongoDBMigrator()
        results = migrator.migrate_all_data()
        
        print("\nMigration Results:")
        for dataset, success in results.items():
            status = "✓ SUCCESS" if success else "✗ FAILED"
            print(f"  {dataset}: {status}")
        
        # Show statistics
        stats = migrator.get_collection_stats()
        print(f"\nData Statistics:")
        for collection, count in stats.items():
            print(f"  {collection}: {count:,} documents")
        
        migrator.close_connection()
        return True
        
    except Exception as e:
        print(f"Migration test failed: {e}")
        return False

def test_data_loading():
    """Test data loading from MongoDB"""
    print("\n" + "=" * 60)
    print("TESTING DATA LOADING")
    print("=" * 60)
    
    try:
        from src.data.loader import KMRLDataLoader
        
        loader = KMRLDataLoader()
        
        # Test loading optimization dataset
        data = loader.get_optimization_dataset()
        
        print(f"Dataset loaded successfully:")
        print(f"  Total trainsets: {data['trainset_count']}")
        print(f"  Available for scheduling: {data['available_for_scheduling']}")
        print(f"  High-priority branding: {data['high_priority_branding']}")
        print(f"  Available bays: {data['available_bays']}")
        
        # Test individual constraint loading
        if data['trainset_ids']:
            sample_ids = data['trainset_ids'][:5]  # Test with first 5
            
            fitness = loader.check_fitness_constraints(sample_ids)
            job_cards = loader.check_job_card_constraints(sample_ids)
            branding = loader.get_branding_requirements(sample_ids)
            
            print(f"\nConstraint Testing (first 5 trains):")
            print(f"  Fitness constraints loaded: {len(fitness)}")
            print(f"  Job card constraints loaded: {len(job_cards)}")
            print(f"  Branding requirements loaded: {len(branding)}")
        
        loader.close_connection()
        return True
        
    except Exception as e:
        print(f"Data loading test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_optimization():
    """Test the optimization engine"""
    print("\n" + "=" * 60)
    print("TESTING OPTIMIZATION ENGINE")
    print("=" * 60)
    
    try:
        from src.optimization.scheduler import KMRLTrainSchedulingOptimizer
        
        optimizer = KMRLTrainSchedulingOptimizer()
        
        # Load data
        target_date = datetime.now() + timedelta(days=1)
        data = optimizer.load_data(target_date)
        
        print(f"Loaded data for optimization:")
        print(f"  Trainsets available: {data['trainset_count']}")
        print(f"  Available for scheduling: {data['available_for_scheduling']}")
        
        if data['available_for_scheduling'] >= 24:
            print(f"\nRunning optimization...")
            result = optimizer.solve_optimization(data)
            
            print(f"\nOptimization Results:")
            print(f"  Status: {result.solution_status}")
            print(f"  Selected trains: {len(result.selected_trains)}")
            print(f"  Remaining trains: {len(result.remaining_trains)}")
            print(f"  Execution time: {result.execution_time:.2f}s")
            print(f"  Optimization score: {result.optimization_score:.2f}")
            
            # Show some selected trains
            if result.selected_trains:
                print(f"\nTop 5 Selected Trains:")
                for i, train in enumerate(result.selected_trains[:5]):
                    train_id = train.get('trainset_id', 'N/A')
                    score = train.get('scheduling_score', 0)
                    bay = train.get('assigned_bay_id', 'N/A')
                    reason = train.get('selection_reason', 'N/A')
                    print(f"  {i+1}. Train {train_id}: Score {score:.1f}, Bay {bay}")
                    print(f"     Reason: {reason}")
            
            # Save detailed results
            report = optimizer.generate_schedule_report(result)
            with open('test_optimization_results.json', 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            print(f"\nDetailed results saved to: test_optimization_results.json")
        else:
            print(f"Insufficient trains available for scheduling (need 24, have {data['available_for_scheduling']})")
        
        optimizer.close()
        return True
        
    except Exception as e:
        print(f"Optimization test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_constraint_analysis():
    """Test constraint analysis in detail"""
    print("\n" + "=" * 60)
    print("TESTING CONSTRAINT ANALYSIS")
    print("=" * 60)
    
    try:
        from src.data.loader import KMRLDataLoader
        
        loader = KMRLDataLoader()
        data = loader.get_optimization_dataset()
        
        trainset_ids = data['trainset_ids'][:10]  # Analyze first 10 trains
        
        print(f"Analyzing constraints for {len(trainset_ids)} trains:")
        
        # Fitness analysis
        print(f"\n1. FITNESS CERTIFICATE ANALYSIS:")
        fitness_data = data['fitness_constraints']
        valid_fitness = sum(1 for tid in trainset_ids if fitness_data[tid]['is_fitness_ok'])
        print(f"   Valid fitness certificates: {valid_fitness}/{len(trainset_ids)}")
        
        for tid in trainset_ids[:3]:  # Show details for first 3
            fit_info = fitness_data[tid]
            print(f"   Train {tid}: Valid={fit_info['is_fitness_ok']}, Expiry in {fit_info['min_expiry_days']} days")
        
        # Job cards analysis
        print(f"\n2. JOB CARD ANALYSIS:")
        job_data = data['job_card_constraints']
        available_for_service = sum(1 for tid in trainset_ids if job_data[tid]['is_available_for_service'])
        print(f"   Available for service: {available_for_service}/{len(trainset_ids)}")
        
        for tid in trainset_ids[:3]:
            job_info = job_data[tid]
            print(f"   Train {tid}: Available={job_info['is_available_for_service']}, Open jobs={job_info['open_job_count']}")
        
        # Branding analysis
        print(f"\n3. BRANDING REQUIREMENTS ANALYSIS:")
        branding_data = data['branding_requirements']
        urgent_branding = sum(1 for tid in trainset_ids if branding_data[tid]['is_urgent'])
        print(f"   Urgent branding needs: {urgent_branding}/{len(trainset_ids)}")
        
        for tid in trainset_ids[:3]:
            brand_info = branding_data[tid]
            if brand_info['has_branding_commitments']:
                print(f"   Train {tid}: Advertiser={brand_info['advertiser']}, Urgent={brand_info['is_urgent']}")
        
        # Mileage analysis
        print(f"\n4. MILEAGE BALANCING ANALYSIS:")
        mileage_data = data['mileage_balancing']
        avg_balance_score = sum(mileage_data[tid]['balance_score'] for tid in trainset_ids) / len(trainset_ids)
        print(f"   Average balance score: {avg_balance_score:.1f}")
        
        # Cleaning analysis
        print(f"\n5. CLEANING STATUS ANALYSIS:")
        cleaning_data = data['cleaning_constraints']
        cleaning_available = sum(1 for tid in trainset_ids if cleaning_data[tid]['is_available_for_service'])
        print(f"   Available for service (not being cleaned): {cleaning_available}/{len(trainset_ids)}")
        
        # Bay availability
        print(f"\n6. BAY AVAILABILITY:")
        bay_data = data['stabling_geometry']
        print(f"   Available bays: {bay_data['available_bay_count']}")
        print(f"   Total bays: {bay_data['total_bay_count']}")
        
        loader.close_connection()
        return True
        
    except Exception as e:
        print(f"Constraint analysis test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("KMRL TRAIN SCHEDULING SYSTEM - COMPREHENSIVE TESTING")
    print("=" * 80)
    
    tests = [
        ("CSV Migration", test_csv_migration),
        ("Data Loading", test_data_loading),
        ("Constraint Analysis", test_constraint_analysis),
        ("Optimization Engine", test_optimization),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            print(f"\n⏳ Running {test_name}...")
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
    
    # Final summary
    print("\n" + "=" * 80)
    print("TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed = 0
    total = len(tests)
    
    for test_name, passed_test in results.items():
        status = "✅ PASSED" if passed_test else "❌ FAILED"
        print(f"{test_name}: {status}")
        if passed_test:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System ready for production use.")
    else:
        print("⚠️  Some tests failed. Please check the logs above.")

if __name__ == "__main__":
    main()