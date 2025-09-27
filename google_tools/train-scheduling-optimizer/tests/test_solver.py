import unittest
from src.optimization.solver import Solver
from src.models.schedule import Schedule
from src.models.train import Train

class TestSolver(unittest.TestCase):

    def setUp(self):
        self.schedule = Schedule()
        self.solver = Solver(self.schedule)

        # Sample trains for testing
        self.train1 = Train(train_id=1, fitness_certificate=True, job_card_status=True, branding_priority=1, mileage=100, cleaning_slot=True, stabling_geometry='A')
        self.train2 = Train(train_id=2, fitness_certificate=True, job_card_status=True, branding_priority=2, mileage=150, cleaning_slot=True, stabling_geometry='B')
        self.train3 = Train(train_id=3, fitness_certificate=False, job_card_status=True, branding_priority=3, mileage=200, cleaning_slot=True, stabling_geometry='C')

        self.schedule.add_train(self.train1)
        self.schedule.add_train(self.train2)
        self.schedule.add_train(self.train3)

    def test_optimize_schedule(self):
        optimal_schedule = self.solver.optimize()
        self.assertIsNotNone(optimal_schedule)
        self.assertEqual(len(optimal_schedule), 2)  # Expecting only valid trains to be scheduled

    def test_best_24_trains(self):
        best_trains = self.schedule.get_best_24_trains()
        self.assertEqual(len(best_trains), 2)  # Should only return valid trains

    def test_invalid_train(self):
        self.assertFalse(self.train3.is_valid())  # Train 3 should be invalid due to fitness certificate

if __name__ == '__main__':
    unittest.main()