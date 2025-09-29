import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Train, 
  Clock, 
  MapPin, 
  Zap, 
  Sparkles,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface TrainSchedulingPanelProps {
  className?: string;
}

const TrainSchedulingPanel: React.FC<TrainSchedulingPanelProps> = ({ className }) => {
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);

  // Simulated API call - replace with actual backend integration
  const runOptimization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call to Python optimization service
      const response = await fetch('/api/train-scheduling/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      const result = await response.json();
      setSchedulingResult(result);
    } catch (err) {
      // Fallback to demo data for development
      console.log('Using demo data - replace with actual API integration');
      setSchedulingResult(generateDemoData());
    } finally {
      setLoading(false);
    }
  };

  // Demo data generator - remove when integrating with actual API
  const generateDemoData = (): SchedulingResult => {
    const selectedTrains: TrainData[] = Array.from({ length: 24 }, (_, i) => ({
      trainset_id: i + 1,
      number: `KMRL-${String(i + 1).padStart(3, '0')}`,
      status: 'ready',
      assigned_bay_id: i + 1,
      scheduling_score: Math.random() * 100 + 50,
      selection_reason: [
        'Optimal combination of all criteria',
        'Urgent branding requirements',
        'High mileage balance priority',
        'Long-term fitness validity'
      ][Math.floor(Math.random() * 4)],
      make_model: ['Hyundai Rotem', 'Alstom', 'BEML'][Math.floor(Math.random() * 3)],
      year_commissioned: 2015 + Math.floor(Math.random() * 8),
      home_depot: ['Depot A', 'Depot B'][Math.floor(Math.random() * 2)],
    })).sort((a, b) => b.scheduling_score - a.scheduling_score);

    const remainingTrains: TrainData[] = Array.from({ length: 20 }, (_, i) => ({
      trainset_id: i + 25,
      number: `KMRL-${String(i + 25).padStart(3, '0')}`,
      status: ['standby', 'maintenance'][Math.floor(Math.random() * 2)],
      scheduling_score: Math.random() * 50,
      exclusion_reason: [
        'Expired or missing fitness certificates',
        'Open high-priority maintenance jobs',
        'Currently undergoing cleaning/maintenance',
        'Lower optimization score'
      ][Math.floor(Math.random() * 4)],
      make_model: ['Hyundai Rotem', 'Alstom', 'BEML'][Math.floor(Math.random() * 3)],
      year_commissioned: 2015 + Math.floor(Math.random() * 8),
      home_depot: ['Depot A', 'Depot B'][Math.floor(Math.random() * 2)],
    })).sort((a, b) => b.scheduling_score - a.scheduling_score);

    return {
      selected_trains: selectedTrains,
      remaining_trains: remainingTrains,
      optimization_score: 1847.5,
      solution_status: 'OPTIMAL',
      constraint_violations: [],
      execution_time: 2.34,
      scheduling_date: new Date().toISOString(),
    };
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

  const TrainCard: React.FC<{ train: TrainData; isSelected: boolean; onClick: () => void }> = ({ 
    train, 
    isSelected, 
    onClick 
  }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        isSelected ? "border-green-500 bg-green-50" : "hover:border-blue-300"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Train className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-sm">{train.number}</h3>
          </div>
          {getStatusBadge(train.status, isSelected)}
        </div>
        
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Score:</span>
            <Progress value={train.scheduling_score} className="flex-1 h-2" />
            <span className="font-mono">{train.scheduling_score.toFixed(1)}</span>
          </div>
          
          {isSelected && train.assigned_bay_id && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Bay {train.assigned_bay_id}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <span className="font-medium">{train.make_model}</span>
            <span>({train.year_commissioned})</span>
          </div>
        </div>
        
        {isSelected && train.selection_reason && (
          <div className="mt-3 p-2 bg-green-100 rounded text-xs">
            <strong>Selected:</strong> {train.selection_reason}
          </div>
        )}
        
        {!isSelected && train.exclusion_reason && (
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
            <strong>Not selected:</strong> {train.exclusion_reason}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const exportSchedule = () => {
    if (!schedulingResult) return;
    
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
        doc.text(`Generated on ${new Date().toLocaleString()} | KMRL Train Scheduling System`, 20, 290);
        doc.text(`Official Document - Confidential`, 150, 290);
      }
    };
    
    // Page 1: Cover Page
    addHeader(1);
    
    // Main title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('TRAIN SCHEDULING', 20, 50);
    doc.text('OPTIMIZATION REPORT', 20, 62);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text('Google OR-Tools Powered Optimization', 20, 80);
    doc.text('Intelligent Fleet Management System', 20, 90);
    
    // Schedule details box
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
    doc.text(`Schedule Date: ${schedulingResult.scheduling_date}`, 30, 140);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 30, 150);
    doc.text(`Optimization Score: ${schedulingResult.optimization_score.toFixed(2)}`, 30, 160);
    doc.text(`Execution Time: ${schedulingResult.execution_time.toFixed(2)} seconds`, 30, 170);
    
    // Fleet status summary
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
    doc.text(`✓ Selected Trains: ${schedulingResult.selected_trains.length}/24`, 30, 218);
    doc.text(`✓ Remaining Trains: ${schedulingResult.remaining_trains.length}`, 30, 228);
    doc.text(`✓ Solution Status: ${schedulingResult.solution_status}`, 30, 238);
    
    // Page 2: Detailed Schedule Table
    doc.addPage();
    addHeader(2);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text('SELECTED TRAINS SCHEDULE', 20, 45);
    
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
    schedulingResult.selected_trains.forEach((train, index) => {
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
    
    // Page 3: Remaining Trains (if any)
    if (schedulingResult.remaining_trains.length > 0) {
      doc.addPage();
      addHeader(3);
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 51, 102);
      doc.text('REMAINING TRAINS', 20, 45);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Remaining Trains: ${schedulingResult.remaining_trains.length}`, 20, 60);
      doc.text('These trains are available for backup operations, maintenance, or future scheduling:', 20, 75);
      
      // Top remaining trains
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOP 10 REMAINING TRAINS (Ranked by Optimization Score):', 20, 95);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let remainingY = 110;
      schedulingResult.remaining_trains.slice(0, 10).forEach((train, index) => {
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
    
    // Add footer to all pages
    addFooter();
    
    // Save the PDF with official naming
    const reportDate = new Date().toISOString().split('T')[0];
    doc.save(`KMRL_Train_Schedule_Report_${schedulingResult.scheduling_date}_${reportDate}.pdf`);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Train Scheduling</h1>
          <p className="text-muted-foreground">
            AI-powered optimization for optimal train deployment
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runOptimization} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Optimizing...' : 'Run Optimization'}
          </Button>
          {schedulingResult && (
            <Button variant="outline" onClick={exportSchedule}>
              <Download className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
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
                  <p className="text-2xl font-bold">{schedulingResult.selected_trains.length}</p>
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Train Lists */}
      {schedulingResult && (
        <Tabs defaultValue="scheduled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Scheduled Trains ({schedulingResult.selected_trains.length})
            </TabsTrigger>
            <TabsTrigger value="remaining" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              For Review ({schedulingResult.remaining_trains.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  Optimally Selected Trains
                </CardTitle>
                <CardDescription>
                  These 24 trains have been selected based on fitness certificates, job cards, 
                  branding priorities, mileage balancing, cleaning status, and stabling geometry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedulingResult.selected_trains.map((train) => (
                    <TrainCard
                      key={train.trainset_id}
                      train={train}
                      isSelected={true}
                      onClick={() => setSelectedTrain(train)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="remaining" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  Trains for Supervisor Review
                </CardTitle>
                <CardDescription>
                  These trains were not selected in the optimization but are available for 
                  supervisor review and manual assignment if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schedulingResult.remaining_trains.map((train) => (
                    <TrainCard
                      key={train.trainset_id}
                      train={train}
                      isSelected={false}
                      onClick={() => setSelectedTrain(train)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Running Optimization</h3>
            <p className="text-muted-foreground">
              Analyzing {" "}
              <span className="font-mono">fitness certificates, job cards, branding priorities, 
              mileage balancing, cleaning slots, and stabling geometry</span>
            </p>
          </div>
        </div>
      )}

      {/* Initial State */}
      {!schedulingResult && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Train className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ready to Optimize</h3>
            <p className="text-muted-foreground mb-4">
              Click "Run Optimization" to select the best 24 trains based on all criteria
            </p>
            <Button onClick={runOptimization} size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Start Optimization
            </Button>
          </CardContent>
        </Card>
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
  );
};

export default TrainSchedulingPanel;