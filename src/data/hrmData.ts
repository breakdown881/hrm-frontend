export type Priority = 'Must-have' | 'Should-have' | 'Later'
export type UserRole = 'Admin' | 'HR' | 'Manager' | 'Employee' | 'Payroll/Finance'

export type ModuleId =
  | 'dashboard'
  | 'organization'
  | 'employees'
  | 'recruitment'
  | 'onboarding'
  | 'attendance'
  | 'leave'
  | 'performance'
  | 'payroll'
  | 'reports'
  | 'settings'
  | 'audit'

export type Module = {
  id: ModuleId
  label: string
  icon: string
  description: string
  progress: number
  owner: string
  priority: Priority
}

export type Employee = {
  id: string
  name: string
  role: string
  department: string
  manager: string
  status: 'Official' | 'Probation' | 'Offboarding'
  attendance: string
  leaveBalance: number
}

export type PipelineStage = {
  label: string
  count: number
  tone: 'blue' | 'purple' | 'green' | 'orange'
}

export type ApprovalItem = {
  employee: string
  type: string
  date: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export type RoadmapItem = {
  phase: string
  description: string
}

export const modules: Module[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'DB',
    description: 'Overall people, contracts, leave, attendance, payroll and reporting signals.',
    progress: 82,
    owner: 'Admin / HR',
    priority: 'Must-have',
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: 'OR',
    description: 'Departments, job titles, levels, direct managers and org chart.',
    progress: 74,
    owner: 'Admin',
    priority: 'Must-have',
  },
  {
    id: 'employees',
    label: 'Employees',
    icon: 'EM',
    description: 'Employee profiles, employment status, contracts and HR documents.',
    progress: 88,
    owner: 'HR',
    priority: 'Must-have',
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: 'RE',
    description: 'Job openings, candidates, hiring pipeline and hired-to-employee conversion.',
    progress: 64,
    owner: 'HR / Manager',
    priority: 'Should-have',
  },
  {
    id: 'onboarding',
    label: 'Onboarding',
    icon: 'ON',
    description: 'New hire checklist, task ownership, onboarding templates and reminders.',
    progress: 57,
    owner: 'HR',
    priority: 'Should-have',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: 'AT',
    description: 'Timesheets, check-in/out, late arrivals, early leaves and adjustments.',
    progress: 70,
    owner: 'HR / Employee',
    priority: 'Must-have',
  },
  {
    id: 'leave',
    label: 'Leave',
    icon: 'LV',
    description: 'Leave requests, approvals, remaining balance and team leave calendar.',
    progress: 76,
    owner: 'Manager / HR',
    priority: 'Must-have',
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: 'PF',
    description: 'Review cycles, self review, manager review, KPI and review history.',
    progress: 52,
    owner: 'Manager / HR',
    priority: 'Should-have',
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: 'PY',
    description: 'Base salary, allowances, deductions, payslips and locked payroll cycles.',
    progress: 61,
    owner: 'Payroll / Finance',
    priority: 'Must-have',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'RP',
    description: 'People, headcount movement, leave, attendance and payroll reports.',
    progress: 48,
    owner: 'Admin / HR',
    priority: 'Should-have',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'ST',
    description: 'Master data, leave policy, work calendar, holidays and permissions.',
    progress: 67,
    owner: 'Admin',
    priority: 'Must-have',
  },
  {
    id: 'audit',
    label: 'Audit & Security',
    icon: 'AU',
    description: 'RBAC, audit log, payroll/contract protection and sensitive actions.',
    progress: 73,
    owner: 'Admin',
    priority: 'Must-have',
  },
]

