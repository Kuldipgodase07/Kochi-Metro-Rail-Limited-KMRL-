import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import Index from '@/pages/Index'
import LandingPage from '@/pages/LandingPage'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import AdminPortal from '@/pages/AdminPortal'
import SuperAdminApproval from '@/pages/SuperAdminApproval'
import FleetManagement from '@/pages/FleetManagement'
import FleetOverviewPage from '@/pages/FleetOverviewPage'
import InductionPlanning from '@/pages/InductionPlanning'
import WhatIfSimulation from '@/pages/WhatIfSimulation'
import MaintenanceTracking from '@/pages/MaintenanceTracking'
import CertificateManagement from '@/pages/CertificateManagement'
import BrandingManagement from '@/pages/BrandingManagement'
import CleaningScheduler from '@/pages/CleaningScheduler'
import TrainScheduling from '@/pages/TrainScheduling'
import ComprehensiveReporting from '@/pages/ComprehensiveReporting'
import ManualSchedulingPage from '@/pages/ManualSchedulingPage'
import AISchedulingPage from '@/pages/AISchedulingPage'
import ORToolsSchedulingPage from '@/pages/ORToolsSchedulingPage'
import SIHSchedulingPage from '@/pages/SIHSchedulingPage'
import ReportsPage from '@/pages/ReportsPage'
import PassengerInfo from '@/pages/PassengerInfo'
import TicketingRevenue from '@/pages/TicketingRevenue'
import IncidentResponse from '@/pages/IncidentResponse'
import NotFound from '@/pages/NotFound'
import APIDebugger from '@/components/APIDebugger'
import './App.css'

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <div className="min-h-screen bg-teal-gradient bg-teal-gradient-dark">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/approvals" element={
              <ProtectedRoute>
                <SuperAdminApproval />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Module Routes */}
            <Route path="/fleet" element={
              <ProtectedRoute>
                <FleetOverviewPage />
              </ProtectedRoute>
            } />
            <Route path="/fleet-overview" element={
              <ProtectedRoute>
                <FleetManagement />
              </ProtectedRoute>
            } />
            <Route path="/induction" element={
              <ProtectedRoute>
                <InductionPlanning />
              </ProtectedRoute>
            } />
            <Route path="/simulation" element={
              <ProtectedRoute>
                <WhatIfSimulation />
              </ProtectedRoute>
            } />
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <MaintenanceTracking />
              </ProtectedRoute>
            } />
            <Route path="/certificates" element={
              <ProtectedRoute>
                <CertificateManagement />
              </ProtectedRoute>
            } />
            <Route path="/branding" element={
              <ProtectedRoute>
                <BrandingManagement />
              </ProtectedRoute>
            } />
            <Route path="/cleaning" element={
              <ProtectedRoute>
                <CleaningScheduler />
              </ProtectedRoute>
            } />
            <Route path="/manual-scheduling" element={
              <ProtectedRoute>
                <ManualSchedulingPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-scheduling" element={
              <ProtectedRoute>
                <AISchedulingPage />
              </ProtectedRoute>
            } />
            <Route path="/ortools-scheduling" element={
              <ProtectedRoute>
                <ORToolsSchedulingPage />
              </ProtectedRoute>
            } />
            <Route path="/sih-scheduling" element={
              <ProtectedRoute>
                <SIHSchedulingPage />
              </ProtectedRoute>
            } />
            <Route path="/train-scheduling" element={
              <ProtectedRoute>
                <TrainScheduling />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/passenger-info" element={
              <ProtectedRoute>
                <PassengerInfo />
              </ProtectedRoute>
            } />
            <Route path="/ticketing-revenue" element={
              <ProtectedRoute>
                <TicketingRevenue />
              </ProtectedRoute>
            } />
            <Route path="/incident-response" element={
              <ProtectedRoute>
                <IncidentResponse />
              </ProtectedRoute>
            } />
            <Route path="/comprehensive-reports" element={
              <ProtectedRoute>
                <ComprehensiveReporting />
              </ProtectedRoute>
            } />
            <Route path="/debug" element={<APIDebugger />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </div>
      </AuthProvider>
    </TooltipProvider>
  )
}

export default App