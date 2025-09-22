import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Download,
  Droplets,
  Sparkles,
  Settings,
  User,
  MapPin,
  Star,
  Timer,
  Wrench,
  ClipboardList,
  TrendingUp
} from 'lucide-react';

interface CleaningTask {
  id: string;
  trainset: string;
  type: 'daily' | 'weekly' | 'deep' | 'emergency' | 'maintenance';
  category: 'interior' | 'exterior' | 'technical' | 'sanitization';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  assignedTo: string;
  teamSize: number;
  scheduledDate: string;
  startTime: string;
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  location: string;
  depot: string;
  qualityScore?: number;
  supplies: string[];
  equipment: string[];
  completedBy?: string;
  completedDate?: string;
  nextScheduled?: string;
  cost: number;
  notes?: string;
}

interface CleaningTeam {
  id: string;
  name: string;
  supervisor: string;
  members: number;
  specialization: string[];
  availability: 'available' | 'busy' | 'off-duty';
  currentTask?: string;
  rating: number;
  tasksCompleted: number;
  efficiency: number;
}

const mockCleaningTasks: CleaningTask[] = [
  {
    id: '1',
    trainset: 'KMRL-001',
    type: 'daily',
    category: 'interior',
    title: 'Daily Interior Cleaning',
    description: 'Complete interior cleaning including seats, floors, windows, and sanitization',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'Team Alpha',
    teamSize: 4,
    scheduledDate: '2024-09-21',
    startTime: '06:00',
    estimatedDuration: 90,
    actualDuration: 75,
    location: 'Depot A - Bay 3',
    depot: 'Muttom Depot',
    supplies: ['Disinfectant', 'Glass cleaner', 'Floor cleaner', 'Microfiber cloths'],
    equipment: ['Vacuum cleaner', 'Steam cleaner', 'Pressure washer'],
    cost: 2500,
    notes: 'Extra attention needed for seat stains in coach 2'
  },
  {
    id: '2',
    trainset: 'KMRL-005',
    type: 'weekly',
    category: 'exterior',
    title: 'Weekly Exterior Wash',
    description: 'Complete exterior washing, window cleaning, and undercarriage cleaning',
    priority: 'medium',
    status: 'scheduled',
    assignedTo: 'Team Beta',
    teamSize: 3,
    scheduledDate: '2024-09-22',
    startTime: '14:00',
    estimatedDuration: 120,
    location: 'Depot B - Wash Bay',
    depot: 'Kalamassery Depot',
    supplies: ['Soap concentrate', 'Wax', 'Degreaser'],
    equipment: ['High-pressure washer', 'Rotating brushes', 'Blow dryer'],
    cost: 3500,
    nextScheduled: '2024-09-29'
  },
  {
    id: '3',
    trainset: 'KMRL-009',
    type: 'deep',
    category: 'technical',
    title: 'Monthly Deep Technical Clean',
    description: 'Technical area cleaning including HVAC, electrical panels, and equipment compartments',
    priority: 'critical',
    status: 'completed',
    assignedTo: 'Team Gamma',
    teamSize: 5,
    scheduledDate: '2024-09-15',
    startTime: '10:00',
    estimatedDuration: 240,
    actualDuration: 260,
    location: 'Depot A - Maintenance Bay',
    depot: 'Muttom Depot',
    qualityScore: 92,
    supplies: ['Compressed air', 'Contact cleaner', 'Specialized lubricants'],
    equipment: ['Vacuum system', 'Cleaning tools', 'Safety equipment'],
    completedBy: 'Suresh Kumar',
    completedDate: '2024-09-15',
    cost: 8500,
    nextScheduled: '2024-10-15'
  },
  {
    id: '4',
    trainset: 'KMRL-013',
    type: 'emergency',
    category: 'sanitization',
    title: 'Emergency Sanitization',
    description: 'Complete sanitization after biohazard incident',
    priority: 'critical',
    status: 'scheduled',
    assignedTo: 'Specialized Team',
    teamSize: 6,
    scheduledDate: '2024-09-21',
    startTime: '20:00',
    estimatedDuration: 180,
    location: 'Depot A - Isolation Bay',
    depot: 'Muttom Depot',
    supplies: ['Hospital-grade disinfectant', 'PPE', 'Biohazard disposal bags'],
    equipment: ['Fogging machine', 'UV sanitizer', 'HEPA filter system'],
    cost: 12000
  },
  {
    id: '5',
    trainset: 'KMRL-017',
    type: 'daily',
    category: 'interior',
    title: 'Post-Service Interior Cleaning',
    description: 'Quick interior cleaning after end of service day',
    priority: 'medium',
    status: 'overdue',
    assignedTo: 'Team Delta',
    teamSize: 2,
    scheduledDate: '2024-09-20',
    startTime: '22:30',
    estimatedDuration: 60,
    location: 'Depot B - Bay 1',
    depot: 'Kalamassery Depot',
    supplies: ['Quick disinfectant', 'Floor cleaner'],
    equipment: ['Handheld vacuum', 'Mop system'],
    cost: 1500
  }
];

