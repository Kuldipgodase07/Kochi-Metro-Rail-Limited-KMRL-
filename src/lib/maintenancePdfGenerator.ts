import jsPDF from 'jspdf';

export interface MaintenanceLogData {
  _id: string;
  trainNumber: string;
  serviceInTime: Date;
  serviceOutTime?: Date;
  maintenanceDuration: number;
  maintenanceType: string;
  maintenancePriority: string;
  workDescription: string;
  componentsReplaced?: Array<{
    componentName: string;
    partNumber?: string;
    quantity?: number;
    cost?: number;
  }>;
  techniciansAssigned?: Array<{
    name: string;
    id?: string;
    specialization?: string;
  }>;
  performanceBeforeMaintenance?: PerformanceParameters;
  performanceAfterMaintenance?: PerformanceParameters;
  overallPerformanceScore: number;
  trainStatus: string;
  readyForOperation: boolean;
  alertType: string;
  alertMessage?: string;
  totalMaintenanceCost?: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceParameters {
  brakingEfficiency: number;
  doorOperationScore: number;
  tractionMotorHealth: number;
  hvacSystemStatus: number;
  signalCommunicationQuality: number;
  batteryHealthStatus: number;
}

class MaintenancePDFReportGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addHeader(trainNumber: string): void {
    // Dark teal header background
    this.doc.setFillColor(0, 128, 128);
    this.doc.rect(0, 0, this.pageWidth, 35, 'F');

    // Logo/Title area
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KMRL - Maintenance Log', this.margin, 15);

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Train: ${trainNumber}`, this.margin, 25);
    this.doc.text(`Generated: ${new Date().toLocaleString()}`, this.pageWidth - this.margin - 80, 25);

    this.currentY = 45;
    this.doc.setTextColor(0, 0, 0);
  }

  private addSectionHeader(title: string): void {
    this.checkPageBreak(20);

    this.doc.setFillColor(224, 242, 241); // Light teal background
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 128, 128); // Dark teal text
    this.doc.text(title, this.margin + 5, this.currentY + 7);

    this.currentY += 15;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addKeyValue(key: string, value: string, bold: boolean = false): void {
    this.checkPageBreak(8);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${key}:`, this.margin + 5, this.currentY);

    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const keyWidth = this.doc.getTextWidth(`${key}: `);
    this.doc.text(value, this.margin + 5 + keyWidth, this.currentY);

