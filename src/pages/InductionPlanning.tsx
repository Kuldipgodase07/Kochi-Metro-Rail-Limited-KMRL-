import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Info,
  Target,
  Zap,
  Shield
} from 'lucide-react';

interface InductionRecommendation {
  trainsetNumber: string;
  rank: number;
  score: number;
  status: 'recommended' | 'caution' | 'not-recommended';
  route: string;
  scheduledTime: string;
  factors: {
    availability: number;
    maintenance: number;
    fitness: number;
    branding: number;
    cleaning: number;
    priority: number;
  };
  conflicts: string[];
  reasoning: string[];
  alternatives: string[];
}

const mockRecommendations: InductionRecommendation[] = [
  {
    trainsetNumber: 'KMRL-001',
    rank: 1,
    score: 95,
    status: 'recommended',
    route: 'Aluva - Pettah',
    scheduledTime: '05:30 AM',
    factors: {
      availability: 98,
      maintenance: 95,
      fitness: 100,
      branding: 90,
      cleaning: 100,
      priority: 95
    },
    conflicts: [],
    reasoning: [
      'Highest availability score (98%)',
      'Recently completed maintenance',
      'All certificates valid until 2025',
      'Premium branding exposure opportunity'
    ],
    alternatives: ['KMRL-003', 'KMRL-007']
  },
  {
    trainsetNumber: 'KMRL-009',
    rank: 2,
    score: 88,
    status: 'recommended',
    route: 'Kalamassery - Maharajas',
    scheduledTime: '05:45 AM',
    factors: {
      availability: 95,
      maintenance: 85,
      fitness: 95,
      branding: 80,
      cleaning: 95,
      priority: 85
    },
    conflicts: ['Minor cleaning schedule overlap'],
    reasoning: [
      'Good availability and performance metrics',
      'Optimal for medium-priority routes',
      'Cost-effective operation expected'
    ],
    alternatives: ['KMRL-011', 'KMRL-015']
  },
  {
    trainsetNumber: 'KMRL-005',
    rank: 3,
    score: 72,
    status: 'caution',
    route: 'Edapally - Thykoodam',
    scheduledTime: '06:00 AM',
    factors: {
      availability: 85,
      maintenance: 60,
      fitness: 85,
      branding: 70,
      cleaning: 65,
      priority: 75
    },
    conflicts: ['3 open job cards', 'Cleaning overdue'],
    reasoning: [
      'Acceptable for low-demand routes',
      'Requires monitoring during service',
      'Should complete pending maintenance soon'
    ],
    alternatives: ['KMRL-017', 'KMRL-019']
  },
  {
    trainsetNumber: 'KMRL-013',
    rank: 4,
    score: 45,
    status: 'not-recommended',
    route: 'Not Assigned',
    scheduledTime: 'IBL',
    factors: {
      availability: 70,
      maintenance: 30,
      fitness: 60,
      branding: 40,
      cleaning: 35,
      priority: 45
    },
    conflicts: ['5 critical job cards', 'Fitness certificate expiring', 'Cleaning overdue'],
    reasoning: [
      'Currently under intensive maintenance',
      'Multiple safety-critical issues',
      'Should remain in IBL until resolved'
    ],
    alternatives: ['KMRL-021', 'KMRL-023']
  }
];

