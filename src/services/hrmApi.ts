import type { Employee, UserRole } from '../data/hrmData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/api/v1'

export type ApiSession = {
  token: string
  user: {
    id: number
    name: string
    email: string
    role: UserRole
  }
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'
export type AttendanceStatus = 'On time' | 'Late' | 'Remote' | 'Missing checkout'
export type ContractStatus = 'Active' | 'Expiring soon' | 'Expired'
export type NotificationStatus = 'Unread' | 'Read'
export type NotificationTone = 'warning' | 'info' | 'success'
export type OpeningStatus = 'Draft' | 'Active' | 'Closed'
export type CandidateStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected'
export type OnboardingStatus = 'Pending' | 'Completed'

export type FrontendLeaveRequest = {
  backendId?: number
  id: string
  employee: string
  employeeBackendId?: number
  type: string
  dateRange: string
  days: number
  status: LeaveStatus
  note: string
}

export type FrontendAttendanceRecord = {
  backendId?: number
  id: string
  employee: string
  employeeBackendId?: number
  date: string
  checkIn: string
  checkOut: string
  status: AttendanceStatus
}

export type FrontendApprovalRequest = {
  id: string
  sourceType: 'leave_request' | 'attendance_adjustment'
  sourceId: number
  employee: string
  requestType: string
  period: string
  status: LeaveStatus
  decisionNote: string
  handledBy: string
}

export type FrontendContractRecord = {
  backendId?: number
  id: string
  employee: string
  employeeBackendId?: number
  type: string
  startDate: string
  endDate: string
  status: ContractStatus
}

export type FrontendNotification = {
  backendId?: number
  id: string
  title: string
  message: string
  module: string
  status: NotificationStatus
  tone: NotificationTone
}

export type FrontendJobOpening = {
  backendId?: number
  id: string
  title: string
  department: string
  departmentBackendId?: number
  status: OpeningStatus
}

export type FrontendCandidate = {
  backendId?: number
  id: string
  name: string
  email: string
  phone: string
  position: string
  jobOpeningBackendId?: number
  source: string
  status: CandidateStatus
}

export type FrontendConvertedEmployee = {
  id: string
  candidateId: string
  name: string
  email: string
  role: string
  department: string
}

export type FrontendOnboardingTask = {
  backendId?: number
  id: string
  name: string
  newHire: string
  newHireBackendId?: number
  owner: string
  ownerBackendId?: number
  status: OnboardingStatus
}

type BackendEmployee = {
  id: number
  employee_code: string
  full_name: string
  birth_date: string | null
  gender: string | null
  email: string
  phone: string | null
  address: string | null
  department: { id: number; name: string; code: string } | null
  job_title: { id: number; name: string; code: string } | null
  manager: { full_name: string } | null
  start_date: string | null
  employee_type: string | null
  employment_status: string
  emergency_contact: { name: string | null; phone: string | null }
}

type BackendLeaveRequest = {
  id: number
  employee: { id: number; full_name: string } | null
  leave_type: string
  start_date: string
  end_date: string
  days: number
  status: string
  reason: string | null
  decision_note?: string | null
}

type BackendAttendanceRecord = {
  id: number
  employee: { id: number; employee_code: string; full_name: string } | null
  work_date: string
  check_in_at: string | null
  check_out_at: string | null
  status: string
}

type BackendApproval = {
  id: string
  source_type: 'leave_request' | 'attendance_adjustment'
  source_id: number
  employee: string
  request_type: string
  period: string
  status: string
  decision_note: string | null
}

type BackendContract = {
  id: number
  employee: { id: number; employee_code: string; full_name: string } | null
  contract_type: string
  start_date: string
  end_date: string | null
  status: string
}

type BackendNotification = {
  id: number
  title: string
  message: string
  module: string
  tone: string
  status: string
}

type BackendJobOpening = {
  id: number
  title: string
  department: { id: number; name: string } | null
  status: string
}

type BackendCandidate = {
  id: number
  full_name: string
  email: string
  phone: string | null
  position: string | null
  job_opening_id: number | null
  source: string | null
  status: string
  converted_employee_id?: number | null
}

type BackendConvertedEmployee = {
  employee_code: string
  full_name: string
  email: string
  department: { name: string } | null
}

type BackendOnboardingTask = {
  id: number
  name: string
  new_hire: { id: number; full_name: string } | null
  owner: { id: number; full_name: string } | null
  status: string
}

export async function signIn(email: string, password: string): Promise<ApiSession> {
  const response = await request<{ data: ApiSession }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return response.data
}

export async function fetchEmployees(token: string): Promise<Employee[]> {
  const response = await request<{ data: BackendEmployee[] }>('/employees', { token })

  return response.data.map(mapEmployee)
}

export async function fetchLeaveRequests(token: string): Promise<FrontendLeaveRequest[]> {
  const response = await request<{ data: BackendLeaveRequest[] }>('/leave-requests', { token })

  return response.data.map(mapLeaveRequest)
}

export async function createLeaveRequest(
  token: string,
  input: {
    employeeId: number
    leaveType: string
    dateRange: string
    days: number
    reason: string
  },
): Promise<FrontendLeaveRequest> {
  const [startDate, endDate] = parseDateRange(input.dateRange)
  const response = await request<{ data: BackendLeaveRequest }>('/leave-requests', {
    method: 'POST',
    token,
    body: JSON.stringify({
      employee_id: input.employeeId,
      leave_type: leaveTypeToBackend(input.leaveType),
      start_date: startDate,
      end_date: endDate,
      days: input.days,
      reason: input.reason,
    }),
  })

  return mapLeaveRequest(response.data)
}

export async function fetchAttendanceRecords(token: string): Promise<FrontendAttendanceRecord[]> {
  const response = await request<{ data: BackendAttendanceRecord[] }>('/attendance-records', { token })

  return response.data.map(mapAttendanceRecord)
}

export async function createAttendanceRecord(
  token: string,
  input: {
    employeeId: number
    workDate: string
    checkIn: string
    checkOut: string
    status: AttendanceStatus
  },
): Promise<FrontendAttendanceRecord> {
  const response = await request<{ data: BackendAttendanceRecord }>('/attendance-records', {
    method: 'POST',
    token,
    body: JSON.stringify({
      employee_id: input.employeeId,
      work_date: input.workDate,
      check_in_at: `${input.workDate} ${input.checkIn}:00`,
      check_out_at: `${input.workDate} ${input.checkOut}:00`,
      status: attendanceStatusToBackend(input.status),
    }),
  })

  return mapAttendanceRecord(response.data)
}

export async function fetchApprovals(token: string): Promise<FrontendApprovalRequest[]> {
  const response = await request<{ data: BackendApproval[] }>('/approvals?status=pending', { token })

  return response.data.map(mapApproval)
}

export async function decideApproval(
  token: string,
  input: {
    sourceType: 'leave_request' | 'attendance_adjustment'
    sourceId: number
    status: 'approved' | 'rejected'
    decisionNote: string
  },
): Promise<FrontendLeaveRequest | FrontendApprovalRequest> {
  const endpoint =
    input.sourceType === 'leave_request'
      ? `/leave-requests/${input.sourceId}/decision`
      : `/attendance-adjustments/${input.sourceId}/decision`
  const response = await request<{ data: BackendLeaveRequest | BackendApproval }>(endpoint, {
    method: 'POST',
    token,
    body: JSON.stringify({ status: input.status, decision_note: input.decisionNote }),
  })

  if ('leave_type' in response.data) {
    return mapLeaveRequest(response.data)
  }

  return mapApproval(response.data)
}

export async function fetchContracts(token: string): Promise<FrontendContractRecord[]> {
  const response = await request<{ data: BackendContract[] }>('/contracts', { token })

  return response.data.map(mapContract)
}

export async function createContract(
  token: string,
  input: {
    employeeId: number
    contractType: string
    startDate: string
    endDate: string
    status: ContractStatus
  },
): Promise<FrontendContractRecord> {
  const response = await request<{ data: BackendContract }>('/contracts', {
    method: 'POST',
    token,
    body: JSON.stringify({
      employee_id: input.employeeId,
      contract_type: contractTypeToBackend(input.contractType),
      start_date: input.startDate,
      end_date: input.endDate === 'No end date' ? null : input.endDate,
      status: contractStatusToBackend(input.status),
    }),
  })

  return mapContract(response.data)
}

export async function fetchNotifications(token: string): Promise<FrontendNotification[]> {
  const response = await request<{ data: BackendNotification[] }>('/notifications', { token })

  return response.data.map(mapNotification)
}

export async function markNotificationAsRead(token: string, notificationId: number): Promise<FrontendNotification> {
  const response = await request<{ data: BackendNotification }>(`/notifications/${notificationId}/read`, {
    method: 'POST',
    token,
  })

  return mapNotification(response.data)
}

export async function fetchJobOpenings(token: string): Promise<FrontendJobOpening[]> {
  const response = await request<{ data: BackendJobOpening[] }>('/job-openings', { token })

  return response.data.map(mapJobOpening)
}

export async function createJobOpening(
  token: string,
  input: { title: string; departmentId?: number; status: OpeningStatus },
): Promise<FrontendJobOpening> {
  const response = await request<{ data: BackendJobOpening }>('/job-openings', {
    method: 'POST',
    token,
    body: JSON.stringify({
      title: input.title,
      department_id: input.departmentId,
      status: openingStatusToBackend(input.status),
    }),
  })

  return mapJobOpening(response.data)
}

export async function fetchCandidates(token: string): Promise<FrontendCandidate[]> {
  const response = await request<{ data: BackendCandidate[] }>('/candidates', { token })

  return response.data.map(mapCandidate)
}

export async function createCandidate(
  token: string,
  input: { jobOpeningId: number; name: string; email: string; phone: string; source: string; status: CandidateStatus },
): Promise<FrontendCandidate> {
  const response = await request<{ data: BackendCandidate }>('/candidates', {
    method: 'POST',
    token,
    body: JSON.stringify({
      job_opening_id: input.jobOpeningId,
      full_name: input.name,
      email: input.email,
      phone: input.phone,
      source: candidateSourceToBackend(input.source),
      status: candidateStatusToBackend(input.status),
    }),
  })

  return mapCandidate(response.data)
}

export async function convertCandidateToEmployee(
  token: string,
  candidate: FrontendCandidate,
): Promise<FrontendConvertedEmployee> {
  const response = await request<{ data: BackendConvertedEmployee }>(`/candidates/${candidate.backendId}/convert`, {
    method: 'POST',
    token,
  })

  return {
    id: response.data.employee_code,
    candidateId: candidate.id,
    name: response.data.full_name,
    email: response.data.email,
    role: candidate.position,
    department: response.data.department?.name ?? 'People Ops',
  }
}

export async function fetchOnboardingTasks(token: string): Promise<FrontendOnboardingTask[]> {
  const response = await request<{ data: BackendOnboardingTask[] }>('/onboarding-tasks', { token })

  return response.data.map(mapOnboardingTask)
}

export async function createOnboardingTask(
  token: string,
  input: { name: string; newHireId: number; ownerId?: number },
): Promise<FrontendOnboardingTask> {
  const response = await request<{ data: BackendOnboardingTask }>('/onboarding-tasks', {
    method: 'POST',
    token,
    body: JSON.stringify({
      name: input.name,
      new_hire_id: input.newHireId,
      owner_id: input.ownerId,
    }),
  })

  return mapOnboardingTask(response.data)
}

export async function completeOnboardingTask(token: string, taskId: number): Promise<FrontendOnboardingTask> {
  const response = await request<{ data: BackendOnboardingTask }>(`/onboarding-tasks/${taskId}/complete`, {
    method: 'POST',
    token,
  })

  return mapOnboardingTask(response.data)
}

async function request<T>(path: string, options: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error(`HRM API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

function mapEmployee(employee: BackendEmployee): Employee {
  const emergencyContact = [employee.emergency_contact.name, employee.emergency_contact.phone]
    .filter(Boolean)
    .join(' - ')

  return {
    backendId: employee.id,
    address: employee.address ?? 'Needs update',
    birthDate: employee.birth_date ?? 'Needs update',
    email: employee.email,
    emergencyContact: emergencyContact || 'Needs update',
    employeeType: humanizeSnake(employee.employee_type ?? 'full_time'),
    gender: humanizeSnake(employee.gender ?? 'Needs update'),
    id: employee.employee_code,
    name: employee.full_name,
    phone: employee.phone ?? 'Needs update',
    role: employee.job_title?.name ?? 'Needs update',
    department: employee.department?.name ?? 'Needs update',
    manager: employee.manager?.full_name ?? 'CEO',
    startDate: employee.start_date ?? 'Needs update',
    status: employmentStatusToFrontend(employee.employment_status),
    attendance: 'Not checked in',
    leaveBalance: 0,
  }
}

function mapLeaveRequest(request: BackendLeaveRequest): FrontendLeaveRequest {
  return {
    backendId: request.id,
    id: `LV-${String(request.id).padStart(3, '0')}`,
    employee: request.employee?.full_name ?? 'Unknown employee',
    employeeBackendId: request.employee?.id,
    type: leaveTypeToFrontend(request.leave_type),
    dateRange: request.start_date === request.end_date ? request.start_date : `${request.start_date} to ${request.end_date}`,
    days: Number(request.days),
    status: requestStatusToFrontend(request.status),
    note: request.decision_note ?? request.reason ?? 'Submitted by employee',
  }
}

function mapAttendanceRecord(record: BackendAttendanceRecord): FrontendAttendanceRecord {
  return {
    backendId: record.id,
    id: `ATT-${String(record.id).padStart(3, '0')}`,
    employee: record.employee?.full_name ?? 'Unknown employee',
    employeeBackendId: record.employee?.id,
    date: record.work_date,
    checkIn: timeOnly(record.check_in_at),
    checkOut: timeOnly(record.check_out_at),
    status: attendanceStatusToFrontend(record.status),
  }
}

function mapApproval(approval: BackendApproval): FrontendApprovalRequest {
  return {
    id: `APR-${approval.id}`,
    sourceType: approval.source_type,
    sourceId: approval.source_id,
    employee: approval.employee,
    requestType: requestTypeToFrontend(approval.request_type),
    period: approval.period,
    status: requestStatusToFrontend(approval.status),
    decisionNote: approval.decision_note ?? 'Awaiting decision',
    handledBy: approval.status === 'pending' ? 'Awaiting decision' : `${requestStatusToFrontend(approval.status)} by Admin`,
  }
}

function mapContract(contract: BackendContract): FrontendContractRecord {
  return {
    backendId: contract.id,
    id: `CON-${String(contract.id).padStart(3, '0')}`,
    employee: contract.employee?.full_name ?? 'Unknown employee',
    employeeBackendId: contract.employee?.id,
    type: contractTypeToFrontend(contract.contract_type),
    startDate: contract.start_date,
    endDate: contract.end_date ?? 'No end date',
    status: contractStatusToFrontend(contract.status),
  }
}

function mapNotification(notification: BackendNotification): FrontendNotification {
  return {
    backendId: notification.id,
    id: `NOT-${String(notification.id).padStart(3, '0')}`,
    title: notification.title,
    message: notification.message,
    module: notification.module,
    status: notification.status === 'read' ? 'Read' : 'Unread',
    tone: notificationToneToFrontend(notification.tone),
  }
}

function mapJobOpening(opening: BackendJobOpening): FrontendJobOpening {
  return {
    backendId: opening.id,
    id: `JOB-${String(opening.id).padStart(3, '0')}`,
    title: opening.title,
    department: opening.department?.name ?? 'People Ops',
    departmentBackendId: opening.department?.id,
    status: openingStatusToFrontend(opening.status),
  }
}

function mapCandidate(candidate: BackendCandidate): FrontendCandidate {
  return {
    backendId: candidate.id,
    id: `CAN-${String(candidate.id).padStart(3, '0')}`,
    name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone ?? '',
    position: candidate.position ?? 'Open role',
    jobOpeningBackendId: candidate.job_opening_id ?? undefined,
    source: candidateSourceToFrontend(candidate.source ?? 'career_site'),
    status: candidateStatusToFrontend(candidate.status),
  }
}

function mapOnboardingTask(task: BackendOnboardingTask): FrontendOnboardingTask {
  return {
    backendId: task.id,
    id: `ONB-${String(task.id).padStart(3, '0')}`,
    name: task.name,
    newHire: task.new_hire?.full_name ?? 'Unknown employee',
    newHireBackendId: task.new_hire?.id,
    owner: task.owner?.full_name ?? 'Unassigned',
    ownerBackendId: task.owner?.id,
    status: task.status === 'completed' ? 'Completed' : 'Pending',
  }
}

function parseDateRange(dateRange: string): [string, string] {
  const [startDate, endDate] = dateRange.split(' to ').map((value) => value.trim())

  return [startDate, endDate || startDate]
}

function leaveTypeToBackend(type: string) {
  const map: Record<string, string> = {
    'Annual Leave': 'annual',
    'Sick Leave': 'sick',
    'Unpaid Leave': 'unpaid',
    'Personal Leave': 'personal',
  }

  return map[type] ?? 'annual'
}

function leaveTypeToFrontend(type: string) {
  const map: Record<string, string> = {
    annual: 'Annual Leave',
    sick: 'Sick Leave',
    unpaid: 'Unpaid Leave',
    personal: 'Personal Leave',
  }

  return map[type] ?? humanizeSnake(type)
}

function attendanceStatusToBackend(status: AttendanceStatus) {
  const map: Record<AttendanceStatus, string> = {
    'On time': 'on_time',
    Late: 'late',
    Remote: 'remote',
    'Missing checkout': 'missing_checkout',
  }

  return map[status]
}

function attendanceStatusToFrontend(status: string): AttendanceStatus {
  const map: Record<string, AttendanceStatus> = {
    on_time: 'On time',
    late: 'Late',
    remote: 'Remote',
    missing_checkout: 'Missing checkout',
    adjusted: 'On time',
  }

  return map[status] ?? 'On time'
}

function employmentStatusToFrontend(status: string): Employee['status'] {
  const map: Record<string, Employee['status']> = {
    official: 'Official',
    probation: 'Probation',
    offboarding: 'Offboarding',
  }

  return map[status] ?? 'Probation'
}

function requestStatusToFrontend(status: string): LeaveStatus {
  const map: Record<string, LeaveStatus> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  return map[status] ?? 'Pending'
}

function requestTypeToFrontend(type: string) {
  const map: Record<string, string> = {
    annual: 'Annual leave',
    sick: 'Sick leave',
    unpaid: 'Unpaid leave',
    personal: 'Personal leave',
    timesheet_adjustment: 'Timesheet adjustment',
  }

  return map[type] ?? humanizeSnake(type)
}

function contractTypeToBackend(type: string) {
  const map: Record<string, string> = {
    'Probation Contract': 'probation',
    'Fixed-term Contract': 'fixed_term',
    'Indefinite Contract': 'indefinite',
  }

  return map[type] ?? 'fixed_term'
}

function contractTypeToFrontend(type: string) {
  const map: Record<string, string> = {
    probation: 'Probation Contract',
    fixed_term: 'Fixed-term Contract',
    indefinite: 'Indefinite Contract',
  }

  return map[type] ?? humanizeSnake(type)
}

function contractStatusToBackend(status: ContractStatus) {
  const map: Record<ContractStatus, string> = {
    Active: 'active',
    'Expiring soon': 'expiring_soon',
    Expired: 'expired',
  }

  return map[status]
}

function contractStatusToFrontend(status: string): ContractStatus {
  const map: Record<string, ContractStatus> = {
    active: 'Active',
    expiring_soon: 'Expiring soon',
    expired: 'Expired',
  }

  return map[status] ?? 'Active'
}

function notificationToneToFrontend(tone: string): NotificationTone {
  if (tone === 'warning' || tone === 'success') {
    return tone
  }

  return 'info'
}

function openingStatusToBackend(status: OpeningStatus) {
  return status.toLowerCase()
}

function openingStatusToFrontend(status: string): OpeningStatus {
  const map: Record<string, OpeningStatus> = {
    draft: 'Draft',
    active: 'Active',
    closed: 'Closed',
  }

  return map[status] ?? 'Draft'
}

function candidateStatusToBackend(status: CandidateStatus) {
  return status.toLowerCase()
}

function candidateStatusToFrontend(status: string): CandidateStatus {
  const map: Record<string, CandidateStatus> = {
    applied: 'Applied',
    screening: 'Screening',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
  }

  return map[status] ?? 'Applied'
}

function candidateSourceToBackend(source: string) {
  const map: Record<string, string> = {
    LinkedIn: 'linkedin',
    Referral: 'referral',
    'Career site': 'career_site',
    Agency: 'agency',
  }

  return map[source] ?? 'career_site'
}

function candidateSourceToFrontend(source: string) {
  const map: Record<string, string> = {
    linkedin: 'LinkedIn',
    referral: 'Referral',
    career_site: 'Career site',
    agency: 'Agency',
  }

  return map[source] ?? humanizeSnake(source)
}

function humanizeSnake(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function timeOnly(value: string | null) {
  return value?.slice(11, 16) ?? ''
}