export const employees: Employee[] = [
  {
    id: 'EMP-001',
    name: 'Nguyen Minh Anh',
    role: 'HR Manager',
    department: 'People Ops',
    manager: 'CEO',
    status: 'Official',
    attendance: 'On time',
    leaveBalance: 10,
  },
  {
    id: 'EMP-014',
    name: 'Tran Quoc Huy',
    role: 'Frontend Lead',
    department: 'Engineering',
    manager: 'CTO',
    status: 'Official',
    attendance: 'Late 12m',
    leaveBalance: 7,
  },
  {
    id: 'EMP-027',
    name: 'Le Thu Ha',
    role: 'Finance Executive',
    department: 'Finance',
    manager: 'CFO',
    status: 'Probation',
    attendance: 'Remote',
    leaveBalance: 4,
  },
  {
    id: 'EMP-052',
    name: 'Pham Gia Bao',
    role: 'Sales Manager',
    department: 'Sales',
    manager: 'COO',
    status: 'Official',
    attendance: 'On time',
    leaveBalance: 12,
  },
]

export const pipeline: PipelineStage[] = [
  { label: 'Applied', count: 42, tone: 'blue' },
  { label: 'Screening', count: 18, tone: 'purple' },
  { label: 'Interview', count: 9, tone: 'orange' },
  { label: 'Offer', count: 3, tone: 'green' },
]

export const approvals: ApprovalItem[] = [
  { employee: 'Tran Quoc Huy', type: 'Annual leave', date: '03/06 - 05/06', status: 'Pending' },
  { employee: 'Le Thu Ha', type: 'Timesheet adjustment', date: '31/05', status: 'Pending' },
  { employee: 'Pham Gia Bao', type: 'Unpaid leave', date: '07/06', status: 'Approved' },
]

export const roadmap: RoadmapItem[] = [
  { phase: 'Phase 1', description: 'Foundation, RBAC, organization, employees.' },
  { phase: 'Phase 2', description: 'Contracts, leave, attendance, approvals.' },
  { phase: 'Phase 3', description: 'Recruitment, onboarding, performance, reports.' },
  { phase: 'Phase 4', description: 'Payroll, payslip, audit log, exports.' },
]

export const moduleRequirements: Record<ModuleId, string[]> = {
  dashboard: ['Role-based overview dashboard', 'Expiring contract widgets', 'Headcount by department chart'],
  organization: ['Department and job title management', 'Direct manager assignment', 'Tree-style organization chart'],
  employees: ['Employee profile CRUD', 'Filter by department and status', 'HR document upload and export'],
  recruitment: ['Job opening and candidate profiles', 'Applied to Hired pipeline', 'Convert hired candidate to employee'],
  onboarding: ['New hire checklist', 'Task owners for each step', 'Onboarding progress tracking'],
  attendance: ['Check-in and check-out', 'Personal and company timesheets', 'Import and approve adjustments'],
  leave: ['Create leave requests', 'Manager and HR approval', 'Balance tracking and team calendar'],
  performance: ['Performance review cycles', 'Self review and manager review', 'Score summary and review history'],
  payroll: ['Monthly payroll runs', 'Allowances, deductions and payslips', 'Locked cycles and payroll permissions'],
  reports: ['People, attendance and leave reports', 'Time and department filters', 'Excel and PDF exports'],
  settings: ['Master data', 'Working days and holidays', 'Policy and permission configuration'],
  audit: ['Role-based access control', 'Sensitive action audit log', 'Hide payroll data without permission'],
}


export const userRoles: UserRole[] = ['Admin', 'HR', 'Manager', 'Employee', 'Payroll/Finance']

export const rolePermissions: Record<UserRole, ModuleId[]> = {
  Admin: modules.map((module) => module.id),
  HR: ['dashboard', 'organization', 'employees', 'recruitment', 'onboarding', 'attendance', 'leave', 'performance', 'reports', 'settings'],
  Manager: ['dashboard', 'employees', 'recruitment', 'onboarding', 'attendance', 'leave', 'performance', 'reports'],
  Employee: ['dashboard', 'attendance', 'leave', 'performance'],
  'Payroll/Finance': ['dashboard', 'employees', 'attendance', 'leave', 'payroll', 'reports'],
}

export function canAccessModule(role: UserRole, moduleId: ModuleId) {
  return rolePermissions[role].includes(moduleId)
}

export function getVisibleModules(role: UserRole) {
  const visibleModuleIds = new Set(rolePermissions[role])
  return modules.filter((module) => visibleModuleIds.has(module.id))
}
