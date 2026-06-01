import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createAttendanceRecord,
  createContract,
  createCandidate,
  createJobOpening,
  createOnboardingTask,
  createLeaveRequest,
  decideApproval,
  completeOnboardingTask,
  fetchApprovals,
  fetchAttendanceRecords,
  fetchContracts,
  fetchCandidates,
  fetchEmployees,
  fetchJobOpenings,
  fetchLeaveRequests,
  fetchNotifications,
  fetchOnboardingTasks,
  markNotificationAsRead,
  signIn,
} from '../src/services/hrmApi'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('HRM API client', () => {
  it('signs in through the backend and returns user session data', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: {
        token: 'token-123',
        user: { id: 1, name: 'HR Operator', email: 'hr@company.test', role: 'HR' },
        modules: [],
      },
    }))

    const session = await signIn('hr@company.test', 'password')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ email: 'hr@company.test', password: 'password' }),
    }))
    expect(session.token).toBe('token-123')
    expect(session.user.role).toBe('HR')
  })

  it('maps backend employees to the existing frontend employee shape', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: [
        {
          id: 1,
          employee_code: 'EMP-014',
          full_name: 'Tran Quoc Huy',
          birth_date: '1988-09-21',
          gender: 'male',
          email: 'quoc.huy@example.com',
          phone: '0901000014',
          address: '88 Le Loi',
          department: { id: 2, name: 'Engineering', code: 'ENG' },
          job_title: { id: 2, name: 'Frontend Lead', code: 'FE-LEAD' },
          manager: null,
          start_date: '2021-11-01',
          employee_type: 'full_time',
          employment_status: 'official',
          emergency_contact: { name: 'Nguyen Thu Linh', phone: '0902000014' },
        },
      ],
      meta: { total: 1 },
    }))

    const employees = await fetchEmployees('token-123')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost/api/v1/employees', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer token-123' }),
    }))
    expect(employees[0]).toMatchObject({
      id: 'EMP-014',
      name: 'Tran Quoc Huy',
      department: 'Engineering',
      role: 'Frontend Lead',
      status: 'Official',
      emergencyContact: 'Nguyen Thu Linh - 0902000014',
    })
  })

  it('maps leave requests and posts leave decisions', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: 12,
            employee: { id: 2, full_name: 'Tran Quoc Huy' },
            leave_type: 'annual',
            start_date: '2026-06-03',
            end_date: '2026-06-05',
            days: 3,
            status: 'pending',
            reason: 'Family trip',
            decision_note: null,
          },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: {
          id: 12,
          employee: { id: 2, full_name: 'Tran Quoc Huy' },
          leave_type: 'annual',
          start_date: '2026-06-03',
          end_date: '2026-06-05',
          days: 3,
          status: 'approved',
          reason: 'Family trip',
          decision_note: 'Approved by Admin',
        },
      }))

    const requests = await fetchLeaveRequests('token-123')
    const decided = await decideApproval('token-123', {
      sourceType: 'leave_request',
      sourceId: 12,
      status: 'approved',
      decisionNote: 'Approved by Admin',
    })

    expect(requests[0]).toMatchObject({
      id: 'LV-012',
      employee: 'Tran Quoc Huy',
      type: 'Annual Leave',
      dateRange: '2026-06-03 to 2026-06-05',
      status: 'Pending',
    })
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost/api/v1/leave-requests/12/decision', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ status: 'approved', decision_note: 'Approved by Admin' }),
    }))
    expect(decided.status).toBe('Approved')
  })

  it('creates leave requests using backend enum values', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: {
        id: 13,
        employee: { id: 3, full_name: 'Le Thu Ha' },
        leave_type: 'sick',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
        days: 2,
        status: 'pending',
        reason: 'Submitted by employee',
      },
    }))

    await createLeaveRequest('token-123', {
      employeeId: 3,
      leaveType: 'Sick Leave',
      dateRange: '2026-06-10 to 2026-06-11',
      days: 2,
      reason: 'Submitted by employee',
    })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost/api/v1/leave-requests', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        employee_id: 3,
        leave_type: 'sick',
        start_date: '2026-06-10',
        end_date: '2026-06-11',
        days: 2,
        reason: 'Submitted by employee',
      }),
    }))
  })

  it('maps attendance records and creates new records', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: 1,
            employee: { id: 1, employee_code: 'EMP-001', full_name: 'Nguyen Minh Anh' },
            work_date: '2026-06-01',
            check_in_at: '2026-06-01 08:54:00',
            check_out_at: '2026-06-01 17:42:00',
            status: 'on_time',
          },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: {
          id: 2,
          employee: { id: 3, employee_code: 'EMP-027', full_name: 'Le Thu Ha' },
          work_date: '2026-06-02',
          check_in_at: '2026-06-02 08:45:00',
          check_out_at: '2026-06-02 17:35:00',
          status: 'on_time',
        },
      }))

    const records = await fetchAttendanceRecords('token-123')
    const created = await createAttendanceRecord('token-123', {
      employeeId: 3,
      workDate: '2026-06-02',
      checkIn: '08:45',
      checkOut: '17:35',
      status: 'On time',
    })

    expect(records[0]).toMatchObject({ employee: 'Nguyen Minh Anh', checkIn: '08:54', status: 'On time' })
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost/api/v1/attendance-records', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        employee_id: 3,
        work_date: '2026-06-02',
        check_in_at: '2026-06-02 08:45:00',
        check_out_at: '2026-06-02 17:35:00',
        status: 'on_time',
      }),
    }))
    expect(created.id).toBe('ATT-002')
  })

  it('maps the unified approval queue', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      data: [
        {
          id: 'attendance-adjustment-3',
          source_type: 'attendance_adjustment',
          source_id: 3,
          employee: 'Le Thu Ha',
          request_type: 'timesheet_adjustment',
          period: '2026-05-31',
          status: 'pending',
          decision_note: 'Forgot checkout correction',
        },
      ],
    }))

    const approvals = await fetchApprovals('token-123')

    expect(fetchMock).toHaveBeenCalledWith('http://localhost/api/v1/approvals?status=pending', expect.any(Object))
    expect(approvals[0]).toMatchObject({
      id: 'APR-attendance-adjustment-3',
      employee: 'Le Thu Ha',
      requestType: 'Timesheet adjustment',
      status: 'Pending',
    })
  })

  it('maps contracts and creates contract records with backend enums', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: 2,
            employee: { id: 2, employee_code: 'EMP-014', full_name: 'Tran Quoc Huy' },
            contract_type: 'fixed_term',
            start_date: '2025-07-01',
            end_date: '2026-06-30',
            status: 'expiring_soon',
          },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: {
          id: 4,
          employee: { id: 3, employee_code: 'EMP-027', full_name: 'Le Thu Ha' },
          contract_type: 'fixed_term',
          start_date: '2026-06-01',
          end_date: '2026-11-30',
          status: 'expiring_soon',
        },
      }))

    const contracts = await fetchContracts('token-123')
    const created = await createContract('token-123', {
      employeeId: 3,
      contractType: 'Fixed-term Contract',
      startDate: '2026-06-01',
      endDate: '2026-11-30',
      status: 'Expiring soon',
    })

    expect(contracts[0]).toMatchObject({
      id: 'CON-002',
      employee: 'Tran Quoc Huy',
      type: 'Fixed-term Contract',
      status: 'Expiring soon',
    })
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost/api/v1/contracts', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        employee_id: 3,
        contract_type: 'fixed_term',
        start_date: '2026-06-01',
        end_date: '2026-11-30',
        status: 'expiring_soon',
      }),
    }))
    expect(created.id).toBe('CON-004')
  })

  it('maps notifications and marks notifications as read', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [
          {
            id: 1,
            title: 'Contract expiring soon',
            message: 'Tran Quoc Huy contract ends on 2026-06-30.',
            module: 'Contracts',
            tone: 'warning',
            status: 'unread',
          },
        ],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: {
          id: 1,
          title: 'Contract expiring soon',
          message: 'Tran Quoc Huy contract ends on 2026-06-30.',
          module: 'Contracts',
          tone: 'warning',
          status: 'read',
        },
      }))

    const notifications = await fetchNotifications('token-123')
    const updated = await markNotificationAsRead('token-123', 1)

    expect(notifications[0]).toMatchObject({
      id: 'NOT-001',
      backendId: 1,
      title: 'Contract expiring soon',
      status: 'Unread',
      tone: 'warning',
    })
    expect(fetchMock).toHaveBeenLastCalledWith('http://localhost/api/v1/notifications/1/read', expect.objectContaining({
      method: 'POST',
    }))
    expect(updated.status).toBe('Read')
  })

  it('maps recruitment data and posts opening/candidate payloads', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [{ id: 1, title: 'Frontend Engineer', department: { id: 2, name: 'Engineering' }, status: 'active' }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: { id: 2, title: 'Data Analyst', department: { id: 3, name: 'Finance' }, status: 'active' },
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: [{ id: 1, full_name: 'Hoang Minh Tue', email: 'tue@example.com', phone: '0901', position: 'Frontend Engineer', job_opening_id: 1, source: 'linkedin', status: 'applied' }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: { id: 2, full_name: 'Linh Pham', email: 'linh@example.com', phone: '0902', position: 'Data Analyst', job_opening_id: 2, source: 'referral', status: 'hired' },
      }))

    const openings = await fetchJobOpenings('token-123')
    const opening = await createJobOpening('token-123', { title: 'Data Analyst', departmentId: 3, status: 'Active' })
    const candidates = await fetchCandidates('token-123')
    const candidate = await createCandidate('token-123', {
      jobOpeningId: 2,
      name: 'Linh Pham',
      email: 'linh@example.com',
      phone: '0902',
      source: 'Referral',
      status: 'Hired',
    })

    expect(openings[0]).toMatchObject({ id: 'JOB-001', title: 'Frontend Engineer', department: 'Engineering', status: 'Active' })
    expect(opening.id).toBe('JOB-002')
    expect(candidates[0]).toMatchObject({ id: 'CAN-001', source: 'LinkedIn', status: 'Applied' })
    expect(candidate.status).toBe('Hired')
  })

  it('maps onboarding tasks and completes tasks', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({
        data: [{ id: 1, name: 'Complete employee profile', new_hire: { id: 3, full_name: 'Le Thu Ha' }, owner: { id: 1, full_name: 'Nguyen Minh Anh' }, status: 'pending' }],
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: { id: 2, name: 'Prepare welcome kit', new_hire: { id: 3, full_name: 'Le Thu Ha' }, owner: { id: 1, full_name: 'Nguyen Minh Anh' }, status: 'pending' },
      }))
      .mockResolvedValueOnce(jsonResponse({
        data: { id: 2, name: 'Prepare welcome kit', new_hire: { id: 3, full_name: 'Le Thu Ha' }, owner: { id: 1, full_name: 'Nguyen Minh Anh' }, status: 'completed' },
      }))

    const tasks = await fetchOnboardingTasks('token-123')
    const created = await createOnboardingTask('token-123', { name: 'Prepare welcome kit', newHireId: 3, ownerId: 1 })
    const completed = await completeOnboardingTask('token-123', 2)

    expect(tasks[0]).toMatchObject({ id: 'ONB-001', newHire: 'Le Thu Ha', status: 'Pending' })
    expect(created.id).toBe('ONB-002')
    expect(completed.status).toBe('Completed')
  })
})

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  } as Response
}
