import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Users,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Send,
  FileText,
  Camera,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Heart,
  Ambulance,
  Fire,
  Wrench,
  UserCheck,
  MessageSquare,
  Calendar,
  Timer,
  ArrowUpDown,
  ExternalLink
} from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function IncidentResponse() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('incidents')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIncident, setSelectedIncident] = useState(null)

  // Comprehensive Incident Data
  const incidents = [
    {
      id: 1,
      type: 'emergency',
      title: 'Medical Emergency at Aluva Station',
      description: 'Passenger requires immediate medical attention on platform 1',
      location: 'Aluva Station, Platform 1',
      time: '14:30',
      status: 'active',
      priority: 'high',
      assigned: 'Emergency Response Team',
      eta: '5 minutes',
      reporter: 'Station Master',
      attachments: ['medical_report.pdf', 'photo_1.jpg'],
      notifications: ['Medical Team', 'Station Staff', 'Control Center'],
      responseTime: '2 minutes',
      resolution: null
    },
    {
      id: 2,
      type: 'technical',
      title: 'Signal Failure at Pulinchodu',
      description: 'Signal system malfunction affecting train operations',
      location: 'Pulinchodu Station',
      time: '13:45',
      status: 'in-progress',
      priority: 'medium',
      assigned: 'Technical Team',
      eta: '15 minutes',
      reporter: 'Train Driver',
      attachments: ['signal_diagnosis.pdf'],
      notifications: ['Technical Team', 'Control Center'],
      responseTime: '5 minutes',
      resolution: null
    },
    {
      id: 3,
      type: 'safety',
      title: 'Door Malfunction on Train 1001',
      description: 'Automatic doors not functioning properly on train 1001',
      location: 'Train 1001, Between Companypady and Ambattukavu',
      time: '12:20',
      status: 'resolved',
      priority: 'medium',
      assigned: 'Maintenance Team',
      eta: 'Completed',
      reporter: 'Passenger',
      attachments: ['door_repair_report.pdf'],
      notifications: ['Maintenance Team', 'Control Center'],
      responseTime: '8 minutes',
      resolution: 'Doors repaired and tested. Train back in service.'
    },
    {
      id: 4,
      type: 'security',
      title: 'Suspicious Activity Reported',
      description: 'Unattended bag reported at Companypady Station',
      location: 'Companypady Station, Platform 2',
      time: '11:15',
      status: 'resolved',
      priority: 'high',
      assigned: 'Security Team',
      eta: 'Completed',
      reporter: 'Security Guard',
      attachments: ['security_report.pdf'],
      notifications: ['Security Team', 'Police', 'Control Center'],
      responseTime: '3 minutes',
      resolution: 'Bag checked and cleared. No threat found.'
    }
  ]

  // Response Teams with detailed information
  const responseTeams = [
    { 
      name: 'Emergency Response Team', 
      status: 'active', 
      members: 4, 
      location: 'Aluva Station',
      specializations: ['Medical', 'Fire', 'Rescue'],
      contact: '+91-9876543210',
      availability: '24/7'
    },
    { 
      name: 'Technical Support', 
      status: 'standby', 
      members: 6, 
      location: 'Control Center',
      specializations: ['Signals', 'Power', 'Communication'],
      contact: '+91-9876543211',
      availability: '24/7'
    },
    { 
      name: 'Medical Team', 
      status: 'active', 
      members: 2, 
      location: 'Aluva Station',
      specializations: ['First Aid', 'Emergency Care'],
      contact: '+91-9876543212',
      availability: 'Peak Hours'
    },
    { 
      name: 'Security Team', 
      status: 'standby', 
      members: 8, 
      location: 'Various Stations',
      specializations: ['Security', 'Crowd Control', 'Investigation'],
      contact: '+91-9876543213',
      availability: '24/7'
    }
  ]

  // Emergency Protocols
  const emergencyProtocols = [
    {
      type: 'Medical Emergency',
      steps: [
        'Assess the situation and call medical team',
        'Clear the area and provide first aid',
        'Contact ambulance if required',
        'Document the incident',
        'Follow up with passenger'
      ],
      contacts: ['Medical Team: +91-9876543212', 'Ambulance: 108']
    },
    {
      type: 'Fire Emergency',
      steps: [
        'Activate fire alarm immediately',
        'Evacuate passengers to safe area',
        'Contact fire department',
        'Use fire extinguishers if safe',
        'Coordinate with emergency services'
      ],
      contacts: ['Fire Department: 101', 'Emergency Team: +91-9876543210']
    },
    {
      type: 'Security Threat',
      steps: [
        'Secure the area immediately',
        'Contact security team and police',
        'Evacuate if necessary',
        'Document all evidence',
        'Coordinate with authorities'
      ],
      contacts: ['Police: 100', 'Security Team: +91-9876543213']
    }
  ]

  // Escalation Matrix
  const escalationMatrix = [
    { level: 'Level 1', severity: 'Low', response: 'Station Staff', time: '15 minutes', escalation: 'Control Center' },
    { level: 'Level 2', severity: 'Medium', response: 'Specialized Team', time: '10 minutes', escalation: 'Management' },
    { level: 'Level 3', severity: 'High', response: 'Emergency Team', time: '5 minutes', escalation: 'CEO/External Agencies' },
    { level: 'Level 4', severity: 'Critical', response: 'All Teams', time: 'Immediate', escalation: 'Government Agencies' }
  ]

  // Analytics Data
  const incidentAnalytics = {
    total: 156,
    resolved: 142,
    active: 14,
    avgResponseTime: '8.5 minutes',
    resolutionRate: '91%',
    monthlyTrend: '+12%'
  }

  // Incident Types Distribution
  const incidentTypes = [
    { type: 'Medical', count: 45, percentage: 28.8, color: 'bg-red-500' },
    { type: 'Technical', count: 38, percentage: 24.4, color: 'bg-blue-500' },
    { type: 'Safety', count: 32, percentage: 20.5, color: 'bg-orange-500' },
    { type: 'Security', count: 25, percentage: 16.0, color: 'bg-purple-500' },
    { type: 'Other', count: 16, percentage: 10.3, color: 'bg-gray-500' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500'
      case 'in-progress': return 'bg-orange-500'
      case 'resolved': return 'bg-green-500'
      case 'standby': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Incident & Emergency Response
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive incident management and emergency response coordination system
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">ACTIVE</span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="teams">Response Teams</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Active Incidents</h3>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{incidentAnalytics.active}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Resolved</h3>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{incidentAnalytics.resolved}</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Response Teams</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Avg. Response</h3>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{incidentAnalytics.avgResponseTime}</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search incidents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Incident
              </Button>
            </div>

            {/* Incident List */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Incident Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-white">{incident.title}</h4>
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                            <Badge variant={incident.status === 'active' ? 'destructive' : incident.status === 'in-progress' ? 'secondary' : 'default'}>
                              {incident.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{incident.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{incident.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{incident.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <UserCheck className="w-3 h-3" />
                              <span>{incident.reporter}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Assigned: </span>
                          <span className="font-medium text-gray-800 dark:text-white">{incident.assigned}</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-4">Response Time: </span>
                          <span className="font-medium text-gray-800 dark:text-white">{incident.responseTime}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          ETA: {incident.eta}
                        </div>
                      </div>
                      {incident.attachments && incident.attachments.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Attachments:</span>
                            {incident.attachments.map((attachment, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {attachment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Response Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Response Teams</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responseTeams.map((team, index) => (
                    <div key={index} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{team.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{team.location}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(team.status)}`}></div>
                          <Badge variant="secondary" className="text-xs">
                            {team.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{team.members}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{team.contact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Availability</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{team.availability}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Specializations</p>
                        <div className="flex flex-wrap gap-2">
                          {team.specializations.map((spec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Protocols Tab */}
          <TabsContent value="protocols" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span>Emergency Protocols</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {emergencyProtocols.map((protocol, index) => (
                    <div key={index} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{protocol.type}</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Response Steps</h4>
                          <ol className="space-y-2">
                            {protocol.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-gray-800 dark:text-white">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Emergency Contacts</h4>
                          <div className="space-y-2">
                            {protocol.contacts.map((contact, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-800 dark:text-white">{contact}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escalation Matrix Tab */}
          <TabsContent value="escalation" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpDown className="w-5 h-5 text-purple-600" />
                  <span>Escalation Matrix</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {escalationMatrix.map((level, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{level.level}</h4>
                        <Badge 
                          variant={level.severity === 'Critical' ? 'destructive' : level.severity === 'High' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {level.severity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Response Team</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{level.response}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{level.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Escalation To</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{level.escalation}</p>
                        </div>
                        <div className="flex items-center justify-end">
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span>Incident Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{incidentAnalytics.total}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Incidents</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{incidentAnalytics.resolutionRate}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Resolution Rate</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{incidentAnalytics.avgResponseTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Trend</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{incidentAnalytics.monthlyTrend}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    <span>Incident Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incidentTypes.map((type, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 dark:text-white">{type.type}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{type.count} incidents</span>
                            <Badge variant="secondary" className="text-xs">
                              {type.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${type.color} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Admin Controls Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Incident Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Incident
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Incident
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Close Incident
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Reports & Documentation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Export Incident Report
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Attachments
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Actions */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle>Emergency Response Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Call
                  </Button>
                  <Button variant="outline" className="h-12 border-red-200 text-red-600 hover:bg-red-50">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Alert
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Send className="w-4 h-4 mr-2" />
                    Notify Teams
                  </Button>
                  <Button variant="outline" className="h-12">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
