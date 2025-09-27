import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KMRLLogo from '@/components/KMRLLogo';
import { TrainCard } from '@/components/TrainCard';
import { SystemMetrics } from '@/components/SystemMetrics';
import { ArrowLeft } from 'lucide-react';
import { useTrainsets, useRealtimeMetrics } from '@/hooks/useTrainData';
import { useTranslation } from 'react-i18next';

const FleetOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: trainsets = [] } = useTrainsets();
  const { data: metrics, isLoading: metricsLoading } = useRealtimeMetrics();

  const readyTrainsets = trainsets.filter(t => t.status === 'ready');
  const standbyTrainsets = trainsets.filter(t => t.status === 'standby');
  const maintenanceTrainsets = trainsets.filter(t => t.status === 'maintenance');
  const criticalTrainsets = trainsets.filter(t => t.status === 'critical');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fleet Overview</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Complete fleet status and performance metrics</p>
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
        <div className="space-y-6">
          {/* Page Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fleet Status Overview
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Real-time monitoring of all trainsets, system metrics, and operational status across the entire KMRL fleet.
            </p>
          </div>

          {/* System Metrics */}
          <div className="mb-8">
            <SystemMetrics metrics={metrics} isLoading={metricsLoading} />
          </div>

          {/* Fleet Status Summary */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-xl dark:shadow-black/10">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b dark:border-gray-600">
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                {t('dashboard.overview')}
                <div className="flex space-x-2 flex-wrap">
                  <Badge variant="ready" className="shadow-sm">{readyTrainsets.length} {t('status.ready')}</Badge>
                  <Badge variant="standby" className="shadow-sm">{standbyTrainsets.length} {t('status.standby')}</Badge>
                  <Badge variant="maintenance" className="shadow-sm">{maintenanceTrainsets.length} {t('status.maintenance')}</Badge>
                  <Badge variant="critical" className="shadow-sm">{criticalTrainsets.length} {t('status.critical')}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {trainsets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trainsets.map((trainset) => (
                    <TrainCard key={trainset.id} trainset={trainset} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No trainsets available. Please check your data connection.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">{readyTrainsets.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ready for Service</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">{standbyTrainsets.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Standby</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{maintenanceTrainsets.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Under Maintenance</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-red-600 mb-2">{criticalTrainsets.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Critical Status</div>
              </CardContent>
            </Card>
          </div>

          {/* Fleet Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Fleet Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Operational Efficiency</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fleet Availability:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {trainsets.length > 0 ? Math.round(((readyTrainsets.length + standbyTrainsets.length) / trainsets.length) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Active Trainsets:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{readyTrainsets.length + standbyTrainsets.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Maintenance Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Scheduled Maintenance:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{maintenanceTrainsets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Critical Issues:</span>
                      <span className="font-medium text-red-600">{criticalTrainsets.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fleet Composition</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Trainsets:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{trainsets.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Service Ready:</span>
                      <span className="font-medium text-green-600">{readyTrainsets.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FleetOverviewPage;