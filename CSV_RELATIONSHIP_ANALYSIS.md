# CSV Data Files Relationship Analysis

## Overview

This document analyzes the relationships between 9 CSV files in the KMRL train scheduling system, identifying key connections and data dependencies.

## File Inventory

| File | Name                                 | Records | Primary Key    | Description                    |
| ---- | ------------------------------------ | ------- | -------------- | ------------------------------ |
| 1    | trainset_master.csv                  | 100     | trainset_id    | Master train fleet data        |
| 2    | fitness_certificates.csv             | 300     | certificate_id | Train fitness certificates     |
| 3    | job_cards.csv                        | 200     | jobcard_id     | Maintenance job cards          |
| 4    | branding_commitments.csv             | 100     | branding_id    | Branding campaign data         |
| 5    | mileage_records.csv                  | 100     | mileage_id     | Train mileage tracking         |
| 6    | cleaning_schedule.csv                | 200     | cleaning_id    | Cleaning schedules             |
| 7    | stabling_geometry.csv                | 100     | bay_id         | Depot stabling assignments     |
| 8    | induction_history.csv                | 3,000   | decision_id    | Historical induction decisions |
| 9    | passenger_flow_variable_capacity.csv | 10,000  | record_id      | Passenger flow data            |

## Core Relationships

### 1. **Central Hub: trainset_master.csv**

- **Primary Key**: `trainset_id` (1-100)
- **Role**: Master reference for all other files
- **Key Fields**:
  - `rake_number` (R1000-R1099)
  - `make_model` (Hyundai Rotem, Alstom, BEML)
  - `current_status` (in_service, standby, IBL_maintenance)
  - `home_depot` (Depot A, Depot B)

### 2. **Operational Status Relationships**

#### A. **Fitness Certificates** (trainset_master → fitness_certificates)

- **Relationship**: 1:3 (each train has 3 certificate types)
- **Foreign Key**: `trainset_id`
- **Certificate Types**: rolling_stock, signalling, telecom
- **Status Impact**: Valid certificates required for service

#### B. **Job Cards** (trainset_master → job_cards)

- **Relationship**: 1:2 (average 2 active jobs per train)
- **Foreign Key**: `trainset_id`
- **Impact**: Active jobs prevent service induction
- **Priority Levels**: emergency, high, medium, low

#### C. **Branding Commitments** (trainset_master → branding_commitments)

- **Relationship**: 1:1 (each train has one campaign)
- **Foreign Key**: `trainset_id`
- **Campaign Types**: Amul, Airtel, Coca Cola, LIC, Tata Motors
- **Priority Impact**: Critical campaigns get scheduling preference

### 3. **Maintenance & Operations**

#### D. **Mileage Records** (trainset_master → mileage_records)

- **Relationship**: 1:1
- **Foreign Key**: `trainset_id`
- **Key Metrics**:
  - `total_km_run` (10K-200K km)
  - `km_since_last_POH` (Periodic Overhaul)
  - `bogie_condition_index` (50-99)
  - `brake_pad_wear_level` (10-89)

#### E. **Cleaning Schedule** (trainset_master → cleaning_schedule)

- **Relationship**: 1:2 (average 2 cleaning slots per train)
- **Foreign Key**: `trainset_id`
- **Cleaning Types**: fumigation, deep_cleaning, detailing, trip_cleaning
- **Status Impact**: Recent cleaning improves scheduling score

#### F. **Stabling Geometry** (trainset_master → stabling_geometry)

- **Relationship**: 1:1
- **Foreign Key**: `trainset_id`
- **Key Fields**:
  - `depot_name` (Depot A/B)
  - `line_name` (Blue Line/Green Line)
  - `position_order` (1-24)
  - `occupied` (Y/N)

### 4. **Historical & Performance Data**

#### G. **Induction History** (trainset_master → induction_history)

- **Relationship**: 1:30 (30 decisions per train)
- **Foreign Key**: `trainset_id`
- **Decision Types**: inducted, standby, maintenance
- **Reasons**: Branding Commitment, Service Ready, Mileage Balanced, etc.

#### H. **Passenger Flow** (trainset_master → passenger_flow_variable_capacity)

- **Relationship**: 1:100 (100 flow records per train)
- **Foreign Key**: `trainset_id`
- **Key Metrics**:
  - `passenger_capacity` (975 passengers)
  - `occupancy_rate` (0-100%)
  - `time_slot` (Morning Peak, Evening Peak, Off Peak)

