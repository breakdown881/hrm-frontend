import { useMemo, useState } from 'react'
import './ApprovalsPage.css'

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

type ApprovalRequest = {
  id: string
  employee: string
  requestType: string
  period: string
  status: ApprovalStatus
  decisionNote: string
  handledBy: string
}

const initialApprovalRequests: ApprovalRequest[] = [
  {
    id: 'APR-001',
    employee: 'Tran Quoc Huy',
    requestType: 'Annual leave',
    period: '2026-06-03 to 2026-06-05',
    status: 'Pending',
    decisionNote: 'Family trip request',
    handledBy: 'Awaiting decision',
  },
  {
    id: 'APR-002',
    employee: 'Le Thu Ha',
    requestType: 'Timesheet adjustment',
    period: '2026-05-31',
    status: 'Pending',
    decisionNote: 'Forgot checkout correction',
    handledBy: 'Awaiting decision',
  },
  {
    id: 'APR-003',
    employee: 'Pham Gia Bao',
    requestType: 'Unpaid leave',
    period: '2026-06-07',
    status: 'Approved',
    decisionNote: 'Valid personal request',
    handledBy: 'Approved by HR',
  },
]

export function ApprovalsPage() {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialApprovalRequests)
  const [decisionNote, setDecisionNote] = useState('')
  const [feedback, setFeedback] = useState('')

  const pendingCount = useMemo(() => requests.filter((request) => request.status === 'Pending').length, [requests])
  const completedCount = requests.length - pendingCount

  const handleDecision = (requestId: string, status: Exclude<ApprovalStatus, 'Pending'>) => {
    const note = decisionNote.trim() || 'No decision note provided'

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              decisionNote: note,
              handledBy: `${status} by Admin`,
            }
          : request,
      ),
    )
    setDecisionNote('')
    setFeedback(`Request ${status.toLowerCase()} successfully`)
  }

  return (
    <>
      <section className="page-heading approvals-heading">
        <p className="eyebrow">Core HR workflow</p>
        <h2>Request & Approval Workflow</h2>
        <p>Review pending leave and attendance requests, record decision notes and keep a decision history.</p>
      </section>

      <section className="approvals-summary" aria-label="Approvals summary">
        <article className="approvals-stat-card">
          <span>Pending requests</span>
          <strong>{pendingCount}</strong>
          <p>Need Manager or HR decision</p>
        </article>
        <article className="approvals-stat-card">
          <span>Completed decisions</span>
          <strong>{completedCount}</strong>
          <p>Approved or rejected requests</p>
        </article>
        <article className="approvals-stat-card">
          <span>Workflow types</span>
          <strong>3</strong>
          <p>Leave, attendance and unpaid leave</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card approvals-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Approval queue</p>
              <h2>Pending Requests</h2>
            </div>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          <label className="decision-note-field">
            <span>Decision note</span>
            <textarea
              onChange={(event) => setDecisionNote(event.target.value)}
              placeholder="Add approval or rejection reason"
              value={decisionNote}
            />
          </label>

          <div className="approval-request-list">
            {requests.map((request) => (
              <article className="approval-request-item" key={request.id}>
                <div>
                  <strong>{request.employee}</strong>
                  <span>{request.requestType}</span>
                  <p>{request.period}</p>
                  <p>{request.decisionNote}</p>
                  <p>{request.handledBy}</p>
                </div>
                <span className={`approval-workflow-status ${request.status.toLowerCase()}`}>{request.status}</span>
                {request.status === 'Pending' ? (
                  <div className="approval-actions">
                    <button
                      className="ghost-button"
                      onClick={() => handleDecision(request.id, 'Approved')}
                      type="button"
                    >
                      Approve {request.employee} {request.requestType}
                    </button>
                    <button
                      className="ghost-button danger"
                      onClick={() => handleDecision(request.id, 'Rejected')}
                      type="button"
                    >
                      Reject {request.employee} {request.requestType}
                    </button>
                  </div>
                ) : (
                  <span className="approval-muted">Decision recorded</span>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="card approvals-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">History</p>
              <h2>Decision History</h2>
            </div>
          </div>
          <ul className="approval-history-list">
            {requests
              .filter((request) => request.status !== 'Pending')
              .map((request) => (
                <li key={`${request.id}-history`}>
                  <strong>{request.handledBy}</strong>
                  <span>{request.employee} - {request.requestType}</span>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  )
}
