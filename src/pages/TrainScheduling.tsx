import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import TrainSchedulingPanel from '@/components/TrainSchedulingPanel';
import { Train, Zap, BarChart3, Clock, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import KMRLLogo from '@/components/KMRLLogo';

const TrainScheduling: React.FC = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Train className="h-6 w-6 text-blue-500" />,
      title: "Smart Selection",
      description: "AI-powered optimization selects the best 24 trains from your entire fleet"
    },
    {
      icon: <Zap className="h-6 w-6 text-green-500" />,
      title: "Multi-Criteria Analysis",
      description: "Considers fitness certificates, job cards, branding, mileage, cleaning, and stabling"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
      title: "Performance Optimization",
      description: "Balances fleet utilization and maintenance requirements for optimal performance"
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-500" />,
      title: "Real-time Results",
      description: "Get scheduling recommendations in seconds with detailed explanations"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <KMRLLogo height={28} />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Google OR-Tools Train Scheduling</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Advanced optimization for 24 train fleet</p>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mb-4 justify-center"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Train className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('Train Scheduling')}
            </h1>
            <p className="text-gray-600">
              {t('Intelligent optimization for fleet deployment using Google OR-Tools')}
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {feature.icon}
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Main Scheduling Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TrainSchedulingPanel />
      </motion.div>

      {/* Information Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Train Scheduling Works</CardTitle>
            <CardDescription>
              Understanding the optimization criteria and process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Optimization Criteria:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Fitness Certificates:</strong> Validity windows from Rolling-Stock, Signalling and Telecom departments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Job-Card Status:</strong> Open vs. closed work orders from IBM Maximo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Branding Priorities:</strong> Contractual commitments for exterior wrap exposure hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Mileage Balancing:</strong> Kilometer allocation to equalize wear across fleet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Cleaning Slots:</strong> Available manpower and bay occupancy for deep-cleaning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span><strong>Stabling Geometry:</strong> Bay positions that minimize shunting and turn-out time</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Process Flow:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <span>Load train data from CSV files into MongoDB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <span>Apply Google OR-Tools optimization algorithm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <span>Select optimal 24 trains based on all criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                    <span>Assign bay positions for minimal shunting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                    <span>Present results with remaining trains for review</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
      </main>
    </div>
  );
};

export default TrainScheduling;