const mockCleaningTeams: CleaningTeam[] = [
  {
    id: '1',
    name: 'Team Alpha',
    supervisor: 'Ravi Menon',
    members: 4,
    specialization: ['Interior cleaning', 'Sanitization'],
    availability: 'busy',
    currentTask: 'Daily Interior Cleaning - KMRL-001',
    rating: 4.8,
    tasksCompleted: 145,
    efficiency: 92
  },
  {
    id: '2',
    name: 'Team Beta',
    supervisor: 'Priya Nair',
    members: 3,
    specialization: ['Exterior washing', 'Window cleaning'],
    availability: 'available',
    rating: 4.6,
    tasksCompleted: 98,
    efficiency: 88
  },
  {
    id: '3',
    name: 'Team Gamma',
    supervisor: 'Suresh Kumar',
    members: 5,
    specialization: ['Technical cleaning', 'Deep cleaning'],
    availability: 'available',
    rating: 4.9,
    tasksCompleted: 67,
    efficiency: 95
  },
  {
    id: '4',
    name: 'Specialized Team',
    supervisor: 'Dr. Lakshmi',
    members: 6,
    specialization: ['Biohazard cleanup', 'Emergency response'],
    availability: 'available',
    rating: 5.0,
    tasksCompleted: 23,
    efficiency: 98
  },
  {
    id: '5',
    name: 'Team Delta',
    supervisor: 'Manoj Thomas',
    members: 2,
    specialization: ['Quick cleaning', 'Maintenance support'],
    availability: 'off-duty',
    rating: 4.3,
    tasksCompleted: 201,
    efficiency: 85
  }
];

