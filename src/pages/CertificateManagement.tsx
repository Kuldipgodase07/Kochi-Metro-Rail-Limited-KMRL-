import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Upload,
  Download,
  Search,
  Plus,
  Eye,
  Edit,
  Clock,
  Award,
  Shield,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

interface Certificate {
  id: string;
  trainset: string;
  type: 'fitness' | 'safety' | 'performance' | 'environmental' | 'compliance';
  name: string;
  authority: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring' | 'expired' | 'pending-renewal' | 'suspended';
  certificateNumber: string;
  inspector: string;
  nextInspectionDate: string;
  documents: string[];
  complianceScore: number;
  remarks?: string;
  renewalCost: number;
  criticalityLevel: 'critical' | 'high' | 'medium' | 'low';
}

const mockCertificates: Certificate[] = [
  {
    id: '1',
    trainset: 'KMRL-001',
    type: 'fitness',
    name: 'Rolling Stock Fitness Certificate',
    authority: 'Commissioner of Metro Railway Safety (CMRS)',
    issueDate: '2023-09-15',
    expiryDate: '2024-09-15',
    status: 'expiring',
    certificateNumber: 'CMRS/KMRL/2023/001',
    inspector: 'Dr. Rajesh Kumar',
    nextInspectionDate: '2024-08-15',
    documents: ['Fitness_Certificate.pdf', 'Inspection_Report.pdf'],
    complianceScore: 92,
    renewalCost: 150000,
    criticalityLevel: 'critical'
  },
  {
    id: '2',
    trainset: 'KMRL-005',
    type: 'safety',
    name: 'Fire Safety Compliance Certificate',
    authority: 'Kerala Fire & Rescue Services',
    issueDate: '2024-03-20',
    expiryDate: '2025-03-20',
    status: 'valid',
    certificateNumber: 'KFRS/KMRL/2024/005',
    inspector: 'Fire Officer M. Nair',
    nextInspectionDate: '2025-02-20',
    documents: ['Fire_Safety_Certificate.pdf', 'Fire_Audit_Report.pdf'],
    complianceScore: 98,
    renewalCost: 75000,
    criticalityLevel: 'high'
  },
  {
    id: '3',
    trainset: 'KMRL-009',
    type: 'environmental',
    name: 'Environmental Clearance Certificate',
    authority: 'Kerala Pollution Control Board',
    issueDate: '2023-06-10',
    expiryDate: '2024-06-10',
    status: 'expired',
    certificateNumber: 'KPCB/KMRL/2023/009',
    inspector: 'Environmental Officer P. Das',
    nextInspectionDate: '2024-05-10',
    documents: ['Environmental_Certificate.pdf'],
    complianceScore: 78,
    renewalCost: 50000,
    criticalityLevel: 'medium'
  },
  {
    id: '4',
    trainset: 'KMRL-013',
    type: 'performance',
    name: 'Performance & Efficiency Certificate',
    authority: 'Research Design & Standards Organisation (RDSO)',
    issueDate: '2024-01-15',
    expiryDate: '2025-01-15',
    status: 'valid',
    certificateNumber: 'RDSO/KMRL/2024/013',
    inspector: 'Technical Expert S. Sharma',
    nextInspectionDate: '2024-12-15',
    documents: ['Performance_Certificate.pdf', 'Efficiency_Report.pdf', 'Test_Results.pdf'],
    complianceScore: 95,
    renewalCost: 120000,
    criticalityLevel: 'high'
  },
  {
    id: '5',
    trainset: 'KMRL-017',
    type: 'compliance',
    name: 'Accessibility Compliance Certificate',
    authority: 'Ministry of Railways',
    issueDate: '2024-07-01',
    expiryDate: '2026-07-01',
    status: 'valid',
    certificateNumber: 'MOR/ACC/2024/017',
    inspector: 'Accessibility Auditor K. Menon',
    nextInspectionDate: '2026-06-01',
    documents: ['Accessibility_Certificate.pdf', 'Compliance_Audit.pdf'],
    complianceScore: 89,
    renewalCost: 80000,
    criticalityLevel: 'medium'
  }
];

