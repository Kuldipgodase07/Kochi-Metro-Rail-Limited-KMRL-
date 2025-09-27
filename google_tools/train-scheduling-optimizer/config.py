import os

class Config:
    DATA_SOURCE_PATH = os.path.join('data', 'sample_data.json')
    MAX_SCHEDULED_TRAINS = 24
    MIN_MILEAGE_BALANCE = 100  # Minimum mileage balance for scheduling
    CLEANING_SLOT_DURATION = 30  # Duration in minutes for cleaning slots
    STABLING_GEOMETRY = {
        'length': 300,  # Length in meters
        'width': 50     # Width in meters
    }
    BRANDING_PRIORITIES = {
        'high': 1,
        'medium': 2,
        'low': 3
    }
    FITNESS_CERTIFICATE_VALIDITY_DAYS = 30  # Validity period for fitness certificates in days
    JOB_CARD_STATUS_REQUIRED = ['approved', 'in_progress']  # Required job card statuses for scheduling

    @staticmethod
    def get_configuration():
        return {
            'data_source_path': Config.DATA_SOURCE_PATH,
            'max_scheduled_trains': Config.MAX_SCHEDULED_TRAINS,
            'min_mileage_balance': Config.MIN_MILEAGE_BALANCE,
            'cleaning_slot_duration': Config.CLEANING_SLOT_DURATION,
            'stabling_geometry': Config.STABLING_GEOMETRY,
            'branding_priorities': Config.BRANDING_PRIORITIES,
            'fitness_certificate_validity_days': Config.FITNESS_CERTIFICATE_VALIDITY_DAYS,
            'job_card_status_required': Config.JOB_CARD_STATUS_REQUIRED
        }