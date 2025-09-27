from ortools.linear_solver import pywraplp

def create_objective_function(solver, trains):
    objective = solver.Objective()
    
    for train in trains:
        # Assuming each train has a property 'efficiency' that we want to maximize
        # and a property 'downtime' that we want to minimize
        efficiency = train.efficiency
        downtime = train.downtime
        
        # Add terms to the objective function
        objective.SetCoefficient(efficiency, 1)  # Maximize efficiency
        objective.SetCoefficient(downtime, -1)   # Minimize downtime
    
    objective.SetMaximization()  # We want to maximize the objective
    return objective