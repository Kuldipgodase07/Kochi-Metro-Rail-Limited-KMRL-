import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Train, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  BarChart3,
  FileText
} from 'lucide-react';

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

const mockTrainsets: Trainset[] = [
  {
    id: '1',
    number: 'KMRL-001',
    status: 'service',
    location: 'Aluva',
    mileage: 45230,
    lastMaintenance: '2024-09-15',
    nextMaintenance: '2024-10-15',
    fitnessExpiry: '2025-03-15',
    brandingStatus: 'Coca-Cola (Valid)',
    cleaningStatus: 'clean',
    openJobCards: 0,
    availability: 98,
    priority: 9
  },
  {
    id: '2',
    number: 'KMRL-005',
    status: 'maintenance',
    location: 'Muttom Depot',
    mileage: 38975,
    lastMaintenance: '2024-09-10',
    nextMaintenance: '2024-10-10',
    fitnessExpiry: '2025-01-20',
    brandingStatus: 'Pepsi (Expiring)',
    cleaningStatus: 'due',
    openJobCards: 3,
    availability: 85,
    priority: 6
  },
  {
    id: '3',
    number: 'KMRL-009',
    status: 'standby',
    location: 'Kalamassery',
    mileage: 52100,
    lastMaintenance: '2024-09-08',
    nextMaintenance: '2024-10-08',
    fitnessExpiry: '2025-06-10',
    brandingStatus: 'None',
    cleaningStatus: 'clean',
    openJobCards: 1,
    availability: 95,
    priority: 8
  },
  {
    id: '4',
    number: 'KMRL-013',
    status: 'IBL',
    location: 'Muttom Depot',
    mileage: 41850,
    lastMaintenance: '2024-09-20',
    nextMaintenance: '2024-10-20',
    fitnessExpiry: '2025-04-05',
    brandingStatus: 'Samsung (Valid)',
    cleaningStatus: 'overdue',
    openJobCards: 5,
    availability: 70,
    priority: 4
  }
];

const FleetManagement: React.FC = () => {
  const [trainsets] = useState<Trainset[]>(mockTrainsets);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrainset, setSelectedTrainset] = useState<Trainset | null>(null);
  const { toast } = useToast();

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      service: { color: 'bg-green-500', text: 'In Service' },
      standby: { color: 'bg-blue-500', text: 'Standby' },
      maintenance: { color: 'bg-yellow-500', text: 'Maintenance' },
      IBL: { color: 'bg-red-500', text: 'IBL' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getCleaningBadge = (status: string) => {
    const statusConfig = {
      clean: { color: 'bg-green-500', text: 'Clean' },
      due: { color: 'bg-yellow-500', text: 'Due' },
      overdue: { color: 'bg-red-500', text: 'Overdue' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const filteredTrainsets = trainsets.filter(trainset => {
    const matchesSearch = trainset.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fleetSummary = {
    total: trainsets.length,
    inService: trainsets.filter(t => t.status === 'service').length,
    standby: trainsets.filter(t => t.status === 'standby').length,
    maintenance: trainsets.filter(t => t.status === 'maintenance').length,
    IBL: trainsets.filter(t => t.status === 'IBL').length,
    averageAvailability: Math.round(trainsets.reduce((acc, t) => acc + t.availability, 0) / trainsets.length),
    totalJobCards: trainsets.reduce((acc, t) => acc + t.openJobCards, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-gray-600">Comprehensive trainset tracking and status management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={raiseTestIncident}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Raise Test Incident
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trainsets</p>
                <p className="text-2xl font-bold text-gray-900">{fleetSummary.total}</p>
              </div>
              <Train className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Service</p>
                <p className="text-2xl font-bold text-green-600">{fleetSummary.inService}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Under Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{fleetSummary.maintenance + fleetSummary.IBL}</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Availability</p>
                <p className="text-2xl font-bold text-blue-600">{fleetSummary.averageAvailability}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
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
                  placeholder="Search by trainset number or location..."
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
                <option value="service">In Service</option>
                <option value="standby">Standby</option>
                <option value="maintenance">Maintenance</option>
                <option value="IBL">IBL</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainset List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTrainsets.map((trainset) => (
          <Card key={trainset.id} className="hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setSelectedTrainset(trainset)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{trainset.number}</CardTitle>
                {getStatusBadge(trainset.status)}
              </div>
              <p className="text-sm text-gray-600">{trainset.location}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Availability</span>
                <div className="flex items-center gap-2">
                  <Progress value={trainset.availability} className="w-20 h-2" />
                  <span className="text-sm font-medium">{trainset.availability}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Mileage</p>
                  <p className="font-medium">{trainset.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-gray-600">Priority</p>
                  <p className="font-medium">{trainset.priority}/10</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cleaning</span>
                {getCleaningBadge(trainset.cleaningStatus)}
              </div>

              {trainset.openJobCards > 0 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{trainset.openJobCards} open job cards</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Quick Actions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
    </div>
  );
};

export default FleetManagement;