const InductionPlanning: React.FC = () => {
  const [recommendations, setRecommendations] = useState<InductionRecommendation[]>(mockRecommendations);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTrainset, setFeedbackTrainset] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState({ actual_status: '', punctuality: '', incidents: '', notes: '' });
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [selectedTrainset, setSelectedTrainset] = useState<InductionRecommendation | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showSimulation, setShowSimulation] = useState(false);
  const [scenarioOverrides, setScenarioOverrides] = useState<any>({});
  const [loadingSim, setLoadingSim] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  const getStatusBadge = (status: string, score: number) => {
    const statusConfig = {
      'recommended': { color: 'bg-green-500', text: 'Recommended' },
      'caution': { color: 'bg-yellow-500', text: 'Caution' },
      'not-recommended': { color: 'bg-red-500', text: 'Not Recommended' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <div className="flex items-center gap-2">
        <Badge className={`${config.color} text-white`}>{config.text}</Badge>
        <span className="text-sm font-medium">{score}/100</span>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const refreshRecommendations = () => {
    setLastUpdated(new Date());
    // In real implementation, this would trigger AI model re-evaluation
  };

  const generateSchedule = async () => {
    setLoadingSchedule(true);
    try {
      // Call the AI schedule generation API
      const response = await fetch('http://localhost:5000/api/data/ai-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          preferences: {
            prioritize_availability: true,
            minimize_conflicts: true,
            optimize_branding: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate schedule');
      }

      const result = await response.json();
      console.log('Schedule generated successfully:', result);
      
      // Update recommendations with new data
      if (result.recommendations) {
        setRecommendations(result.recommendations);
      }
      
      // Show success message
      alert('Schedule generated successfully!');
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Please try again.');
    } finally {
      setLoadingSchedule(false);
    }
  };

  // What-if simulation handler
  const runSimulation = async () => {
    setLoadingSim(true);
    try {
      const res = await fetch('/api/optimizer/induction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioOverrides })
      });
      const data = await res.json();
      // Map backend results to frontend format if needed
      setRecommendations(data.results.map((r: any, idx: number) => ({
        trainsetNumber: r.trainset_number,
        rank: idx + 1,
        score: r.priority_score * 10,
        status: r.recommended_status === 'ready' ? 'recommended' : (r.recommended_status === 'maintenance' ? 'caution' : 'not-recommended'),
        route: 'Simulated',
        scheduledTime: 'Simulated',
        factors: {
          availability: r.availability,
          maintenance: 80,
          fitness: 80,
          branding: 80,
          cleaning: 80,
          priority: r.priority_score * 10
        },
        conflicts: r.conflicts,
        reasoning: r.reasoning,
        alternatives: []
      })));
      setLastUpdated(new Date());
      setShowSimulation(false);
    } catch (err) {
      alert('Simulation failed');
    }
    setLoadingSim(false);
  };

  const overallMetrics = {
    totalRecommended: recommendations.filter(r => r.status === 'recommended').length,
    totalCaution: recommendations.filter(r => r.status === 'caution').length,
    totalNotRecommended: recommendations.filter(r => r.status === 'not-recommended').length,
    averageScore: Math.round(recommendations.reduce((acc, r) => acc + r.score, 0) / recommendations.length),
    totalConflicts: recommendations.reduce((acc, r) => acc + r.conflicts.length, 0)
  };

  // Fetch feedback history for selected trainset
  const fetchFeedbackHistory = async (trainsetNumber: string) => {
    setLoadingFeedback(true);
    try {
      const res = await fetch(`/api/feedback/trainset/${trainsetNumber}`);
      const data = await res.json();
      setFeedbackHistory(data);
    } catch {}
    setLoadingFeedback(false);
  };

  // Submit feedback
  const submitFeedback = async () => {
    setLoadingFeedback(true);
    try {
      await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainset_id: feedbackTrainset,
          induction_date: new Date().toISOString(),
          ...feedbackData
        })
      });
      setShowFeedback(false);
      setFeedbackData({ actual_status: '', punctuality: '', incidents: '', notes: '' });
      fetchFeedbackHistory(feedbackTrainset!);
    } catch {}
    setLoadingFeedback(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Induction Planning Engine</h1>
          <p className="text-gray-600">Intelligent trainset selection for optimal daily operations</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={refreshRecommendations} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button 
            onClick={generateSchedule}
            disabled={loadingSchedule}
            className="bg-teal-700 hover:bg-teal-800 text-white border-teal-700 hover:border-teal-800 disabled:opacity-50"
          >
            {loadingSchedule ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            {loadingSchedule ? 'Generating...' : 'Generate Schedule'}
          </Button>
          <Button variant="secondary" onClick={() => setShowSimulation(true)}>
            What-if Simulation
          </Button>
        </div>
      </div>

      {/* AI Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recommended</p>
                <p className="text-2xl font-bold text-green-600">{overallMetrics.totalRecommended}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{overallMetrics.totalCaution}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average AI Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(overallMetrics.averageScore)}`}>
                  {overallMetrics.averageScore}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Conflicts</p>
                <p className="text-2xl font-bold text-red-600">{overallMetrics.totalConflicts}</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">AI Analysis Last Updated</p>
              <p className="text-sm text-blue-700">
                {lastUpdated.toLocaleString()} - Next auto-refresh in 15 minutes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Induction Recommendations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tomorrow's Induction Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.trainsetNumber}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTrainset(rec)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full font-bold">
                      {rec.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{rec.trainsetNumber}</h3>
                      <p className="text-sm text-gray-600">{rec.route} • {rec.scheduledTime}</p>
                    </div>
                  </div>
                  {getStatusBadge(rec.status, rec.score)}
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Availability</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.availability)}`}>
                      {rec.factors.availability}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Maintenance</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.maintenance)}`}>
                      {rec.factors.maintenance}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Fitness</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.fitness)}`}>
                      {rec.factors.fitness}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Branding</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.branding)}`}>
                      {rec.factors.branding}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Cleaning</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.cleaning)}`}>
                      {rec.factors.cleaning}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Priority</p>
                    <p className={`font-medium ${getScoreColor(rec.factors.priority)}`}>
                      {rec.factors.priority}%
                    </p>
                  </div>
                </div>

                {/* Conflicts */}
                {rec.conflicts.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {rec.conflicts.map((conflict, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600 border-orange-300">
                          {conflict}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning Preview */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Info className="w-4 h-4" />
                  <span>{rec.reasoning[0]}</span>
                  <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                    View Full Analysis
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-600 p-0 h-auto" onClick={() => { setShowFeedback(true); setFeedbackTrainset(rec.trainsetNumber); fetchFeedbackHistory(rec.trainsetNumber); }}>
                    Submit Feedback
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Modal */}
      {selectedTrainset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* ...existing code... */}
            {/* Audit trail: feedback history */}
            <CardContent>
              <h3 className="font-semibold mb-2">Audit Trail: Feedback History</h3>
              {loadingFeedback ? (
                <p>Loading feedback...</p>
              ) : feedbackHistory.length === 0 ? (
                <p>No feedback submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {feedbackHistory.map((fb, idx) => (
                    <div key={idx} className="p-2 border rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{fb.actual_status}</span>
                        <span className="text-xs text-gray-500">{new Date(fb.induction_date).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-700">Punctuality: {fb.punctuality} | Incidents: {fb.incidents}</div>
                      <div className="text-xs text-gray-500">{fb.notes}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feedback Submission Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Submit Induction Feedback</CardTitle>
              <Button variant="ghost" onClick={() => setShowFeedback(false)}>×</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="block">
                  <span className="font-medium">Actual Status</span>
                  <input className="w-full border rounded p-2" value={feedbackData.actual_status} onChange={e => setFeedbackData({ ...feedbackData, actual_status: e.target.value })} />
                </label>
                <label className="block">
                  <span className="font-medium">Punctuality (%)</span>
                  <input className="w-full border rounded p-2" type="number" value={feedbackData.punctuality} onChange={e => setFeedbackData({ ...feedbackData, punctuality: e.target.value })} />
                </label>
                <label className="block">
                  <span className="font-medium">Incidents</span>
                  <input className="w-full border rounded p-2" type="number" value={feedbackData.incidents} onChange={e => setFeedbackData({ ...feedbackData, incidents: e.target.value })} />
                </label>
                <label className="block">
                  <span className="font-medium">Notes</span>
                  <textarea className="w-full border rounded p-2" value={feedbackData.notes} onChange={e => setFeedbackData({ ...feedbackData, notes: e.target.value })} />
                </label>
                <Button className="w-full" onClick={submitFeedback} disabled={loadingFeedback}>
                  {loadingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* What-if Simulation Modal */}
      {showSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>What-if Simulation</CardTitle>
              <Button variant="ghost" onClick={() => setShowSimulation(false)}>
                ×
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">Adjust variables for one or more trainsets to simulate alternative scenarios. Example: mark a trainset unavailable, force cleaning overdue, override certificate status.</p>
                {/* Simple override form for demo: trainsetNumber, forceUnavailable, forceOverdueCleaning, forceExpiredCert */}
                {recommendations.map((rec) => (
                  <div key={rec.trainsetNumber} className="border-b pb-3 mb-3">
                    <div className="font-semibold mb-2">{rec.trainsetNumber}</div>
                    <div className="flex gap-3 flex-wrap">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={scenarioOverrides[rec.trainsetNumber]?.forceUnavailable || false}
                          onChange={e => setScenarioOverrides({
                            ...scenarioOverrides,
                            [rec.trainsetNumber]: {
                              ...scenarioOverrides[rec.trainsetNumber],
                              forceUnavailable: e.target.checked,
                              forceAvailability: e.target.checked ? 0 : undefined
                            }
                          })}
                        /> Unavailable
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={scenarioOverrides[rec.trainsetNumber]?.forceOverdueCleaning || false}
                          onChange={e => setScenarioOverrides({
                            ...scenarioOverrides,
                            [rec.trainsetNumber]: {
                              ...scenarioOverrides[rec.trainsetNumber],
                              forceOverdueCleaning: e.target.checked
                            }
                          })}
                        /> Cleaning Overdue
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={scenarioOverrides[rec.trainsetNumber]?.forceExpiredCert || false}
                          onChange={e => setScenarioOverrides({
                            ...scenarioOverrides,
                            [rec.trainsetNumber]: {
                              ...scenarioOverrides[rec.trainsetNumber],
                              forceExpiredCert: e.target.checked
                            }
                          })}
                        /> Certificate Expired
                      </label>
                    </div>
                  </div>
                ))}
                <Button className="w-full" onClick={runSimulation} disabled={loadingSim}>
                  {loadingSim ? 'Simulating...' : 'Run Simulation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InductionPlanning;