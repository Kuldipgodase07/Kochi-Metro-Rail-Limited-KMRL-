import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import KMRLLogo from '@/components/KMRLLogo';
import { useTrainsets, useRealtimeMetrics } from '@/hooks/useTrainData';
import { 
  Train, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  BarChart3,
  ArrowLeft,
  Download,
  RefreshCw,
  Activity,
  Clock,
  Shield,
  Zap
} from 'lucide-react';

// Utility function to format date
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format: Oct 3, 2025 10:30 AM
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'N/A';
  }
};

interface Trainset {
  id: string;
  number: string;
  status: 'service' | 'standby' | 'maintenance' | 'IBL';
  location: string;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  fitnessExpiry: string;
  brandingStatus: string;
  cleaningStatus: 'clean' | 'due' | 'overdue';
  openJobCards: number;
  availability: number;
  priority: number;
}

const FleetManagement: React.FC = () => {
  const { data: trainsets, isLoading: loading, refetch, error } = useTrainsets();
  const { data: metrics } = useRealtimeMetrics();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrainset, setSelectedTrainset] = useState<Trainset | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showTrainsetModal, setShowTrainsetModal] = useState(false);
  const [selectedTrainsetForModal, setSelectedTrainsetForModal] = useState<any>(null);
  const [showQuickActionsModal, setShowQuickActionsModal] = useState(false);
  const [quickActionsTrainset, setQuickActionsTrainset] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateFormData, setUpdateFormData] = useState<any>({});
  const { toast } = useToast();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Fleet Overview...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Fleet Data</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Unable to connect to the backend service.</p>
          <div className="space-y-2">
            <Button onClick={() => refetch()} className="bg-teal-600 hover:bg-teal-700 text-white mr-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/30"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const raiseTestIncident = async () => {
    try {
      const token = localStorage.getItem('train_plan_wise_token');
      const res = await fetch('http://localhost:5000/api/alerts/raise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'Fleet Alert',
          message: 'Brake temperature exceeds threshold on KMRL-001',
          severity: 'critical',
          source: 'FleetManagement',
          dedupeKey: 'fleet-critical-test'
        })
      });
      if (!res.ok) throw new Error('Failed to raise incident');
      toast({ title: 'Incident Raised', description: 'A critical test incident was raised. Check the bell icon.' });
    } catch (e) {
      toast({ title: 'Failed to raise incident', description: e instanceof Error ? e.message : 'Unknown error', variant: 'destructive' });
    }
  }

  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const token = localStorage.getItem('train_plan_wise_token');
      const res = await fetch('http://localhost:5000/api/reports/fleet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'fleet_summary',
          includeMetrics: true,
          includeTrainsets: true,
          format: 'pdf'
        })
      });

      if (!res.ok) throw new Error('Failed to generate report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fleet-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Report Generated',
        description: 'Fleet management report has been downloaded successfully.'
      });
    } catch (e) {
      toast({
        title: 'Failed to generate report',
        description: e instanceof Error ? e.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }

  const handleViewDetails = (trainset: any) => {
    setSelectedTrainsetForModal(trainset);
    setShowTrainsetModal(true);
  }

  const handleQuickActions = (trainset: any) => {
    setQuickActionsTrainset(trainset);
    setUpdateFormData({
      status: trainset.status,
      bay_position: trainset.bay_position || '',
      mileage: trainset.mileage || '',
      availability_percentage: trainset.availability_percentage || '',
      branding_priority: trainset.branding_priority || '',
      last_cleaning: trainset.last_cleaning ? new Date(trainset.last_cleaning).toISOString().slice(0, 16) : ''
    });
    setShowQuickActionsModal(true);
  }

  const handleUpdateTrainset = async () => {
    if (!quickActionsTrainset) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('train_plan_wise_token');
      const response = await fetch(`http://localhost:5000/api/data/trainsets/${quickActionsTrainset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateFormData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Trainset ${quickActionsTrainset.number} updated successfully`,
        });
        setShowQuickActionsModal(false);
        refetch(); // Refresh the trainsets list
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update trainset',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating trainset:', error);
      toast({
        title: 'Error',
        description: 'Failed to update trainset. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      service: { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' },
      standby: { color: 'bg-yellow-500 dark:bg-yellow-600', text: 'Standby' },
      maintenance: { color: 'bg-red-500 dark:bg-red-600', text: 'Maintenance' },
      IBL: { color: 'bg-red-500 dark:bg-red-600', text: 'IBL' },
      ready: { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' },
      critical: { color: 'bg-red-500 dark:bg-red-600', text: 'Critical' },
      // Add more status mappings to ensure we catch all cases
      'in-service': { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' },
      'in service': { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' },
      'active': { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' },
      'operational': { color: 'bg-green-500 dark:bg-green-600', text: 'In Service' }
    };
    
    // Normalize the status to lowercase for better matching
    const normalizedStatus = status?.toLowerCase() || '';
    const config = statusConfig[normalizedStatus as keyof typeof statusConfig] || 
                   statusConfig[status as keyof typeof statusConfig] || { 
      color: 'bg-gray-500 dark:bg-gray-600', 
      text: status || 'Unknown' 
    };
    return <Badge className={`${config.color} text-white font-medium px-2 py-1`}>{config.text}</Badge>;
  };


  const filteredTrainsets = (trainsets || []).filter(trainset => {
    const matchesSearch = trainset.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trainset.bay_position?.toString() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fleetSummary = {
    total: trainsets?.length || 0,
    inService: trainsets?.filter(t => t.status === 'ready').length || 0,
    standby: trainsets?.filter(t => t.status === 'standby').length || 0,
    maintenance: trainsets?.filter(t => t.status === 'maintenance').length || 0,
    IBL: trainsets?.filter(t => t.status === 'critical').length || 0,
    averageAvailability: trainsets?.length > 0 ? Math.round(trainsets.reduce((acc, t) => acc + (t.availability_percentage || 0), 0) / trainsets.length) : 0,
    totalJobCards: 0 // This field doesn't exist in the current data structure
  };

  // Use metrics data if available
  const displayMetrics = metrics?.fleet_status || {
    total_fleet: fleetSummary.total,
    ready: fleetSummary.inService,
    standby: fleetSummary.standby,
    maintenance: fleetSummary.maintenance,
    critical: fleetSummary.IBL,
    avg_availability: fleetSummary.averageAvailability
  };

  return (
    <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark">
      {/* Header */}
      <header className="bg-white/90 dark:bg-teal-900/95 backdrop-blur-md border-b border-teal-200 dark:border-teal-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fleet Overview</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time fleet monitoring and analytics</p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Fleet Overview</h2>
              <p className="text-gray-600">Comprehensive trainset tracking and status management</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={raiseTestIncident} className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/30">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Raise Test Incident
              </Button>
              <Button 
                onClick={generateReport}
                disabled={isGeneratingReport}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {isGeneratingReport ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {/* Fleet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="dark-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Trainsets</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{displayMetrics.total_fleet}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active Fleet</p>
                  </div>
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <Train className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Service</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{displayMetrics.ready}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Operational</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Under Maintenance</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{displayMetrics.maintenance + displayMetrics.critical}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Service Required</p>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Wrench className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Availability</p>
                    <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{displayMetrics.avg_availability}%</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fleet Performance</p>
                  </div>
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="dark-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-teal-500" />
                    <Input
                      placeholder="Search by trainset number or location..."
                      className="pl-10 dark-input border-teal-200 focus:border-teal-500 focus:ring-teal-500/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-teal-200 dark:border-teal-600 rounded-md bg-white dark:bg-teal-900 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-teal-500/20"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="service">In Service</option>
                    <option value="standby">Standby</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="IBL">IBL</option>
                  </select>
                  <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/30">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trainset List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrainsets.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Train className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Trainsets Found</h3>
                  <p className="text-sm">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'No trainsets are currently available.'}
                  </p>
                </div>
                {(searchTerm || statusFilter !== 'all') && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/30"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredTrainsets.map((trainset) => (
              <Card key={trainset.id} className="dark-card hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105" 
                    onClick={() => setSelectedTrainset(trainset as any)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">{trainset.number}</CardTitle>
                    {getStatusBadge(trainset.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-teal-500" />
                    Bay Position: {trainset.bay_position}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Availability</span>
                    <div className="flex items-center gap-2">
                      <Progress value={trainset.availability_percentage || 0} className="w-20 h-2" />
                      <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{trainset.availability_percentage || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Mileage
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">{(trainset.mileage || 0).toLocaleString()} km</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Priority
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">{trainset.branding_priority || 0}/10</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Last Cleaning</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{formatDate(trainset.last_cleaning)}</span>
                  </div>

                  {trainset.status === 'critical' && (
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Critical status - requires attention</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(trainset);
                      }}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickActions(trainset);
                      }}
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Quick Actions
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {/* Trainset Details Modal */}
          {showTrainsetModal && selectedTrainsetForModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Trainset {selectedTrainsetForModal.number} Details</CardTitle>
                    <Button variant="ghost" onClick={() => setShowTrainsetModal(false)}>
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Basic Information</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Number:</span> {selectedTrainsetForModal.number}</p>
                        <p className="text-sm"><span className="font-medium">Status:</span> {getStatusBadge(selectedTrainsetForModal.status)}</p>
                        <p className="text-sm"><span className="font-medium">Bay Position:</span> {selectedTrainsetForModal.bay_position}</p>
                        <p className="text-sm"><span className="font-medium">Mileage:</span> {(selectedTrainsetForModal.mileage || 0).toLocaleString()} km</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Performance</h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Availability:</span> {selectedTrainsetForModal.availability_percentage || 0}%</p>
                        <p className="text-sm"><span className="font-medium">Branding Priority:</span> {selectedTrainsetForModal.branding_priority || 0}/10</p>
                        <p className="text-sm"><span className="font-medium">Last Cleaning:</span> {formatDate(selectedTrainsetForModal.last_cleaning)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleQuickActions(selectedTrainsetForModal)}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Quick Actions
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowTrainsetModal(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Selected Trainset Detail Modal */}
          {selectedTrainset && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Trainset {selectedTrainset.number} Details</CardTitle>
                    <Button variant="ghost" onClick={() => setSelectedTrainset(null)}>
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                      <TabsTrigger value="certificates">Certificates</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Current Status</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Status:</span>
                              {getStatusBadge(selectedTrainset.status)}
                            </div>
                            <div className="flex justify-between">
                              <span>Location:</span>
                              <span>{selectedTrainset.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Availability:</span>
                              <span>{selectedTrainset.availability}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Performance Metrics</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total Mileage:</span>
                              <span>{selectedTrainset.mileage.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Priority Score:</span>
                              <span>{selectedTrainset.priority}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Open Job Cards:</span>
                              <span>{selectedTrainset.openJobCards}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="maintenance">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Maintenance Schedule</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Last Maintenance</p>
                            <p className="font-medium">{selectedTrainset.lastMaintenance}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Next Maintenance</p>
                            <p className="font-medium">{selectedTrainset.nextMaintenance}</p>
                          </div>
                        </div>
                        {selectedTrainset.openJobCards > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-600">Open Job Cards ({selectedTrainset.openJobCards})</h4>
                            <div className="mt-2 space-y-2">
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <p className="font-medium">Brake Pad Replacement</p>
                                <p className="text-sm text-gray-600">Priority: High | Due: 2024-09-25</p>
                              </div>
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <p className="font-medium">HVAC Filter Change</p>
                                <p className="text-sm text-gray-600">Priority: Medium | Due: 2024-09-30</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="certificates">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Fitness Certificates</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium">Rolling Stock Certificate</p>
                              <p className="text-sm text-gray-600">Expires: {selectedTrainset.fitnessExpiry}</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <div>
                              <p className="font-medium">Signalling Certificate</p>
                              <p className="text-sm text-gray-600">Expires: 2025-04-20</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div>
                              <p className="font-medium">Telecom Certificate</p>
                              <p className="text-sm text-gray-600">Expires: 2024-12-15</p>
                            </div>
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="history">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Service History</h3>
                        <div className="space-y-3">
                          <div className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">Scheduled Maintenance</p>
                              <span className="text-sm text-gray-600">2024-09-15</span>
                            </div>
                            <p className="text-sm text-gray-600">Routine inspection and brake system check</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">Emergency Repair</p>
                              <span className="text-sm text-gray-600">2024-09-02</span>
                            </div>
                            <p className="text-sm text-gray-600">Door mechanism repair on car 2</p>
                          </div>
                          <div className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <p className="font-medium">Deep Cleaning</p>
                              <span className="text-sm text-gray-600">2024-08-28</span>
                            </div>
                            <p className="text-sm text-gray-600">Interior and exterior cleaning service</p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions Modal */}
          {showQuickActionsModal && quickActionsTrainset && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                      Quick Update - Trainset {quickActionsTrainset.number}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowQuickActionsModal(false)}
                      disabled={isUpdating}
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Status */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Status
                        </label>
                        <select
                          value={updateFormData.status}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="ready">Ready / In Service</option>
                          <option value="standby">Standby</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>

                      {/* Bay Position */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bay Position
                        </label>
                        <Input
                          type="number"
                          value={updateFormData.bay_position}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, bay_position: e.target.value })}
                          placeholder="Enter bay position"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>

                      {/* Mileage */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mileage (km)
                        </label>
                        <Input
                          type="number"
                          value={updateFormData.mileage}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, mileage: e.target.value })}
                          placeholder="Enter mileage"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>

                      {/* Availability Percentage */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Availability (%)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={updateFormData.availability_percentage}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, availability_percentage: e.target.value })}
                          placeholder="Enter availability %"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>

                      {/* Branding Priority */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Branding Priority (1-10)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={updateFormData.branding_priority}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, branding_priority: e.target.value })}
                          placeholder="Enter priority"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>

                      {/* Last Cleaning */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Last Cleaning
                        </label>
                        <Input
                          type="datetime-local"
                          value={updateFormData.last_cleaning}
                          onChange={(e) => setUpdateFormData({ ...updateFormData, last_cleaning: e.target.value })}
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>

                    {/* Current Values Info */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Current Values</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <div><span className="font-medium">Status:</span> {getStatusBadge(quickActionsTrainset.status)}</div>
                        <div><span className="font-medium">Bay Position:</span> {quickActionsTrainset.bay_position || 'N/A'}</div>
                        <div><span className="font-medium">Mileage:</span> {(quickActionsTrainset.mileage || 0).toLocaleString()} km</div>
                        <div><span className="font-medium">Availability:</span> {quickActionsTrainset.availability_percentage || 0}%</div>
                        <div><span className="font-medium">Priority:</span> {quickActionsTrainset.branding_priority || 0}/10</div>
                        <div><span className="font-medium">Last Cleaning:</span> {formatDate(quickActionsTrainset.last_cleaning)}</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600"
                        onClick={() => setShowQuickActionsModal(false)}
                        disabled={isUpdating}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                        onClick={handleUpdateTrainset}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Trainset
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FleetManagement;