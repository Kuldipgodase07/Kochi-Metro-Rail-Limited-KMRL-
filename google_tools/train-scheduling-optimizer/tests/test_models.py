import unittest
from src.models.train import Train
from src.models.schedule import Schedule

class TestTrainModel(unittest.TestCase):
    def setUp(self):
        self.train = Train(
            train_id="T123",
            fitness_certificate=True,
            job_card_status="Completed",
            branding_priority=1,
            mileage=100,
            cleaning_slot="2023-10-01T10:00:00",
            stabling_geometry="A"
        )

    def test_fitness_certificate_validation(self):
        self.assertTrue(self.train.validate_fitness_certificate())

    def test_job_card_status_check(self):
        self.assertTrue(self.train.check_job_card_status())

class TestScheduleModel(unittest.TestCase):
    def setUp(self):
        self.schedule = Schedule()
        self.train1 = Train(
            train_id="T123",
            fitness_certificate=True,
            job_card_status="Completed",
            branding_priority=1,
            mileage=100,
            cleaning_slot="2023-10-01T10:00:00",
            stabling_geometry="A"
        )
        self.train2 = Train(
            train_id="T124",
            fitness_certificate=True,
            job_card_status="Pending",
            branding_priority=2,
            mileage=150,
            cleaning_slot="2023-10-01T11:00:00",
            stabling_geometry="B"
        )
        self.schedule.add_train(self.train1)
        self.schedule.add_train(self.train2)

    def test_add_train(self):
        self.assertEqual(len(self.schedule.trains), 2)

    def test_best_24_scheduled_trains(self):
        best_trains = self.schedule.get_best_24_scheduled_trains()
        self.assertEqual(len(best_trains), 2)  # Adjust based on actual logic

if __name__ == '__main__':
    unittest.main()