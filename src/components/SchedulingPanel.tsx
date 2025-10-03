import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Train, MapPin, RefreshCw, Zap, Plus, X, AlertCircle, Gauge, Sparkles } from "lucide-react"
import { useState } from "react"

interface SchedulingPanelProps {
  trainsets: any[]
}

export function SchedulingPanel({ trainsets }: SchedulingPanelProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [scheduledTrains, setScheduledTrains] = useState<string[]>([])
  const MAX_SCHEDULED_TRAINS = 25

  const addToSchedule = (trainsetId: string) => {
    if (scheduledTrains.length < MAX_SCHEDULED_TRAINS && !scheduledTrains.includes(trainsetId)) {
      setScheduledTrains(prev => [...prev, trainsetId])
    }
  }

  const removeFromSchedule = (trainsetId: string) => {
    setScheduledTrains(prev => prev.filter(id => id !== trainsetId))
  }

  const resetSchedule = () => {
    setScheduledTrains([])
  }

  const autoGenerateSchedule = () => {
    // Sort by availability and status, then take top 25
    const sortedTrains = [...trainsets]
      .sort((a, b) => {
        // Prioritize: ready > standby > maintenance > critical
        const statusPriority: Record<string, number> = {
          ready: 4,
          standby: 3,
          maintenance: 2,
          critical: 1
        }
        const statusDiff = (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0)
        if (statusDiff !== 0) return statusDiff
        
        // Then by availability
        return (b.availability_percentage || 0) - (a.availability_percentage || 0)
      })
      .slice(0, MAX_SCHEDULED_TRAINS)
      .map(t => t.id)
    
    setScheduledTrains(sortedTrains)
  }

  // Split trains into scheduled and available
  // Maintain insertion order for scheduled trains by mapping scheduledTrains array
  const scheduled = scheduledTrains
    .map(id => trainsets.find(t => t.id === id))
    .filter(Boolean) as any[]
  const available = trainsets.filter(t => !scheduledTrains.includes(t.id))

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ready: 'text-green-600 bg-green-50 border-green-200',
      standby: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      maintenance: 'text-orange-600 bg-orange-50 border-orange-200',
      critical: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>Manual Train Scheduling</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select up to 25 trains for scheduled service
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800"
              />
              <Button onClick={resetSchedule} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={autoGenerateSchedule} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Zap className="h-4 w-4 mr-2" />
                Auto-Select
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {scheduledTrains.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Scheduled</div>
              </div>
              <div className="h-12 w-px bg-blue-300 dark:bg-blue-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {MAX_SCHEDULED_TRAINS - scheduledTrains.length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
              </div>
            </div>
            <Progress 
              value={(scheduledTrains.length / MAX_SCHEDULED_TRAINS) * 100} 
              className="w-64 h-3" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT: Scheduled Trains (Max 25) */}
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="bg-green-50 dark:bg-green-900/20">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Scheduled Trains ({scheduledTrains.length}/25)</span>
              </div>
              <Badge className="bg-green-600 text-white">Active Schedule</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[600px] pr-4">
              {scheduledTrains.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No trains scheduled yet</p>
                  <p className="text-xs mt-1">Add trains from available list →</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduled.map((trainset, index) => (
                    <div 
                      key={trainset.id} 
                      className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                {trainset.number}
                              </div>
                              <Badge className={`text-xs ${getStatusColor(trainset.status)}`}>
                                {trainset.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 ml-10">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>Bay {trainset.bay_position || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Gauge className="h-3 w-3" />
                              <span>{trainset.availability_percentage || 0}% Available</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => removeFromSchedule(trainset.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT: Available Trains */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center space-x-2">
                <Train className="h-5 w-5 text-blue-600" />
                <span>Available Trains ({available.length})</span>
              </div>
              <Badge variant="outline" className="border-blue-600 text-blue-600">
                Ready to Schedule
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ScrollArea className="h-[600px] pr-4">
              {available.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">All trains are scheduled!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {available.map((trainset) => (
                    <div 
                      key={trainset.id} 
                      className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                            {trainset.number}
                          </div>
                          <Badge className={`text-xs ${getStatusColor(trainset.status)}`}>
                            {trainset.status.toUpperCase()}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => addToSchedule(trainset.id)}
                          disabled={scheduledTrains.length >= MAX_SCHEDULED_TRAINS}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      
                      {/* Key Decision Factors */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Availability</span>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={trainset.availability_percentage || 0} 
                              className="w-24 h-2" 
                            />
                            <span className="font-semibold text-gray-900 dark:text-white w-12">
                              {trainset.availability_percentage || 0}%
                            </span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Bay Position</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {trainset.bay_position || 'N/A'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Mileage</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {(trainset.mileage || 0).toLocaleString()} km
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Priority</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {trainset.branding_priority || 0}/10
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Last Clean</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(trainset.last_cleaning)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Alert */}
                        {trainset.status === 'critical' && (
                          <div className="flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded mt-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>Requires immediate attention</span>
                          </div>
                        )}
                        {trainset.availability_percentage < 70 && trainset.status !== 'critical' && (
                          <div className="flex items-center space-x-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded mt-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>Low availability - may need maintenance</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}