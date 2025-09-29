import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Ticket,
  Receipt,
  Wallet,
  ShoppingCart,
  Target,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Percent,
  MapPin,
  Timer,
  Shield,
  Zap,
  Calculator
} from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function TicketingRevenue() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')

  // Revenue Data
  const revenueData = {
    today: { amount: 425000, transactions: 2847, growth: 8.2 },
    week: { amount: 2890000, transactions: 19845, growth: 12.5 },
    month: { amount: 12500000, transactions: 85623, growth: 15.8 }
  }

  // Ticket Types with detailed information
  const ticketTypes = [
    { 
      id: 1,
      type: 'Single Journey', 
      count: 1847, 
      revenue: 184700, 
      percentage: 43.5,
      baseFare: 20,
      description: 'One-way journey ticket',
      validity: '2 hours',
      discount: 0
    },
    { 
      id: 2,
      type: 'Return Journey', 
      count: 892, 
      revenue: 178400, 
      percentage: 42.0,
      baseFare: 35,
      description: 'Round trip ticket with 10% discount',
      validity: '4 hours',
      discount: 10
    },
    { 
      id: 3,
      type: 'Monthly Pass', 
      count: 108, 
      revenue: 61900, 
      percentage: 14.5,
      baseFare: 500,
      description: 'Unlimited travel for one month',
      validity: '30 days',
      discount: 0
    },
    { 
      id: 4,
      type: 'Student Pass', 
      count: 156, 
      revenue: 23400, 
      percentage: 5.5,
      baseFare: 250,
      description: '50% discount for students',
      validity: '30 days',
      discount: 50
    }
  ]

  // Payment Methods
  const paymentMethods = [
    { method: 'Card Payments', count: 1456, percentage: 51.2, color: 'bg-blue-500', successRate: 98.5 },
    { method: 'Mobile Wallets', count: 892, percentage: 31.3, color: 'bg-green-500', successRate: 97.2 },
    { method: 'Cash', count: 499, percentage: 17.5, color: 'bg-orange-500', successRate: 100 },
    { method: 'UPI', count: 234, percentage: 8.2, color: 'bg-purple-500', successRate: 96.8 }
  ]

  // Station Performance
  const stations = [
    { name: 'Aluva', revenue: 125000, passengers: 2847, growth: 12.3, avgFare: 44 },
    { name: 'Pulinchodu', revenue: 98000, passengers: 2234, growth: 8.7, avgFare: 44 },
    { name: 'Companypady', revenue: 87000, passengers: 1987, growth: 15.2, avgFare: 44 },
    { name: 'Ambattukavu', revenue: 76000, passengers: 1734, growth: 6.8, avgFare: 44 },
    { name: 'Muttom', revenue: 39000, passengers: 891, growth: 9.4, avgFare: 44 }
  ]

  // User Ticket History
  const userTicketHistory = [
    { id: 'T001', type: 'Single Journey', from: 'Aluva', to: 'Muttom', fare: 20, date: '2024-01-15', status: 'Used', paymentMethod: 'Card' },
    { id: 'T002', type: 'Return Journey', from: 'Pulinchodu', to: 'Companypady', fare: 35, date: '2024-01-14', status: 'Used', paymentMethod: 'UPI' },
    { id: 'T003', type: 'Monthly Pass', from: 'All Stations', to: 'All Stations', fare: 500, date: '2024-01-01', status: 'Active', paymentMethod: 'Card' },
    { id: 'T004', type: 'Single Journey', from: 'Ambattukavu', to: 'Muttom', fare: 20, date: '2024-01-13', status: 'Expired', paymentMethod: 'Cash' }
  ]

  // Payment Status
  const paymentStatus = {
    successful: { count: 2689, percentage: 94.5, amount: 401500 },
    pending: { count: 89, percentage: 3.1, amount: 13400 },
    failed: { count: 69, percentage: 2.4, amount: 10100 }
  }

  // Revenue Analytics
  const revenueAnalytics = [
    { period: 'Jan', revenue: 1200000, target: 1500000, achievement: 80 },
    { period: 'Feb', revenue: 1350000, target: 1500000, achievement: 90 },
    { period: 'Mar', revenue: 1420000, target: 1500000, achievement: 95 },
    { period: 'Apr', revenue: 1480000, target: 1500000, achievement: 99 },
    { period: 'May', revenue: 1520000, target: 1500000, achievement: 101 },
    { period: 'Jun', revenue: 1580000, target: 1600000, achievement: 99 }
  ]

  // Fare Calculator Data
  const fareRules = [
    { from: 'Aluva', to: 'Muttom', distance: 25, baseFare: 20, peakFare: 25 },
    { from: 'Aluva', to: 'Companypady', distance: 15, baseFare: 15, peakFare: 18 },
    { from: 'Pulinchodu', to: 'Ambattukavu', distance: 20, baseFare: 18, peakFare: 22 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Ticketing & Revenue Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive ticketing system with revenue analytics and management tools
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">LIVE</span>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="history">User History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Period Selector */}
            <div className="flex space-x-2">
              {['today', 'week', 'month'].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period}
                </Button>
              ))}
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ₹{revenueData[selectedPeriod as keyof typeof revenueData].amount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      +{revenueData[selectedPeriod as keyof typeof revenueData].growth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Transactions</h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {revenueData[selectedPeriod as keyof typeof revenueData].transactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Total transactions</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Avg. Ticket Price</h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    ₹{Math.round(revenueData[selectedPeriod as keyof typeof revenueData].amount / revenueData[selectedPeriod as keyof typeof revenueData].transactions)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Per transaction</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">94.5%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Payment success</p>
                </CardContent>
              </Card>
            </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Types */}
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-green-600" />
                <span>Ticket Types Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ticketTypes.map((ticket, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-white">{ticket.type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{ticket.count} tickets</span>
                        <Badge variant="secondary" className="text-xs">
                          {ticket.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${ticket.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Revenue: ₹{ticket.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 dark:text-white">{method.method}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{method.count} transactions</span>
                        <Badge variant="secondary" className="text-xs">
                          {method.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${method.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${method.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Performance */}
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span>Station Revenue Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stations.map((station, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">{station.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{station.passengers} passengers</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      ₹{station.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        +{station.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button className="h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" className="h-12">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button variant="outline" className="h-12">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Report
                  </Button>
                  <Button variant="outline" className="h-12">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Set Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ticket Types Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ticket className="w-5 h-5 text-green-600" />
                  <span>Ticket Types & Fare Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{ticket.type}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{ticket.baseFare}</p>
                          {ticket.discount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {ticket.discount}% off
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Sold</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{ticket.count}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                          <p className="font-semibold text-gray-800 dark:text-white">₹{ticket.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Percentage</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{ticket.percentage}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Validity</p>
                          <p className="font-semibold text-gray-800 dark:text-white">{ticket.validity}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Payment Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800 dark:text-white">{method.method}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{method.count} transactions</span>
                            <Badge variant="secondary" className="text-xs">
                              {method.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`${method.color} h-2 rounded-full transition-all duration-1000`}
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                          <span className="font-medium text-gray-800 dark:text-white">{method.successRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Payment Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Successful</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{paymentStatus.successful.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ₹{paymentStatus.successful.amount.toLocaleString()}
                        </p>
                        <Badge variant="default" className="text-xs">{paymentStatus.successful.percentage}%</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-yellow-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Pending</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{paymentStatus.pending.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          ₹{paymentStatus.pending.amount.toLocaleString()}
                        </p>
                        <Badge variant="secondary" className="text-xs">{paymentStatus.pending.percentage}%</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">Failed</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{paymentStatus.failed.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          ₹{paymentStatus.failed.amount.toLocaleString()}
                        </p>
                        <Badge variant="destructive" className="text-xs">{paymentStatus.failed.percentage}%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Receipt className="w-5 h-5 text-purple-600" />
                  <span>User Ticket History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userTicketHistory.map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <Ticket className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">{ticket.id}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.type}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{ticket.from} → {ticket.to}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={ticket.status === 'Active' ? 'default' : ticket.status === 'Used' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {ticket.status}
                          </Badge>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            ₹{ticket.fare}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {ticket.date} • {ticket.paymentMethod}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>Revenue Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueAnalytics.map((analytics, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{analytics.period}</h4>
                        <Badge 
                          variant={analytics.achievement >= 100 ? 'default' : analytics.achievement >= 90 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {analytics.achievement}% Target
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{analytics.revenue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Target</p>
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            ₹{analytics.target.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(analytics.achievement, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Controls Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Ticket Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Ticket Type
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Ticket Types
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Ticket Type
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Reports & Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                      <Download className="w-4 h-4 mr-2" />
                      Export Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Reports
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
