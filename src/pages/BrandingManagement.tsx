import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Camera,
  Search,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3,
  Image as ImageIcon,
  Palette
} from 'lucide-react';

interface BrandingContract {
  id: string;
  trainset: string;
  advertiser: string;
  campaign: string;
  contractValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  exposureTarget: number; // in thousands of impressions
  actualExposure: number;
  wrapArea: 'full' | 'partial' | 'doors' | 'sides' | 'front-rear';
  routes: string[];
  performanceScore: number;
  renewalProbability: number;
  complianceStatus: 'compliant' | 'minor-issues' | 'non-compliant';
  lastInspectionDate: string;
  revenue: number;
}

interface ExposureMetrics {
  date: string;
  route: string;
  passengersExposed: number;
  durationMinutes: number;
  peakHours: boolean;
  stationStops: string[];
  weatherConditions: 'clear' | 'rainy' | 'foggy';
  visibility: 'excellent' | 'good' | 'fair' | 'poor';
}

const mockBrandingContracts: BrandingContract[] = [
  {
    id: '1',
    trainset: 'KMRL-001',
    advertiser: 'Kerala Tourism',
    campaign: 'God\'s Own Country - Monsoon Special',
    contractValue: 2500000,
    startDate: '2024-06-01',
    endDate: '2024-11-30',
    status: 'active',
    exposureTarget: 5000,
    actualExposure: 4200,
    wrapArea: 'full',
    routes: ['Aluva-Maharaja College', 'Maharaja College-Aluva'],
    performanceScore: 84,
    renewalProbability: 75,
    complianceStatus: 'compliant',
    lastInspectionDate: '2024-09-15',
    revenue: 1800000
  },
  {
    id: '2',
    trainset: 'KMRL-005',
    advertiser: 'Lulu Mall',
    campaign: 'Festival Shopping Extravaganza',
    contractValue: 1800000,
    startDate: '2024-08-15',
    endDate: '2025-01-15',
    status: 'active',
    exposureTarget: 3500,
    actualExposure: 2800,
    wrapArea: 'sides',
    routes: ['Edapally-MG Road', 'MG Road-Edapally'],
    performanceScore: 80,
    renewalProbability: 85,
    complianceStatus: 'minor-issues',
    lastInspectionDate: '2024-09-10',
    revenue: 1200000
  },
  {
    id: '3',
    trainset: 'KMRL-009',
    advertiser: 'Technopark',
    campaign: 'IT Hub Kerala',
    contractValue: 3200000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    exposureTarget: 8000,
    actualExposure: 7100,
    wrapArea: 'full',
    routes: ['Kaloor-Palarivattom', 'Palarivattom-Kaloor'],
    performanceScore: 89,
    renewalProbability: 90,
    complianceStatus: 'compliant',
    lastInspectionDate: '2024-09-20',
    revenue: 2400000
  },
  {
    id: '4',
    trainset: 'KMRL-013',
    advertiser: 'Kochi Metro Rail Ltd.',
    campaign: 'Safe Travel Campaign',
    contractValue: 500000,
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    status: 'expired',
    exposureTarget: 2000,
    actualExposure: 2200,
    wrapArea: 'doors',
    routes: ['All Routes'],
    performanceScore: 110,
    renewalProbability: 100,
    complianceStatus: 'compliant',
    lastInspectionDate: '2024-08-25',
    revenue: 500000
  },
  {
    id: '5',
    trainset: 'KMRL-017',
    advertiser: 'Federal Bank',
    campaign: 'Digital Banking Solutions',
    contractValue: 2200000,
    startDate: '2024-05-01',
    endDate: '2024-10-31',
    status: 'active',
    exposureTarget: 4500,
    actualExposure: 3900,
    wrapArea: 'partial',
    routes: ['Ernakulam South-Thripunithura', 'Thripunithura-Ernakulam South'],
    performanceScore: 87,
    renewalProbability: 80,
    complianceStatus: 'compliant',
    lastInspectionDate: '2024-09-12',
    revenue: 1650000
  }
];

const mockExposureData: ExposureMetrics[] = [
  {
    date: '2024-09-20',
    route: 'Aluva-Maharaja College',
    passengersExposed: 1250,
    durationMinutes: 45,
    peakHours: true,
    stationStops: ['Aluva', 'Pulinchodu', 'Companypadi', 'Ambattukavu', 'Muttom'],
    weatherConditions: 'clear',
    visibility: 'excellent'
  },
  {
    date: '2024-09-20',
    route: 'Edapally-MG Road',
    passengersExposed: 980,
    durationMinutes: 35,
    peakHours: true,
    stationStops: ['Edapally', 'Changampuzha Park', 'Palarivattom', 'JLN Stadium'],
    weatherConditions: 'rainy',
    visibility: 'good'
  }
];

