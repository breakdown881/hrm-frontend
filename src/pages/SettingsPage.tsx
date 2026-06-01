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

type WorkCalendar = {
  hours: string
  workdays: string
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

const initialHolidays: Holiday[] = [
  { id: 'HOL-001', name: 'Company Holiday', date: '2026-01-01' },
  { id: 'HOL-002', name: 'Founding Day', date: '2026-08-15' },
]

const initialWorkCalendar: WorkCalendar = {
  hours: '09:00 - 18:00',
  workdays: 'Monday - Friday',
}

export function SettingsPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(initialLeaveTypes)
  const [holidayList, setHolidayList] = useState<Holiday[]>(initialHolidays)
  const [workCalendar, setWorkCalendar] = useState<WorkCalendar>(initialWorkCalendar)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isHolidayFormOpen, setIsHolidayFormOpen] = useState(false)
  const [isCalendarFormOpen, setIsCalendarFormOpen] = useState(false)
  const [leaveTypeName, setLeaveTypeName] = useState('')
  const [defaultDays, setDefaultDays] = useState('')
  const [holidayName, setHolidayName] = useState('')
  const [holidayDate, setHolidayDate] = useState('')
  const [calendarValues, setCalendarValues] = useState<WorkCalendar>(initialWorkCalendar)
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

  const handleSaveWorkCalendar = () => {
    const trimmedWorkdays = calendarValues.workdays.trim()
    const trimmedHours = calendarValues.hours.trim()

    if (!trimmedWorkdays || !trimmedHours) {
      setFormError('Workdays and standard working hours are required.')
      return
    }

    setWorkCalendar({ hours: trimmedHours, workdays: trimmedWorkdays })
    setCalendarValues({ hours: trimmedHours, workdays: trimmedWorkdays })
    setFormError('')
    setFeedback('Work calendar updated successfully')
    setIsCalendarFormOpen(false)
  }

  const handleSaveHoliday = () => {
    const trimmedName = holidayName.trim()
    const trimmedDate = holidayDate.trim()

    if (!trimmedName || !trimmedDate) {
      setFormError('Holiday name and date are required.')
      return
    }

    const newHoliday: Holiday = {
      date: trimmedDate,
      id: getNextHolidayId(holidayList),
      name: trimmedName,
    }

    setHolidayList((currentHolidays) => [...currentHolidays, newHoliday])
    setHolidayName('')
    setHolidayDate('')
    setFormError('')
    setFeedback('Holiday created successfully')
    setIsHolidayFormOpen(false)
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
          <strong>{holidayList.length}</strong>
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
              <h2>Working Calendar</h2>
            </div>
            <button
              className="ghost-button"
              onClick={() => {
                setCalendarValues(workCalendar)
                setIsCalendarFormOpen((isOpen) => !isOpen)
                setFormError('')
              }}
              type="button"
            >
              {isCalendarFormOpen ? 'Close calendar form' : 'Configure work calendar'}
            </button>
          </div>

          {isCalendarFormOpen && (
            <div className="settings-form calendar-form" aria-label="Work calendar form">
              <label>
                <span>Workdays</span>
                <input
                  onChange={(event) => {
                    setCalendarValues((currentValues) => ({ ...currentValues, workdays: event.target.value }))
                    setFormError('')
                  }}
                  type="text"
                  value={calendarValues.workdays}
                />
              </label>
              <label>
                <span>Standard working hours</span>
                <input
                  onChange={(event) => {
                    setCalendarValues((currentValues) => ({ ...currentValues, hours: event.target.value }))
                    setFormError('')
                  }}
                  type="text"
                  value={calendarValues.hours}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveWorkCalendar} type="button">
                Save work calendar
              </button>
            </div>
          )}

          <div className="master-data-list">
            <article className="master-data-item">
              <div>
                <strong>{workCalendar.workdays}</strong>
                <span>Configured workdays</span>
              </div>
              <span>{workCalendar.hours}</span>
            </article>
          </div>
        </div>

        <div className="card settings-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Calendar</p>
              <h2>Holidays</h2>
            </div>
            <button className="ghost-button" onClick={() => setIsHolidayFormOpen((isOpen) => !isOpen)} type="button">
              {isHolidayFormOpen ? 'Close holiday form' : 'Add holiday'}
            </button>
          </div>

          {isHolidayFormOpen && (
            <div className="settings-form holiday-form" aria-label="Add holiday form">
              <label>
                <span>Holiday name</span>
                <input
                  onChange={(event) => {
                    setHolidayName(event.target.value)
                    setFormError('')
                  }}
                  type="text"
                  value={holidayName}
                />
              </label>
              <label>
                <span>Holiday date</span>
                <input
                  onChange={(event) => {
                    setHolidayDate(event.target.value)
                    setFormError('')
                  }}
                  type="date"
                  value={holidayDate}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveHoliday} type="button">
                Save holiday
              </button>
            </div>
          )}

          <div className="master-data-list">
            {holidayList.map((holiday) => (
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

function getNextHolidayId(holidays: Holiday[]) {
  const nextNumber = Math.max(...holidays.map((holiday) => Number(holiday.id.replace('HOL-', '')))) + 1
  return `HOL-${String(nextNumber).padStart(3, '0')}`
}
