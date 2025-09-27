from ortools.sat.python import cp_model

class Solver:
    def __init__(self, trains, constraints):
        self.trains = trains
        self.constraints = constraints
        self.model = cp_model.CpModel()
        self.schedule_vars = {}

    def create_variables(self):
        for train in self.trains:
            self.schedule_vars[train.train_id] = self.model.NewBoolVar(f'schedule_{train.train_id}')

    def add_constraints(self):
        for constraint in self.constraints:
            constraint.apply(self.model, self.schedule_vars)

    def set_objective(self, objective):
        self.model.Maximize(objective)

    def solve(self):
        solver = cp_model.CpSolver()
        status = solver.Solve(self.model)

        if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
            return self.get_solution(solver)
        else:
            return None

    def get_solution(self, solver):
        scheduled_trains = []
        for train_id, var in self.schedule_vars.items():
            if solver.Value(var) == 1:
                scheduled_trains.append(train_id)
        return scheduled_trains[:24]  # Return the best 24 scheduled trains
