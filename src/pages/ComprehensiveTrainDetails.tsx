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
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-metro-teal/20 rounded-full"></div>
            </div>
            <RefreshCw className="h-12 w-12 animate-spin text-metro-teal mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium mt-4">Loading comprehensive train details...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Fetching data from all modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 flex items-center justify-center">
        <Card className="max-w-md shadow-2xl border-2 border-red-200">
          <CardContent className="p-6 text-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchTrainDetails} className="bg-metro-teal hover:bg-metro-teal-dark">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header with Metro Theme */}
      <header className="bg-gradient-to-r from-metro-teal to-cyan-600 dark:from-metro-teal-darker dark:to-cyan-900 backdrop-blur-md border-b-4 border-white/20 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <KMRLLogo height={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Train className="h-6 w-6" />
                  Comprehensive Data Module
                </h1>
                <p className="text-sm text-white/90 font-medium">
                  Real-time operational intelligence • 100 Trains • 20 Data Points
                </p>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="bg-white/20 border-white/40 text-white hover:bg-white/30 hover:text-white backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Ready Trains</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {filteredTrains.filter(t => t.status === 'ready').length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Standby</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {filteredTrains.filter(t => t.status === 'standby').length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Maintenance</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {filteredTrains.filter(t => t.status === 'maintenance').length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-rose-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Critical</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {filteredTrains.filter(t => t.status === 'critical').length}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="shadow-lg border-t-4 border-metro-teal">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-metro-teal group-hover:scale-110 transition-transform" />
                  <Input
                    placeholder="Search by train number (e.g., R1028)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 border-2 border-gray-300 focus:border-metro-teal dark:border-gray-600 dark:focus:border-metro-teal transition-all"
                  />
                </div>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 font-medium hover:border-metro-teal focus:border-metro-teal focus:ring-2 focus:ring-metro-teal/20 transition-all cursor-pointer"
              >
                <option value="all">🚄 All Status</option>
                <option value="ready">✅ Ready</option>
                <option value="standby">⏸️ Standby</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="critical">⚠️ Critical</option>
              </select>
              
              <Button 
                onClick={fetchTrainDetails} 
                variant="outline" 
                className="h-11 border-2 border-metro-teal text-metro-teal hover:bg-metro-teal hover:text-white transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button 
                onClick={exportToCSV} 
                className="h-11 bg-gradient-to-r from-metro-teal to-cyan-600 hover:from-metro-teal-dark hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            
            <div className="mt-4 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-metro-teal animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  Total Trains: <strong className="text-metro-teal font-bold text-lg">{filteredTrains.length}</strong>
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 dark:text-gray-400">
                Showing: <strong>{filteredTrains.length}</strong> of <strong>{trains.length}</strong> records
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="shadow-2xl border-t-4 border-metro-teal">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 border-b-2 border-metro-teal/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="bg-metro-teal p-2 rounded-lg">
                    <Train className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-metro-teal to-cyan-600 bg-clip-text text-transparent">
                    Comprehensive Train Data
                  </span>
                  <Badge className="bg-metro-teal text-white text-lg px-3 py-1">
                    {filteredTrains.length} trains
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                    💡 Pro Tip
                  </span>
                  <span>Scroll horizontally to view all 20 data columns across 6 integrated modules</span>
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-auto max-h-[650px] w-full relative custom-scrollbar">
              <table className="w-full text-sm" style={{ minWidth: '2400px' }}>
                  <thead className="bg-gradient-to-r from-metro-teal to-cyan-600 text-white sticky top-0 z-10 shadow-lg">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold border-r border-white/20">
                        <div className="flex items-center gap-2">
                          <Train className="h-5 w-5" />
                          Train
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold border-r border-white/20" colSpan={3}>
                        <div className="flex items-center justify-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          Fitness Certificates
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold border-r border-white/20" colSpan={3}>
                        <div className="flex items-center justify-center gap-2">
                          <Wrench className="h-5 w-5" />
                          Job Cards (Maximo)
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold border-r border-white/20" colSpan={2}>
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Branding
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold border-r border-white/20" colSpan={5}>
                        <div className="flex items-center justify-center gap-2">
                          <Gauge className="h-5 w-5" />
                          Mileage & Wear
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold border-r border-white/20" colSpan={2}>
                        <div className="flex items-center justify-center gap-2">
                          <Droplets className="h-5 w-5" />
                          Cleaning
                        </div>
                      </th>
                      <th className="px-4 py-4 text-center font-bold" colSpan={4}>
                        <div className="flex items-center justify-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Stabling Geometry
                        </div>
                      </th>
                    </tr>
                    <tr className="bg-teal-500/10 dark:bg-teal-900/20 text-white font-semibold">
                      <th className="px-4 py-3 text-left text-xs border-r border-white/10">Number / Status</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Rolling Stock</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Signalling</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Telecom</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Open</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Closed</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Emergency</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Priority</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Hours Left</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Current</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Target</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Bogie %</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Brake %</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">HVAC %</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Last</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Next</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Bay</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Depot</th>
                      <th className="px-4 py-3 text-center text-xs border-r border-white/10">Shunt (min)</th>
                      <th className="px-4 py-3 text-center text-xs">Turnout (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrains.map((train, index) => (
                      <tr 
                        key={train.id}
                        className={`border-b border-gray-200 dark:border-gray-700 hover:bg-metro-teal/5 dark:hover:bg-metro-teal/10 transition-all duration-200 cursor-pointer group ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                        }`}
                      >
                        {/* Train Info */}
                        <td className="px-4 py-4 border-r border-gray-200 dark:border-gray-700">
                          <div className="font-bold text-lg text-metro-teal group-hover:text-metro-teal-dark transition-colors">
                            {train.number}
                          </div>
                          <Badge className={`text-xs mt-1.5 font-semibold ${
                            train.status === 'ready' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0' :
                            train.status === 'standby' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' :
                            train.status === 'maintenance' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0' :
                            'bg-gradient-to-r from-red-600 to-rose-700 text-white border-0'
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

        {/* Enhanced Legend */}
        <Card className="shadow-xl border-t-4 border-metro-teal bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="w-1 h-6 bg-metro-teal rounded-full"></div>
              Data Legend & Status Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-green-500">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Valid Certificate</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Active & Compliant</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-yellow-500">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Expiring Soon</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Within 30 days</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-red-500">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Expired/Invalid</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Requires Attention</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 border-metro-teal">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-metro-teal" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Time Units</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Shunt/Turnout in Minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Integration Info */}
            <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                <span className="text-metro-teal font-bold">📊 Integrated Data Modules:</span> 
                This comprehensive view combines data from 6 core systems
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <FileCheck className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Certificates</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <Wrench className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Job Cards</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <Sparkles className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Branding</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <Gauge className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Mileage</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <Droplets className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Cleaning</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-sm">
                  <MapPin className="h-4 w-4 text-metro-teal" />
                  <span className="text-xs font-medium">Stabling</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ComprehensiveTrainDetails;
