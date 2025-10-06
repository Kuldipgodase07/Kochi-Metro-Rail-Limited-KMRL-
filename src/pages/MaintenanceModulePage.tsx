import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Wrench, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { generateMaintenanceReport } from "@/lib/maintenancePdfGenerator";
import { saveAs } from "file-saver";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaintenanceDurationReport from "@/components/MaintenanceDurationReport";

interface PerformanceParameters {
  brakingEfficiency: number;
  doorOperationScore: number;
  tractionMotorHealth: number;
  hvacSystemStatus: number;
  signalCommunicationQuality: number;
  batteryHealthStatus: number;
}

interface MaintenanceLog {
  _id: string;
  trainNumber: string;
  trainsetId: string;
  serviceInTime: string;
  serviceOutTime?: string;
  maintenanceDuration: number;
  maintenanceType: string;
  maintenancePriority: string;
  workDescription: string;
  performanceBeforeMaintenance?: PerformanceParameters;
  performanceAfterMaintenance?: PerformanceParameters;
  overallPerformanceScore: number;
  trainStatus: string;
  readyForOperation: boolean;
  alertType: string;
  alertMessage?: string;
  totalMaintenanceCost?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceStats {
  totalLogs: number;
  inMaintenance: number;
  ready: number;
  dropout: number;
  averageScore: number;
}

interface Trainset {
  id: string;
  number: string;
  status: string;
  mileage: number;
  availability_percentage: number;
  bay_position: number;
}

const MaintenanceModulePage = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [alerts, setAlerts] = useState<MaintenanceLog[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [trainsets, setTrainsets] = useState<Trainset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);
  const [showNewLogDialog, setShowNewLogDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const { toast } = useToast();

  // Form state for new maintenance log
  const [newLog, setNewLog] = useState({
    trainNumber: "",
    trainsetId: "",
    serviceInTime: "",
    maintenanceType: "scheduled",
    maintenancePriority: "medium",
    workDescription: "",
    createdBy: "System Admin"
  });

  // Form state for completing maintenance
  const [completionData, setCompletionData] = useState({
    serviceOutTime: "",
    performanceAfterMaintenance: {
      brakingEfficiency: 90,
      doorOperationScore: 90,
      tractionMotorHealth: 90,
      hvacSystemStatus: 90,
      signalCommunicationQuality: 90,
      batteryHealthStatus: 90
    },
    totalMaintenanceCost: 0,
    remarks: "",
    updatedBy: "System Admin"
  });

  useEffect(() => {
    fetchTrainsets();
    fetchMaintenanceLogs();
    fetchStats();
    fetchAlerts();
    fetchIssues();
    // Real-time polling to keep data fresh
    const interval = setInterval(() => {
      fetchMaintenanceLogs();
      fetchStats();
      fetchAlerts();
      fetchIssues();
    }, 20000); // 20s refresh

    return () => clearInterval(interval);
  }, []);

  const fetchTrainsets = async () => {
    try {
      const res = await fetch('/api/data/trainsets');
      const data = await res.json();
      // Backend returns a raw array (no success wrapper). Support both shapes.
      if (Array.isArray(data)) {
        setTrainsets(data as unknown as Trainset[]);
      } else if (data?.success && Array.isArray(data.data)) {
        setTrainsets(data.data);
      } else {
        console.warn('Unexpected trainsets response shape:', data);
        setTrainsets([]);
      }
    } catch (error) {
      console.error('Error fetching trainsets:', error);
    }
  };

  const fetchMaintenanceLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/maintenance?limit=50');
      const data = await res.json();
      if (data.success) {
        setMaintenanceLogs(data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/maintenance/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/maintenance/alerts/active');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/maintenance/issues?periodDays=45&gapHours=36');
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMaintenanceLogs(),
        fetchStats(),
        fetchAlerts()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createMaintenanceLog = async () => {
    if (!newLog.trainNumber || !newLog.serviceInTime || !newLog.workDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use already-fetched trainsets to resolve trainsetId by train number
      let trainsetId = newLog.trainsetId;
      if (!trainsetId) {
        const selected = trainsets.find(t => t.number === newLog.trainNumber);
        if (!selected) {
          toast({
            title: "Train Not Found",
            description: `Train ${newLog.trainNumber} does not exist in the database`,
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        trainsetId = selected.id;
      }
      
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLog,
          trainsetId
        })
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Maintenance log created successfully"
        });
        setShowNewLogDialog(false);
        fetchMaintenanceLogs();
        fetchStats();
        // Reset form
        setNewLog({
          trainNumber: "",
          trainsetId: "",
          serviceInTime: "",
          maintenanceType: "scheduled",
          maintenancePriority: "medium",
          workDescription: "",
          createdBy: "System Admin"
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance log",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeMaintenance = async () => {
    if (!selectedLog || !completionData.serviceOutTime) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/${selectedLog._id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completionData)
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: data.readiness.alertMessage || "Maintenance completed successfully"
        });
        setShowCompleteDialog(false);
        setSelectedLog(null);
        fetchMaintenanceLogs();
        fetchStats();
        fetchAlerts();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete maintenance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (log: MaintenanceLog) => {
    try {
      // Convert date strings to Date objects for PDF generation
      const logData: any = {
        ...log,
        serviceInTime: new Date(log.serviceInTime),
        serviceOutTime: log.serviceOutTime ? new Date(log.serviceOutTime) : undefined,
        createdAt: new Date(log.createdAt),
        updatedAt: new Date(log.updatedAt)
      };
      
      const pdf = generateMaintenanceReport(logData);
      const blob = pdf.output('blob');
      saveAs(blob, `Maintenance_Report_${log.trainNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Success",
        description: "Maintenance report downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate maintenance report",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string, icon: any }> = {
      'in-maintenance': { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'ready': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'dropout': { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      'testing': { color: 'bg-yellow-100 text-yellow-800', icon: TrendingUp },
      'pending-approval': { color: 'bg-purple-100 text-purple-800', icon: FileText }
    };

    const config = variants[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-teal-600" />
            Maintenance Module
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track maintenance logs, performance analysis, and train readiness status
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Maintenance Logs
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Duration Reports
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLogs}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">In Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inMaintenance}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Dropout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.dropout}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Avg Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getPerformanceColor(stats.averageScore)}`}>
                  {stats.averageScore.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Active Alerts ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{alert.trainNumber}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{alert.alertMessage}</p>
                    </div>
                    {getStatusBadge(alert.trainStatus)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Dialog open={showNewLogDialog} onOpenChange={setShowNewLogDialog}>
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4 mr-2" />
                New Maintenance Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Maintenance Log</DialogTitle>
                <DialogDescription>
                  Enter the details for the new maintenance log entry
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trainNumber">Select Train *</Label>
                    <Select
                      value={newLog.trainNumber}
                      onValueChange={(value) => {
                        const selectedTrain = trainsets.find(t => t.number === value);
                        setNewLog({ 
                          ...newLog, 
                          trainNumber: value,
                          trainsetId: selectedTrain?.id || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a train..." />
                      </SelectTrigger>
                      <SelectContent>
                        {trainsets.map((train) => (
                          <SelectItem key={train.id} value={train.number}>
                            {train.number} - {train.status.toUpperCase()} ({train.mileage.toLocaleString()} km)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="serviceInTime">Service In Time *</Label>
                    <Input
                      id="serviceInTime"
                      type="datetime-local"
                      value={newLog.serviceInTime}
                      onChange={(e) => setNewLog({ ...newLog, serviceInTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maintenanceType">Maintenance Type *</Label>
                    <Select
                      value={newLog.maintenanceType}
                      onValueChange={(value) => setNewLog({ ...newLog, maintenanceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="unscheduled">Unscheduled</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="preventive">Preventive</SelectItem>
                        <SelectItem value="corrective">Corrective</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={newLog.maintenancePriority}
                      onValueChange={(value) => setNewLog({ ...newLog, maintenancePriority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="workDescription">Work Description *</Label>
                  <Textarea
                    id="workDescription"
                    value={newLog.workDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLog({ ...newLog, workDescription: e.target.value })}
                    placeholder="Describe the maintenance work to be performed..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewLogDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createMaintenanceLog} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Log'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={refreshAll} disabled={loading}>
            <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Maintenance Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Maintenance Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center gap-2 mb-3 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading latest logs…</span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Train</th>
                    <th className="text-left p-3">Service In</th>
                    <th className="text-left p-3">Service Out</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Score</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceLogs.map((log) => (
                    <tr key={log._id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="p-3 font-semibold">{log.trainNumber}</td>
                      <td className="p-3 text-sm">{new Date(log.serviceInTime).toLocaleString()}</td>
                      <td className="p-3 text-sm">
                        {log.serviceOutTime ? new Date(log.serviceOutTime).toLocaleString() : '— Pending'}
                      </td>
                      <td className="p-3 text-sm">{log.maintenanceType?.charAt(0).toUpperCase() + log.maintenanceType?.slice(1)}</td>
                      <td className="p-3">{getStatusBadge(log.trainStatus)}</td>
                      <td className="p-3">
                        {log.serviceOutTime && log.performanceAfterMaintenance ? (
                          <span className={`font-bold ${getPerformanceColor(log.overallPerformanceScore)}`}>
                            {log.overallPerformanceScore.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {log.trainStatus === 'in-maintenance' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowCompleteDialog(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(log)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {maintenanceLogs.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No maintenance logs found. Create your first log to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Complete Maintenance Dialog */}
        <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complete Maintenance - {selectedLog?.trainNumber}</DialogTitle>
              <DialogDescription>
                Enter performance metrics after maintenance completion
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="serviceOutTime">Service Out Time *</Label>
                <Input
                  id="serviceOutTime"
                  type="datetime-local"
                  value={completionData.serviceOutTime}
                  onChange={(e) => setCompletionData({ ...completionData, serviceOutTime: e.target.value })}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Performance Parameters (After Maintenance)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(completionData.performanceAfterMaintenance).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (%)
                      </Label>
                      <Input
                        id={key}
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => setCompletionData({
                          ...completionData,
                          performanceAfterMaintenance: {
                            ...completionData.performanceAfterMaintenance,
                            [key]: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="cost">Total Maintenance Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={completionData.totalMaintenanceCost}
                  onChange={(e) => setCompletionData({ ...completionData, totalMaintenanceCost: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={completionData.remarks}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompletionData({ ...completionData, remarks: e.target.value })}
                  placeholder="Any additional remarks..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={completeMaintenance} disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    'Complete Maintenance'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
          </TabsContent>

          <TabsContent value="reports">
            <MaintenanceDurationReport />
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Maintenance Issues {issues.length > 0 ? `(${issues.length})` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length === 0 ? (
                  <div className="text-slate-500">No issues detected in the recent period.</div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((item) => (
                      <div key={`${item.trainNumber}-${item.stats?.minGapHours}-${item.stats?.visitsLastNDays}`} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900 dark:text-white">{item.trainNumber}</div>
                          <Badge className={item.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {item.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
                        {item.recentLogs?.length > 0 && (
                          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                            Recent:
                            <ul className="list-disc ml-5 mt-1 space-y-1">
                              {item.recentLogs.map((l: any) => (
                                <li key={l._id}>
                                  {new Date(l.serviceInTime).toLocaleString()} → {l.serviceOutTime ? new Date(l.serviceOutTime).toLocaleString() : 'Pending'}
                                  {l.maintenanceType ? ` • ${l.maintenanceType}` : ''}
                                  {typeof l.overallPerformanceScore === 'number' ? ` • ${Math.round(l.overallPerformanceScore)}%` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MaintenanceModulePage;
