class Schedule:
    def __init__(self):
        self.trains = []

    def add_train(self, train):
        self.trains.append(train)

    def generate_schedule(self):
        # Logic to generate the schedule based on various criteria
        # This is a placeholder for the actual scheduling logic
        pass

    def get_best_scheduled_trains(self, count=24):
        # Sort trains based on some criteria and return the best scheduled trains
        sorted_trains = sorted(self.trains, key=lambda x: x.branding_priority)  # Example sorting
        return sorted_trains[:count]

    def get_remaining_trains(self):
        # Return the remaining trains that are not in the best scheduled list
        best_trains = self.get_best_scheduled_trains()
        return [train for train in self.trains if train not in best_trains]