const BrandingManagement: React.FC = () => {
  const [contracts] = useState<BrandingContract[]>(mockBrandingContracts);
  const [exposureData] = useState<ExposureMetrics[]>(mockExposureData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<BrandingContract | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { color: 'bg-green-500', text: 'Active' },
      'expired': { color: 'bg-red-500', text: 'Expired' },
      'pending': { color: 'bg-yellow-500', text: 'Pending' },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getComplianceBadge = (status: string) => {
    const complianceConfig = {
      'compliant': { color: 'bg-green-500', text: 'Compliant' },
      'minor-issues': { color: 'bg-yellow-500', text: 'Minor Issues' },
      'non-compliant': { color: 'bg-red-500', text: 'Non-Compliant' }
    };
    const config = complianceConfig[status as keyof typeof complianceConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getWrapAreaBadge = (area: string) => {
    const areaConfig = {
      'full': { color: 'bg-purple-500', text: 'Full Wrap', icon: '🚄' },
      'partial': { color: 'bg-blue-500', text: 'Partial Wrap', icon: '🚃' },
      'sides': { color: 'bg-indigo-500', text: 'Side Panels', icon: '🎨' },
      'doors': { color: 'bg-cyan-500', text: 'Door Wraps', icon: '🚪' },
      'front-rear': { color: 'bg-teal-500', text: 'Front & Rear', icon: '🎯' }
    };
    const config = areaConfig[area as keyof typeof areaConfig];
    return (
      <Badge className={`${config.color} text-white`}>
        {config.icon} {config.text}
      </Badge>
    );
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.trainset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const brandingMetrics = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
    totalRevenue: contracts.reduce((acc, c) => acc + c.revenue, 0),
    averagePerformance: Math.round(contracts.reduce((acc, c) => acc + c.performanceScore, 0) / contracts.length),
    expiringContracts: contracts.filter(c => {
      const daysUntilExpiry = Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }).length,
    totalExposure: contracts.reduce((acc, c) => acc + c.actualExposure, 0),
    complianceRate: Math.round((contracts.filter(c => c.complianceStatus === 'compliant').length / contracts.length) * 100)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branding & Advertising Management</h1>
          <p className="text-gray-600">Exterior wrap tracking, exposure analytics & revenue optimization</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Analytics
          </Button>
          <Button variant="outline">
            <Camera className="w-4 h-4 mr-2" />
            Visual Inspection
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Branding Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600">{brandingMetrics.activeContracts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue (YTD)</p>
                <p className="text-2xl font-bold text-blue-600">₹{(brandingMetrics.totalRevenue / 10000000).toFixed(1)}Cr</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-purple-600">{brandingMetrics.averagePerformance}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{brandingMetrics.expiringContracts}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exposure</p>
                <p className="text-xl font-bold text-gray-900">{(brandingMetrics.totalExposure / 1000).toFixed(1)}K impressions</p>
              </div>
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-xl font-bold text-green-600">{brandingMetrics.complianceRate}%</p>
              </div>
              <div className="w-12 h-12">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
                            strokeDasharray={`${brandingMetrics.complianceRate * 0.88} 88`}
                            strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-green-600">{brandingMetrics.complianceRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Renewal Pipeline</p>
                <p className="text-xl font-bold text-orange-600">₹{(contracts.filter(c => c.renewalProbability > 70).reduce((acc, c) => acc + c.contractValue, 0) / 10000000).toFixed(1)}Cr</p>
              </div>
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by trainset, advertiser, or campaign..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="pending">Pending</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => {
          const exposurePercentage = (contract.actualExposure / contract.exposureTarget) * 100;
          const daysUntilExpiry = Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedContract(contract)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contract.trainset}</CardTitle>
                    <p className="text-sm text-gray-600">{contract.advertiser}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(contract.status)}
                    {getComplianceBadge(contract.complianceStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{contract.campaign}</h4>
                  <p className="text-sm text-gray-600">Contract Value: ₹{(contract.contractValue / 100000).toFixed(1)}L</p>
                </div>

                <div className="flex items-center gap-2">
                  {getWrapAreaBadge(contract.wrapArea)}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exposure Progress</span>
                    <span className={exposurePercentage >= 80 ? 'text-green-600' : exposurePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                      {exposurePercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={exposurePercentage} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {contract.actualExposure}K / {contract.exposureTarget}K impressions
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Performance</p>
                    <p className="font-medium flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      {contract.performanceScore}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Renewal Chance</p>
                    <p className="font-medium flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {contract.renewalProbability}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Revenue: ₹{(contract.revenue / 100000).toFixed(1)}L</span>
                  <span className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-600' : 
                    daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysUntilExpiry < 0 ? 'Expired' :
                     daysUntilExpiry < 30 ? `${daysUntilExpiry} days left` : 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <MapPin className="w-3 h-3" />
                  <span>{contract.routes.length} route(s)</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View Analytics
                  </Button>
                  <Button size="sm" className="flex-1">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Inspect
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contract Details Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{selectedContract.campaign}</CardTitle>
                  <p className="text-gray-600">{selectedContract.trainset} • {selectedContract.advertiser}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedContract(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="exposure">Exposure</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="renewal">Renewal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Contract Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(selectedContract.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Wrap Area:</span>
                          {getWrapAreaBadge(selectedContract.wrapArea)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract Value:</span>
                          <span>₹{(selectedContract.contractValue / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue Earned:</span>
                          <span>₹{(selectedContract.revenue / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Advertiser:</span>
                          <span>{selectedContract.advertiser}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Timeline & Routes</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span>{new Date(selectedContract.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span>{new Date(selectedContract.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Inspection:</span>
                          <span>{new Date(selectedContract.lastInspectionDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Routes:</span>
                          <div className="mt-1">
                            {selectedContract.routes.map((route, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {route}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="exposure" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Exposure Metrics</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target Impressions:</span>
                            <span>{selectedContract.exposureTarget}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Impressions:</span>
                            <span>{selectedContract.actualExposure}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Achievement Rate:</span>
                            <span className="font-medium text-blue-600">
                              {((selectedContract.actualExposure / selectedContract.exposureTarget) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={(selectedContract.actualExposure / selectedContract.exposureTarget) * 100} className="h-3" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Daily Exposure Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Peak Hours (7-10 AM):</span>
                            <span className="font-medium">35%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Regular Hours (10 AM-5 PM):</span>
                            <span className="font-medium">45%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Evening Peak (5-8 PM):</span>
                            <span className="font-medium">20%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3">Recent Exposure Data</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Date</th>
                              <th className="text-left p-2">Route</th>
                              <th className="text-left p-2">Passengers</th>
                              <th className="text-left p-2">Duration</th>
                              <th className="text-left p-2">Weather</th>
                              <th className="text-left p-2">Visibility</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exposureData.map((data, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">{new Date(data.date).toLocaleDateString()}</td>
                                <td className="p-2">{data.route}</td>
                                <td className="p-2">{data.passengersExposed.toLocaleString()}</td>
                                <td className="p-2">{data.durationMinutes}min</td>
                                <td className="p-2 capitalize">{data.weatherConditions}</td>
                                <td className="p-2 capitalize">{data.visibility}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium mb-2">Overall Score</h4>
                        <div className="text-3xl font-bold text-blue-600">{selectedContract.performanceScore}%</div>
                        <p className="text-sm text-gray-600 mt-1">Above average</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium mb-2">Visibility Rating</h4>
                        <div className="text-3xl font-bold text-green-600">A+</div>
                        <p className="text-sm text-gray-600 mt-1">Excellent visibility</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4 text-center">
                        <h4 className="font-medium mb-2">Engagement</h4>
                        <div className="text-3xl font-bold text-purple-600">High</div>
                        <p className="text-sm text-gray-600 mt-1">Strong audience response</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Performance Breakdown</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Exposure Achievement</span>
                              <span className="text-sm">84%</span>
                            </div>
                            <Progress value={84} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Brand Visibility</span>
                              <span className="text-sm">92%</span>
                            </div>
                            <Progress value={92} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Wrap Condition</span>
                              <span className="text-sm">88%</span>
                            </div>
                            <Progress value={88} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Route Coverage</span>
                              <span className="text-sm">95%</span>
                            </div>
                            <Progress value={95} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Revenue Performance</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Revenue per Day:</span>
                            <span>₹{(selectedContract.revenue / 180).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cost per Impression:</span>
                            <span>₹{(selectedContract.revenue / (selectedContract.actualExposure * 1000)).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ROI for Advertiser:</span>
                            <span className="text-green-600 font-medium">+{(Math.random() * 15 + 5).toFixed(1)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="compliance" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Compliance Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span>Overall Compliance:</span>
                            {getComplianceBadge(selectedContract.complianceStatus)}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Inspection:</span>
                            <span>{new Date(selectedContract.lastInspectionDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Next Inspection Due:</span>
                            <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Inspection Checklist</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Wrap adhesion quality</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Color vibrancy maintained</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm">Minor edge lifting detected</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Safety clearances verified</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="renewal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Renewal Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Renewal Probability:</span>
                            <span className="font-medium text-green-600">{selectedContract.renewalProbability}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expected Rate:</span>
                            <span>+15% premium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contract Expires:</span>
                            <span>{new Date(selectedContract.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Negotiation Window:</span>
                            <span>60 days before expiry</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Renewal Recommendations</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>Strong performance metrics support rate increase</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span>High brand visibility and compliance record</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <span>Address minor wrap maintenance issues</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-blue-600 mt-0.5" />
                            <span>Consider extended term for higher rates</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="flex-1">
                      <Palette className="w-4 h-4 mr-2" />
                      Initiate Renewal Discussion
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Inspection
                    </Button>
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

export default BrandingManagement;