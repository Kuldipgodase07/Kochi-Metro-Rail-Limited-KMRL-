import { ReportsPanel } from '@/components/ReportsPanel'
import { useTrainsets, useDailySchedule, useKPIs } from '@/hooks/useTrainData'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import KMRLLogo from '@/components/KMRLLogo'

export default function ReportsPage() {
  const { data: trainsets = [] } = useTrainsets()
  const { data: scheduleData = [] } = useDailySchedule(new Date().toISOString().split('T')[0])
  const { data: kpiData = [] } = useKPIs()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Basic reporting functionality</p>
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
        <ReportsPanel 
          trainsets={trainsets}
          scheduleData={scheduleData}
          kpiData={Array.isArray(kpiData) ? kpiData : [kpiData]}
        />
      </main>
    </div>
  )
}