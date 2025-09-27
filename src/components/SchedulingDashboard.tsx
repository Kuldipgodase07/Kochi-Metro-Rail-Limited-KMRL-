import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Train, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  BarChart3,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

interface Trainset {
  trainset_id: number;
  rake_number: string;
  score: number;
  reasoning: string[];
  scores?: {
    fitness: number;
    maintenance: number;
    branding: number;
    mileage: number;
    cleaning: number;
    stabling: number;
  };
}

interface Schedule {
  date: string;
  status: string;
  schedule: {
    induction_list: Trainset[];
    standby_list: Trainset[];
    maintenance_list: Trainset[];
    summary: {
      total_available: number;
      total_required: number;
      total_standby: number;
      total_maintenance: number;
      coverage: number;
    };
  };
  reasoning: {
    optimization_summary: string;
    key_factors: string[];
    recommendations: string[];
    alerts: string[];
  };
  metadata: {
    total_trainsets: number;
    available_trainsets: number;
    standby_trainsets: number;
    maintenance_trainsets: number;
  };
}

interface Constraints {
  requiredTrainsets: number;
  maxStandby: number;
  maxMaintenance: number;
}

const SchedulingDashboard: React.FC = () => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [constraints, setConstraints] = useState<Constraints>({
    requiredTrainsets: 20,
    maxStandby: 5,
    maxMaintenance: 3
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Generate schedule
  const generateSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scheduling/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetDate,
          constraints
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const data = await response.json();
      setSchedule(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Get existing schedule
  const getSchedule = async (date: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scheduling/${date}`);
      
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.data);
      } else {
        setSchedule(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Load schedule on date change
  useEffect(() => {
    if (targetDate) {
      getSchedule(targetDate);
    }
  }, [targetDate]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Train Scheduling Dashboard</h1>
          <p className="text-gray-600">Optimize daily train induction planning</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={generateSchedule}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Generate Schedule'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Schedule Parameters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="requiredTrainsets">Required Trainsets</Label>
              <Input
                id="requiredTrainsets"
                type="number"
                min="15"
                max="25"
                value={constraints.requiredTrainsets}
                onChange={(e) => setConstraints({
                  ...constraints,
                  requiredTrainsets: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxStandby">Max Standby</Label>
              <Input
                id="maxStandby"
                type="number"
                min="3"
                max="8"
                value={constraints.maxStandby}
                onChange={(e) => setConstraints({
                  ...constraints,
                  maxStandby: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <Label htmlFor="maxMaintenance">Max Maintenance</Label>
              <Input
                id="maxMaintenance"
                type="number"
                min="1"
                max="5"
                value={constraints.maxMaintenance}
                onChange={(e) => setConstraints({
                  ...constraints,
                  maxMaintenance: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {schedule && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="induction">Induction List</TabsTrigger>
            <TabsTrigger value="standby">Standby</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Train className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Induction</p>
                      <p className="text-2xl font-bold">{schedule.schedule.induction_list.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Standby</p>
                      <p className="text-2xl font-bold">{schedule.schedule.standby_list.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Maintenance</p>
                      <p className="text-2xl font-bold">{schedule.schedule.maintenance_list.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Coverage</p>
                      <p className="text-2xl font-bold">{schedule.schedule.summary.coverage}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations & Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Factors:</h4>
                  <div className="flex flex-wrap gap-2">
                    {schedule.reasoning.key_factors.map((factor, index) => (
                      <Badge key={index} variant="outline">{factor}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {schedule.reasoning.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
                {schedule.reasoning.alerts.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Alerts:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {schedule.reasoning.alerts.map((alert, index) => (
                        <li key={index} className="text-sm text-red-600">{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="induction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Induction List ({schedule.schedule.induction_list.length} trainsets)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.schedule.induction_list.map((trainset, index) => (
                    <div key={trainset.trainset_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">#{index + 1}</span>
                          <span className="font-bold">{trainset.rake_number}</span>
                          <span className="text-sm text-gray-600">ID: {trainset.trainset_id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${getScoreColor(trainset.score)}`}>
                            {trainset.score.toFixed(1)}
                          </span>
                          {getScoreBadge(trainset.score)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Reasoning:</strong> {trainset.reasoning.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standby" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span>Standby List ({schedule.schedule.standby_list.length} trainsets)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.schedule.standby_list.map((trainset, index) => (
                    <div key={trainset.trainset_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">#{index + 1}</span>
                          <span className="font-bold">{trainset.rake_number}</span>
                          <span className="text-sm text-gray-600">ID: {trainset.trainset_id}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${getScoreColor(trainset.score)}`}>
                            {trainset.score.toFixed(1)}
                          </span>
                          {getScoreBadge(trainset.score)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Reasoning:</strong> {trainset.reasoning.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Maintenance List ({schedule.schedule.maintenance_list.length} trainsets)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.schedule.maintenance_list.map((trainset, index) => (
                    <div key={trainset.trainset_id} className="border rounded-lg p-4 border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">#{index + 1}</span>
                          <span className="font-bold">{trainset.rake_number}</span>
                          <span className="text-sm text-gray-600">ID: {trainset.trainset_id}</span>
                        </div>
                        <Badge className="bg-red-100 text-red-800">Maintenance Required</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Issues:</strong> {trainset.issues.join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SchedulingDashboard;
