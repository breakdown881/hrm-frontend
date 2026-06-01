import { useMemo, useState } from 'react'
import './AuditPage.css'

type AuditModule = 'All modules' | 'Auth' | 'Employees' | 'Payroll' | 'Leave' | 'Contracts'
type AuditSeverity = 'Low' | 'Medium' | 'High'

type AuditEntry = {
  id: string
  actor: string
  module: Exclude<AuditModule, 'All modules'>
  action: string
  timestamp: string
  severity: AuditSeverity
}

const moduleFilters: AuditModule[] = ['All modules', 'Auth', 'Employees', 'Payroll', 'Leave', 'Contracts']

const initialAuditEntries: AuditEntry[] = [
  {
    id: 'AUD-001',
    actor: 'Admin',
    module: 'Auth',
    action: 'Login succeeded',
    timestamp: '2026-06-01 08:00',
    severity: 'Low',
  },
  {
    id: 'AUD-002',
    actor: 'HR',
    module: 'Employees',
    action: 'Employee profile updated',
    timestamp: '2026-06-01 09:15',
    severity: 'Medium',
  },
  {
    id: 'AUD-003',
    actor: 'Payroll/Finance',
    module: 'Payroll',
    action: 'Payroll locked',
    timestamp: '2026-06-01 10:30',
    severity: 'High',
  },
  {
    id: 'AUD-004',
    actor: 'Manager',
    module: 'Leave',
    action: 'Leave request approved',
    timestamp: '2026-06-01 11:00',
    severity: 'Medium',
  },
]

export function AuditPage() {
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(initialAuditEntries)
  const [moduleFilter, setModuleFilter] = useState<AuditModule>('All modules')
  const [feedback, setFeedback] = useState('')

  const filteredEntries = useMemo(
    () =>
      auditEntries.filter((entry) => moduleFilter === 'All modules' || entry.module === moduleFilter),
    [auditEntries, moduleFilter],
  )
  const highSeverityCount = auditEntries.filter((entry) => entry.severity === 'High').length
  const protectedModules = ['Payroll', 'Contracts', 'Employees']

  const handleRecordSensitiveAction = () => {
    const nextEntry: AuditEntry = {
      id: getNextAuditId(auditEntries),
      actor: 'Admin',
      module: 'Payroll',
      action: 'Salary visibility reviewed',
      timestamp: '2026-06-01 14:00',
      severity: 'High',
    }

    setAuditEntries((currentEntries) => [nextEntry, ...currentEntries])
    setFeedback('Audit entry recorded successfully')
  }

  return (
    <>
      <section className="page-heading audit-heading">
        <p className="eyebrow">Security first</p>
        <h2>Audit Log & Security</h2>
        <p>Track sensitive activity, monitor protected modules and keep payroll data behind role-based access.</p>
      </section>

      <section className="audit-summary" aria-label="Audit summary">
        <article className="audit-stat-card">
          <span>Audit entries</span>
          <strong>{auditEntries.length}</strong>
          <p>Tracked sensitive actions</p>
        </article>
        <article className="audit-stat-card">
          <span>High severity</span>
          <strong>{highSeverityCount}</strong>
          <p>Needs admin attention</p>
        </article>
        <article className="audit-stat-card">
          <span>Protected modules</span>
          <strong>{protectedModules.length}</strong>
          <p>RBAC enforced</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card audit-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Sensitive activity</p>
              <h2>Audit Log</h2>
            </div>
            <button className="primary-button" onClick={handleRecordSensitiveAction} type="button">
              Record sensitive action
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          <div className="audit-filter-row">
            <label>
              <span>Module filter</span>
              <select onChange={(event) => setModuleFilter(event.target.value as AuditModule)} value={moduleFilter}>
                {moduleFilters.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="audit-entry-list">
            {filteredEntries.map((entry) => (
              <article className="audit-entry-item" key={entry.id}>
                <div>
                  <span className="audit-entry-id">{entry.id}</span>
                  <h3>{entry.action}</h3>
                  <p>
                    {entry.actor} | {entry.timestamp}
                  </p>
                </div>
                <div className="audit-entry-meta">
                  <span className="audit-module">{entry.module}</span>
                  <span className={`audit-severity ${entry.severity.toLowerCase()}`}>{entry.severity}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card audit-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Controls</p>
              <h2>Security Controls</h2>
            </div>
          </div>
          <ul className="audit-control-list">
            <li>Payroll route requires Admin or Payroll/Finance access.</li>
            <li>Contract and payroll changes are treated as high-risk actions.</li>
            <li>Unauthorized roles see access denied before sensitive data renders.</li>
          </ul>
        </div>
      </section>
    </>
  )
}

function getNextAuditId(entries: AuditEntry[]) {
  const nextNumber = Math.max(...entries.map((entry) => Number(entry.id.replace('AUD-', '')))) + 1
  return `AUD-${String(nextNumber).padStart(3, '0')}`
}
