import { approvals } from '../data/hrmData'

export function ApprovalsCard() {
  return (
    <div className="card">
      <div className="card-header compact">
        <div>
          <p className="eyebrow">Approval workflow</p>
          <h2>Pending approvals</h2>
        </div>
      </div>
      <div className="approval-list">
        {approvals.map((approval) => (
          <article className="approval-item" key={`${approval.employee}-${approval.date}`}>
            <div>
              <strong>{approval.employee}</strong>
              <span>
                {approval.type} ? {approval.date}
              </span>
            </div>
            <span className={`approval-status ${approval.status.toLowerCase()}`}>{approval.status}</span>
          </article>
        ))}
      </div>
    </div>
  )
}
