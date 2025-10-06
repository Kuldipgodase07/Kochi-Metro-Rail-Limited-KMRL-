import { jsPDF } from 'jspdf';

interface Trainset {
  number: string;
  status: string;
  mileage: number;
  availability_percentage: number;
}

interface Metrics {
  current_kpis?: {
    fleet_availability?: number;
    punctuality?: number;
    energy_consumption?: number;
  };
  alerts?: {
    trainset: string;
    message: string;
    priority: string;
  }[];
}

export class SimplePDFReportGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private reportType: 'daily' | 'monthly' | 'yearly';

  constructor(reportType: 'daily' | 'monthly' | 'yearly' = 'daily') {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = 297;
    this.pageWidth = 210;
    this.margin = 20;
    this.currentY = this.margin;
    this.reportType = reportType;
  }

  async generateFleetReport(trainsets: Trainset[], metrics: Metrics): Promise<jsPDF> {
    try {
      // Add cover page based on report type
      await this.addCoverPage();
      
      // Add new page for content
      this.doc.addPage();
      this.currentY = this.margin;
      
      // Header
      this.addHeader();
      
      // Title Page
      this.addTitle('KOCHI METRO RAIL LIMITED', 18);
      this.addTitle('TRAIN FLEET MANAGEMENT REPORT', 16);
      this.currentY += 10;
      
      this.addText(`Report Generated: ${new Date().toLocaleString()}`, 12);
      this.addText(`Total Fleet Size: ${trainsets.length} Trainsets`, 12);
      this.currentY += 15;

      // Executive Summary
      this.addSectionHeader('EXECUTIVE SUMMARY');
      this.addExecutiveSummary(trainsets, metrics);
      
      // Fleet Status Overview
      this.addSectionHeader('1. FLEET STATUS OVERVIEW');
      this.addFleetStatusTable(trainsets);
      
      // Performance Metrics
      this.addSectionHeader('2. PERFORMANCE METRICS');
      this.addPerformanceMetrics(trainsets, metrics);
      
      // Trainset Details
      this.addSectionHeader('3. TRAINSET DETAILS');
      this.addTrainsetDetailsTable(trainsets);
      
      // Maintenance Analysis
      this.addSectionHeader('4. MAINTENANCE ANALYSIS');
      this.addMaintenanceAnalysis(trainsets);
      
      // AI Recommendations
      this.addSectionHeader('5. AI RECOMMENDATIONS & INSIGHTS');
      this.addAIRecommendations(trainsets, metrics);
      
      // Footer
      this.addFooter();
      
      return this.doc;
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }

  private addHeader(): void {
    this.doc.setFillColor(0, 128, 128);
    this.doc.rect(0, 0, this.pageWidth, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KMRL - Train Fleet Management System', this.margin, 15);
    
    this.doc.setTextColor(0, 0, 0);
    this.currentY = 35;
  }

  private addTitle(text: string, fontSize = 14): void {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', 'bold');
    const textWidth = this.doc.getTextWidth(text);
    const x = (this.pageWidth - textWidth) / 2;
    this.doc.text(text, x, this.currentY);
    this.currentY += fontSize * 0.6 + 5;
  }

  private addText(text: string, fontSize = 11, style: 'normal' | 'bold' = 'normal'): void {
    this.checkPageBreak(fontSize);
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', style);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize * 0.6 + 3;
  }

  private addSectionHeader(text: string): void {
    this.currentY += 15;
    this.checkPageBreak(15);
    
    // Add colored background with teal theme
    this.doc.setFillColor(224, 242, 241);
    this.doc.rect(this.margin - 5, this.currentY - 8, this.pageWidth - 2 * this.margin + 10, 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 128, 128);
    this.doc.text(text, this.margin, this.currentY);
    this.doc.setTextColor(0, 0, 0);
    this.currentY += 12;
  }

  private checkPageBreak(requiredSpace = 20): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.addHeader();
    }
  }

  private addExecutiveSummary(trainsets: Trainset[], metrics: Metrics): void {
    const readyTrains = trainsets.filter(t => t.status === 'ready').length;
    const standbyTrains = trainsets.filter(t => t.status === 'standby').length;
    const maintenanceTrains = trainsets.filter(t => t.status === 'maintenance').length;
    const criticalTrains = trainsets.filter(t => t.status === 'critical').length;
    
    const operationalRate = Math.round(((readyTrains + standbyTrains) / trainsets.length) * 100);
    const avgAvailability = Math.round(trainsets.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsets.length);
    
    this.addText('Fleet Overview:', 12, 'bold');
    this.addText(`• Total Fleet: ${trainsets.length} trainsets`, 11);
    this.addText(`• Operational Rate: ${operationalRate}% (${readyTrains + standbyTrains}/${trainsets.length})`, 11);
    this.addText(`• Average Availability: ${avgAvailability}%`, 11);
    this.addText(`• Fleet Availability Target: ${metrics.current_kpis?.fleet_availability || 'N/A'}%`, 11);
    
    this.currentY += 5;
    this.addText('Status Distribution:', 12, 'bold');
    this.addText(`• Ready for Service: ${readyTrains} (${Math.round(readyTrains/trainsets.length*100)}%)`, 11);
    this.addText(`• Standby: ${standbyTrains} (${Math.round(standbyTrains/trainsets.length*100)}%)`, 11);
    this.addText(`• Under Maintenance: ${maintenanceTrains} (${Math.round(maintenanceTrains/trainsets.length*100)}%)`, 11);
    this.addText(`• Critical Issues: ${criticalTrains} (${Math.round(criticalTrains/trainsets.length*100)}%)`, 11);
  }

  private addFleetStatusTable(trainsets: Trainset[]): void {
    const statusCounts = trainsets.reduce((acc: Record<string, number>, train) => {
      acc[train.status] = (acc[train.status] || 0) + 1;
      return acc;
    }, {});

    // Table headers
    this.currentY += 5;
    this.doc.setFillColor(179, 229, 229);
    this.doc.rect(this.margin, this.currentY - 5, 160, 10, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Status', this.margin + 5, this.currentY);
    this.doc.text('Count', this.margin + 60, this.currentY);
    this.doc.text('Percentage', this.margin + 100, this.currentY);
    this.doc.text('Description', this.margin + 140, this.currentY);
    
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');

    // Table rows
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / trainsets.length) * 100).toFixed(1);
      const description = this.getStatusDescription(status);
      
      this.doc.text(status.toUpperCase(), this.margin + 5, this.currentY);
      this.doc.text(count.toString(), this.margin + 60, this.currentY);
      this.doc.text(`${percentage}%`, this.margin + 100, this.currentY);
      this.doc.text(description, this.margin + 140, this.currentY);
      
      this.currentY += 7;
    });
  }

  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      'ready': 'Active Service',
      'standby': 'Available Backup',
      'maintenance': 'Scheduled Repair',
      'critical': 'Urgent Attention'
    };
    return descriptions[status] || status;
  }

  private addPerformanceMetrics(trainsets: Trainset[], metrics: Metrics): void {
    this.addText('Key Performance Indicators:', 12, 'bold');
    
    if (metrics?.current_kpis) {
      this.addText(`• Fleet Availability: ${metrics.current_kpis.fleet_availability || 'N/A'}%`, 11);
      this.addText(`• Punctuality: ${metrics.current_kpis.punctuality || 'N/A'}%`, 11);
      this.addText(`• Energy Efficiency: ${100 - ((metrics.current_kpis.energy_consumption || 8500) / 100)}%`, 11);
    }
    
    this.currentY += 5;
    this.addText('Fleet Statistics:', 12, 'bold');
    
    const avgMileage = Math.round(trainsets.reduce((sum, t) => sum + t.mileage, 0) / trainsets.length);
    const maxMileage = Math.max(...trainsets.map(t => t.mileage));
    const minMileage = Math.min(...trainsets.map(t => t.mileage));
    const avgAvailability = Math.round(trainsets.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsets.length);
    
    this.addText(`• Average Mileage: ${avgMileage.toLocaleString()} km`, 11);
    this.addText(`• Mileage Range: ${minMileage.toLocaleString()} - ${maxMileage.toLocaleString()} km`, 11);
    this.addText(`• Average Availability: ${avgAvailability}%`, 11);
    this.addText(`• High Mileage Units (>50k): ${trainsets.filter(t => t.mileage > 50000).length}`, 11);
  }

  private addTrainsetDetailsTable(trainsets: Trainset[]): void {
    this.currentY += 5;
    
    // Sort trainsets by number for better presentation
    const sortedTrainsets = [...trainsets].sort((a, b) => a.number.localeCompare(b.number));
    
    // Table headers
    this.doc.setFillColor(179, 229, 229);
    this.doc.rect(this.margin, this.currentY - 5, 170, 10, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Trainset', this.margin + 5, this.currentY);
    this.doc.text('Status', this.margin + 45, this.currentY);
    this.doc.text('Mileage (km)', this.margin + 80, this.currentY);
    this.doc.text('Availability', this.margin + 125, this.currentY);
    this.doc.text('Priority', this.margin + 160, this.currentY);
    
    this.currentY += 8;
    this.doc.setFont('helvetica', 'normal');

    // Table rows
    sortedTrainsets.forEach((trainset) => {
      this.checkPageBreak(10);
      
      const priority = this.calculatePriority(trainset);
      
      this.doc.text(trainset.number, this.margin + 5, this.currentY);
      this.doc.text(trainset.status.toUpperCase(), this.margin + 45, this.currentY);
      this.doc.text(trainset.mileage.toLocaleString(), this.margin + 80, this.currentY);
      this.doc.text(`${trainset.availability_percentage}%`, this.margin + 125, this.currentY);
      this.doc.text(priority, this.margin + 160, this.currentY);
      
      this.currentY += 7;
    });
  }

  private calculatePriority(trainset: Trainset): string {
    if (trainset.mileage > 65000 || trainset.availability_percentage < 60) return 'HIGH';
    if (trainset.mileage > 50000 || trainset.availability_percentage < 80) return 'MEDIUM';
    return 'LOW';
  }

  private addMaintenanceAnalysis(trainsets: Trainset[]): void {
    const criticalTrains = trainsets.filter(t => 
      t.mileage > 60000 || t.availability_percentage < 70 || t.status === 'critical'
    );
    
    const maintenanceTrains = trainsets.filter(t => 
      (t.mileage > 45000 && t.mileage <= 60000) || 
      (t.availability_percentage >= 70 && t.availability_percentage < 85) ||
      t.status === 'maintenance'
    );

    this.addText('Maintenance Priority Analysis:', 12, 'bold');
    
    this.addText(`Critical Attention Required (${criticalTrains.length} units):`, 11, 'bold');
    if (criticalTrains.length > 0) {
      criticalTrains.forEach(train => {
        this.addText(`• ${train.number}: ${train.mileage.toLocaleString()} km, ${train.availability_percentage}% availability`, 10);
      });
    } else {
      this.addText('• No critical issues identified', 10);
    }

    this.currentY += 3;
    this.addText(`Scheduled Maintenance (${maintenanceTrains.length} units):`, 11, 'bold');
    if (maintenanceTrains.length > 0) {
      maintenanceTrains.forEach(train => {
        this.addText(`• ${train.number}: ${train.mileage.toLocaleString()} km, ${train.availability_percentage}% availability`, 10);
      });
    } else {
      this.addText('• No scheduled maintenance pending', 10);
    }

    this.currentY += 5;
    this.addText('Maintenance Recommendations:', 12, 'bold');
    this.addText('• Prioritize units with >60,000 km mileage for comprehensive inspection', 11);
    this.addText('• Schedule preventive maintenance for units below 80% availability', 11);
    this.addText('• Implement predictive maintenance for high-mileage units', 11);
    this.addText('• Regular performance monitoring for critical status units', 11);
  }

  private addAIRecommendations(trainsets: Trainset[], metrics: Metrics): void {
    this.addText('AI-Powered Insights:', 12, 'bold');
    
    const operationalRate = Math.round(((trainsets.filter(t => ['ready', 'standby'].includes(t.status)).length) / trainsets.length) * 100);
    const avgAvailability = Math.round(trainsets.reduce((sum, t) => sum + t.availability_percentage, 0) / trainsets.length);
    
    this.addText('• Fleet Optimization Recommendations:', 11, 'bold');
    
    if (operationalRate < 85) {
      this.addText('  - Increase preventive maintenance frequency to improve operational rate', 10);
    } else {
      this.addText('  - Current operational rate is optimal, maintain current schedule', 10);
    }
    
    if (avgAvailability < 85) {
      this.addText('  - Focus on availability improvement through targeted maintenance', 10);
    } else {
      this.addText('  - Fleet availability is meeting targets, continue monitoring', 10);
    }
    
    this.addText('  - Implement dynamic scheduling based on real-time performance data', 10);
    this.addText('  - Consider predictive analytics for maintenance planning', 10);
    
    this.currentY += 5;
    this.addText('• System Alerts:', 11, 'bold');
    
    if (metrics?.alerts && metrics.alerts.length > 0) {
      metrics.alerts.slice(0, 5).forEach(alert => {
        this.addText(`  - ${alert.trainset}: ${alert.message} (Priority: ${alert.priority})`, 10);
      });
    } else {
      this.addText('  - No active system alerts', 10);
    }
    
    this.currentY += 5;
    this.addText('• Performance Insights:', 11, 'bold');
    this.addText('  - AI scheduling has improved fleet efficiency by optimizing maintenance windows', 10);
    this.addText('  - Predictive maintenance recommendations reduce emergency repairs', 10);
    this.addText('  - Real-time monitoring enables proactive fleet management', 10);
  }

  private async addCoverPage(): Promise<void> {
    // Determine which cover page image to use based on report type
    const coverPageMap = {
      'daily': '/KMRL_DailyReport_Cover_Page[1].png',
      'monthly': '/Monthly_Report[1].png',
      'yearly': '/kmrl-annual-report-cover.jpg[1].jpg'
    };
    
    const coverPagePath = coverPageMap[this.reportType];
    
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Create a canvas to convert image to base64
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            // Detect image format from file extension
            const isPng = coverPagePath.toLowerCase().includes('.png');
            const format = isPng ? 'PNG' : 'JPEG';
            const mimeType = isPng ? 'image/png' : 'image/jpeg';
            const base64Image = canvas.toDataURL(mimeType, 1.0);
            
            // Add the cover page image to fill the entire page (A4 size)
            this.doc.addImage(base64Image, format, 0, 0, this.pageWidth, this.pageHeight);
            console.log(`✅ Cover page added successfully: ${this.reportType} report (${format})`);
          } else {
            console.warn('Canvas context not available, using fallback');
            this.addFallbackCoverPage();
          }
        } catch (error) {
          console.error('Error adding cover page image:', error);
          this.addFallbackCoverPage();
        }
        resolve();
      };
      
      img.onerror = (error) => {
        console.error('❌ Error loading cover page image:', error);
        console.log('📁 Attempted to load:', coverPagePath);
        console.log('💡 Using fallback cover page instead');
        this.addFallbackCoverPage();
        resolve();
      };
      
      // Start loading the image
      img.src = coverPagePath;
      
      // Set a timeout in case image doesn't load
      setTimeout(() => {
        if (!img.complete) {
          console.warn('Image loading timeout - image may be missing or empty');
          console.log('Expected path:', coverPagePath);
          console.log('Please ensure cover page images are placed in the /public folder with valid content');
          this.addFallbackCoverPage();
          resolve();
        }
      }, 5000);
    });
  }

  private addFallbackCoverPage(): void {
    // Create a professional gradient background
    this.doc.setFillColor(0, 70, 150);
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Add decorative header bar
    this.doc.setFillColor(0, 102, 204);
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Add decorative footer bar
    this.doc.setFillColor(0, 102, 204);
    this.doc.rect(0, this.pageHeight - 40, this.pageWidth, 40, 'F');
    
    // Main title area
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KMRL', this.pageWidth / 2, 100, { align: 'center' });
    
    // Report type with styling
    const reportTitle = this.reportType.toUpperCase() + ' REPORT';
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(reportTitle, this.pageWidth / 2, 130, { align: 'center' });
    
    // Decorative line
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(255, 255, 255);
    this.doc.line(60, 140, 150, 140);
    
    // Organization details
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Kochi Metro Rail Limited', this.pageWidth / 2, 170, { align: 'center' });
    
    this.doc.setFontSize(14);
    this.doc.text('Train Fleet Management System', this.pageWidth / 2, 185, { align: 'center' });
    
    // Date and period information
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'italic');
    const currentDate = new Date();
    this.doc.text(`Report Period: ${this.reportType.charAt(0).toUpperCase() + this.reportType.slice(1)}`, this.pageWidth / 2, 220, { align: 'center' });
    this.doc.text(`Generated: ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`, this.pageWidth / 2, 230, { align: 'center' });
    
    // Footer note
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Confidential Document', this.pageWidth / 2, this.pageHeight - 20, { align: 'center' });
  }

  private addFooter(): void {
    this.currentY = this.pageHeight - 25;
    
    this.doc.setFillColor(224, 242, 241);
    this.doc.rect(0, this.pageHeight - 20, this.pageWidth, 20, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated by Train Plan Wise System | ${new Date().toLocaleString()}`, this.margin, this.pageHeight - 10);
    this.doc.text(`Page 1 of 1 | Confidential - Kochi Metro Rail Limited`, this.margin, this.pageHeight - 5);
  }
}

export const generateSimplePDFReport = async (trainsets: Trainset[], metrics: Metrics, reportType: 'daily' | 'monthly' | 'yearly' = 'daily'): Promise<jsPDF> => {
  const generator = new SimplePDFReportGenerator(reportType);
  return await generator.generateFleetReport(trainsets, metrics);
};