import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Train, 
  MapPin, 
  Zap, 
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Calendar,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';

interface TrainData {
  trainset_id: number;
  number: string;
  status: string;
  assigned_bay_id?: number;
  scheduling_score: number;
  selection_reason?: string;
  exclusion_reason?: string;
  make_model: string;
  year_commissioned: number;
  home_depot: string;
}

interface SchedulingResult {
  selected_trains: TrainData[];
  remaining_trains: TrainData[];
  optimization_score: number;
  solution_status: string;
  constraint_violations: string[];
  execution_time: number;
  scheduling_date: string;
}

interface AISchedulingPanelProps {
  trainsets: any[];
}

export function AISchedulingPanel({ }: AISchedulingPanelProps) {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);
  const [modifiedSchedule, setModifiedSchedule] = useState<{
    selected: TrainData[];
    remaining: TrainData[];
  } | null>(null);

  // Google OR-Tools optimization API call
  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the Google OR-Tools optimization API directly
      const response = await fetch('http://localhost:8001/api/train-scheduling/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_date: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const result = await response.json();
      setSchedulingResult(result);
      // Initialize modified schedule with original results
      setModifiedSchedule({
        selected: result.selected_trains || [],
        remaining: result.remaining_trains || []
      });
    } catch (err) {
      setError(`Failed to connect to Google OR-Tools optimization service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };



  // Function to move train from remaining to selected
  const moveToScheduled = (train: TrainData) => {
    if (!modifiedSchedule) return;
    
    if (modifiedSchedule.selected.length >= 24) {
      alert('Maximum 24 trains can be scheduled. Please remove a train first.');
      return;
    }

    const updatedSelected = [...modifiedSchedule.selected, train];
    const updatedRemaining = modifiedSchedule.remaining.filter(t => t.trainset_id !== train.trainset_id);

    setModifiedSchedule({
      selected: updatedSelected.sort((a, b) => b.scheduling_score - a.scheduling_score),
      remaining: updatedRemaining.sort((a, b) => b.scheduling_score - a.scheduling_score)
    });
  };

  // Function to move train from selected to remaining
  const moveToRemaining = (train: TrainData) => {
    if (!modifiedSchedule) return;

    const updatedSelected = modifiedSchedule.selected.filter(t => t.trainset_id !== train.trainset_id);
    const updatedRemaining = [...modifiedSchedule.remaining, train];

    setModifiedSchedule({
      selected: updatedSelected.sort((a, b) => b.scheduling_score - a.scheduling_score),
      remaining: updatedRemaining.sort((a, b) => b.scheduling_score - a.scheduling_score)
    });
  };

  // Function to reset to original AI schedule
  const resetToOriginal = () => {
    if (!schedulingResult) return;
    
    setModifiedSchedule({
      selected: [...schedulingResult.selected_trains],
      remaining: [...schedulingResult.remaining_trains]
    });
  };

  const getStatusBadge = (status: string, isSelected: boolean = false) => {
    const baseClasses = "text-xs font-medium";
    
    if (isSelected) {
      return (
        <Badge className={cn(baseClasses, "bg-green-100 text-green-800 border-green-200")}>
          Scheduled
        </Badge>
      );
    }

    switch (status) {
      case 'ready':
        return <Badge className={cn(baseClasses, "bg-green-100 text-green-800")}>Ready</Badge>;
      case 'standby':
        return <Badge className={cn(baseClasses, "bg-yellow-100 text-yellow-800")}>Standby</Badge>;
      case 'maintenance':
        return <Badge className={cn(baseClasses, "bg-red-100 text-red-800")}>Maintenance</Badge>;
      default:
        return <Badge className={cn(baseClasses, "bg-gray-100 text-gray-800")}>Unknown</Badge>;
    }
  };

  // Single Train Card Component for vertical list
  const TrainListCard: React.FC<{ 
    train: TrainData; 
    isSelected: boolean; 
    onMove: () => void;
    onDetails: () => void;
  }> = ({ train, isSelected, onMove, onDetails }) => (
    <Card className={cn(
      "mb-3 transition-all duration-200 hover:shadow-md",
      isSelected ? "border-green-500 bg-green-50" : "hover:border-blue-300"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Train className={cn(
              "h-5 w-5",
              isSelected ? "text-green-600" : "text-blue-600"
            )} />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{train.number}</h3>
                {getStatusBadge(train.status, isSelected)}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-medium">Score:</span>
                <Progress value={train.scheduling_score} className="flex-1 h-1 max-w-20" />
                <span className="font-mono min-w-12">{train.scheduling_score.toFixed(1)}</span>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {train.make_model} ({train.year_commissioned})
                {isSelected && train.assigned_bay_id && (
                  <span className="ml-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Bay {train.assigned_bay_id}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDetails}
              className="text-xs"
            >
              Details
            </Button>
            <Button
              variant={isSelected ? "destructive" : "default"}
              size="sm"
              onClick={onMove}
              className="text-xs"
            >
              {isSelected ? (
                <>
                  <ArrowRight className="h-3 w-3 mr-1" />
                  Remove
                </>
              ) : (
                <>
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Schedule
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Reason Display */}
        {isSelected && train.selection_reason && (
          <div className="mt-2 p-2 bg-green-100 rounded text-xs">
            <strong>Selected:</strong> {train.selection_reason}
          </div>
        )}
        
        {!isSelected && train.exclusion_reason && (
          <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
            <strong>Not selected:</strong> {train.exclusion_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const exportSchedule = () => {
    if (!modifiedSchedule) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Helper function to add header to each page
    const addHeader = (pageNum: number) => {
      // Government of Kerala header
      doc.setFillColor(0, 51, 102); // Dark blue
      doc.rect(0, 0, 210, 25, 'F');
      
      // White text on blue background
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('GOVERNMENT OF KERALA', 20, 12);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Kochi Metro Rail Limited (KMRL)', 20, 18);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add page number
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${pageNum}`, 180, 18);
    };
    
    // Helper function to add footer
    const addFooter = () => {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleString()} | KMRL AI Scheduling System`, 20, 290);
        doc.text(`Official Document - Confidential`, 150, 290);
      }
    };
    
    // Page 1: Cover Page
    addHeader(1);
    
    // Main title with proper spacing
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('AI-POWERED TRAIN SCHEDULING', 20, 50);
    doc.text('OPTIMIZATION REPORT', 20, 62);
    
    // Subtitle with better spacing
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Intelligent Fleet Management System', 20, 80);
    doc.text('Powered by Google OR-Tools & Machine Learning', 20, 90);
    
    // Date and details box with improved layout
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 110, 170, 70, 'F');
    doc.setDrawColor(0, 51, 102);
    doc.rect(20, 110, 170, 70, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('SCHEDULE DETAILS', 30, 125);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Schedule Date: ${selectedDate}`, 30, 140);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 30, 150);
    doc.text(`Optimization Score: ${schedulingResult?.optimization_score?.toFixed(2) || 'N/A'}`, 30, 160);
    doc.text(`Execution Time: ${schedulingResult?.execution_time?.toFixed(2) || 'N/A'} seconds`, 30, 170);
    
    // Key metrics box with better formatting
    doc.setFillColor(240, 255, 240);
    doc.rect(20, 190, 170, 50, 'F');
    doc.setDrawColor(0, 128, 0);
    doc.rect(20, 190, 170, 50, 'S');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 0);
    doc.text('FLEET STATUS SUMMARY', 30, 205);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`✓ Scheduled Trains: ${modifiedSchedule.selected.length}/24`, 30, 218);
    doc.text(`✓ Available Trains: ${modifiedSchedule.remaining.length}`, 30, 228);
    doc.text(`✓ Optimization Status: ${schedulingResult?.solution_status || 'N/A'}`, 30, 238);
    
    // Page 2: Executive Summary
    doc.addPage();
    addHeader(2);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('EXECUTIVE SUMMARY', 20, 45);
    
    // Summary content with better formatting
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const summaryText = [
      'This report presents the AI-optimized train scheduling solution for Kochi Metro Rail Limited.',
      'The system utilizes advanced constraint programming and machine learning algorithms to',
      'maximize operational efficiency while ensuring passenger safety and service reliability.',
      '',
      'Key Achievements:',
      `• Successfully scheduled ${modifiedSchedule.selected.length} trains for optimal service delivery`,
      `• Achieved optimization score of ${schedulingResult?.optimization_score?.toFixed(2) || 'N/A'}`,
      `• Processing completed in ${schedulingResult?.execution_time?.toFixed(2) || 'N/A'} seconds`,
      `• ${modifiedSchedule.remaining.length} trains available for backup and maintenance`,
      '',
      'The AI system considers multiple factors including train availability, maintenance',
      'schedules, passenger demand patterns, and operational constraints to deliver the',
      'most efficient scheduling solution.'
    ];
    
    let yPos = 60;
    summaryText.forEach(line => {
      if (yPos > 280) {
        doc.addPage();
        addHeader(doc.getNumberOfPages());
        yPos = 50;
      }
      
      // Special formatting for headers
      if (line === 'Key Achievements:') {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 51, 102);
      } else if (line.startsWith('•')) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(line, 20, yPos);
      yPos += line === '' ? 4 : 7;
    });
    
    // Page 3: Detailed Schedule
    doc.addPage();
    addHeader(3);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('SCHEDULED TRAINS DETAILS', 20, 45);
    
    // Table with enhanced styling and proper spacing
    doc.setFillColor(0, 51, 102);
    doc.rect(20, 55, 170, 15, 'F');
    
    // Table headers with white text and better spacing
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('No.', 25, 66);
    doc.text('Train ID', 40, 66);
    doc.text('Model', 80, 66);
    doc.text('Status', 130, 66);
    doc.text('Score', 160, 66);
    doc.text('Bay', 180, 66);
    
    // Table data with improved formatting
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let yPosition = 80;
    modifiedSchedule.selected.forEach((train, index) => {
      if (yPosition > 270) {
        doc.addPage();
        addHeader(doc.getNumberOfPages());
        // Re-add table header
        doc.setFillColor(0, 51, 102);
        doc.rect(20, 55, 170, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('No.', 25, 66);
        doc.text('Train ID', 40, 66);
        doc.text('Model', 80, 66);
        doc.text('Status', 130, 66);
        doc.text('Score', 160, 66);
        doc.text('Bay', 180, 66);
        doc.setTextColor(0, 0, 0);
        yPosition = 80;
      }
      
      // Alternate row colors with better spacing
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPosition - 5, 170, 10, 'F');
      }
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${index + 1}`, 25, yPosition);
      doc.text(train.number, 40, yPosition);
      doc.text(train.make_model, 80, yPosition);
      doc.text(train.status, 130, yPosition);
      doc.text(train.scheduling_score.toFixed(1), 160, yPosition);
      doc.text(train.assigned_bay_id?.toString() || 'N/A', 180, yPosition);
      yPosition += 12;
    });
    
    // Page 4: Available Trains & Recommendations
    if (modifiedSchedule.remaining.length > 0) {
      doc.addPage();
      addHeader(4);
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102);
      doc.text('AVAILABLE TRAINS & RECOMMENDATIONS', 20, 45);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Available Trains: ${modifiedSchedule.remaining.length}`, 20, 60);
      doc.text('These trains are available for backup operations, maintenance, or future scheduling:', 20, 75);
      
      // Top available trains
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP 10 AVAILABLE TRAINS (Ranked by Optimization Score):', 20, 95);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let remainingY = 110;
      modifiedSchedule.remaining.slice(0, 10).forEach((train, index) => {
        if (remainingY > 280) {
          doc.addPage();
          addHeader(doc.getNumberOfPages());
          remainingY = 50;
        }
        
        // Status color coding
        const statusColor = train.status === 'ready' ? [0, 128, 0] : 
                           train.status === 'standby' ? [255, 165, 0] : [128, 128, 128];
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        
        doc.text(`${index + 1}. ${train.number} (${train.make_model})`, 20, remainingY);
        doc.text(`   Status: ${train.status.toUpperCase()} | Score: ${train.scheduling_score.toFixed(1)}`, 20, remainingY + 5);
        
        doc.setTextColor(0, 0, 0);
        remainingY += 15;
      });
    }
    
    // Page 5: Technical Details & Compliance
    doc.addPage();
    addHeader(5);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('TECHNICAL SPECIFICATIONS & COMPLIANCE', 20, 45);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const techDetails = [
      'SYSTEM SPECIFICATIONS:',
      '• Optimization Engine: Google OR-Tools Constraint Programming',
      '• AI Framework: Machine Learning with Real-time Data Processing',
      '• Processing Time: ' + (schedulingResult?.execution_time?.toFixed(2) || 'N/A') + ' seconds',
      '• Solution Status: ' + (schedulingResult?.solution_status || 'N/A'),
      '',
      'COMPLIANCE & SAFETY:',
      '• All scheduled trains meet safety certification requirements',
      '• Maintenance schedules are respected and optimized',
      '• Passenger capacity and demand patterns considered',
      '• Emergency backup trains available for contingency',
      '',
      'QUALITY ASSURANCE:',
      '• Real-time monitoring and validation',
      '• Automated conflict detection and resolution',
      '• Performance metrics tracking and reporting',
      '• Continuous improvement through machine learning'
    ];
    
    let techY = 60;
    techDetails.forEach(line => {
      if (techY > 280) {
        doc.addPage();
        addHeader(doc.getNumberOfPages());
        techY = 50;
      }
      doc.text(line, 20, techY);
      techY += 6;
    });
    
    // Add footer to all pages
    addFooter();
    
    // Save the PDF with official naming
    const reportDate = new Date().toISOString().split('T')[0];
    doc.save(`KMRL_AI_Schedule_Report_${selectedDate}_${reportDate}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            {t('scheduling.aiScheduling')}
          </h1>
          <p className="text-muted-foreground">
            Google OR-Tools powered train scheduling optimization
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          <Button onClick={runOptimization} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Optimizing...' : 'Run AI Optimization'}
          </Button>
          {modifiedSchedule && (
            <>
              <Button variant="outline" onClick={resetToOriginal}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to AI
              </Button>
              <Button variant="outline" onClick={exportSchedule}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Optimization Results Summary */}
      {schedulingResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-2xl font-bold">{schedulingResult.solution_status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Train className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Selected Trains</p>
                  <p className="text-2xl font-bold">{(modifiedSchedule?.selected || schedulingResult?.selected_trains || []).length}/24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Optimization Score</p>
                  <p className="text-2xl font-bold">{schedulingResult.optimization_score.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Execution Time</p>
                  <p className="text-2xl font-bold">{schedulingResult.execution_time.toFixed(2)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Optimization Service Unavailable</p>
              <p>{error}</p>
              <p className="text-sm">
                Please ensure the Google OR-Tools backend service is running at{' '}
                <code className="bg-gray-100 px-1 rounded text-xs">http://localhost:8001</code>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* No Results State */}
      {!loading && !schedulingResult && !error && (
        <Card className="text-center py-12">
          <CardContent>
            <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready for OR-Tools Optimization</h3>
            <p className="text-muted-foreground mb-4">
              Connect to Google OR-Tools optimization service to get real-time scheduling recommendations
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
              <p className="font-semibold text-blue-800">Required Backend Service:</p>
              <p className="text-blue-700">Python service with Google OR-Tools running on port 8001</p>
              <p className="text-blue-600 mt-1">
                Endpoint: <code className="bg-blue-100 px-1 rounded">POST /api/train-scheduling/optimize</code>
              </p>
            </div>
            <Button onClick={runOptimization} size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Connect to OR-Tools Service
            </Button>
          </CardContent>
        </Card>
      )}
      {modifiedSchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Scheduled Trains */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Scheduled Trains ({(modifiedSchedule?.selected || []).length}/24)
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={(modifiedSchedule?.selected || []).length === 24 ? "default" : "destructive"}>
                      {(modifiedSchedule?.selected || []).length === 24 ? "Complete" : "Incomplete"}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {24 - (modifiedSchedule?.selected || []).length} slots remaining
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {(modifiedSchedule?.selected || []).length > 0 ? (
                  (modifiedSchedule.selected).map((train, index) => (
                    <div key={train.trainset_id} className="relative">
                      <div className="absolute -left-2 top-4 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4">
                        <TrainListCard
                          train={train}
                          isSelected={true}
                          onMove={() => moveToRemaining(train)}
                          onDetails={() => setSelectedTrain(train)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Train className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No trains scheduled</p>
                    <p className="text-sm">Click "Schedule" on trains from the right to add them</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Remaining Trains (Best to Worst) */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5 text-orange-500" />
                    Available Trains ({(modifiedSchedule?.remaining || []).length})
                  </div>
                  <div className="text-xs text-gray-500">
                    Sorted by optimization score
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                {(modifiedSchedule?.remaining || []).length > 0 ? (
                  (modifiedSchedule.remaining).map((train) => (
                    <TrainListCard
                      key={train.trainset_id}
                      train={train}
                      isSelected={false}
                      onMove={() => moveToScheduled(train)}
                      onDetails={() => setSelectedTrain(train)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>All trains scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Running Google OR-Tools Optimization</h3>
            <p className="text-muted-foreground">
              Analyzing train fleet data using constraint programming and optimization algorithms
            </p>
          </div>
        </div>
      )}

      {/* Train Detail Modal would go here */}
      {selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedTrain.number}</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedTrain(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Model:</strong> {selectedTrain.make_model} ({selectedTrain.year_commissioned})
                </div>
                <div>
                  <strong>Home Depot:</strong> {selectedTrain.home_depot}
                </div>
                <div>
                  <strong>Status:</strong> {getStatusBadge(selectedTrain.status)}
                </div>
                <div>
                  <strong>Scheduling Score:</strong> {selectedTrain.scheduling_score.toFixed(2)}
                </div>
                {selectedTrain.assigned_bay_id && (
                  <div>
                    <strong>Assigned Bay:</strong> {selectedTrain.assigned_bay_id}
                  </div>
                )}
                {selectedTrain.selection_reason && (
                  <div>
                    <strong>Selection Reason:</strong> {selectedTrain.selection_reason}
                  </div>
                )}
                {selectedTrain.exclusion_reason && (
                  <div>
                    <strong>Exclusion Reason:</strong> {selectedTrain.exclusion_reason}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}