const CertificateManagement: React.FC = () => {
  const [certificates] = useState<Certificate[]>(mockCertificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'valid': { color: 'bg-green-500', text: 'Valid' },
      'expiring': { color: 'bg-yellow-500', text: 'Expiring Soon' },
      'expired': { color: 'bg-red-500', text: 'Expired' },
      'pending-renewal': { color: 'bg-orange-500', text: 'Pending Renewal' },
      'suspended': { color: 'bg-gray-500', text: 'Suspended' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'fitness': { color: 'bg-blue-500', text: 'Fitness', icon: Shield },
      'safety': { color: 'bg-red-500', text: 'Safety', icon: AlertTriangle },
      'performance': { color: 'bg-purple-500', text: 'Performance', icon: TrendingDown },
      'environmental': { color: 'bg-green-500', text: 'Environmental', icon: Award },
      'compliance': { color: 'bg-orange-500', text: 'Compliance', icon: CheckCircle }
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getCriticalityBadge = (level: string) => {
    const criticalityConfig = {
      'critical': { color: 'bg-red-600', text: 'Critical' },
      'high': { color: 'bg-orange-500', text: 'High' },
      'medium': { color: 'bg-yellow-500', text: 'Medium' },
      'low': { color: 'bg-green-500', text: 'Low' }
    };
    const config = criticalityConfig[level as keyof typeof criticalityConfig];
    return <Badge className={`${config.color} text-white`}>{config.text}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.trainset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const certificateMetrics = {
    totalCertificates: certificates.length,
    validCertificates: certificates.filter(c => c.status === 'valid').length,
    expiringSoon: certificates.filter(c => {
      const days = getDaysUntilExpiry(c.expiryDate);
      return days <= 30 && days > 0;
    }).length,
    expired: certificates.filter(c => c.status === 'expired').length,
    averageCompliance: Math.round(certificates.reduce((acc, c) => acc + c.complianceScore, 0) / certificates.length),
    totalRenewalCost: certificates.reduce((acc, c) => acc + c.renewalCost, 0),
    criticalCertificates: certificates.filter(c => c.criticalityLevel === 'critical').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-600">Fitness certificates, compliance tracking & renewal management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Authorities
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Certificate
          </Button>
        </div>
      </div>

      {/* Certificate Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valid Certificates</p>
                <p className="text-2xl font-bold text-green-600">{certificateMetrics.validCertificates}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{certificateMetrics.expiringSoon}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{certificateMetrics.expired}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Certs</p>
                <p className="text-2xl font-bold text-purple-600">{certificateMetrics.criticalCertificates}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-600" />
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
                <p className="text-sm font-medium text-gray-600">Avg Compliance Score</p>
                <p className="text-xl font-bold text-gray-900">{certificateMetrics.averageCompliance}%</p>
              </div>
              <div className="w-16 h-16">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2"/>
                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="#3b82f6" strokeWidth="2"
                            strokeDasharray={`${certificateMetrics.averageCompliance * 0.97} 97`}
                            strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-600">{certificateMetrics.averageCompliance}%</span>
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
                <p className="text-sm font-medium text-gray-600">Total Renewal Cost</p>
                <p className="text-xl font-bold text-gray-900">₹{(certificateMetrics.totalRenewalCost / 100000).toFixed(1)}L</p>
              </div>
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Renewal Due (30 days)</p>
                <p className="text-xl font-bold text-orange-600">{certificateMetrics.expiringSoon}</p>
              </div>
              <Calendar className="w-6 h-6 text-orange-600" />
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
                  placeholder="Search by trainset, certificate name, or number..."
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
                <option value="valid">Valid</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="pending-renewal">Pending Renewal</option>
              </select>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => {
          const daysUntilExpiry = getDaysUntilExpiry(certificate.expiryDate);
          return (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedCertificate(certificate)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{certificate.trainset}</CardTitle>
                    <p className="text-sm text-gray-600">{certificate.authority}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(certificate.status)}
                    {getCriticalityBadge(certificate.criticalityLevel)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{certificate.name}</h4>
                  <p className="text-sm text-gray-600">Cert #: {certificate.certificateNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getTypeBadge(certificate.type)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Issued</p>
                    <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expires</p>
                    <p className="font-medium">{new Date(certificate.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Compliance: {certificate.complianceScore}%</span>
                  <span className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-600' : 
                    daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days overdue` :
                     daysUntilExpiry < 30 ? `${daysUntilExpiry} days left` : 'Valid'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <FileText className="w-3 h-3" />
                  <span>{certificate.documents.length} document(s)</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Certificate Details Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{selectedCertificate.name}</CardTitle>
                  <p className="text-gray-600">{selectedCertificate.trainset} • {selectedCertificate.authority}</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedCertificate(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="renewal">Renewal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">Certificate Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(selectedCertificate.status)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          {getTypeBadge(selectedCertificate.type)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Criticality:</span>
                          {getCriticalityBadge(selectedCertificate.criticalityLevel)}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Certificate #:</span>
                          <span>{selectedCertificate.certificateNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inspector:</span>
                          <span>{selectedCertificate.inspector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Authority:</span>
                          <span>{selectedCertificate.authority}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Validity & Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issue Date:</span>
                          <span>{new Date(selectedCertificate.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expiry Date:</span>
                          <span>{new Date(selectedCertificate.expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Next Inspection:</span>
                          <span>{new Date(selectedCertificate.nextInspectionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days Until Expiry:</span>
                          <span className={getDaysUntilExpiry(selectedCertificate.expiryDate) < 30 ? 'text-red-600 font-medium' : ''}>
                            {getDaysUntilExpiry(selectedCertificate.expiryDate)} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Renewal Cost:</span>
                          <span>₹{selectedCertificate.renewalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCertificate.remarks && (
                    <div>
                      <h3 className="font-semibold mb-2">Remarks</h3>
                      <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                        {selectedCertificate.remarks}
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="compliance" className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Compliance Score</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Overall Compliance</span>
                          <span>{selectedCertificate.complianceScore}%</span>
                        </div>
                        <Progress value={selectedCertificate.complianceScore} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-green-600">Compliant Areas</h4>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Safety systems operational</li>
                            <li>• Emergency equipment functional</li>
                            <li>• Regular maintenance completed</li>
                            <li>• Documentation up to date</li>
                          </ul>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-orange-600">Areas for Improvement</h4>
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Minor cosmetic issues</li>
                            <li>• Non-critical equipment checks</li>
                            <li>• Process documentation updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <h3 className="font-semibold">Associated Documents</h3>
                  <div className="space-y-3">
                    {selectedCertificate.documents.map((document, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span>{document}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Document
                  </Button>
                </TabsContent>
                
                <TabsContent value="renewal" className="space-y-4">
                  <h3 className="font-semibold">Renewal Planning</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Renewal Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Start Renewal Process:</span>
                            <span>60 days before expiry</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Submit Application:</span>
                            <span>45 days before expiry</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Inspection Date:</span>
                            <span>30 days before expiry</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expected Completion:</span>
                            <span>15 days before expiry</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Renewal Checklist</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">Previous certificate review</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm">Pre-inspection maintenance</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Documentation preparation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">Schedule inspection</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button className="flex-1">
                      Start Renewal Process
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Schedule Inspection
                    </Button>
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

export default CertificateManagement;