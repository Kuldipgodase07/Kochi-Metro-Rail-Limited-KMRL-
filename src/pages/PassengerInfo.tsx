import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  MessageSquare, 
  Bell, 
  MapPin, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Info,
  Wifi,
  Volume2,
  Monitor,
  Train,
  Navigation,
  Phone,
  Mail,
  Settings,
  Eye,
  Ear,
  Accessibility,
  Search,
  Route,
  Calendar,
  Timer,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function PassengerInfo() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('live-status')
  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [journeyDate, setJourneyDate] = useState('')

  // Live Train Status Data
  const liveTrains = [
    { trainNo: 'T001', route: 'Aluva → Muttom', eta: '2 min', currentLocation: 'Pulinchodu', status: 'On Time', platform: '1' },
    { trainNo: 'T002', route: 'Muttom → Aluva', eta: '5 min', currentLocation: 'Companypady', status: 'Delayed', platform: '2' },
    { trainNo: 'T003', route: 'Aluva → Muttom', eta: '8 min', currentLocation: 'Ambattukavu', status: 'On Time', platform: '1' },
    { trainNo: 'T004', route: 'Muttom → Aluva', eta: '12 min', currentLocation: 'Muttom', status: 'On Time', platform: '2' }
  ]

  // Arrivals & Departures Data
  const arrivalsDepartures = [
    { station: 'Aluva', arrivals: [{ train: 'T001', time: '10:30', platform: '1', status: 'On Time' }], departures: [{ train: 'T002', time: '10:35', platform: '2', status: 'Delayed' }] },
    { station: 'Pulinchodu', arrivals: [{ train: 'T002', time: '10:32', platform: '1', status: 'On Time' }], departures: [{ train: 'T001', time: '10:33', platform: '2', status: 'On Time' }] },
    { station: 'Companypady', arrivals: [{ train: 'T003', time: '10:40', platform: '1', status: 'On Time' }], departures: [{ train: 'T002', time: '10:42', platform: '2', status: 'On Time' }] }
  ]

  // Delay Notifications
  const delayNotifications = [
    { train: 'T002', route: 'Muttom → Aluva', delay: '5 min', reason: 'Signal maintenance', expectedResolution: '10:45 AM' },
    { train: 'T004', route: 'Aluva → Muttom', delay: '3 min', reason: 'Passenger assistance', expectedResolution: '10:50 AM' }
  ]

  // Platform Information
  const platformInfo = [
    { platform: '1', train: 'T001', destination: 'Muttom', arrival: '10:30', status: 'Arriving' },
    { platform: '2', train: 'T002', destination: 'Aluva', arrival: '10:35', status: 'Boarding' },
    { platform: '3', train: 'T003', destination: 'Muttom', arrival: '10:40', status: 'Waiting' }
  ]

  // Journey Planner Routes
  const journeyRoutes = [
    { from: 'Aluva', to: 'Muttom', duration: '25 min', transfers: 0, fare: '₹20' },
    { from: 'Aluva', to: 'Companypady', duration: '15 min', transfers: 0, fare: '₹15' },
    { from: 'Pulinchodu', to: 'Ambattukavu', duration: '20 min', transfers: 0, fare: '₹18' }
  ]

  // Notification Settings
  const notificationSettings = {
    sms: true,
    email: false,
    app: true,
    accessibility: true
  }

  // Accessibility Support
  const accessibilityFeatures = [
    { type: 'Visual', feature: 'Audio announcements', status: 'Active' },
    { type: 'Hearing', feature: 'Visual displays', status: 'Active' },
    { type: 'Mobility', feature: 'Wheelchair access', status: 'Available' },
    { type: 'Cognitive', feature: 'Simple language', status: 'Enabled' }
  ]

  // System Status
  const systemStatus = {
    announcements: true,
    wifi: true,
    displayScreens: true,
    audioSystem: true,
    accessibility: true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Passenger Information System
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive passenger information and real-time updates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">LIVE</span>
          </div>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">System Status</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">Operational</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Connectivity</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">98%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Volume2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Audio Systems</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">95%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Monitor className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Display Systems</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">92%</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Accessibility className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Accessibility</h3>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">100%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="live-status">Live Status</TabsTrigger>
            <TabsTrigger value="arrivals">Arrivals</TabsTrigger>
            <TabsTrigger value="delays">Delays</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="journey">Journey Planner</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Live Train Status */}
          <TabsContent value="live-status" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Train className="w-5 h-5 text-blue-600" />
                  <span>Live Train Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveTrains.map((train, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Train className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{train.trainNo}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{train.route}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">Current: {train.currentLocation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={train.status === 'On Time' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {train.status}
                          </Badge>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            ETA: {train.eta}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Platform {train.platform}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Arrivals & Departures */}
          <TabsContent value="arrivals" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span>Arrivals & Departures</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {arrivalsDepartures.map((station, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        {station.station} Station
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Arrivals</h4>
                          {station.arrivals.map((arrival, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                              <span className="text-sm font-medium">{arrival.train}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{arrival.time}</span>
                              <Badge variant="secondary" className="text-xs">Platform {arrival.platform}</Badge>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Departures</h4>
                          {station.departures.map((departure, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <span className="text-sm font-medium">{departure.train}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{departure.time}</span>
                              <Badge variant="secondary" className="text-xs">Platform {departure.platform}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Delay Notifications */}
          <TabsContent value="delays" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Delay Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {delayNotifications.map((delay, index) => (
                    <div key={index} className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 dark:text-white">{delay.train} - {delay.route}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Delay: {delay.delay} | Reason: {delay.reason}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Expected resolution: {delay.expectedResolution}
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {delay.delay} Delay
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Information */}
          <TabsContent value="platforms" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5 text-purple-600" />
                  <span>Platform Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {platformInfo.map((platform, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-white">Platform {platform.platform}</h4>
                        <Badge 
                          variant={platform.status === 'Arriving' ? 'default' : platform.status === 'Boarding' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {platform.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Train: {platform.train}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">To: {platform.destination}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Arrival: {platform.arrival}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journey Planner */}
          <TabsContent value="journey" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="w-5 h-5 text-indigo-600" />
                  <span>Journey Planner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Journey Search Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fromStation">From Station</Label>
                      <Input
                        id="fromStation"
                        value={fromStation}
                        onChange={(e) => setFromStation(e.target.value)}
                        placeholder="Select departure station"
                      />
                    </div>
                    <div>
                      <Label htmlFor="toStation">To Station</Label>
                      <Input
                        id="toStation"
                        value={toStation}
                        onChange={(e) => setToStation(e.target.value)}
                        placeholder="Select destination station"
                      />
                    </div>
                    <div>
                      <Label htmlFor="journeyDate">Date</Label>
                      <Input
                        id="journeyDate"
                        type="date"
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Search className="w-4 h-4 mr-2" />
                    Plan Journey
                  </Button>

                  {/* Journey Routes */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Available Routes</h3>
                    {journeyRoutes.map((route, index) => (
                      <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {route.from} → {route.to}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Duration: {route.duration} | Transfers: {route.transfers}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{route.fare}</p>
                            <Button size="sm" variant="outline">Book</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notification Settings */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">SMS Notifications</span>
                      </div>
                      <Button variant={notificationSettings.sms ? "default" : "outline"} size="sm">
                        {notificationSettings.sms ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">Email Notifications</span>
                      </div>
                      <Button variant={notificationSettings.email ? "default" : "outline"} size="sm">
                        {notificationSettings.email ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">App Notifications</span>
                      </div>
                      <Button variant={notificationSettings.app ? "default" : "outline"} size="sm">
                        {notificationSettings.app ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Support */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Accessibility className="w-5 h-5 text-teal-600" />
                    <span>Accessibility Support</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {accessibilityFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{feature.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{feature.feature}</p>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Controls */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Admin Controls</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Bell className="w-4 h-4 mr-2" />
                    Emergency Alert
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
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
