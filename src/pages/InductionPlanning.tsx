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
  const [recommendations] = useState<InductionRecommendation[]>(mockRecommendations);
  const [selectedTrainset, setSelectedTrainset] = useState<InductionRecommendation | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

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

  const overallMetrics = {
    totalRecommended: recommendations.filter(r => r.status === 'recommended').length,
    totalCaution: recommendations.filter(r => r.status === 'caution').length,
    totalNotRecommended: recommendations.filter(r => r.status === 'not-recommended').length,
    averageScore: Math.round(recommendations.reduce((acc, r) => acc + r.score, 0) / recommendations.length),
    totalConflicts: recommendations.reduce((acc, r) => acc + r.conflicts.length, 0)
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
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Target className="w-4 h-4 mr-2" />
            Generate Schedule
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
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  AI Analysis: {selectedTrainset.trainsetNumber}
                </CardTitle>
                <Button variant="ghost" onClick={() => setSelectedTrainset(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="analysis">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="factors">Score Factors</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                </TabsList>
                
                <TabsContent value="analysis" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Overall Assessment</h3>
                      <div className="flex items-center gap-4 mb-4">
                        {getStatusBadge(selectedTrainset.status, selectedTrainset.score)}
                        <div className="flex-1">
                          <Progress value={selectedTrainset.score} className="h-3" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">AI Reasoning</h3>
                      <div className="space-y-2">
                        {selectedTrainset.reasoning.map((reason, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTrainset.conflicts.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Identified Conflicts</h3>
                        <div className="space-y-2">
                          {selectedTrainset.conflicts.map((conflict, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{conflict}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2">Scheduled Assignment</h3>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p><span className="font-medium">Route:</span> {selectedTrainset.route}</p>
                        <p><span className="font-medium">Departure:</span> {selectedTrainset.scheduledTime}</p>
                        <p><span className="font-medium">Rank:</span> #{selectedTrainset.rank} of {recommendations.length}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="factors" className="space-y-4">
                  <h3 className="font-semibold">Detailed Score Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(selectedTrainset.factors).map(([factor, score]) => (
                      <div key={factor}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="capitalize font-medium">{factor}</span>
                          <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="alternatives" className="space-y-4">
                  <h3 className="font-semibold">Alternative Trainsets</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    If {selectedTrainset.trainsetNumber} becomes unavailable, these are the AI-recommended alternatives:
                  </p>
                  <div className="space-y-3">
                    {selectedTrainset.alternatives.map((alt, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{alt}</span>
                          <Badge variant="outline">Alternative #{index + 1}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Similar performance profile with {85 - index * 5}% compatibility score
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InductionPlanning;