## Data Flow for OR-Tools Scheduling

### **Input Data Sources**

1. **Train Availability**: `trainset_master.current_status`
2. **Fitness Status**: `fitness_certificates.status`
3. **Maintenance Status**: `job_cards.status`
4. **Branding Priority**: `branding_commitments.priority`
5. **Mileage Balance**: `mileage_records.total_km_run`
6. **Cleaning Status**: `cleaning_schedule.status`
7. **Stabling Position**: `stabling_geometry.position_order`

### **Constraint Relationships**

#### **Primary Constraints**

- **Fitness**: All 3 certificate types must be valid
- **Maintenance**: No emergency/high priority active jobs
- **Branding**: Critical campaigns get priority
- **Mileage**: Balance between high/low mileage trains
- **Cleaning**: Recent cleaning improves score
- **Stabling**: Optimal depot and position assignment

#### **Secondary Constraints**

- **Depot Balance**: 9-15 trains from each depot
- **Age Diversity**: 8+ newer trains (≤5 years old)
- **Manufacturer Balance**: 4+ trains from each make
- **Operational History**: Past performance patterns

## Key Business Rules

### **1. Service Eligibility**

```
IF (fitness_certificates.status = 'valid' for all 3 types)
AND (job_cards.priority != 'emergency')
AND (trainset_master.current_status != 'IBL_maintenance')
THEN train is eligible for service
```

### **2. Scheduling Priority**

```
Priority Score =
  (Fitness Score × 0.25) +
  (Maintenance Score × 0.20) +
  (Branding Score × 0.15) +
  (Mileage Score × 0.15) +
  (Cleaning Score × 0.10) +
  (Stabling Score × 0.15)
```

### **3. Depot Assignment Rules**

- **Depot A**: Blue Line, Green Line trains
- **Depot B**: Blue Line, Green Line trains
- **Balance**: 9-15 trains from each depot
- **Position**: 1-24 bay assignments

## Data Quality Insights

### **Completeness**

- ✅ All 100 trains have complete master data
- ✅ All trains have fitness certificates (3 each)
- ✅ All trains have mileage records
- ✅ All trains have stabling assignments
- ⚠️ Some trains missing job cards (maintenance not required)
- ⚠️ Some trains missing branding commitments

### **Consistency**

- ✅ trainset_id consistent across all files
- ✅ Status values follow defined enums
- ✅ Date formats consistent (DD-MM-YYYY)
- ✅ Numeric ranges within expected bounds

### **Relationships Validation**

- ✅ Foreign key relationships intact
- ✅ 1:1 relationships properly maintained
- ✅ 1:Many relationships correctly implemented
- ✅ No orphaned records found

## OR-Tools Integration Points

### **Constraint Programming Variables**

1. **Binary Variables**: `train_selected[train_id]` (0 or 1)
2. **Assignment Variables**: `bay_assignment[train_id]` (1-24)
3. **Depot Variables**: `depot_assignment[train_id]` (A or B)

### **Objective Function**

```
Maximize: Σ(availability_score[train_id] × train_selected[train_id])
Subject to:
  - Exactly 24 trains selected
  - Depot balance constraints
  - Age diversity constraints
  - Manufacturer diversity constraints
  - Fitness certificate validity
  - No active emergency maintenance
```

### **Data Preprocessing**

1. **Filter Eligible Trains**: Remove unfit trains
2. **Calculate Scores**: Apply business rules
3. **Sort by Priority**: Rank by optimization score
4. **Apply Constraints**: Enforce business rules

## Recommendations

### **1. Data Enhancement**

- Add more historical performance data
- Include energy efficiency metrics
- Track passenger satisfaction scores
- Monitor punctuality records

### **2. Constraint Refinement**

- Add weather-based constraints
- Include crew availability
- Consider maintenance windows
- Factor in passenger demand patterns

### **3. Optimization Improvements**

- Multi-objective optimization
- Real-time constraint updates
- Machine learning integration
- Predictive maintenance scheduling

## Conclusion

The CSV files form a comprehensive data ecosystem supporting advanced train scheduling optimization. The relationships are well-structured with clear foreign key dependencies, enabling effective constraint programming for the OR-Tools scheduling system. The data quality is high with consistent formats and complete coverage across all operational aspects.
