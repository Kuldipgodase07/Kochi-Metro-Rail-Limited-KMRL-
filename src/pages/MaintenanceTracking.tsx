import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  TrendingUp
} from 'lucide-react';

interface JobCard {
  id: string;
  number: string;
  trainset: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'modification';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'pending-parts' | 'testing' | 'completed' | 'cancelled';
  title: string;
  description: string;
  department: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  cost: number;
  components: string[];
  maximoNumber?: string;
  safety: boolean;
}

const mockJobCards: JobCard[] = [
  {
    id: '1',
    number: 'JC-2024-001',
    trainset: 'KMRL-001',
    type: 'preventive',
    priority: 'high',
    status: 'in-progress',
    title: 'Brake Pad Replacement',
    description: 'Replace worn brake pads on all bogies as per maintenance schedule',
    department: 'Mechanical',
    assignedTo: 'Ravi Kumar',
    createdDate: '2024-09-15',
    dueDate: '2024-09-25',
    estimatedHours: 8,
    actualHours: 6,
    cost: 45000,
    components: ['Brake Pads', 'Brake Discs', 'Hydraulic Fluid'],
    maximoNumber: 'WO-24-789',
    safety: true
  },
  {
    id: '2',
    number: 'JC-2024-002',
    trainset: 'KMRL-005',
    type: 'corrective',
    priority: 'critical',
    status: 'pending-parts',
    title: 'Door Mechanism Repair',
    description: 'Door 2 on car 3 not opening properly, requires motor replacement',
    department: 'Electrical',
    assignedTo: 'Suresh Nair',
    createdDate: '2024-09-18',
    dueDate: '2024-09-22',
    estimatedHours: 4,
    cost: 25000,
    components: ['Door Motor', 'Control Module'],
    maximoNumber: 'WO-24-791',
    safety: true
  },
  {
    id: '3',
    number: 'JC-2024-003',
    trainset: 'KMRL-009',
    type: 'preventive',
    priority: 'medium',
    status: 'completed',
    title: 'HVAC Filter Replacement',
    description: 'Quarterly HVAC filter replacement for optimal air quality',
    department: 'HVAC',
    assignedTo: 'Prakash Menon',
    createdDate: '2024-09-10',
    dueDate: '2024-09-20',
    completedDate: '2024-09-19',
    estimatedHours: 2,
    actualHours: 1.5,
    cost: 8000,
    components: ['HVAC Filters', 'Cleaning Supplies'],
    maximoNumber: 'WO-24-785',
    safety: false
  },
  {
    id: '4',
    number: 'JC-2024-004',
    trainset: 'KMRL-013',
    type: 'emergency',
    priority: 'critical',
    status: 'open',
    title: 'Traction Motor Fault',
    description: 'Abnormal noise from traction motor, immediate inspection required',
    department: 'Electrical',
    assignedTo: 'Unassigned',
    createdDate: '2024-09-20',
    dueDate: '2024-09-21',
    estimatedHours: 12,
    cost: 75000,
    components: ['Traction Motor', 'Control System'],
    safety: true
  }
];

