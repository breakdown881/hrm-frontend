import { useEffect, useMemo, useState } from 'react'
import './LeavePage.css'
import { employees as mockEmployees } from '../data/hrmData'
import type { Employee } from '../data/hrmData'
import { createLeaveRequest, decideApproval, fetchEmployees, fetchLeaveRequests } from '../services/hrmApi'

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

type LeaveRequest = {
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

const leaveTypes = ['Annual Leave', 'Sick Leave', 'Unpaid Leave', 'Personal Leave']

const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'LV-001',
    employee: 'Tran Quoc Huy',
    type: 'Annual Leave',
    dateRange: '2026-06-03 to 2026-06-05',
    days: 3,
    status: 'Pending',
    note: 'Family trip',
  },
  {
    id: 'LV-002',
    employee: 'Pham Gia Bao',
    type: 'Unpaid Leave',
    dateRange: '2026-06-07',
    days: 1,
    status: 'Approved',
    note: 'Approved by HR',
  },
  {
    id: 'LV-003',
    employee: 'Nguyen Minh Anh',
    type: 'Personal Leave',
    dateRange: '2026-06-12',
    days: 1,
    status: 'Pending',
    note: 'Personal appointment',
  },
]

export function LeavePage({ apiToken }: { apiToken?: string | null }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests)
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>(mockEmployees)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [employeeName, setEmployeeName] = useState(mockEmployees[0].name)
  const [leaveType, setLeaveType] = useState(leaveTypes[0])
  const [dateRange, setDateRange] = useState('')
  const [days, setDays] = useState('')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const pendingCount = useMemo(
    () => leaveRequests.filter((request) => request.status === 'Pending').length,
    [leaveRequests],
  )
  const approvedDays = useMemo(
    () => leaveRequests.filter((request) => request.status === 'Approved').reduce((sum, request) => sum + request.days, 0),
    [leaveRequests],
  )

  useEffect(() => {
    if (!apiToken) {
      return
    }

    let isMounted = true

    Promise.all([fetchLeaveRequests(apiToken), fetchEmployees(apiToken)])
      .then(([apiLeaveRequests, apiEmployees]) => {
        if (isMounted) {
          setLeaveRequests(apiLeaveRequests)
          setEmployeeOptions(apiEmployees)
          setEmployeeName(apiEmployees[0]?.name ?? mockEmployees[0].name)
        }
      })
      .catch(() => {
        // Keep mock data available when the API is offline during local UI work.
      })

    return () => {
      isMounted = false
    }
  }, [apiToken])

  const handleSubmitRequest = async () => {
    const trimmedDateRange = dateRange.trim()
    const parsedDays = Number(days)

    if (!trimmedDateRange || Number.isNaN(parsedDays) || parsedDays <= 0) {
      setFormError('Date range and a positive number of days are required.')
      return
    }

    const localRequest: LeaveRequest = {
      id: getNextLeaveRequestId(leaveRequests),
      employee: employeeName,
      type: leaveType,
      dateRange: trimmedDateRange,
      days: parsedDays,
      status: 'Pending',
      note: 'Submitted by employee',
    }
    const selectedEmployee = employeeOptions.find((employee) => employee.name === employeeName)
    let nextRequest = localRequest

    if (apiToken && selectedEmployee?.backendId) {
      try {
        nextRequest = await createLeaveRequest(apiToken, {
          employeeId: selectedEmployee.backendId,
          leaveType,
          dateRange: trimmedDateRange,
          days: parsedDays,
          reason: 'Submitted by employee',
        })
      } catch {
        nextRequest = localRequest
      }
    }

    setLeaveRequests((currentRequests) => [...currentRequests, nextRequest])
    setDateRange('')
    setDays('')
    setFormError('')
    setFeedback('Leave request submitted successfully')
    setIsFormOpen(false)
  }

  const handleDecision = async (requestId: string, status: Exclude<LeaveStatus, 'Pending'>) => {
    const targetRequest = leaveRequests.find((request) => request.id === requestId)
    const decisionNote = `${status} by Admin`

    if (apiToken && targetRequest?.backendId) {
      try {
        const decidedRequest = await decideApproval(apiToken, {
          sourceType: 'leave_request',
          sourceId: targetRequest.backendId,
          status: status.toLowerCase() as 'approved' | 'rejected',
          decisionNote,
        })

        if ('dateRange' in decidedRequest) {
          setLeaveRequests((currentRequests) =>
            currentRequests.map((request) => (request.id === requestId ? decidedRequest : request)),
          )
          setFeedback(`Leave request ${status.toLowerCase()} successfully`)
          return
        }
      } catch {
        // Fall through to local update for offline demo mode.
      }
    }

    setLeaveRequests((currentRequests) =>
      currentRequests.map((request) => (request.id === requestId ? { ...request, status, note: decisionNote } : request)),
    )
    setFeedback(`Leave request ${status.toLowerCase()} successfully`)
  }

  return (
    <>
      <section className="page-heading leave-heading">
        <p className="eyebrow">Core HR workflow</p>
        <h2>Leave Management</h2>
        <p>Submit leave requests, track remaining balances and approve team leave from one workspace.</p>
      </section>

      <section className="leave-summary" aria-label="Leave summary">
        <article className="leave-stat-card">
          <span>Pending approvals</span>
          <strong>{pendingCount}</strong>
          <p>Need Manager or HR decision</p>
        </article>
        <article className="leave-stat-card">
          <span>Approved days</span>
          <strong>{approvedDays}</strong>
          <p>Current mock cycle</p>
        </article>
        <article className="leave-stat-card">
          <span>Leave types</span>
          <strong>{leaveTypes.length}</strong>
          <p>Annual, sick, unpaid and personal</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card leave-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Requests & approval</p>
              <h2>Leave Requests</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add leave request'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="leave-form" aria-label="Add leave request form">
              <label>
                <span>Employee</span>
                <select onChange={(event) => setEmployeeName(event.target.value)} value={employeeName}>
                  {employeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Leave type</span>
                <select onChange={(event) => setLeaveType(event.target.value)} value={leaveType}>
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Date range</span>
                <input
                  onChange={(event) => {
                    setDateRange(event.target.value)
                    setFormError('')
                  }}
                  placeholder="2026-06-10 to 2026-06-11"
                  type="text"
                  value={dateRange}
                />
              </label>
              <label>
                <span>Days</span>
                <input
                  min="1"
                  onChange={(event) => {
                    setDays(event.target.value)
                    setFormError('')
                  }}
                  placeholder="1"
                  type="number"
                  value={days}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSubmitRequest} type="button">
                Submit leave request
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Date range</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.employee}</strong>
                      <span>{request.note}</span>
                    </td>
                    <td>{request.type}</td>
                    <td>{request.dateRange}</td>
                    <td>{request.days}</td>
                    <td>
                      <span className={`leave-status ${request.status.toLowerCase()}`}>{request.status}</span>
                    </td>
                    <td>
                      {request.status === 'Pending' ? (
                        <div className="leave-actions">
                          <button
                            className="ghost-button"
                            onClick={() => handleDecision(request.id, 'Approved')}
                            type="button"
                          >
                            Approve {request.employee} leave request
                          </button>
                          <button
                            className="ghost-button danger"
                            onClick={() => handleDecision(request.id, 'Rejected')}
                            type="button"
                          >
                            Reject {request.employee} leave request
                          </button>
                        </div>
                      ) : (
                        <span className="leave-muted">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card leave-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Balances</p>
              <h2>Remaining Balances</h2>
            </div>
          </div>
          <div className="leave-balance-list">
            {employeeOptions.map((employee) => (
              <article className="leave-balance-item" key={employee.id}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.department}</span>
                </div>
                <span>{employee.leaveBalance} days</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function getNextLeaveRequestId(leaveRequests: LeaveRequest[]) {
  const nextNumber = Math.max(...leaveRequests.map((request) => Number(request.id.replace('LV-', '')))) + 1
  return `LV-${String(nextNumber).padStart(3, '0')}`
}
