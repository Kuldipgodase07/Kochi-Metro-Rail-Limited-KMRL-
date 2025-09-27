class Train:
    def __init__(self, train_id, fitness_certificate, job_card_status, branding_priority, mileage, cleaning_slot, stabling_geometry):
        self.train_id = train_id
        self.fitness_certificate = fitness_certificate
        self.job_card_status = job_card_status
        self.branding_priority = branding_priority
        self.mileage = mileage
        self.cleaning_slot = cleaning_slot
        self.stabling_geometry = stabling_geometry

    def validate_fitness_certificate(self):
        # Implement validation logic for fitness certificate
        return self.fitness_certificate is not None and self.fitness_certificate.is_valid()

    def check_job_card_status(self):
        # Implement logic to check job card status
        return self.job_card_status == 'completed' or self.job_card_status == 'pending'

    def __repr__(self):
        return f"Train({self.train_id}, {self.fitness_certificate}, {self.job_card_status}, {self.branding_priority}, {self.mileage}, {self.cleaning_slot}, {self.stabling_geometry})"