const MaintenanceTracking: React.FC = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>(mockJobCards);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState<string>('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { color: 'bg-red-500', text: 'Open' },
      'in-progress': { color: 'bg-blue-500', text: 'In Progress' },
      'pending-parts': { color: 'bg-yellow-500', text: 'Pending Parts' },
      'testing': { color: 'bg-purple-500', text: 'Testing' },
      'completed': { color: 'bg-green-500', text: 'Completed' },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
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

  const handleUpdateStatus = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard);
    setUpdateStatus(jobCard.status);
    setUpdateNotes('');
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedJobCard || !updateStatus) return;

    // Update the job card status
    setJobCards(prevCards => 
      prevCards.map(card => 
        card.id === selectedJobCard.id 
          ? { ...card, status: updateStatus as any, completedDate: updateStatus === 'completed' ? new Date().toISOString().split('T')[0] : card.completedDate }
          : card
      )
    );

    // Close modal and reset state
    setShowUpdateModal(false);
    setSelectedJobCard(null);
    setUpdateStatus('');
    setUpdateNotes('');
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'preventive': { color: 'bg-blue-500', text: 'Preventive' },
      'corrective': { color: 'bg-yellow-500', text: 'Corrective' },
      'emergency': { color: 'bg-red-500', text: 'Emergency' },
      'modification': { color: 'bg-purple-500', text: 'Modification' }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const filteredJobCards = jobCards.filter(jobCard => {
    const matchesSearch = jobCard.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobCard.trainset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jobCard.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || jobCard.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const maintenanceMetrics = {
    totalJobCards: jobCards.length,
    openJobCards: jobCards.filter(jc => jc.status === 'open').length,
    inProgress: jobCards.filter(jc => jc.status === 'in-progress').length,
    overdue: jobCards.filter(jc => new Date(jc.dueDate) < new Date() && jc.status !== 'completed').length,
    completedThisMonth: jobCards.filter(jc => jc.status === 'completed').length,
    totalCost: jobCards.reduce((acc, jc) => acc + jc.cost, 0),
    averageCompletionTime: 3.2, // days
    safetyRelated: jobCards.filter(jc => jc.safety).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance & Job Card Tracking</h1>
          <p className="text-gray-600">Comprehensive maintenance management with IBM Maximo integration</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Sync Maximo
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Job Card
          </Button>
        </div>
      </div>

      {/* Maintenance Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Job Cards</p>
                <p className="text-2xl font-bold text-red-600">{maintenanceMetrics.openJobCards}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{maintenanceMetrics.inProgress}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceMetrics.overdue}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{maintenanceMetrics.completedThisMonth}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
                <p className="text-sm font-medium text-gray-600">Total Maintenance Cost</p>
                <p className="text-xl font-bold text-gray-900">₹{maintenanceMetrics.totalCost.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
                <p className="text-xl font-bold text-gray-900">{maintenanceMetrics.averageCompletionTime} days</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Related</p>
                <p className="text-xl font-bold text-red-600">{maintenanceMetrics.safetyRelated}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-600" />
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
                  placeholder="Search by job card number, trainset, or title..."
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
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="pending-parts">Pending Parts</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
              </select>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobCards.map((jobCard) => (
          <Card key={jobCard.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedJobCard(jobCard)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{jobCard.number}</CardTitle>
                  <p className="text-sm text-gray-600">{jobCard.trainset} • {jobCard.department}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {getStatusBadge(jobCard.status)}
                  {getPriorityBadge(jobCard.priority)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">{jobCard.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{jobCard.description}</p>
              </div>

              <div className="flex items-center gap-2">
                {getTypeBadge(jobCard.type)}
                {jobCard.safety && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">Safety Critical</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Assigned To</p>
                  <p className="font-medium">{jobCard.assignedTo || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-medium">{new Date(jobCard.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Cost: ₹{jobCard.cost.toLocaleString()}</span>
                <span className="text-gray-600">{jobCard.estimatedHours}h estimated</span>
              </div>

              {jobCard.maximoNumber && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <FileText className="w-3 h-3" />
                  <span>Maximo: {jobCard.maximoNumber}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1" onClick={() => handleUpdateStatus(jobCard)}>
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Card Details Modal */}
      {selectedJobCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{selectedJobCard.number}</CardTitle>
                  <p className="text-gray-600">{selectedJobCard.title}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedJobCard(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Job Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(selectedJobCard.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          {getPriorityBadge(selectedJobCard.priority)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          {getTypeBadge(selectedJobCard.type)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trainset:</span>
                          <span>{selectedJobCard.trainset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department:</span>
                          <span>{selectedJobCard.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned To:</span>
                          <span>{selectedJobCard.assignedTo}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Timeline & Cost</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span>{new Date(selectedJobCard.createdDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Date:</span>
                          <span>{new Date(selectedJobCard.dueDate).toLocaleDateString()}</span>
                        </div>
                        {selectedJobCard.completedDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span>{new Date(selectedJobCard.completedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Estimated Hours:</span>
                          <span>{selectedJobCard.estimatedHours}h</span>
                        </div>
                        {selectedJobCard.actualHours && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Hours:</span>
                            <span>{selectedJobCard.actualHours}h</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span>₹{selectedJobCard.cost.toLocaleString()}</span>
                        </div>
                        {selectedJobCard.maximoNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maximo WO:</span>
                            <span>{selectedJobCard.maximoNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {selectedJobCard.description}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Progress Tracking</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Overall Completion</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Fault diagnosis completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Parts ordered and received</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Settings className="w-5 h-5 text-blue-600" />
                          <span>Repair work in progress</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span>Testing pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="components" className="space-y-4">
                  <h3 className="font-semibold">Required Components</h3>
                  <div className="space-y-3">
                    {selectedJobCard.components.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{component}</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <h3 className="font-semibold">Activity History</h3>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Job Card Created</span>
                        <span className="text-sm text-gray-600">{selectedJobCard.createdDate}</span>
                      </div>
                      <p className="text-sm text-gray-600">Initial assessment and job card creation</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Assigned to Technician</span>
                        <span className="text-sm text-gray-600">2024-09-16</span>
                      </div>
                      <p className="text-sm text-gray-600">Assigned to {selectedJobCard.assignedTo}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">Work Started</span>
                        <span className="text-sm text-gray-600">2024-09-17</span>
                      </div>
                      <p className="text-sm text-gray-600">Maintenance work commenced</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedJobCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Update Job Card Status</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowUpdateModal(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Card: {selectedJobCard.number}</label>
                <label className="block text-sm font-medium mb-2">Train: {selectedJobCard.trainset}</label>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <div className="p-2 bg-gray-100 rounded">
                  {getStatusBadge(selectedJobCard.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">New Status</label>
                <select 
                  value={updateStatus} 
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending-parts">Pending Parts</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Update Notes (Optional)</label>
                <textarea 
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Add any notes about the status update..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleStatusUpdate}
                >
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTracking;