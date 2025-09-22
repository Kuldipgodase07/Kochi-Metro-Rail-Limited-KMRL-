import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RotateCcw, 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Target,
  BarChart3,
  Settings,
  Save
} from 'lucide-react';

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  changes: {
    trainsetChanges: Array<{
      trainset: string;
      from: string;
      to: string;
      reason: string;
    }>;
    routeChanges: Array<{
      route: string;
      change: string;
      impact: string;
    }>;
  };
  results: {
    serviceReliability: number;
    operationalCost: number;
    passengerImpact: number;
    maintenanceCost: number;
    brandingExposure: number;
    overallScore: number;
  };
  comparison: {
    serviceReliability: number;
    operationalCost: number;
    passengerImpact: number;
    maintenanceCost: number;
    brandingExposure: number;
  };
}

const mockScenarios: SimulationScenario[] = [
  {
    id: '1',
    name: 'Emergency Maintenance - KMRL-001',
    description: 'Simulate impact of taking KMRL-001 out of service for emergency brake repair',
    changes: {
      trainsetChanges: [
        {
          trainset: 'KMRL-001',
          from: 'Aluva-Pettah Route',
          to: 'Emergency Maintenance',
          reason: 'Brake system malfunction detected'
        },
        {
          trainset: 'KMRL-009',
          from: 'Standby',
          to: 'Aluva-Pettah Route',
          reason: 'Replacement for KMRL-001'
        }
      ],
      routeChanges: [
        {
          route: 'Aluva-Pettah',
          change: 'Reduced frequency: 8 min → 12 min',
          impact: 'Service reliability decreased'
        }
      ]
    },
    results: {
      serviceReliability: 78,
      operationalCost: 115,
      passengerImpact: 85,
      maintenanceCost: 140,
      brandingExposure: 92,
      overallScore: 82
    },
    comparison: {
      serviceReliability: -15,
      operationalCost: +15,
      passengerImpact: -8,
      maintenanceCost: +40,
      brandingExposure: -3
    }
  },
  {
    id: '2',
    name: 'Peak Hour Optimization',
    description: 'Test adding extra trainset during morning rush hour (7-9 AM)',
    changes: {
      trainsetChanges: [
        {
          trainset: 'KMRL-015',
          from: 'Standby',
          to: 'Edapally-Thykoodam Route',
          reason: 'Peak hour demand management'
        }
      ],
      routeChanges: [
        {
          route: 'Edapally-Thykoodam',
          change: 'Increased frequency: 10 min → 6 min',
          impact: 'Improved passenger flow'
        }
      ]
    },
    results: {
      serviceReliability: 96,
      operationalCost: 108,
      passengerImpact: 94,
      maintenanceCost: 98,
      brandingExposure: 105,
      overallScore: 95
    },
    comparison: {
      serviceReliability: +3,
      operationalCost: +8,
      passengerImpact: +12,
      maintenanceCost: -2,
      brandingExposure: +8
    }
  }
];

