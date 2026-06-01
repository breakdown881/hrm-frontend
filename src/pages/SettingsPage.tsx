import { useState } from 'react'
import './SettingsPage.css'

type LeaveType = {
  id: string
  name: string
  defaultDays: number
  paid: boolean
}

type ContractType = {
  id: string
  name: string
  duration: string
}

type Holiday = {
  id: string
  name: string
  date: string
}

const initialLeaveTypes: LeaveType[] = [
  { id: 'LVT-001', name: 'Annual Leave', defaultDays: 12, paid: true },
  { id: 'LVT-002', name: 'Sick Leave', defaultDays: 6, paid: true },
  { id: 'LVT-003', name: 'Unpaid Leave', defaultDays: 0, paid: false },
]

const contractTypes: ContractType[] = [
  { id: 'CON-001', name: 'Probation Contract', duration: '2 months' },
  { id: 'CON-002', name: 'Fixed-term Contract', duration: '12 months' },
  { id: 'CON-003', name: 'Indefinite Contract', duration: 'No end date' },
]

const holidays: Holiday[] = [
  { id: 'HOL-001', name: 'Company Holiday', date: '2026-01-01' },
  { id: 'HOL-002', name: 'Founding Day', date: '2026-08-15' },
]

export function SettingsPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialLeaveTypes)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [leaveTypeName, setLeaveTypeName] = useState('')
  const [defaultDays, setDefaultDays] = useState('')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const handleSaveLeaveType = () => {
    const trimmedName = leaveTypeName.trim()
    const parsedDays = Number(defaultDays)

    if (!trimmedName || Number.isNaN(parsedDays) || parsedDays < 0) {
      setFormError('Leave type name and a non-negative default days value are required.')
      return
    }

    const newLeaveType: LeaveType = {
      id: getNextLeaveTypeId(leaveTypes),
      name: trimmedName,
      defaultDays: parsedDays,
      paid: parsedDays > 0,
    }

    setLeaveTypes((currentLeaveTypes) => [...currentLeaveTypes, newLeaveType])
    setLeaveTypeName('')
    setDefaultDays('')
    setFormError('')
    setFeedback('Leave type created successfully')
    setIsFormOpen(false)
  }

  return (
    <>
      <section className="page-heading settings-heading">
        <p className="eyebrow">System configuration</p>
        <h2>Settings & Master Data</h2>
        <p>Configure HR master data used by leave, contracts, payroll and reporting workflows.</p>
      </section>

      <section className="settings-summary" aria-label="Settings summary">
        <article className="settings-stat-card">
          <span>Leave types</span>
          <strong>{leaveTypes.length}</strong>
          <p>Policy-ready categories</p>
        </article>
        <article className="settings-stat-card">
          <span>Contract types</span>
          <strong>{contractTypes.length}</strong>
          <p>Reusable employment templates</p>
        </article>
        <article className="settings-stat-card">
          <span>Holidays</span>
          <strong>{holidays.length}</strong>
          <p>Working calendar entries</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card settings-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Leave policy</p>
              <h2>Leave Types</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add leave type'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="settings-form" aria-label="Add leave type form">
              <label>
                <span>Leave type name</span>
                <input
                  onChange={(event) => {
                    setLeaveTypeName(event.target.value)
                    setFormError('')
                  }}
                  placeholder="Leave type name"
                  type="text"
                  value={leaveTypeName}
                />
              </label>
              <label>
                <span>Default days</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setDefaultDays(event.target.value)
                    setFormError('')
                  }}
                  placeholder="0"
                  type="number"
                  value={defaultDays}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveLeaveType} type="button">
                Save leave type
              </button>
            </div>
          )}

          <div className="master-data-list">
            {leaveTypes.map((leaveType) => (
              <article className="master-data-item" key={leaveType.id}>
                <div>
                  <strong>{leaveType.name}</strong>
                  <span>{leaveType.id}</span>
                </div>
                <span className="master-data-pill">{leaveType.defaultDays} days</span>
              </article>
            ))}
          </div>
        </div>

        <div className="card settings-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Contracts</p>
              <h2>Contract Types</h2>
            </div>
          </div>
          <div className="master-data-list">
            {contractTypes.map((contractType) => (
              <article className="master-data-item" key={contractType.id}>
                <div>
                  <strong>{contractType.name}</strong>
                  <span>{contractType.id}</span>
                </div>
                <span>{contractType.duration}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="card settings-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2>Holidays</h2>
            </div>
          </div>
          <div className="master-data-list">
            {holidays.map((holiday) => (
              <article className="master-data-item" key={holiday.id}>
                <div>
                  <strong>{holiday.name}</strong>
                  <span>{holiday.id}</span>
                </div>
                <span>{holiday.date}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function getNextLeaveTypeId(leaveTypes: LeaveType[]) {
  const nextNumber = Math.max(...leaveTypes.map((leaveType) => Number(leaveType.id.replace('LVT-', '')))) + 1
  return `LVT-${String(nextNumber).padStart(3, '0')}`
}
