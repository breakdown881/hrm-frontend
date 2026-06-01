import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './App.css'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import type { Module, ModuleId, UserRole } from './data/hrmData'
import { canAccessModule, getVisibleModules, modules } from './data/hrmData'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { DashboardPage } from './pages/DashboardPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ModuleWorkflowPage } from './pages/ModuleWorkflowPage'
import { PayrollPage } from './pages/PayrollPage'

const moduleById = new Map<ModuleId, Module>(modules.map((module) => [module.id, module]))
const moduleIds = new Set<ModuleId>(modules.map((module) => module.id))

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

function AppLayout() {
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
        />
        <Routes>
          <Route element={<Navigate replace to="/dashboard" />} path="/" />
          <Route element={<ModuleRoute currentRole={currentRole} />} path="/:moduleId" />
          <Route element={<Navigate replace to="/dashboard" />} path="*" />
        </Routes>
      </main>
    </div>
  )
}

function ModuleRoute({ currentRole }: { currentRole: UserRole }) {
  const { moduleId } = useParams<{ moduleId: string }>()

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
      return <EmployeesPage />
    case 'payroll':
      return <PayrollPage module={activeModule} />
    case 'organization':
    case 'recruitment':
    case 'onboarding':
    case 'attendance':
    case 'leave':
    case 'performance':
    case 'reports':
    case 'settings':
    case 'audit':
      return <ModuleWorkflowPage module={activeModule} />
    default:
      return <Navigate replace to="/dashboard" />
  }
}

function isModuleId(moduleId: string | undefined): moduleId is ModuleId {
  return moduleId !== undefined && moduleIds.has(moduleId as ModuleId)
}

export default App
