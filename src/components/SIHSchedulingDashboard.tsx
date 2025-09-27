import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Target,
  Shield,
  Zap,
  TrendingUp,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

interface SIHTrain {
  trainset_id: number;
  rake_number: string;
  status: string;
  make_model: string;
  year_commissioned: number;
  home_depot: string;
  scheduling_score: number;
  sih_compliance: {
    fitness_certificates_valid: boolean;
    no_emergency_jobs: boolean;
    not_in_maintenance: boolean;
    branding_priority: string;
    mileage_balanced: boolean;
    bay_available: boolean;
    overall_compliance: number;
  };
  selection_reason: string;
  fitness_status: Record<string, string>;
  active_jobs: number;
  branding_priority: string;
  total_mileage: number;
  bay_available: boolean;
}

interface SIHCompliance {
  total_trains: number;
  depot_distribution: {
    depot_a: number;
    depot_b: number;
    balance_ratio: number;
  };
  age_distribution: {
    new_trains: number;
    new_train_ratio: number;
  };
  manufacturer_distribution: Record<string, number>;
  branding_priorities: {
    critical_campaigns: number;
    critical_ratio: number;
  };
  bay_availability: {
    available_bays: number;
    availability_ratio: number;
  };
}

interface SIHOptimizationResult {
  selected_trains: SIHTrain[];
  remaining_trains: SIHTrain[];
  sih_compliance: SIHCompliance;
  optimization_score: number;
  solution_status: string;
  execution_time: number;
  scheduling_date: string;
  constraint_violations: string[];
  solver_stats: {
    total_constraints: number;
    total_variables: number;
    objective_value: number;
  };
}

const SIHSchedulingDashboard: React.FC = () => {
  const [optimizationResult, setOptimizationResult] = useState<SIHOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const runSIHOptimization = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8001/api/train-scheduling/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_date: targetDate,
          num_trains: 24
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setOptimizationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_service': return 'bg-green-100 text-green-800';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
      case 'IBL_maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 0.9) return 'text-green-600';
    if (compliance >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">SIH-Compliant Train Scheduling</h1>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced OR-Tools optimization with Statement of Intent (SIH) compliance requirements
          </p>
        </div>

        {/* SIH Requirements Overview */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>SIH Requirements Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">1. Fitness Certificates</h4>
                <p className="text-xs text-gray-600">Validity windows from Rolling-Stock, Signalling & Telecom departments</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">2. Job-Card Status</h4>
                <p className="text-xs text-gray-600">Open vs. closed work orders from IBM Maximo</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">3. Branding Priorities</h4>
                <p className="text-xs text-gray-600">Contractual commitments for exterior wrap exposure hours</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">4. Mileage Balancing</h4>
                <p className="text-xs text-gray-600">Kilometre allocation for equal bogie, brake-pad & HVAC wear</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">5. Cleaning & Detailing</h4>
                <p className="text-xs text-gray-600">Available manpower and bay occupancy for interior deep-cleaning</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">6. Stabling Geometry</h4>
                <p className="text-xs text-gray-600">Physical bay positions to minimise shunting and turn-out time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Optimization Control Panel</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <Button
                onClick={runSIHOptimization}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run SIH Optimization
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {optimizationResult && (
          <div className="space-y-6">
            {/* Optimization Summary */}
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>SIH Optimization Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {optimizationResult.selected_trains.length}
                    </div>
                    <div className="text-sm text-gray-600">Trains Selected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizationResult.optimization_score}
                    </div>
                    <div className="text-sm text-gray-600">Avg. SIH Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {optimizationResult.execution_time}s
                    </div>
                    <div className="text-sm text-gray-600">Execution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {optimizationResult.solver_stats.total_constraints}
                    </div>
                    <div className="text-sm text-gray-600">Constraints</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SIH Compliance Metrics */}
            {optimizationResult.sih_compliance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>SIH Compliance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="depot" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="depot">Depot Balance</TabsTrigger>
                      <TabsTrigger value="age">Age Diversity</TabsTrigger>
                      <TabsTrigger value="branding">Branding</TabsTrigger>
                      <TabsTrigger value="bays">Bay Availability</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="depot" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {optimizationResult.sih_compliance.depot_distribution.depot_a}
                          </div>
                          <div className="text-sm text-gray-600">Depot A</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {optimizationResult.sih_compliance.depot_distribution.depot_b}
                          </div>
                          <div className="text-sm text-gray-600">Depot B</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Balance Ratio</div>
                        <div className="text-lg font-semibold text-purple-600">
                          {optimizationResult.sih_compliance.depot_distribution.balance_ratio}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="age" className="space-y-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {optimizationResult.sih_compliance.age_distribution.new_trains}
                        </div>
                        <div className="text-sm text-gray-600">New Trains (≤5 years)</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Ratio: {optimizationResult.sih_compliance.age_distribution.new_train_ratio}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="branding" className="space-y-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {optimizationResult.sih_compliance.branding_priorities.critical_campaigns}
                        </div>
                        <div className="text-sm text-gray-600">Critical Campaigns</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Ratio: {optimizationResult.sih_compliance.branding_priorities.critical_ratio}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bays" className="space-y-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {optimizationResult.sih_compliance.bay_availability.available_bays}
                        </div>
                        <div className="text-sm text-gray-600">Available Bays</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Ratio: {optimizationResult.sih_compliance.bay_availability.availability_ratio}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Constraint Violations */}
            {optimizationResult.constraint_violations.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="font-semibold mb-2">Constraint Violations:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {optimizationResult.constraint_violations.map((violation, index) => (
                      <li key={index} className="text-sm">{violation}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Selected Trains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Selected Trains ({optimizationResult.selected_trains.length})</span>
                  </span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    SIH Compliant
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationResult.selected_trains.map((train) => (
                    <div key={train.trainset_id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {train.rake_number}
                          </div>
                          <Badge className={getStatusColor(train.status)}>
                            {train.status}
                          </Badge>
                          <Badge className={getPriorityColor(train.branding_priority)}>
                            {train.branding_priority}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {train.scheduling_score}
                          </div>
                          <div className="text-xs text-gray-500">SIH Score</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">Make/Model</div>
                          <div className="text-gray-600">{train.make_model}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Year</div>
                          <div className="text-gray-600">{train.year_commissioned}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Depot</div>
                          <div className="text-gray-600">{train.home_depot}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Mileage</div>
                          <div className="text-gray-600">{train.total_mileage.toLocaleString()} km</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${train.sih_compliance.fitness_certificates_valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>Fitness Certificates</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${train.sih_compliance.no_emergency_jobs ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>No Emergency Jobs</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${train.sih_compliance.bay_available ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <span>Bay Available</span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Overall SIH Compliance</div>
                        <Progress 
                          value={train.sih_compliance.overall_compliance * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(train.sih_compliance.overall_compliance * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Remaining Trains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span>Remaining Trains ({optimizationResult.remaining_trains.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationResult.remaining_trains.slice(0, 10).map((train) => (
                    <div key={train.trainset_id} className="border border-gray-200 bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium text-gray-900">{train.rake_number}</div>
                          <Badge className={getStatusColor(train.status)}>
                            {train.status}
                          </Badge>
                          <div className="text-sm text-gray-600">{train.make_model}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-600">
                            {train.scheduling_score}
                          </div>
                          <div className="text-xs text-gray-500">Score</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {train.exclusion_reason}
                      </div>
                    </div>
                  ))}
                  {optimizationResult.remaining_trains.length > 10 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      ... and {optimizationResult.remaining_trains.length - 10} more trains
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SIHSchedulingDashboard;
