import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import KMRLLogo from '@/components/KMRLLogo';
import {
  ArrowLeft,
  Search,
  Download,
  RefreshCw,
  Train,
  FileCheck,
  Wrench,
  Sparkles,
  Gauge,
  Droplets,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface TrainDetails {
  id: string;
  number: string;
  status: string;
  
  // 1. Fitness Certificates
  fitness_rolling_stock?: {
    valid: boolean;
    expiry_date: string;
    issued_date: string;
  };
  fitness_signalling?: {
    valid: boolean;
    expiry_date: string;
    issued_date: string;
  };
  fitness_telecom?: {
    valid: boolean;
    expiry_date: string;
    issued_date: string;
  };
  
  // 2. Job Cards
  open_job_cards?: number;
  closed_job_cards?: number;
  emergency_jobs?: number;
  
  // 3. Branding
  branding_priority?: number;
  branding_contract?: string;
  branding_hours_remaining?: number;
  
  // 4. Mileage
  mileage?: number;
  target_mileage?: number;
  bogie_wear?: number;
  brake_pad_wear?: number;
  hvac_wear?: number;
  
  // 5. Cleaning
  last_cleaning?: string;
  next_cleaning?: string;
  cleaning_bay_available?: boolean;
  
  // 6. Stabling
  bay_position?: number;
  stabling_depot?: string;
  shunting_time?: number;
  turnout_time?: number;
  
  availability_percentage?: number;
}

const ComprehensiveTrainDetails: React.FC = () => {
  const [trains, setTrains] = useState<TrainDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTrainDetails();
  }, []);

  const fetchTrainDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/data/comprehensive-train-details');
      
      if (!response.ok) {
        throw new Error('Failed to fetch train details');
      }
      
      const data = await response.json();
      setTrains(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  const isExpiringSoon = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const daysUntilExpiry = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    } catch {
      return false;
    }
  };

  const isExpired = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      return date < now;
    } catch {
      return false;
    }
  };

  const getCertificateStatus = (cert: any) => {
    if (!cert) return <XCircle className="h-4 w-4 text-gray-400" />;
    if (isExpired(cert.expiry_date)) return <XCircle className="h-4 w-4 text-red-600" />;
    if (isExpiringSoon(cert.expiry_date)) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const filteredTrains = trains.filter(train => {
    const matchesSearch = train.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || train.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = [
      'Train Number', 'Status', 'Bay Position', 
      'Rolling Stock Cert', 'Signalling Cert', 'Telecom Cert',
      'Open Jobs', 'Closed Jobs', 'Emergency Jobs',
      'Branding Priority', 'Branding Hours',
      'Mileage', 'Target Mileage', 'Bogie Wear', 'Brake Pad Wear', 'HVAC Wear',
      'Last Cleaning', 'Next Cleaning',
      'Stabling Depot', 'Shunting Time', 'Turnout Time',
      'Availability %'
    ];
    
    const rows = filteredTrains.map(train => [
      train.number,
      train.status,
      train.bay_position || 'N/A',
      train.fitness_rolling_stock ? formatDate(train.fitness_rolling_stock.expiry_date) : 'N/A',
      train.fitness_signalling ? formatDate(train.fitness_signalling.expiry_date) : 'N/A',
      train.fitness_telecom ? formatDate(train.fitness_telecom.expiry_date) : 'N/A',
      train.open_job_cards || 0,
      train.closed_job_cards || 0,
      train.emergency_jobs || 0,
      train.branding_priority || 0,
      train.branding_hours_remaining || 0,
      train.mileage || 0,
      train.target_mileage || 0,
      train.bogie_wear || 0,
      train.brake_pad_wear || 0,
      train.hvac_wear || 0,
      formatDate(train.last_cleaning),
      formatDate(train.next_cleaning),
      train.stabling_depot || 'N/A',
      train.shunting_time || 0,
      train.turnout_time || 0,
      train.availability_percentage || 0
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprehensive-train-details-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading comprehensive train details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchTrainDetails}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Comprehensive Train Details
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Complete operational data for all trains
                </p>
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
        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by train number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="all">All Status</option>
                <option value="ready">Ready</option>
                <option value="standby">Standby</option>
                <option value="maintenance">Maintenance</option>
                <option value="critical">Critical</option>
              </select>
              
              <Button onClick={fetchTrainDetails} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Total Trains: <strong>{filteredTrains.length}</strong></span>
              <span>•</span>
              <span>Ready: <strong>{filteredTrains.filter(t => t.status === 'ready').length}</strong></span>
              <span>•</span>
              <span>Maintenance: <strong>{filteredTrains.filter(t => t.status === 'maintenance').length}</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5 text-blue-600" />
              Comprehensive Train Data ({filteredTrains.length} trains)
            </CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              💡 Scroll horizontally to view all 20 columns (Train, Certificates, Job Cards, Branding, Mileage, Cleaning, Stabling)
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[650px] w-full" style={{ scrollbarWidth: 'auto' }}>
              <table className="w-full text-sm" style={{ minWidth: '2400px' }}>
                  <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold border-r border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Train className="h-4 w-4" />
                          Train
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700" colSpan={3}>
                        <div className="flex items-center justify-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          Fitness Certificates
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700" colSpan={3}>
                        <div className="flex items-center justify-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Job Cards (Maximo)
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700" colSpan={2}>
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Branding
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700" colSpan={5}>
                        <div className="flex items-center justify-center gap-2">
                          <Gauge className="h-4 w-4" />
                          Mileage & Wear
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700" colSpan={2}>
                        <div className="flex items-center justify-center gap-2">
                          <Droplets className="h-4 w-4" />
                          Cleaning
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-semibold" colSpan={4}>
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Stabling Geometry
                        </div>
                      </th>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 py-2 text-left text-xs border-r border-gray-200 dark:border-gray-700">Number / Status</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Rolling Stock</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Signalling</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Telecom</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Open</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Closed</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Emergency</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Priority</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Hours Left</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Current</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Target</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Bogie %</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Brake %</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">HVAC %</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Last</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Next</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Bay</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Depot</th>
                      <th className="px-4 py-2 text-center text-xs border-r border-gray-200 dark:border-gray-700">Shunt (min)</th>
                      <th className="px-4 py-2 text-center text-xs">Turnout (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrains.map((train, index) => (
                      <tr 
                        key={train.id}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                        }`}
                      >
                        {/* Train Info */}
                        <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                          <div className="font-semibold text-blue-600 dark:text-blue-400">{train.number}</div>
                          <Badge className={`text-xs mt-1 ${
                            train.status === 'ready' ? 'bg-green-100 text-green-800' :
                            train.status === 'standby' ? 'bg-yellow-100 text-yellow-800' :
                            train.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {train.status}
                          </Badge>
                        </td>
                        
                        {/* Fitness Certificates */}
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col items-center gap-1">
                            {getCertificateStatus(train.fitness_rolling_stock)}
                            <span className="text-xs">{formatDate(train.fitness_rolling_stock?.expiry_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col items-center gap-1">
                            {getCertificateStatus(train.fitness_signalling)}
                            <span className="text-xs">{formatDate(train.fitness_signalling?.expiry_date)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col items-center gap-1">
                            {getCertificateStatus(train.fitness_telecom)}
                            <span className="text-xs">{formatDate(train.fitness_telecom?.expiry_date)}</span>
                          </div>
                        </td>
                        
                        {/* Job Cards */}
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`font-semibold ${(train.open_job_cards || 0) > 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {train.open_job_cards || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className="text-green-600 font-semibold">{train.closed_job_cards || 0}</span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`font-semibold ${(train.emergency_jobs || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {train.emergency_jobs || 0}
                          </span>
                        </td>
                        
                        {/* Branding */}
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className="font-semibold">{train.branding_priority || 0}/10</span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`${(train.branding_hours_remaining || 0) < 100 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {train.branding_hours_remaining || 0}h
                          </span>
                        </td>
                        
                        {/* Mileage & Wear */}
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className="font-semibold">{(train.mileage || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span>{(train.target_mileage || 0).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`${(train.bogie_wear || 0) > 80 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {train.bogie_wear || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`${(train.brake_pad_wear || 0) > 80 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {train.brake_pad_wear || 0}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          <span className={`${(train.hvac_wear || 0) > 80 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {train.hvac_wear || 0}%
                          </span>
                        </td>
                        
                        {/* Cleaning */}
                        <td className="px-4 py-3 text-center text-xs border-r border-gray-200 dark:border-gray-700">
                          {formatDate(train.last_cleaning)}
                        </td>
                        <td className="px-4 py-3 text-center text-xs border-r border-gray-200 dark:border-gray-700">
                          {formatDate(train.next_cleaning)}
                        </td>
                        
                        {/* Stabling */}
                        <td className="px-4 py-3 text-center font-semibold border-r border-gray-200 dark:border-gray-700">
                          {train.bay_position || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          {train.stabling_depot || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                          {train.shunting_time || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {train.turnout_time || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Valid Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span>Expiring Soon (≤30 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Expired/Invalid</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Shunt/Turnout: Minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComprehensiveTrainDetails;