const CleaningScheduler: React.FC = () => {
  const [tasks] = useState<CleaningTask[]>(mockCleaningTasks);
  const [teams] = useState<CleaningTeam[]>(mockCleaningTeams);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { color: 'bg-blue-500', text: 'Scheduled' },
      'in-progress': { color: 'bg-yellow-500', text: 'In Progress' },
      'completed': { color: 'bg-green-500', text: 'Completed' },
      'cancelled': { color: 'bg-gray-500', text: 'Cancelled' },
      'overdue': { color: 'bg-red-500', text: 'Overdue' }
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

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      'interior': { color: 'bg-blue-500', text: 'Interior', icon: Sparkles },
      'exterior': { color: 'bg-green-500', text: 'Exterior', icon: Droplets },
      'technical': { color: 'bg-purple-500', text: 'Technical', icon: Wrench },
      'sanitization': { color: 'bg-pink-500', text: 'Sanitization', icon: Settings }
    };
    const config = categoryConfig[category as keyof typeof categoryConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getAvailabilityBadge = (availability: string) => {
    const availabilityConfig = {
      'available': { color: 'bg-green-500', text: 'Available' },
      'busy': { color: 'bg-yellow-500', text: 'Busy' },
      'off-duty': { color: 'bg-gray-500', text: 'Off Duty' }
    };
    const config = availabilityConfig[availability as keyof typeof availabilityConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.trainset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cleaningMetrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdueTasks: tasks.filter(t => t.status === 'overdue').length,
    totalCost: tasks.reduce((acc, t) => acc + t.cost, 0),
    averageQuality: Math.round(tasks.filter(t => t.qualityScore).reduce((acc, t) => acc + (t.qualityScore || 0), 0) / 
                              tasks.filter(t => t.qualityScore).length),
    availableTeams: teams.filter(t => t.availability === 'available').length,
    totalTeams: teams.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cleaning & Detailing Scheduler</h1>
          <p className="text-gray-600">Resource management, task assignment & quality tracking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Schedule
          </Button>
          <Button variant="outline">
            <ClipboardList className="w-4 h-4 mr-2" />
            Quality Report
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Cleaning
          </Button>
        </div>
      </div>

      {/* Cleaning Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{cleaningMetrics.inProgress}</p>
              </div>
              <Timer className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold text-green-600">{cleaningMetrics.completedTasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{cleaningMetrics.overdueTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Teams</p>
                <p className="text-2xl font-bold text-blue-600">{cleaningMetrics.availableTeams}/{cleaningMetrics.totalTeams}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
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
                <p className="text-sm font-medium text-gray-600">Daily Cleaning Cost</p>
                <p className="text-xl font-bold text-gray-900">₹{cleaningMetrics.totalCost.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quality Score</p>
                <p className="text-xl font-bold text-green-600">{cleaningMetrics.averageQuality}%</p>
              </div>
              <div className="w-12 h-12">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="3"
                            strokeDasharray={`${cleaningMetrics.averageQuality * 0.88} 88`}
                            strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-green-600">{cleaningMetrics.averageQuality}%</span>
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
                <p className="text-sm font-medium text-gray-600">Team Efficiency</p>
                <p className="text-xl font-bold text-purple-600">
                  {Math.round(teams.reduce((acc, t) => acc + t.efficiency, 0) / teams.length)}%
                </p>
              </div>
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Cleaning Tasks</TabsTrigger>
          <TabsTrigger value="teams">Teams & Resources</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by trainset, task, or team..."
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
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedTask(task)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{task.trainset}</CardTitle>
                      <p className="text-sm text-gray-600">{task.depot}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getCategoryBadge(task.category)}
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Assigned To</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {task.assignedTo}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedDuration}min
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {new Date(task.scheduledDate).toLocaleDateString()} at {task.startTime}
                    </span>
                    <span className="text-gray-600">₹{task.cost.toLocaleString()}</span>
                  </div>

                  {task.qualityScore && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>Quality: {task.qualityScore}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <MapPin className="w-3 h-3" />
                    <span>{task.location}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-gray-600">Supervisor: {team.supervisor}</p>
                    </div>
                    {getAvailabilityBadge(team.availability)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Team Size</p>
                      <p className="font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {team.members} members
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Rating</p>
                      <p className="font-medium flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {team.rating}/5.0
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Specialization</p>
                    <div className="flex flex-wrap gap-1">
                      {team.specialization.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Efficiency</span>
                      <span>{team.efficiency}%</span>
                    </div>
                    <Progress value={team.efficiency} className="h-2" />
                  </div>

                  <div className="text-sm">
                    <p className="text-gray-600">Tasks Completed: {team.tasksCompleted}</p>
                  </div>

                  {team.currentTask && (
                    <div className="text-sm bg-yellow-50 p-2 rounded-lg">
                      <p className="text-yellow-800">
                        <strong>Current Task:</strong> {team.currentTask}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Schedule
                    </Button>
                    <Button size="sm" className="flex-1" disabled={team.availability !== 'available'}>
                      Assign Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cleaning Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Time</th>
                      <th className="text-left p-3">Monday</th>
                      <th className="text-left p-3">Tuesday</th>
                      <th className="text-left p-3">Wednesday</th>
                      <th className="text-left p-3">Thursday</th>
                      <th className="text-left p-3">Friday</th>
                      <th className="text-left p-3">Saturday</th>
                      <th className="text-left p-3">Sunday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">06:00-08:00</td>
                      <td className="p-3">
                        <div className="bg-blue-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-001</div>
                          <div className="text-gray-600">Daily Interior</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-green-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-003</div>
                          <div className="text-gray-600">Daily Interior</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-purple-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-005</div>
                          <div className="text-gray-600">Daily Interior</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-yellow-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-007</div>
                          <div className="text-gray-600">Daily Interior</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-pink-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-009</div>
                          <div className="text-gray-600">Daily Interior</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-indigo-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-011</div>
                          <div className="text-gray-600">Weekly Deep</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-gray-100 p-2 rounded text-xs">
                          <div className="font-medium">Maintenance</div>
                          <div className="text-gray-600">Equipment Check</div>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">10:00-12:00</td>
                      <td className="p-3">
                        <div className="bg-green-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-013</div>
                          <div className="text-gray-600">Exterior Wash</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-blue-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-015</div>
                          <div className="text-gray-600">Exterior Wash</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-red-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-017</div>
                          <div className="text-gray-600">Deep Technical</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-purple-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-019</div>
                          <div className="text-gray-600">Exterior Wash</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-yellow-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-021</div>
                          <div className="text-gray-600">Monthly Deep</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-pink-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-023</div>
                          <div className="text-gray-600">Weekly Clean</div>
                        </div>
                      </td>
                      <td className="p-3"></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">14:00-16:00</td>
                      <td className="p-3">
                        <div className="bg-purple-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-025</div>
                          <div className="text-gray-600">Sanitization</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-green-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-027</div>
                          <div className="text-gray-600">Deep Clean</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-blue-100 p-2 rounded text-xs">
                          <div className="font-medium">KMRL-029</div>
                          <div className="text-gray-600">Exterior Wash</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-yellow-100 p-2 rounded text-xs">
                          <div className="font-medium">Team Training</div>
                          <div className="text-gray-600">Safety Protocol</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-red-100 p-2 rounded text-xs">
                          <div className="font-medium">Equipment</div>
                          <div className="text-gray-600">Maintenance</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="bg-gray-100 p-2 rounded text-xs">
                          <div className="font-medium">Inspection</div>
                          <div className="text-gray-600">Quality Check</div>
                        </div>
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{selectedTask.title}</CardTitle>
                  <p className="text-gray-600">{selectedTask.trainset} • {selectedTask.depot}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedTask(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Task Details</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Task Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(selectedTask.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Priority:</span>
                          {getPriorityBadge(selectedTask.priority)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          {getCategoryBadge(selectedTask.category)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span>{selectedTask.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assigned Team:</span>
                          <span>{selectedTask.assignedTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Size:</span>
                          <span>{selectedTask.teamSize} members</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Schedule & Location</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{new Date(selectedTask.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Time:</span>
                          <span>{selectedTask.startTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span>{selectedTask.estimatedDuration} minutes</span>
                        </div>
                        {selectedTask.actualDuration && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Actual Duration:</span>
                            <span>{selectedTask.actualDuration} minutes</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span>{selectedTask.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cost:</span>
                          <span>₹{selectedTask.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {selectedTask.description}
                    </p>
                  </div>

                  {selectedTask.notes && (
                    <div>
                      <h3 className="font-semibold mb-2">Notes</h3>
                      <p className="text-gray-700 p-3 bg-yellow-50 rounded-lg">
                        {selectedTask.notes}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Required Supplies</h3>
                      <div className="space-y-2">
                        {selectedTask.supplies.map((supply, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{supply}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Required Equipment</h3>
                      <div className="space-y-2">
                        {selectedTask.equipment.map((equipment, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{equipment}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="progress" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Task Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Overall Completion</span>
                          <span>{selectedTask.status === 'completed' ? '100%' : 
                                selectedTask.status === 'in-progress' ? '60%' : '0%'}</span>
                        </div>
                        <Progress value={selectedTask.status === 'completed' ? 100 : 
                                       selectedTask.status === 'in-progress' ? 60 : 0} className="h-3" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span>Task scheduled and team assigned</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedTask.status === 'completed' || selectedTask.status === 'in-progress' ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> :
                            <Clock className="w-5 h-5 text-gray-400" />}
                          <span>Resources prepared and deployed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedTask.status === 'completed' ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> :
                            selectedTask.status === 'in-progress' ?
                            <Settings className="w-5 h-5 text-blue-600" /> :
                            <Clock className="w-5 h-5 text-gray-400" />}
                          <span>Cleaning work in progress</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedTask.status === 'completed' ? 
                            <CheckCircle className="w-5 h-5 text-green-600" /> :
                            <Clock className="w-5 h-5 text-gray-400" />}
                          <span>Quality inspection completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="quality" className="space-y-4">
                  {selectedTask.qualityScore ? (
                    <div>
                      <h3 className="font-semibold mb-3">Quality Assessment</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <h4 className="font-medium mb-2">Overall Score</h4>
                            <div className="text-3xl font-bold text-green-600">{selectedTask.qualityScore}%</div>
                            <p className="text-sm text-gray-600 mt-1">Excellent quality</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-medium mb-3">Quality Breakdown</h4>
                            <div className="space-y-2">
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Cleanliness</span>
                                  <span className="text-sm">95%</span>
                                </div>
                                <Progress value={95} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Timeliness</span>
                                  <span className="text-sm">90%</span>
                                </div>
                                <Progress value={90} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm">Compliance</span>
                                  <span className="text-sm">88%</span>
                                </div>
                                <Progress value={88} className="h-2" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-gray-600">Quality Assessment Pending</h3>
                      <p className="text-sm text-gray-500">Quality score will be available after task completion</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CleaningScheduler;