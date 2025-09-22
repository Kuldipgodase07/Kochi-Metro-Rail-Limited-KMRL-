import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  Search,
  Eye,
  Share,
  Settings,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  Users,
  Train,
  Activity,
  PieChart,
  LineChart,
  Target,
  Zap,
  Shield
} from 'lucide-react';

interface ReportMetrics {
  fleetUtilization: number;
  maintenanceCost: number;
  onTimePerformance: number;
  passengerSatisfaction: number;
  energyEfficiency: number;
  safetyScore: number;
  revenueGrowth: number;
  operationalEfficiency: number;
}

interface Report {
  id: string;
  title: string;
  type: 'operational' | 'financial' | 'maintenance' | 'safety' | 'executive' | 'compliance';
  category: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  description: string;
  lastGenerated: string;
  nextScheduled: string;
  status: 'active' | 'scheduled' | 'generating' | 'draft' | 'archived';
  recipients: string[];
  format: 'pdf' | 'excel' | 'dashboard' | 'email';
  priority: 'critical' | 'high' | 'medium' | 'low';
  automationLevel: 'manual' | 'semi-automated' | 'fully-automated';
  dataPoints: number;
  insights: string[];
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Daily Operations Dashboard',
    type: 'operational',
    category: 'daily',
    description: 'Real-time operational metrics including fleet status, delays, passenger load, and service disruptions',
    lastGenerated: '2024-09-21 06:00',
    nextScheduled: '2024-09-22 06:00',
    status: 'active',
    recipients: ['operations@kmrl.com', 'control.room@kmrl.com'],
    format: 'dashboard',
    priority: 'critical',
    automationLevel: 'fully-automated',
    dataPoints: 1247,
    insights: [
      'Peak hour utilization increased by 8% this week',
      'Average delay reduced to 45 seconds',
      'KMRL-009 requires attention for door system'
    ]
  },
  {
    id: '2',
    title: 'Monthly Financial Performance',
    type: 'financial',
    category: 'monthly',
    description: 'Comprehensive financial analysis including revenue, costs, ROI, and budget variance analysis',
    lastGenerated: '2024-09-01 09:00',
    nextScheduled: '2024-10-01 09:00',
    status: 'scheduled',
    recipients: ['cfo@kmrl.com', 'finance@kmrl.com', 'board@kmrl.com'],
    format: 'pdf',
    priority: 'high',
    automationLevel: 'semi-automated',
    dataPoints: 3892,
    insights: [
      'Revenue up 12% compared to previous month',
      'Maintenance costs within budget (+2%)',
      'Energy efficiency improvements saving ₹2.3L/month'
    ]
  },
  {
    id: '3',
    title: 'Fleet Maintenance Analytics',
    type: 'maintenance',
    category: 'weekly',
    description: 'Predictive maintenance insights, component health, scheduled vs unscheduled maintenance ratios',
    lastGenerated: '2024-09-15 14:30',
    nextScheduled: '2024-09-22 14:30',
    status: 'generating',
    recipients: ['maintenance@kmrl.com', 'engineering@kmrl.com'],
    format: 'excel',
    priority: 'high',
    automationLevel: 'fully-automated',
    dataPoints: 2156,
    insights: [
      'Brake pad replacement due on 3 trainsets next week',
      'Predictive model shows 99.2% accuracy',
      'MTBF improved by 15% with new maintenance schedule'
    ]
  },
  {
    id: '4',
    title: 'Executive Summary Report',
    type: 'executive',
    category: 'monthly',
    description: 'High-level KPIs and strategic insights for executive leadership and board presentations',
    lastGenerated: '2024-09-01 16:00',
    nextScheduled: '2024-10-01 16:00',
    status: 'draft',
    recipients: ['md@kmrl.com', 'board@kmrl.com', 'government@kerala.gov.in'],
    format: 'pdf',
    priority: 'critical',
    automationLevel: 'semi-automated',
    dataPoints: 847,
    insights: [
      'System reliability at 99.7% - exceeding target',
      'Passenger ridership up 18% year-over-year',
      'Carbon emissions reduced by 12% vs baseline'
    ]
  },
  {
    id: '5',
    title: 'Safety & Compliance Audit',
    type: 'safety',
    category: 'quarterly',
    description: 'Comprehensive safety metrics, incident analysis, compliance status, and risk assessment',
    lastGenerated: '2024-07-01 10:00',
    nextScheduled: '2024-10-01 10:00',
    status: 'scheduled',
    recipients: ['safety@kmrl.com', 'cmrs@indianrailways.com', 'audit@kmrl.com'],
    format: 'pdf',
    priority: 'critical',
    automationLevel: 'manual',
    dataPoints: 1563,
    insights: [
      'Zero safety incidents for 180 consecutive days',
      'All safety certifications current and valid',
      'Emergency response time improved by 23%'
    ]
  }
];

