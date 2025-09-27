from ortools.sat.python import cp_model

class TrainConstraints:
    def __init__(self, trains):
        self.trains = trains

    def check_fitness_certificate(self, train):
        return train.fitness_certificate is not None and train.fitness_certificate.is_valid()

    def check_job_card_status(self, train):
        return train.job_card_status == 'completed'

    def check_branding_priority(self, train):
        return train.branding_priority in ['high', 'medium', 'low']

    def balance_mileage(self):
        total_mileage = sum(train.mileage for train in self.trains)
        average_mileage = total_mileage / len(self.trains)
        return all(abs(train.mileage - average_mileage) < 10 for train in self.trains)

    def check_cleaning_slots(self, train):
        return train.cleaning_slot is not None

    def check_stabling_geometry(self, train):
        return train.stabling_geometry is not None and train.stabling_geometry.is_valid()

    def apply_constraints(self, model):
        for train in self.trains:
            if not self.check_fitness_certificate(train):
                model.Add(train.id, 0)  # Example constraint application
            if not self.check_job_card_status(train):
                model.Add(train.id, 0)  # Example constraint application
            if not self.check_branding_priority(train):
                model.Add(train.id, 0)  # Example constraint application
            if not self.check_cleaning_slots(train):
                model.Add(train.id, 0)  # Example constraint application
            if not self.check_stabling_geometry(train):
                model.Add(train.id, 0)  # Example constraint application

        if not self.balance_mileage():
            model.Add(0)  # Example constraint application for mileage balancing