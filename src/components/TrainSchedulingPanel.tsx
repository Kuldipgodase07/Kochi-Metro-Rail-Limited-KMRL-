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
    
    const data = {
      scheduling_date: schedulingResult.scheduling_date,
      selected_trains: schedulingResult.selected_trains,
      optimization_score: schedulingResult.optimization_score,
      execution_time: schedulingResult.execution_time,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `train_schedule_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              Export Schedule
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