const mockMetrics: ReportMetrics = {
  fleetUtilization: 87.5,
  maintenanceCost: 2.3, // in millions
  onTimePerformance: 94.2,
  passengerSatisfaction: 91.8,
  energyEfficiency: 88.9,
  safetyScore: 99.7,
  revenueGrowth: 15.6,
  operationalEfficiency: 92.4
};

const ComprehensiveReporting: React.FC = () => {
  const [reports] = useState<Report[]>(mockReports);
  const [metrics] = useState<ReportMetrics>(mockMetrics);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-500', text: 'Active' },
      'scheduled': { color: 'bg-blue-500', text: 'Scheduled' },
      'generating': { color: 'bg-yellow-500', text: 'Generating' },
      'draft': { color: 'bg-orange-500', text: 'Draft' },
      'archived': { color: 'bg-gray-500', text: 'Archived' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'operational': { color: 'bg-blue-500', text: 'Operational', icon: Activity },
      'financial': { color: 'bg-green-500', text: 'Financial', icon: DollarSign },
      'maintenance': { color: 'bg-purple-500', text: 'Maintenance', icon: Settings },
      'safety': { color: 'bg-red-500', text: 'Safety', icon: Shield },
      'executive': { color: 'bg-indigo-500', text: 'Executive', icon: Target },
      'compliance': { color: 'bg-orange-500', text: 'Compliance', icon: CheckCircle }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'critical': { color: 'bg-red-600', text: 'Critical' },
      'high': { color: 'bg-orange-500', text: 'High' },
      'medium': { color: 'bg-yellow-500', text: 'Medium' },
      'low': { color: 'bg-green-500', text: 'Low' }
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getFormatIcon = (format: string) => {
    const formatIcons = {
      'pdf': Download,
      'excel': BarChart3,
      'dashboard': Eye,
      'email': Share
    };
    return formatIcons[format as keyof typeof formatIcons] || Download;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const reportingMetrics = {
    totalReports: reports.length,
    activeReports: reports.filter(r => r.status === 'active').length,
    scheduledReports: reports.filter(r => r.status === 'scheduled').length,
    generatingReports: reports.filter(r => r.status === 'generating').length,
    automatedReports: reports.filter(r => r.automationLevel === 'fully-automated').length,
    criticalReports: reports.filter(r => r.priority === 'critical').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comprehensive Reporting & Analytics</h1>
          <p className="text-gray-600">AI-powered insights, performance analytics & executive dashboards</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure Alerts
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fleet Utilization</p>
                <p className="text-2xl font-bold text-blue-600">{metrics.fleetUtilization}%</p>
              </div>
              <Train className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.fleetUtilization} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
                <p className="text-2xl font-bold text-green-600">{metrics.onTimePerformance}%</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.onTimePerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Score</p>
                <p className="text-2xl font-bold text-red-600">{metrics.safetyScore}%</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Progress value={metrics.safetyScore} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold text-purple-600">+{metrics.revenueGrowth}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>vs last quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Passenger Satisfaction</p>
            <p className="text-xl font-bold text-blue-600">{metrics.passengerSatisfaction}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Energy Efficiency</p>
            <p className="text-xl font-bold text-yellow-600">{metrics.energyEfficiency}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Maintenance Cost</p>
            <p className="text-xl font-bold text-green-600">₹{metrics.maintenanceCost}M</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Operational Efficiency</p>
            <p className="text-xl font-bold text-purple-600">{metrics.operationalEfficiency}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Reporting Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Total Reports</p>
              <p className="text-lg font-bold text-gray-900">{reportingMetrics.totalReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Active</p>
              <p className="text-lg font-bold text-green-600">{reportingMetrics.activeReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Scheduled</p>
              <p className="text-lg font-bold text-blue-600">{reportingMetrics.scheduledReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Generating</p>
              <p className="text-lg font-bold text-yellow-600">{reportingMetrics.generatingReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Automated</p>
              <p className="text-lg font-bold text-purple-600">{reportingMetrics.automatedReports}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">Critical</p>
              <p className="text-lg font-bold text-red-600">{reportingMetrics.criticalReports}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Report Library</TabsTrigger>
          <TabsTrigger value="analytics">Live Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="settings">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports by title or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="operational">Operational</option>
                    <option value="financial">Financial</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="safety">Safety</option>
                    <option value="executive">Executive</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const FormatIcon = getFormatIcon(report.format);
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedReport(report)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <p className="text-sm text-gray-600">{report.category} report</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTypeBadge(report.type)}
                      <Badge variant="outline" className="text-xs">
                        {report.automationLevel}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Last Generated</p>
                        <p className="font-medium">{new Date(report.lastGenerated).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Next Scheduled</p>
                        <p className="font-medium">{new Date(report.nextScheduled).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{report.dataPoints.toLocaleString()} data points</span>
                      <div className="flex items-center gap-1">
                        <FormatIcon className="w-3 h-3" />
                        <span className="text-gray-600">{report.format}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-blue-600">
                      <Users className="w-3 h-3" />
                      <span>{report.recipients.length} recipient(s)</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Generate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Real-Time Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Fleet Utilization</p>
                      <p className="text-2xl font-bold text-blue-800">{metrics.fleetUtilization}%</p>
                      <div className="flex items-center text-sm text-green-600 mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +2.3% vs yesterday
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Revenue Today</p>
                      <p className="text-2xl font-bold text-green-800">₹4.2L</p>
                      <div className="flex items-center text-sm text-green-600 mt-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +8.1% vs yesterday
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Live Performance Chart</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Current Operational Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trains in Service:</span>
                      <span className="font-medium">23/25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Speed:</span>
                      <span className="font-medium">35.2 km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Passengers:</span>
                      <span className="font-medium">12,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Reliability:</span>
                      <span className="font-medium text-green-600">99.4%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Route Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Aluva - Maharaja College</span>
                        <Badge className="bg-green-500 text-white">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Kaloor - Palarivattom</span>
                        <Badge className="bg-yellow-500 text-white">Minor Delay</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Edapally - MG Road</span>
                        <Badge className="bg-green-500 text-white">Normal</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Cost Breakdown Analysis (Monthly)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Operations & Maintenance</span>
                    <span className="font-medium">₹2.8Cr (45%)</span>
                  </div>
                  <Progress value={45} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy & Utilities</span>
                    <span className="font-medium">₹1.2Cr (19%)</span>
                  </div>
                  <Progress value={19} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Staff & Administration</span>
                    <span className="font-medium">₹1.5Cr (24%)</span>
                  </div>
                  <Progress value={24} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Infrastructure & Capex</span>
                    <span className="font-medium">₹0.8Cr (12%)</span>
                  </div>
                  <Progress value={12} className="h-3" />
                </div>
                
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Cost Distribution Chart</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI-Powered Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-800">Optimization Opportunity</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Adjusting peak hour frequency on Aluva-Maharaja route could increase revenue by 12% 
                      while reducing energy consumption by 5%.
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-800">Predictive Maintenance</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      KMRL-013 brake system showing early wear patterns. Schedule maintenance in next 2 weeks 
                      to prevent unplanned downtime.
                    </p>
                  </div>
                  
                  <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                    <h4 className="font-medium text-orange-800">Cost Optimization</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Energy consumption 8% higher than optimal during off-peak hours. Implementing 
                      smart power management could save ₹3.2L monthly.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-lg font-bold text-green-600">↗ 94.2%</p>
                      <p className="text-xs text-gray-500">On-time performance</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Last 30 Days</p>
                      <p className="text-lg font-bold text-blue-600">↗ 87.5%</p>
                      <p className="text-xs text-gray-500">Fleet utilization</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Key Insights</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Passenger satisfaction increased by 4.2% after implementing new cleaning protocols</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
                        <span>Energy efficiency improvements contributing to 15% cost reduction year-over-year</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                        <span>Peak hour capacity utilization reaching 95% - consider frequency adjustments</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Strategic Business Intelligence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-600">Growth Opportunities</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Extended evening service could capture 18% more ridership</li>
                    <li>• Weekend special services showing 23% revenue potential</li>
                    <li>• Corporate partnerships for dedicated coaches</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-600">Operational Excellence</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Predictive maintenance reducing unplanned downtime by 67%</li>
                    <li>• AI-optimized scheduling improving efficiency by 12%</li>
                    <li>• Real-time passenger load balancing</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-600">Innovation Areas</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• IoT sensor integration for enhanced monitoring</li>
                    <li>• Mobile app integration for seamless passenger experience</li>
                    <li>• Green energy optimization programs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Report Automation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-generate Daily Reports</p>
                      <p className="text-sm text-gray-600">Automatically create and send daily operational reports</p>
                    </div>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Smart Alert System</p>
                      <p className="text-sm text-gray-600">AI-powered alerts for anomalies and critical issues</p>
                    </div>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Predictive Analytics</p>
                      <p className="text-sm text-gray-600">Machine learning for maintenance and performance predictions</p>
                    </div>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Executive Summaries</p>
                      <p className="text-sm text-gray-600">Automated executive-level insights and recommendations</p>
                    </div>
                    <Badge className="bg-blue-500 text-white">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Alert & Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">Critical Alerts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Safety incidents</span>
                        <Badge className="bg-red-500 text-white">Immediate</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>System failures</span>
                        <Badge className="bg-red-500 text-white">Immediate</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Service disruptions</span>
                        <Badge className="bg-orange-500 text-white">5 minutes</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Performance Alerts</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>On-time performance &lt; 90%</span>
                        <Badge className="bg-yellow-500 text-white">Daily</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Energy consumption &gt; target</span>
                        <Badge className="bg-blue-500 text-white">Weekly</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Maintenance due alerts</span>
                        <Badge className="bg-purple-500 text-white">3 days prior</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{selectedReport.title}</CardTitle>
                  <p className="text-gray-600">{selectedReport.type} • {selectedReport.category}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedReport(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="distribution">Distribution</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Report Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(selectedReport.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          {getTypeBadge(selectedReport.type)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          {getPriorityBadge(selectedReport.priority)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
                          <span>{selectedReport.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Automation:</span>
                          <span>{selectedReport.automationLevel}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Schedule & Data</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Generated:</span>
                          <span>{new Date(selectedReport.lastGenerated).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Scheduled:</span>
                          <span>{new Date(selectedReport.nextScheduled).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Data Points:</span>
                          <span>{selectedReport.dataPoints.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recipients:</span>
                          <span>{selectedReport.recipients.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-4">
                  <h3 className="font-semibold">Latest Insights</h3>
                  <div className="space-y-3">
                    {selectedReport.insights.map((insight, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                          <span>{insight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="schedule" className="space-y-4">
                  <h3 className="font-semibold">Report Schedule</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">Frequency</h4>
                        <p className="text-sm text-gray-600">{selectedReport.category}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium mb-2">Next Run</h4>
                        <p className="text-sm text-gray-600">{new Date(selectedReport.nextScheduled).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">Automation Level</h4>
                      <p className="text-sm text-gray-600">{selectedReport.automationLevel}</p>
                      <div className="mt-2">
                        <Progress value={selectedReport.automationLevel === 'fully-automated' ? 100 : 
                                       selectedReport.automationLevel === 'semi-automated' ? 50 : 0} 
                                className="h-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="distribution" className="space-y-4">
                  <h3 className="font-semibold">Distribution List</h3>
                  <div className="space-y-3">
                    {selectedReport.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{recipient}</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Recipients
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReporting;