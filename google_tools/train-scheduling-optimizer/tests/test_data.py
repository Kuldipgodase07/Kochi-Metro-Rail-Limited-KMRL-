import unittest
from src.data.loader import load_data

class TestDataLoading(unittest.TestCase):

    def test_load_data(self):
        data = load_data('data/sample_data.json')
        self.assertIsNotNone(data)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_data_structure(self):
        data = load_data('data/sample_data.json')
        for item in data:
            self.assertIn('train_id', item)
            self.assertIn('fitness_certificate', item)
            self.assertIn('job_card_status', item)
            self.assertIn('branding_priority', item)
            self.assertIn('mileage', item)
            self.assertIn('cleaning_slot', item)
            self.assertIn('stabling_geometry', item)

if __name__ == '__main__':
    unittest.main()