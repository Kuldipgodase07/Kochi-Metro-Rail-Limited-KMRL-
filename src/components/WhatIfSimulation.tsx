import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface SimulationResult {
  scenario: any;
  schedule: any;
  impact_analysis: {
    trainsets_affected: number;
    performance_impact: string;
    recommendations: string[];
  };
}

const WhatIfSimulation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [scenario, setScenario] = useState({
    targetDate: new Date().toISOString().split('T')[0],
    constraints: {
      requiredTrainsets: 20,
      maxStandby: 5,
      maxMaintenance: 3
    },
    modifications: {
      fitnessCertificates: {
        expired: 0,
        expiring: 0
      },
      maintenanceJobs: {
        critical: 0,
        high: 0
      },
      brandingCampaigns: {
        active: 0,
        priority: 'normal'
      },
      cleaningSlots: {
        available: 0,
        delayed: 0
      }
    }
  });

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scheduling/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario)
      });

      if (!response.ok) {
        throw new Error('Failed to run simulation');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'moderate': return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      case 'low': return <TrendingUp className="h-4 w-4 text-green-600" />;
      default: return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">What-If Simulation</h1>
          <p className="text-gray-600">Test different scenarios and their impact on scheduling</p>
        </div>
        <Button
          onClick={runSimulation}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {loading ? 'Running...' : 'Run Simulation'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={scenario.targetDate}
                onChange={(e) => setScenario({
                  ...scenario,
                  targetDate: e.target.value
                })}
              />
            </div>

            <div>
              <h4 className="font-medium mb-3">Constraints</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="requiredTrainsets">Required</Label>
                  <Input
                    id="requiredTrainsets"
                    type="number"
                    min="15"
                    max="25"
                    value={scenario.constraints.requiredTrainsets}
                    onChange={(e) => setScenario({
                      ...scenario,
                      constraints: {
                        ...scenario.constraints,
                        requiredTrainsets: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxStandby">Standby</Label>
                  <Input
                    id="maxStandby"
                    type="number"
                    min="3"
                    max="8"
                    value={scenario.constraints.maxStandby}
                    onChange={(e) => setScenario({
                      ...scenario,
                      constraints: {
                        ...scenario.constraints,
                        maxStandby: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="maxMaintenance">Maintenance</Label>
                  <Input
                    id="maxMaintenance"
                    type="number"
                    min="1"
                    max="5"
                    value={scenario.constraints.maxMaintenance}
                    onChange={(e) => setScenario({
                      ...scenario,
                      constraints: {
                        ...scenario.constraints,
                        maxMaintenance: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Modifications</h4>
              <div className="space-y-4">
                <div>
                  <Label>Fitness Certificates</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Expired"
                      value={scenario.modifications.fitnessCertificates.expired}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          fitnessCertificates: {
                            ...scenario.modifications.fitnessCertificates,
                            expired: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="Expiring"
                      value={scenario.modifications.fitnessCertificates.expiring}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          fitnessCertificates: {
                            ...scenario.modifications.fitnessCertificates,
                            expiring: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Maintenance Jobs</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Critical"
                      value={scenario.modifications.maintenanceJobs.critical}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          maintenanceJobs: {
                            ...scenario.modifications.maintenanceJobs,
                            critical: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <Input
                      type="number"
                      placeholder="High Priority"
                      value={scenario.modifications.maintenanceJobs.high}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          maintenanceJobs: {
                            ...scenario.modifications.maintenanceJobs,
                            high: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Branding Campaigns</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="Active Campaigns"
                      value={scenario.modifications.brandingCampaigns.active}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          brandingCampaigns: {
                            ...scenario.modifications.brandingCampaigns,
                            active: parseInt(e.target.value)
                          }
                        }
                      })}
                    />
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md"
                      value={scenario.modifications.brandingCampaigns.priority}
                      onChange={(e) => setScenario({
                        ...scenario,
                        modifications: {
                          ...scenario.modifications,
                          brandingCampaigns: {
                            ...scenario.modifications.brandingCampaigns,
                            priority: e.target.value
                          }
                        }
                      })}
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Simulation Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Trainsets Affected</p>
                      <p className="text-2xl font-bold">{result.impact_analysis.trainsets_affected}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Performance Impact</p>
                      <div className="flex items-center space-x-2">
                        {getImpactIcon(result.impact_analysis.performance_impact)}
                        <span className={`font-bold ${getImpactColor(result.impact_analysis.performance_impact)}`}>
                          {result.impact_analysis.performance_impact}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {result.impact_analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.schedule && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {result.schedule.schedule?.induction_list?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Induction</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {result.schedule.schedule?.standby_list?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Standby</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {result.schedule.schedule?.maintenance_list?.length || 0}
                        </p>
                        <p className="text-sm text-gray-600">Maintenance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulation;
