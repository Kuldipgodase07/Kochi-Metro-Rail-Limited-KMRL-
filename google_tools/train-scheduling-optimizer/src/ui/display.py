from prettytable import PrettyTable

def display_scheduled_trains(best_trains, remaining_trains):
    best_table = PrettyTable()
    best_table.field_names = ["Train ID", "Fitness Certificate", "Job Card Status", "Branding Priority", "Mileage", "Cleaning Slot", "Stabling Geometry"]
    
    for train in best_trains:
        best_table.add_row([train.train_id, train.fitness_certificate, train.job_card_status, train.branding_priority, train.mileage, train.cleaning_slot, train.stabling_geometry])
    
    print("Best 24 Scheduled Trains:")
    print(best_table)

    remaining_table = PrettyTable()
    remaining_table.field_names = ["Train ID", "Fitness Certificate", "Job Card Status", "Branding Priority", "Mileage", "Cleaning Slot", "Stabling Geometry"]
    
    for train in remaining_trains:
        remaining_table.add_row([train.train_id, train.fitness_certificate, train.job_card_status, train.branding_priority, train.mileage, train.cleaning_slot, train.stabling_geometry])
    
    print("\nRemaining Trains for Supervisor Review:")
    print(remaining_table)