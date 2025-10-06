import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface MaintenanceLogDetail {
  _id: string;
  serviceInTime: string;
  serviceOutTime: string | null;
  maintenanceType: string;
  description: string;
  maintenanceDuration: number;
  overallPerformanceScore: number;
  totalMaintenanceCost: number;
  trainStatus: string;
  alertType: string;
  status: string;
  performanceParameters?: {
    braking_system_score: number;
    traction_system_score: number;
    door_system_score: number;
    signaling_score: number;
    hvac_score: number;
    battery_health_score: number;
  };
}

interface TrainMaintenanceReport {
  trainNumber: string;
  trainId: string;
  currentStatus: string;
  totalMaintenanceDays: number;
  totalMaintenanceSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  averagePerformanceScore: number;
  totalMaintenanceCost: number;
  mileage: number;
  availability: number;
  lastMaintenance: string | null;
  maintenanceLogs: MaintenanceLogDetail[];
}

interface DurationReportData {
  success: boolean;
  period: string;
  periodStart: string;
  periodEnd: string;
  totalTrains: number;
  data: TrainMaintenanceReport[];
}

const MaintenanceDurationReport = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [reportData, setReportData] = useState<DurationReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/maintenance/duration-report?period=${period}`);
      const data = await res.json();
      
      if (data.success) {
        setReportData(data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching duration report:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance duration report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Normalize backend status variants to frontend set
  const normalizeStatus = (status: string) => {
    if (!status) return 'standby';
    const s = status.toLowerCase();
    const map: Record<string, string> = {
      'in_service': 'ready',
      'ready': 'ready',
      'standby': 'standby',
      'maintenance': 'maintenance',
      'ibl_maintenance': 'maintenance',
      'critical': 'critical'
    };
    return map[s] || 'standby';
  };

  // Use only trains with real maintenance activity; normalize status for display
  const getVisibleData = (data: TrainMaintenanceReport[]) => {
    return data
      .map((t) => ({
        ...t,
        currentStatus: normalizeStatus(t.currentStatus)
      }))
      .filter((t) =>
        (t.totalMaintenanceSessions ?? 0) > 0 ||
        (t.totalMaintenanceDays ?? 0) > 0 ||
        (t.totalMaintenanceCost ?? 0) > 0 ||
        (t.averagePerformanceScore ?? 0) > 0
      );
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Maintenance Duration Report', 14, 20);
    
    // Period info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const periodLabel = period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly';
    doc.text(`Period: ${periodLabel} Report`, 14, 28);
    
  const startDate = new Date(reportData.periodStart).toLocaleDateString();
  const endDate = new Date(reportData.periodEnd).toLocaleDateString();
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 34);
  const visible = getVisibleData(reportData.data);
  doc.text(`Active Trains: ${visible.length}`, 14, 40);
    
    // Summary statistics
    const totalDays = visible.reduce((sum, train) => sum + train.totalMaintenanceDays, 0);
    const totalSessions = visible.reduce((sum, train) => sum + train.totalMaintenanceSessions, 0);
    const totalCost = visible.reduce((sum, train) => sum + train.totalMaintenanceCost, 0);
    const avgPerformance = visible.length > 0
      ? visible.reduce((sum, train) => sum + (train.averagePerformanceScore || 0), 0) / visible.length
      : 0;
    
    doc.text(`Total Maintenance Days: ${totalDays.toFixed(2)}`, 14, 46);
    doc.text(`Total Sessions: ${totalSessions}`, 14, 52);
    doc.text(`Total Cost: ₹${totalCost.toLocaleString()}`, 14, 58);
    doc.text(`Average Performance: ${avgPerformance.toFixed(2)}%`, 14, 64);

    // Generate detailed report for each train with maintenance logs
    let yPosition = 72;
    
  visible.forEach((train) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Train header section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(66, 139, 202);
      doc.rect(14, yPosition, 182, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`Train ${train.trainNumber}`, 16, yPosition + 5.5);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Train summary
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${train.currentStatus.toUpperCase()} | Sessions: ${train.totalMaintenanceSessions} | Days: ${train.totalMaintenanceDays.toFixed(2)} | Cost: ₹${train.totalMaintenanceCost.toLocaleString()}`, 16, yPosition);
      yPosition += 6;

      if (train.maintenanceLogs && train.maintenanceLogs.length > 0) {
        // Maintenance logs table for this train
        const logsData = train.maintenanceLogs.map(log => [
          new Date(log.serviceInTime).toLocaleDateString(),
          log.serviceOutTime ? new Date(log.serviceOutTime).toLocaleDateString() : 'In Progress',
          log.maintenanceType || 'N/A',
          log.maintenanceDuration ? log.maintenanceDuration.toFixed(2) + ' hrs' : 'N/A',
          log.overallPerformanceScore ? log.overallPerformanceScore.toFixed(1) + '%' : 'N/A',
          log.totalMaintenanceCost ? '₹' + log.totalMaintenanceCost.toLocaleString() : 'N/A',
          log.status || 'N/A'
        ]);

        autoTable(doc, {
          head: [['Service In', 'Service Out', 'Type', 'Duration', 'Performance', 'Cost', 'Status']],
          body: logsData,
          startY: yPosition,
          margin: { left: 16, right: 14 },
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [100, 149, 237], fontStyle: 'bold', fontSize: 7 },
          alternateRowStyles: { fillColor: [245, 245, 245] },
          columnStyles: {
            0: { cellWidth: 24 },
            1: { cellWidth: 24 },
            2: { cellWidth: 28 },
            3: { cellWidth: 22 },
            4: { cellWidth: 24 },
            5: { cellWidth: 24 },
            6: { cellWidth: 22 }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 8;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('No maintenance logs in this period', 16, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
      }

      // Add some spacing between trains
      yPosition += 2;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    doc.save(`Maintenance_Duration_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Report downloaded successfully",
    });
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const headers = [
      'Train Number',
      'Maintenance Days',
      'Total Sessions',
      'Completed Sessions',
      'In Progress',
      'Avg Performance Score',
      'Total Cost',
      'Current Status',
      'Mileage',
      'Availability %',
      'Last Maintenance'
    ];

    const visible = getVisibleData(reportData.data);
    const rows = visible.map(train => [
      train.trainNumber,
      train.totalMaintenanceDays.toFixed(2),
      train.totalMaintenanceSessions,
      train.completedSessions,
      train.inProgressSessions,
      train.averagePerformanceScore ? train.averagePerformanceScore.toFixed(2) : 'N/A',
      train.totalMaintenanceCost,
      train.currentStatus,
      train.mileage,
      train.availability,
      train.lastMaintenance ? new Date(train.lastMaintenance).toLocaleString() : 'Never'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Maintenance_Duration_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Success",
      description: "CSV report downloaded successfully",
    });
  };

  const getStatusColor = (status: string) => {
    const st = normalizeStatus(status);
    switch (st) {
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'standby':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <CardTitle>Maintenance Duration Report</CardTitle>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={downloadPDF} disabled={loading || !reportData}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button onClick={downloadCSV} variant="outline" disabled={loading || !reportData}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading report data...</span>
            </div>
          ) : reportData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Maintenance Days</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {getVisibleData(reportData.data).reduce((sum, train) => sum + train.totalMaintenanceDays, 0).toFixed(1)}
                        </p>
                      </div>
                      <Clock className="h-10 w-10 text-blue-600 opacity-70" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Sessions</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {getVisibleData(reportData.data).reduce((sum, train) => sum + train.totalMaintenanceSessions, 0)}
                        </p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-purple-600 opacity-70" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Avg Performance</p>
                        <p className="text-2xl font-bold text-green-700">
                          {(() => { const v = getVisibleData(reportData.data); return (v.length ? (v.reduce((s, t) => s + (t.averagePerformanceScore || 0), 0) / v.length) : 0).toFixed(1); })()}%
                        </p>
                      </div>
                      <CheckCircle2 className="h-10 w-10 text-green-600 opacity-70" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                        <p className="text-2xl font-bold text-orange-700">
                          ₹{getVisibleData(reportData.data).reduce((sum, train) => sum + train.totalMaintenanceCost, 0).toLocaleString()}
                        </p>
                      </div>
                      <AlertCircle className="h-10 w-10 text-orange-600 opacity-70" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Train</th>
                        <th className="px-4 py-3 text-left font-semibold">Days in Maintenance</th>
                        <th className="px-4 py-3 text-left font-semibold">Sessions</th>
                        <th className="px-4 py-3 text-left font-semibold">Completed</th>
                        <th className="px-4 py-3 text-left font-semibold">In Progress</th>
                        <th className="px-4 py-3 text-left font-semibold">Avg Score</th>
                        <th className="px-4 py-3 text-left font-semibold">Total Cost</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {getVisibleData(reportData.data).map((train) => (
                        <tr key={train.trainId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{train.trainNumber}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-blue-700">
                              {train.totalMaintenanceDays.toFixed(2)}
                            </span> days
                          </td>
                          <td className="px-4 py-3">{train.totalMaintenanceSessions}</td>
                          <td className="px-4 py-3">
                            <span className="text-green-600 font-medium">
                              {train.completedSessions}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {train.inProgressSessions > 0 ? (
                              <span className="text-orange-600 font-medium">
                                {train.inProgressSessions}
                              </span>
                            ) : (
                              <span className="text-gray-400">0</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {train.averagePerformanceScore > 0 ? (
                              <span className={`font-semibold ${getPerformanceColor(train.averagePerformanceScore)}`}>
                                {train.averagePerformanceScore.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3">₹{train.totalMaintenanceCost.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge className={getStatusColor(train.currentStatus)}>
                              {normalizeStatus(train.currentStatus).toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {reportData.data.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No maintenance data found for the selected period</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Failed to load report data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceDurationReport;
