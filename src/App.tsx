import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import type { Module, ModuleId, UserRole } from './data/hrmData'
import { canAccessModule, getVisibleModules, modules } from './data/hrmData'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { ApprovalsPage } from './pages/ApprovalsPage'
import { AuditPage } from './pages/AuditPage'
import { AuthPage } from './pages/AuthPage'
import { AttendancePage } from './pages/AttendancePage'
import { ContractPage } from './pages/ContractPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { LeavePage } from './pages/LeavePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OrganizationPage } from './pages/OrganizationPage'
import { PayrollPage } from './pages/PayrollPage'
import { PerformancePage } from './pages/PerformancePage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { signIn } from './services/hrmApi'

const moduleById = new Map<ModuleId, Module>(modules.map((module) => [module.id, module]))
const moduleIds = new Set<ModuleId>(modules.map((module) => module.id))

type UserSession = {
  email: string
  role: UserRole
  token?: string
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState<UserSession | null>({ email: 'admin@company.test', role: 'Admin' })
  const [currentRole, setCurrentRole] = useState<UserRole>('Admin')
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const visibleModules = useMemo(() => getVisibleModules(currentRole), [currentRole])

  const handleCreateRequest = () => {
    setIsSubmitting(true)
    setFeedback('')

    window.setTimeout(() => {
      setIsSubmitting(false)
      setFeedback('Mock request created. With a backend, this action will call an API and surface toast/error feedback.')
    }, 650)
  }

  const handleSignIn = async (email: string, password: string, role: UserRole) => {
    setSession({ email, role })
    setCurrentRole(role)
    setFeedback(`Signed in as ${email}`)
    navigate('/dashboard')

    try {
      const apiSession = await signIn(email, password)
      setSession({ email: apiSession.user.email, role: apiSession.user.role, token: apiSession.token })
      setCurrentRole(apiSession.user.role)
      setFeedback(`Signed in as ${apiSession.user.email}`)
    } catch {
      // Keep the local demo session when the backend is unavailable.
    }
  }

  const handleSignOut = () => {
    setSession(null)
    setFeedback('')
    navigate('/login')
  }

  const handleChangePassword = () => {
    setFeedback('')
  }

  return (
    <div className="app-shell">
      <Sidebar modules={visibleModules} />

      <main className="main-content">
        <Topbar
          currentRole={currentRole}
          feedback={feedback}
          isSubmitting={isSubmitting}
          onCreateRequest={handleCreateRequest}
          onRoleChange={setCurrentRole}
          onSignOut={handleSignOut}
          sessionEmail={session?.email ?? null}
        />
        <Routes>
          <Route element={<Navigate replace to="/dashboard" />} path="/" />
          <Route element={<AuthPage onChangePassword={handleChangePassword} onSignIn={handleSignIn} />} path="/login" />
          <Route
            element={<ModuleRoute apiToken={session?.token ?? null} currentRole={currentRole} isAuthenticated={Boolean(session)} />}
            path="/:moduleId"
          />
          <Route element={<Navigate replace to="/dashboard" />} path="*" />
        </Routes>
      </main>
    </div>
  )
}

function ModuleRoute({
  apiToken,
  currentRole,
  isAuthenticated,
}: {
  apiToken: string | null
  currentRole: UserRole
  isAuthenticated: boolean
}) {
  const { moduleId } = useParams<{ moduleId: string }>()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  if (!isModuleId(moduleId)) {
    return <Navigate replace to="/dashboard" />
  }

  const activeModule = moduleById.get(moduleId) ?? modules[0]

  if (!canAccessModule(currentRole, moduleId)) {
    return <AccessDeniedPage module={activeModule} role={currentRole} />
  }

  switch (moduleId) {
    case 'dashboard':
      return <DashboardPage module={activeModule} />
    case 'employees':
      return <EmployeesPage apiToken={apiToken} />
    case 'contracts':
      return <ContractPage apiToken={apiToken} />
    case 'payroll':
      return <PayrollPage module={activeModule} />
    case 'organization':
      return <OrganizationPage />
    case 'recruitment':
      return <RecruitmentPage apiToken={apiToken} />
    case 'onboarding':
      return <OnboardingPage apiToken={apiToken} />
    case 'attendance':
      return <AttendancePage apiToken={apiToken} />
    case 'leave':
      return <LeavePage apiToken={apiToken} />
    case 'notifications':
      return <NotificationsPage apiToken={apiToken} />
    case 'approvals':
      return <ApprovalsPage apiToken={apiToken} />
    case 'performance':
      return <PerformancePage />
    case 'reports':
      return <ReportsPage />
    case 'settings':
      return <SettingsPage />
    case 'audit':
      return <AuditPage />
    default:
      return <Navigate replace to="/dashboard" />
  }
}

function isModuleId(moduleId: string | undefined): moduleId is ModuleId {
  return moduleId !== undefined && moduleIds.has(moduleId as ModuleId)
}

export default App
