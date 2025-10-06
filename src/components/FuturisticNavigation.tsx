import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Database, 
  BrainCircuit, 
  TestTube, 
  Wrench, 
  FileCheck, 
  Palette, 
  Sparkles, 
  Clock, 
  Zap, 
  BarChart3, 
  PieChart,
  ChevronRight,
  Circle,
  Eye,
  Shield,
  Users,
  CreditCard,
  AlertTriangle,
  ClipboardList
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FuturisticNavigationProps {}

const moduleData = [
  {
    id: 'deep-rl',
    key: 'scheduling.deepRLTest',
    icon: Zap,
    iconBg: 'bg-lime-50',
    iconText: 'text-lime-600',
    ring: 'ring-lime-200',
    glow: 'from-lime-200/50 to-lime-300/30',
    description: 'Test the Deep RL model for train scheduling'
  },
  {
    id: 'fleet',
    key: 'modules.fleetManagement',
    icon: Database,
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    ring: 'ring-blue-200',
    glow: 'from-blue-200/50 to-blue-300/30',
    description: 'Real-time fleet monitoring and analytics'
  },
  {
    id: 'fleet-overview',
    key: 'modules.fleetOverview',
    icon: Eye,
    iconBg: 'bg-slate-50',
    iconText: 'text-slate-600',
    ring: 'ring-slate-200',
    glow: 'from-slate-200/50 to-slate-300/30',
    description: 'Complete fleet status and performance metrics'
  },
  {
    id: 'induction',
    key: 'modules.inductionPlanning',
    icon: BrainCircuit,
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    ring: 'ring-indigo-200',
    glow: 'from-indigo-200/50 to-indigo-300/30',
    description: 'AI-powered trainset selection engine'
  },
  {
    id: 'simulation',
    key: 'modules.whatIfSimulation',
    icon: TestTube,
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    ring: 'ring-emerald-200',
    glow: 'from-emerald-200/50 to-emerald-300/30',
    description: 'Scenario testing and planning tools'
  },
  {
    id: 'maintenance',
    key: 'modules.maintenanceTracking',
    icon: Wrench,
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
    ring: 'ring-amber-200',
    glow: 'from-amber-200/50 to-amber-300/30',
    description: 'Job-card management with IBM Maximo'
  },
  {
    id: 'maintenance-log',
    key: 'modules.maintenanceLog',
    icon: ClipboardList,
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    ring: 'ring-orange-200',
    glow: 'from-orange-200/50 to-orange-300/30',
    description: 'Service log, performance analysis & train readiness alerts'
  },
  {
    id: 'certificates',
    key: 'modules.certificateManagement',
    icon: FileCheck,
    iconBg: 'bg-cyan-50',
    iconText: 'text-cyan-600',
    ring: 'ring-cyan-200',
    glow: 'from-cyan-200/50 to-cyan-300/30',
    description: 'Fitness certificate tracking system'
  },
  {
    id: 'branding',
    key: 'modules.brandingManagement',
    icon: Palette,
    iconBg: 'bg-pink-50',
    iconText: 'text-pink-600',
    ring: 'ring-pink-200',
    glow: 'from-pink-200/50 to-pink-300/30',
    description: 'Advertising revenue and vehicle branding'
  },
  {
    id: 'cleaning',
    key: 'modules.cleaningScheduler',
    icon: Sparkles,
    iconBg: 'bg-violet-50',
    iconText: 'text-violet-600',
    ring: 'ring-violet-200',
    glow: 'from-violet-200/50 to-violet-300/30',
    description: 'Resource management and quality tracking'
  },
  {
    id: 'manual',
    key: 'scheduling.manualScheduling',
    icon: Clock,
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
    ring: 'ring-teal-200',
    glow: 'from-teal-200/50 to-teal-300/30',
    description: 'Traditional scheduling interface'
  },
  {
    id: 'ortools',
    key: 'scheduling.ortoolsScheduling',
    icon: BrainCircuit,
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    ring: 'ring-purple-200',
    glow: 'from-purple-200/50 to-purple-300/30',
    description: 'Google OR-Tools constraint programming'
  },
  {
    id: 'sih',
    key: 'scheduling.sihScheduling',
    icon: Shield,
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
    ring: 'ring-emerald-200',
    glow: 'from-emerald-200/50 to-emerald-300/30',
    description: 'SIH-compliant optimization'
  },
  {
    id: 'train-scheduling',
    key: 'scheduling.trainScheduling',
    icon: Clock,
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    ring: 'ring-indigo-200',
    glow: 'from-indigo-200/50 to-indigo-300/30',
    description: 'Advanced train scheduling algorithms'
  },
  {
    id: 'reports',
    key: 'reports.title',
    icon: BarChart3,
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-600',
    ring: 'ring-rose-200',
    glow: 'from-rose-200/50 to-rose-300/30',
    description: 'Basic reporting functionality'
  },
  {
    id: 'comprehensive',
    key: 'modules.comprehensiveReporting',
    icon: PieChart,
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-600',
    ring: 'ring-blue-200',
    glow: 'from-blue-200/50 to-blue-300/30',
    description: 'Advanced analytics and executive dashboards'
  },
  {
    id: 'comprehensive-details',
    key: 'modules.comprehensiveDetails',
    icon: Database,
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-600',
    ring: 'ring-purple-200',
    glow: 'from-purple-200/50 to-purple-300/30',
    description: 'Complete operational data for all trains'
  },
  {
    id: 'passenger-info',
    key: 'modules.passengerInfo',
    icon: Users,
    iconBg: 'bg-green-50',
    iconText: 'text-green-600',
    ring: 'ring-green-200',
    glow: 'from-green-200/50 to-green-300/30',
    description: 'Passenger Information System'
  },
  {
    id: 'ticketing-revenue',
    key: 'modules.ticketingRevenue',
    icon: CreditCard,
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-600',
    ring: 'ring-orange-200',
    glow: 'from-orange-200/50 to-orange-300/30',
    description: 'Ticketing & Revenue Management'
  },
  {
    id: 'incident-response',
    key: 'modules.incidentResponse',
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconText: 'text-red-600',
    ring: 'ring-red-200',
    glow: 'from-red-200/50 to-red-300/30',
    description: 'Incident & Emergency Response'
  }
]

