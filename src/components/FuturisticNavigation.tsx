import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Circle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FuturisticNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const moduleData = [
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
    id: 'ai',
    key: 'scheduling.aiScheduling',
    icon: Zap,
    iconBg: 'bg-sky-50',
    iconText: 'text-sky-600',
    ring: 'ring-sky-200',
    glow: 'from-sky-200/50 to-sky-300/30',
    description: 'AI-powered optimization'
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
  }
]

export function FuturisticNavigation({ activeTab, onTabChange }: FuturisticNavigationProps) {
  const { t } = useTranslation()
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)

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
            const isActive = activeTab === module.id
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
                {/* Active soft glow */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-400/15 to-cyan-400/10 blur"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </AnimatePresence>

                {/* Module card */}
                <motion.button
                  onClick={() => onTabChange(module.id)}
                  className={`
                    relative w-full p-4 rounded-xl border transition-all duration-300 group
                    ${isActive
                      ? 'bg-white border-blue-300 shadow-md ring-1 ring-blue-200 dark:bg-slate-900 dark:border-blue-300/40'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md dark:bg-slate-900/60 dark:border-slate-800'
                    }
                  `}
                  layout
                >
                  {/* Icon container */}
                  <div className={`relative mb-3 mx-auto w-12 h-12 rounded-xl flex items-center justify-center ${module.iconBg} ring-1 ${module.ring}`}>
                    <Icon className={`w-6 h-6 ${module.iconText}`} />
                    {/* Subtle animated glow behind icon */}
                    <motion.div
                      className={`pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-br ${module.glow} opacity-0`}
                      animate={{ opacity: isActive ? 0.6 : isHovered ? 0.35 : 0, scale: isActive ? 1.05 : 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Module name */}
                  <h3 className={`
                    text-sm font-semibold mb-1 transition-colors duration-300
                    ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-700 group-hover:text-slate-900 dark:text-slate-200'
                    }
                  `}>
                    {t(module.key)}
                  </h3>

                  {/* Status indicator */}
                  <div className="flex items-center justify-center space-x-1">
                    <Circle className={`
                      w-2 h-2 transition-colors duration-300
                      ${isActive
                        ? 'text-green-500 fill-current'
                        : 'text-slate-400 group-hover:text-slate-500'
                      }
                    `} />
                    <span className={`
                      text-xs transition-colors duration-300
                      ${isActive
                        ? 'text-green-600'
                        : 'text-slate-500 group-hover:text-slate-600'
                      }
                    `}>
                      {isActive ? 'Active' : 'Ready'}
                    </span>
                  </div>

                  {/* Hover arrow */}
                  <AnimatePresence>
                    {isHovered && !isActive && (
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

          {/* Active module info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="mt-6 p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {(() => {
                const activeModule = moduleData.find(m => m.id === activeTab)
                if (!activeModule) return null

                const ActiveIcon = activeModule.icon
                return (
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${activeModule.iconBg} ring-1 ${activeModule.ring}`}>
                      <ActiveIcon className={`w-5 h-5 ${activeModule.iconText}`} />
                    </div>
                    <div>
                      <h4 className="text-slate-900 font-semibold dark:text-white">{t(activeModule.key)}</h4>
                      <p className="text-slate-500 text-sm dark:text-slate-400">{activeModule.description}</p>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}