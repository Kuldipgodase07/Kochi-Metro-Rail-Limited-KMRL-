import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SystemMetrics } from "./SystemMetrics"
import { SettingsPanel } from './SettingsPanel-simple'
import { LanguageSelector } from './LanguageSelector'
import { FuturisticNavigation } from './FuturisticNavigation'
import { useRealtimeMetrics } from "@/hooks/useTrainData"
import { RefreshCw, Settings, LogOut, UserCheck } from "lucide-react"
import KMRLLogo from './KMRLLogo'
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { NotificationsBell } from './NotificationsBell'

export function Dashboard() {
  const { t } = useTranslation()
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useRealtimeMetrics()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [liveTime, setLiveTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetchMetrics()
      toast({
        title: "Data Refreshed",
        description: "System metrics have been updated successfully.",
      })
    } catch {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }


  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <div className={`min-h-screen bg-teal-gradient bg-teal-gradient-dark`}>
      {/* Header */}
      <header className="bg-white/90 dark-header backdrop-blur-md border-b border-teal-200 dark:border-teal-800 sticky top-0 z-50 shadow-sm dark:shadow-xl dark:shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} className="drop-shadow-sm" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">{t('app.title')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('app.subtitle')}</p>
              </div>
              {user && (
                <div className="ml-4 px-3 py-1 bg-teal-100 dark:bg-teal-900/30 dark:border dark:border-teal-500/30 rounded-full">
                  <span className="text-sm text-teal-800 dark:text-teal-200 font-medium">Welcome, {user.fullName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {/* Simple, consistent, interactive Live Time Bar */}
              <div
                className="flex items-center gap-2 px-4 py-1 rounded-full bg-white/80 dark:bg-teal-900/80 border border-teal-200 dark:border-teal-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer select-none"
                title="Live Metro Time"
              >
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" className="opacity-30" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                </svg>
                <span className="font-mono text-base font-semibold text-gray-900 dark:text-gray-100 tracking-widest">
                  {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="uppercase text-xs text-teal-700 dark:text-teal-300 ml-1 tracking-wider">IST</span>
              </div>
              <LanguageSelector />
              <NotificationsBell />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="hover:bg-teal-50 dark:hover:bg-teal-900/20 dark:border-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-all duration-200"
                title={isRefreshing ? t('common.loading') : t('common.refresh')}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-teal-50 dark:hover:bg-teal-900/20 dark:border-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-all duration-200" title={t('settings.title')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('settings.title')}</DialogTitle>
                  </DialogHeader>
                  <SettingsPanel />
                </DialogContent>
              </Dialog>
              
              {/* Report button removed: reporting is available in navigation bar */}
              
              {user?.role === 'super_admin' && (
                <Link to="/admin/approvals">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-teal-50 dark:hover:bg-teal-900/20 dark:border-teal-600 dark:text-gray-300 dark:hover:text-teal-400 transition-all duration-200"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    User Approvals
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-teal-600 dark:text-gray-300 dark:hover:text-red-400 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Metrics */}
        <div className="mb-8">
          <SystemMetrics metrics={metrics} isLoading={metricsLoading} />
        </div>

        {/* Futuristic Navigation */}
        <div className="mb-8">
          <FuturisticNavigation />
        </div>

        {/* Welcome Message */}
        <div className="mt-8 text-center">
          <div className="bg-white/80 dark:bg-teal-900/80 backdrop-blur-sm rounded-2xl border border-teal-200 dark:border-teal-700 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Kochi Metro Rail Management System
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select any module from the navigation above to access specific features and management tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Fleet Management</h3>
                <p className="text-teal-600 dark:text-teal-300">Track and manage your trainset fleet</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Scheduling</h3>
                <p className="text-teal-600 dark:text-teal-300">AI-powered train scheduling optimization</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4">
                <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">Reports</h3>
                <p className="text-teal-600 dark:text-teal-300">Comprehensive analytics and reporting</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}