export function FuturisticNavigation({}: FuturisticNavigationProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)

  const moduleRoutes: { [key: string]: string } = {
    'deep-rl': '/deep-rl-scheduling',
    'fleet': '/fleet',
    'fleet-overview': '/fleet-overview',
    'induction': '/induction', 
    'simulation': '/simulation',
    'maintenance': '/maintenance',
    'maintenance-log': '/maintenance-log',
    'certificates': '/certificates',
    'branding': '/branding',
    'cleaning': '/cleaning',
    'manual': '/manual-scheduling',
    'ortools': '/ortools-scheduling',
    'sih': '/sih-scheduling',
    'train-scheduling': '/train-scheduling',
    'reports': '/reports',
    'comprehensive': '/comprehensive-reports',
    'comprehensive-details': '/comprehensive-details',
    'passenger-info': '/passenger-info',
    'ticketing-revenue': '/ticketing-revenue',
    'incident-response': '/incident-response'
  }

  const handleModuleClick = (moduleId: string) => {
    const route = moduleRoutes[moduleId]
    if (route) {
      navigate(route)
    }
  }

  return (
    <div className="relative w-full">
      {/* Light card container matching system UI */}
      <div className="relative rounded-2xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        {/* Subtle animated background accents */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:radial-gradient(60%_60%_at_50%_30%,#000_10%,transparent_70%)]">
          <div className="absolute -inset-8 bg-gradient-to-tr from-blue-100/40 via-sky-100/30 to-indigo-100/20 animate-pulse rounded-3xl blur-xl dark:from-sky-900/20 dark:via-blue-900/10 dark:to-indigo-900/10" />
        </div>

        {/* Navigation content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Kochi Metro Rail System</h2>
            <p className="text-slate-500 text-sm mt-1 dark:text-slate-400">Comprehensive Train Management Platform</p>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {moduleData.map((module) => {
            const Icon = module.icon
            const isHovered = hoveredModule === module.id

            return (
              <motion.div
                key={module.id}
                className="relative"
                onHoverStart={() => setHoveredModule(module.id)}
                onHoverEnd={() => setHoveredModule(null)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >

                {/* Module card */}
                <motion.button
                  onClick={() => handleModuleClick(module.id)}
                  className="relative w-full h-[140px] p-4 rounded-xl border transition-all duration-300 group bg-white border-slate-200 hover:border-blue-200 hover:shadow-md dark:bg-slate-900/60 dark:border-slate-800 flex flex-col items-center justify-center"
                  layout
                >
                  {/* Icon container */}
                  <div className={`relative mb-3 mx-auto w-12 h-12 rounded-xl flex items-center justify-center ${module.iconBg} ring-1 ${module.ring} flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${module.iconText}`} />
                    {/* Subtle animated glow behind icon */}
                    <motion.div
                      className={`pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-br ${module.glow} opacity-0`}
                      animate={{ opacity: isHovered ? 0.35 : 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Module name */}
                  <h3 className="text-sm font-semibold mb-1 transition-colors duration-300 text-slate-700 group-hover:text-slate-900 dark:text-slate-200 text-center line-clamp-2">
                    {t(module.key)}
                  </h3>

                  {/* Status indicator */}
                  <div className="flex items-center justify-center space-x-1">
                    <Circle className="w-2 h-2 transition-colors duration-300 text-slate-400 group-hover:text-slate-500" />
                    <span className="text-xs transition-colors duration-300 text-slate-500 group-hover:text-slate-600">
                      Ready
                    </span>
                  </div>

                  {/* Hover arrow */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg px-3 py-2 max-w-xs shadow-sm dark:bg-slate-900/90 dark:border-slate-700">
                        <p className="text-xs text-slate-600 text-center dark:text-slate-300">
                          {module.description}
                        </p>
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-slate-200 rotate-45 dark:bg-slate-900 dark:border-slate-700"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
          </div>

        </div>
      </div>
    </div>
  )
}