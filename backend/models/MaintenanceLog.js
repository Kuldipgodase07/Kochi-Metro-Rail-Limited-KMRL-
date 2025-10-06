import mongoose from 'mongoose';

const performanceParameterSchema = new mongoose.Schema({
  // 6 Key Performance Parameters
  brakingEfficiency: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Braking system efficiency percentage'
  },
  doorOperationScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Door operation reliability score'
  },
  tractionMotorHealth: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Traction motor health percentage'
  },
  hvacSystemStatus: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'HVAC system operational status'
  },
  signalCommunicationQuality: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Signal and communication system quality'
  },
  batteryHealthStatus: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    description: 'Battery health and voltage status'
  }
}, { _id: false });

const maintenanceLogSchema = new mongoose.Schema({
  // Train Identification
  trainsetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainset',
    required: true,
    index: true
  },
  trainNumber: {
    type: String,
    required: true,
    index: true
  },

  // Maintenance Period Tracking
  serviceInTime: {
    type: Date,
    required: true,
    index: true
  },
  serviceOutTime: {
    type: Date,
    required: false // Will be set when service is completed
  },
  maintenanceDuration: {
    type: Number, // Duration in hours
    default: 0
  },

  // Maintenance Type
  maintenanceType: {
    type: String,
    enum: ['scheduled', 'unscheduled', 'emergency', 'preventive', 'corrective'],
    required: true
  },
  maintenancePriority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },

  // Work Details
  workDescription: {
    type: String,
    required: true
  },
  componentsReplaced: [{
    componentName: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],
  techniciansAssigned: [{
    name: String,
    id: String,
    specialization: String
  }],

  // Performance Analysis (6 Parameters)
  performanceBeforeMaintenance: performanceParameterSchema,
  performanceAfterMaintenance: performanceParameterSchema,

  // Overall Performance Score
  overallPerformanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Train Status
  trainStatus: {
    type: String,
    enum: ['in-maintenance', 'ready', 'dropout', 'testing', 'pending-approval'],
    default: 'in-maintenance',
    index: true
  },

  // Readiness Assessment
  readyForOperation: {
    type: Boolean,
    default: false
  },
  readinessCheckTimestamp: {
    type: Date
  },
  readinessCheckedBy: {
    type: String
  },

  // Alert Information
  alertGenerated: {
    type: Boolean,
    default: false
  },
  alertType: {
    type: String,
    enum: ['ready', 'dropout', 'warning', 'attention-required', 'none'],
    default: 'none'
  },
  alertMessage: {
    type: String
  },
  alertTimestamp: {
    type: Date
  },

  // Additional Information
  remarks: {
    type: String
  },
  nextScheduledMaintenance: {
    type: Date
  },
  totalMaintenanceCost: {
    type: Number,
    default: 0
  },

  // Audit Trail
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'maintenance_logs'
});

// Indexes for better query performance
maintenanceLogSchema.index({ createdAt: -1 });
maintenanceLogSchema.index({ trainStatus: 1, createdAt: -1 });
maintenanceLogSchema.index({ alertGenerated: 1, trainStatus: 1 });

// Virtual for maintenance duration calculation
maintenanceLogSchema.virtual('calculatedDuration').get(function() {
  if (this.serviceOutTime && this.serviceInTime) {
    const diff = this.serviceOutTime - this.serviceInTime;
    return Math.round(diff / (1000 * 60 * 60) * 100) / 100; // Hours with 2 decimals
  }
  return 0;
});

// Method to calculate overall performance score
maintenanceLogSchema.methods.calculatePerformanceScore = function() {
  if (!this.performanceAfterMaintenance) return 0;
  
  const params = this.performanceAfterMaintenance;
  const weights = {
    brakingEfficiency: 0.25,
    doorOperationScore: 0.15,
    tractionMotorHealth: 0.25,
    hvacSystemStatus: 0.10,
    signalCommunicationQuality: 0.15,
    batteryHealthStatus: 0.10
  };

  const score = (
    params.brakingEfficiency * weights.brakingEfficiency +
    params.doorOperationScore * weights.doorOperationScore +
    params.tractionMotorHealth * weights.tractionMotorHealth +
    params.hvacSystemStatus * weights.hvacSystemStatus +
    params.signalCommunicationQuality * weights.signalCommunicationQuality +
    params.batteryHealthStatus * weights.batteryHealthStatus
  );

  this.overallPerformanceScore = Math.round(score * 100) / 100;
  return this.overallPerformanceScore;
};

// Method to assess train readiness
maintenanceLogSchema.methods.assessReadiness = function() {
  const score = this.overallPerformanceScore;
  const params = this.performanceAfterMaintenance;

  // Thresholds for readiness
  const READY_THRESHOLD = 85;
  const DROPOUT_THRESHOLD = 60;
  const CRITICAL_PARAM_THRESHOLD = 70;

  // Check critical parameters (braking and traction motor must be above 70)
  const criticalParamsOk = 
    params.brakingEfficiency >= CRITICAL_PARAM_THRESHOLD &&
    params.tractionMotorHealth >= CRITICAL_PARAM_THRESHOLD;

  if (score >= READY_THRESHOLD && criticalParamsOk) {
    this.trainStatus = 'ready';
    this.readyForOperation = true;
    this.alertType = 'ready';
    this.alertMessage = `Train ${this.trainNumber} is READY for operation with performance score ${score}%`;
  } else if (score < DROPOUT_THRESHOLD || !criticalParamsOk) {
    this.trainStatus = 'dropout';
    this.readyForOperation = false;
    this.alertType = 'dropout';
    this.alertMessage = `Train ${this.trainNumber} DROPPED OUT - Performance score ${score}%. Critical systems need attention.`;
  } else {
    this.trainStatus = 'testing';
    this.readyForOperation = false;
    this.alertType = 'warning';
    this.alertMessage = `Train ${this.trainNumber} requires additional testing. Performance score ${score}% is below ready threshold.`;
  }

  this.alertGenerated = true;
  this.alertTimestamp = new Date();
  this.readinessCheckTimestamp = new Date();

  return {
    status: this.trainStatus,
    ready: this.readyForOperation,
    score: this.overallPerformanceScore,
    alertType: this.alertType,
    alertMessage: this.alertMessage
  };
};

// Pre-save middleware to calculate duration and performance
maintenanceLogSchema.pre('save', function(next) {
  // Calculate maintenance duration
  if (this.serviceOutTime && this.serviceInTime) {
    const diff = this.serviceOutTime - this.serviceInTime;
    this.maintenanceDuration = Math.round(diff / (1000 * 60 * 60) * 100) / 100;
  }

  // Calculate performance score if after-maintenance parameters exist
  if (this.performanceAfterMaintenance) {
    this.calculatePerformanceScore();
  }

  next();
});

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

export default MaintenanceLog;