    this.currentY += 6;
  }

  private addPerformanceTable(params: PerformanceParameters, title: string): void {
    this.checkPageBreak(50);

    // Table header
    this.doc.setFillColor(179, 229, 229); // Medium teal
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.text(title, this.margin + 5, this.currentY + 5);

    this.currentY += 10;

    // Parameters
    const parameters = [
      { name: 'Braking Efficiency', value: params.brakingEfficiency, critical: true },
      { name: 'Door Operation Score', value: params.doorOperationScore, critical: false },
      { name: 'Traction Motor Health', value: params.tractionMotorHealth, critical: true },
      { name: 'HVAC System Status', value: params.hvacSystemStatus, critical: false },
      { name: 'Signal Communication Quality', value: params.signalCommunicationQuality, critical: false },
      { name: 'Battery Health Status', value: params.batteryHealthStatus, critical: false }
    ];

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);

    parameters.forEach((param) => {
      this.checkPageBreak(8);

      // Parameter name
      this.doc.text(param.name, this.margin + 5, this.currentY);

      // Value with color coding
      const status = this.getPerformanceStatus(param.value);
      this.doc.setFillColor(...status.color);
      this.doc.rect(this.pageWidth - this.margin - 50, this.currentY - 4, 30, 6, 'F');

      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${param.value}%`, this.pageWidth - this.margin - 45, this.currentY);

      // Critical indicator
      if (param.critical) {
        this.doc.setFontSize(7);
        this.doc.setTextColor(200, 0, 0);
        this.doc.text('CRITICAL', this.pageWidth - this.margin - 15, this.currentY);
        this.doc.setFontSize(9);
        this.doc.setTextColor(0, 0, 0);
      }

      this.currentY += 7;
    });

    this.currentY += 5;
  }

  private getPerformanceStatus(value: number): { color: [number, number, number], label: string } {
    if (value >= 85) return { color: [200, 255, 200], label: 'Excellent' };
    if (value >= 70) return { color: [255, 255, 200], label: 'Good' };
    if (value >= 60) return { color: [255, 220, 180], label: 'Fair' };
    return { color: [255, 200, 200], label: 'Poor' };
  }

  private addAlertBox(log: MaintenanceLogData): void {
    if (!log.alertMessage) return;

    this.checkPageBreak(30);

    // Alert box background
    let alertColor: [number, number, number] = [240, 240, 240];
    if (log.alertType === 'ready') alertColor = [200, 255, 200];
    else if (log.alertType === 'dropout') alertColor = [255, 200, 200];
    else if (log.alertType === 'warning') alertColor = [255, 240, 180];

    this.doc.setFillColor(...alertColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');

    // Alert icon and text
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);

    const alertTitle = log.alertType.toUpperCase().replace('-', ' ');
    this.doc.text(`⚠️ ${alertTitle} ALERT`, this.margin + 5, this.currentY + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    const lines = this.doc.splitTextToSize(log.alertMessage, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(lines, this.margin + 5, this.currentY + 16);

    this.currentY += 30;
  }

  private addComponentsTable(components: MaintenanceLogData['componentsReplaced']): void {
    if (!components || components.length === 0) return;

    this.checkPageBreak(15 + components.length * 7);

    // Table header
    this.doc.setFillColor(179, 229, 229);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9);
    this.doc.text('Component', this.margin + 5, this.currentY + 5);
    this.doc.text('Part Number', this.margin + 70, this.currentY + 5);
    this.doc.text('Qty', this.margin + 130, this.currentY + 5);
    this.doc.text('Cost', this.margin + 150, this.currentY + 5);

    this.currentY += 10;

    // Table rows
    this.doc.setFont('helvetica', 'normal');
    components.forEach((comp) => {
      this.checkPageBreak(7);

      this.doc.text(comp.componentName || 'N/A', this.margin + 5, this.currentY);
      this.doc.text(comp.partNumber || '-', this.margin + 70, this.currentY);
      this.doc.text(comp.quantity?.toString() || '-', this.margin + 130, this.currentY);
      this.doc.text(comp.cost ? `₹${comp.cost}` : '-', this.margin + 150, this.currentY);

      this.currentY += 6;
    });

    this.currentY += 5;
  }

  private addPerformanceScoreGauge(score: number): void {
    this.checkPageBreak(40);

    const centerX = this.pageWidth / 2;
    const centerY = this.currentY + 20;
    const radius = 15;

    // Draw circular gauge
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.circle(centerX, centerY, radius, 'S');

    // Fill based on score
    const status = this.getPerformanceStatus(score);
    this.doc.setFillColor(...status.color);
    
    // Draw arc (simplified as circle for now)
    const fillRadius = (score / 100) * radius;
    this.doc.circle(centerX, centerY, fillRadius, 'F');

    // Score text
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`${score.toFixed(1)}%`, centerX, centerY + 2, { align: 'center' });

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Overall Performance Score', centerX, centerY + 10, { align: 'center' });

    this.currentY += 45;
  }

  public generateReport(log: MaintenanceLogData): jsPDF {
    // Add header
    this.addHeader(log.trainNumber);

    // Basic Information Section
    this.addSectionHeader('Maintenance Details');
    this.addKeyValue('Maintenance ID', log._id.toString().substring(0, 12));
    this.addKeyValue('Train Number', log.trainNumber, true);
    this.addKeyValue('Service In Time', new Date(log.serviceInTime).toLocaleString());
    if (log.serviceOutTime) {
      this.addKeyValue('Service Out Time', new Date(log.serviceOutTime).toLocaleString());
      this.addKeyValue('Duration', `${log.maintenanceDuration.toFixed(2)} hours`, true);
    } else {
      this.addKeyValue('Status', 'IN MAINTENANCE', true);
    }
    this.addKeyValue('Maintenance Type', log.maintenanceType.toUpperCase());
    this.addKeyValue('Priority', log.maintenancePriority.toUpperCase());

    this.currentY += 5;

    // Work Description
    this.addSectionHeader('Work Description');
    const workLines = this.doc.splitTextToSize(log.workDescription, this.pageWidth - 2 * this.margin - 10);
    this.doc.text(workLines, this.margin + 5, this.currentY);
    this.currentY += workLines.length * 5 + 10;

    // Components Replaced
    if (log.componentsReplaced && log.componentsReplaced.length > 0) {
      this.addSectionHeader('Components Replaced');
      this.addComponentsTable(log.componentsReplaced);
    }

    // Technicians
    if (log.techniciansAssigned && log.techniciansAssigned.length > 0) {
      this.addSectionHeader('Technicians Assigned');
      log.techniciansAssigned.forEach((tech) => {
        this.addKeyValue(tech.name, tech.specialization || 'General Maintenance');
      });
      this.currentY += 5;
    }

    // Performance Analysis
    if (log.performanceBeforeMaintenance) {
      this.addSectionHeader('Performance Analysis');
      this.addPerformanceTable(log.performanceBeforeMaintenance, 'Before Maintenance');
    }

    if (log.performanceAfterMaintenance) {
      this.addPerformanceTable(log.performanceAfterMaintenance, 'After Maintenance');
      
      // Overall Performance Score
      this.addSectionHeader('Overall Performance Assessment');
      this.addPerformanceScoreGauge(log.overallPerformanceScore);
    }

    // Train Status
    this.addSectionHeader('Train Status & Readiness');
    this.addKeyValue('Current Status', log.trainStatus.toUpperCase(), true);
    this.addKeyValue('Ready for Operation', log.readyForOperation ? 'YES ✓' : 'NO ✗', true);

    // Alert Box
    if (log.alertMessage) {
      this.currentY += 5;
      this.addAlertBox(log);
    }

    // Cost Information
    if (log.totalMaintenanceCost) {
      this.currentY += 5;
      this.addSectionHeader('Cost Summary');
      this.addKeyValue('Total Maintenance Cost', `₹${log.totalMaintenanceCost.toLocaleString()}`, true);
    }

    // Remarks
    if (log.remarks) {
      this.currentY += 5;
      this.addSectionHeader('Remarks');
      const remarkLines = this.doc.splitTextToSize(log.remarks, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(remarkLines, this.margin + 5, this.currentY);
      this.currentY += remarkLines.length * 5 + 10;
    }

    // Footer
    this.addFooter();

    return this.doc;
  }

  private addFooter(): void {
    this.currentY = this.pageHeight - 25;

    this.doc.setFillColor(224, 242, 241);
    this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');

    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Generated by KMRL Maintenance System', this.margin, this.pageHeight - 10);
    this.doc.text(`Report Date: ${new Date().toLocaleString()}`, this.margin, this.pageHeight - 5);
    this.doc.text('Confidential - Kochi Metro Rail Limited', this.pageWidth - this.margin - 80, this.pageHeight - 10);
  }
}

export const generateMaintenanceReport = (log: MaintenanceLogData): jsPDF => {
  const generator = new MaintenancePDFReportGenerator();
  return generator.generateReport(log);
};
