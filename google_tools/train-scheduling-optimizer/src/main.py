from ortools.sat.python import cp_model
from models.train import Train
from models.schedule import Schedule
from data.loader import load_data
from optimization.solver import Solver
from ui.display import display_results

def main():
    # Load train data
    train_data = load_data('data/sample_data.json')
    
    # Initialize the schedule
    schedule = Schedule()
    
    # Add trains to the schedule
    for train_info in train_data:
        train = Train(**train_info)
        if train.is_valid():
            schedule.add_train(train)
    
    # Optimize the schedule
    solver = Solver(schedule)
    optimal_schedule = solver.solve()
    
    # Display the best 24 scheduled trains and remaining trains
    display_results(optimal_schedule)

if __name__ == "__main__":
    main()