const WhatiIfSimulation: React.FC = () => {
  const [scenarios] = useState<SimulationScenario[]>(mockScenarios);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario | null>(null);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');

  const runSimulation = (scenario: SimulationScenario) => {
    setIsRunningSimulation(true);
    setActiveScenario(scenario);
    
    // Simulate processing time
    setTimeout(() => {
      setIsRunningSimulation(false);
    }, 2000);
  };

  const createNewScenario = () => {
    if (newScenarioName.trim()) {
      // In real implementation, this would open a scenario builder
      console.log('Creating new scenario:', newScenarioName);
      setNewScenarioName('');
    }
  };

  const getChangeIndicator = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (value < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const baselineMetrics = {
    serviceReliability: 93,
    operationalCost: 100,
    passengerImpact: 82,
    maintenanceCost: 100,
    brandingExposure: 95,
    overallScore: 90
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">What-If Simulation Center</h1>
          <p className="text-gray-600">Test operational scenarios and predict their impact on KPIs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Parameters
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
        </div>
      </div>

      {/* Current Baseline Metrics */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Current Baseline Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Service Reliability</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{baselineMetrics.serviceReliability}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Operational Cost</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{baselineMetrics.operationalCost}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Passenger Satisfaction</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{baselineMetrics.passengerImpact}%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Maintenance Cost</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{baselineMetrics.maintenanceCost}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Overall Score</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{baselineMetrics.overallScore}/100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Scenario */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter scenario name..."
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createNewScenario}>
              <Settings className="w-4 h-4 mr-2" />
              Build Scenario
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Predefined Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Scenario</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Changes Summary */}
              <div>
                <h4 className="font-medium mb-2">Planned Changes</h4>
                <div className="space-y-2">
                  {scenario.changes.trainsetChanges.map((change, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium">{change.trainset}: {change.from} → {change.to}</p>
                      <p className="text-gray-600">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Impact Preview */}
              <div>
                <h4 className="font-medium mb-2">Expected Impact</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Service Reliability:</span>
                    <div className="flex items-center gap-1">
                      {getChangeIndicator(scenario.comparison.serviceReliability)}
                      <span className={`text-sm font-medium ${getChangeColor(scenario.comparison.serviceReliability)}`}>
                        {scenario.comparison.serviceReliability > 0 ? '+' : ''}{scenario.comparison.serviceReliability}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Operational Cost:</span>
                    <div className="flex items-center gap-1">
                      {getChangeIndicator(scenario.comparison.operationalCost)}
                      <span className={`text-sm font-medium ${getChangeColor(scenario.comparison.operationalCost)}`}>
                        {scenario.comparison.operationalCost > 0 ? '+' : ''}{scenario.comparison.operationalCost}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => runSimulation(scenario)}
                disabled={isRunningSimulation}
                className="w-full"
              >
                {isRunningSimulation ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simulation Results */}
      {activeScenario && !isRunningSimulation && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results: {activeScenario.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Overall Impact Score</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {activeScenario.results.overallScore}/100
                  </div>
                  <Progress value={activeScenario.results.overallScore} className="w-48 h-3 mx-auto" />
                </div>

                {/* Metrics Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Service Reliability</span>
                      {getChangeIndicator(activeScenario.comparison.serviceReliability)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{activeScenario.results.serviceReliability}%</span>
                      <span className={`text-sm ${getChangeColor(activeScenario.comparison.serviceReliability)}`}>
                        {activeScenario.comparison.serviceReliability > 0 ? '+' : ''}{activeScenario.comparison.serviceReliability}%
                      </span>
                    </div>
                    <Progress value={activeScenario.results.serviceReliability} className="mt-2 h-2" />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Operational Cost</span>
                      {getChangeIndicator(activeScenario.comparison.operationalCost)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{activeScenario.results.operationalCost}</span>
                      <span className={`text-sm ${getChangeColor(activeScenario.comparison.operationalCost)}`}>
                        {activeScenario.comparison.operationalCost > 0 ? '+' : ''}{activeScenario.comparison.operationalCost}
                      </span>
                    </div>
                    <Progress value={Math.min(activeScenario.results.operationalCost, 100)} className="mt-2 h-2" />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Passenger Impact</span>
                      {getChangeIndicator(activeScenario.comparison.passengerImpact)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{activeScenario.results.passengerImpact}%</span>
                      <span className={`text-sm ${getChangeColor(activeScenario.comparison.passengerImpact)}`}>
                        {activeScenario.comparison.passengerImpact > 0 ? '+' : ''}{activeScenario.comparison.passengerImpact}%
                      </span>
                    </div>
                    <Progress value={activeScenario.results.passengerImpact} className="mt-2 h-2" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-4">
                <h3 className="font-semibold">Detailed Impact Analysis</h3>
                
                {/* Trainset Changes Impact */}
                <div>
                  <h4 className="font-medium mb-3">Trainset Reassignments</h4>
                  <div className="space-y-3">
                    {activeScenario.changes.trainsetChanges.map((change, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{change.trainset}</span>
                          <Badge variant="outline">Reassigned</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{change.reason}</p>
                        <div className="text-sm">
                          <span className="text-red-600">From:</span> {change.from} →{' '}
                          <span className="text-green-600">To:</span> {change.to}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Route Changes Impact */}
                <div>
                  <h4 className="font-medium mb-3">Route Modifications</h4>
                  <div className="space-y-3">
                    {activeScenario.changes.routeChanges.map((change, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{change.route}</span>
                          <Badge variant="outline">Modified</Badge>
                        </div>
                        <p className="text-sm mb-1">{change.change}</p>
                        <p className="text-sm text-gray-600">{change.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <h3 className="font-semibold">AI Recommendations</h3>
                
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-100 rounded-full">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">Implement Scenario</p>
                        <p className="text-sm text-green-700">
                          The simulation shows positive overall impact with manageable risks.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-yellow-100 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-800">Monitor Service Reliability</p>
                        <p className="text-sm text-yellow-700">
                          Keep close watch on service metrics during implementation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">Prepare Contingency Plans</p>
                        <p className="text-sm text-blue-700">
                          Have backup trainsets ready in case of additional failures.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WhatiIfSimulation;