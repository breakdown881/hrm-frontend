import { useMemo, useState } from 'react'
import './AttendancePage.css'
import { employees } from '../data/hrmData'

type AttendanceStatus = 'On time' | 'Late' | 'Remote' | 'Missing checkout'

type AttendanceRecord = {
  id: string
  employee: string
  date: string
  checkIn: string
  checkOut: string
  status: AttendanceStatus
}

const attendanceStatuses: AttendanceStatus[] = ['On time', 'Late', 'Remote', 'Missing checkout']

const initialAttendanceRecords: AttendanceRecord[] = [
  { id: 'ATT-001', employee: 'Nguyen Minh Anh', date: '2026-06-01', checkIn: '08:54', checkOut: '17:42', status: 'On time' },
  { id: 'ATT-002', employee: 'Tran Quoc Huy', date: '2026-06-01', checkIn: '09:17', checkOut: '18:05', status: 'Late' },
  { id: 'ATT-003', employee: 'Pham Gia Bao', date: '2026-06-01', checkIn: '08:45', checkOut: '17:30', status: 'On time' },
]

export function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialAttendanceRecords)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [employeeName, setEmployeeName] = useState(employees[0].name)
  const [workDate, setWorkDate] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [status, setStatus] = useState<AttendanceStatus>('On time')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const onTimeCount = useMemo(() => records.filter((record) => record.status === 'On time').length, [records])
  const exceptionCount = records.length - onTimeCount

  const handleSaveRecord = () => {
    const trimmedWorkDate = workDate.trim()
    const trimmedCheckIn = checkIn.trim()
    const trimmedCheckOut = checkOut.trim()

    if (!trimmedWorkDate || !trimmedCheckIn || !trimmedCheckOut) {
      setFormError('Work date, check-in and check-out are required.')
      return
    }

    const nextRecord: AttendanceRecord = {
      id: getNextAttendanceId(records),
      employee: employeeName,
      date: trimmedWorkDate,
      checkIn: trimmedCheckIn,
      checkOut: trimmedCheckOut,
      status,
    }

    setRecords((currentRecords) => [...currentRecords, nextRecord])
    setWorkDate('')
    setCheckIn('')
    setCheckOut('')
    setStatus('On time')
    setFormError('')
    setFeedback('Attendance record created successfully')
    setIsFormOpen(false)
  }

  return (
    <>
      <section className="page-heading attendance-heading">
        <p className="eyebrow">Core HR workflow</p>
        <h2>Attendance Management</h2>
        <p>Track daily check-in, check-out, late arrivals and company timesheet exceptions.</p>
      </section>

      <section className="attendance-summary" aria-label="Attendance summary">
        <article className="attendance-stat-card">
          <span>Present records</span>
          <strong>{records.length}</strong>
          <p>Recorded for the current cycle</p>
        </article>
        <article className="attendance-stat-card">
          <span>On-time records</span>
          <strong>{onTimeCount}</strong>
          <p>Within configured work hours</p>
        </article>
        <article className="attendance-stat-card">
          <span>Exceptions</span>
          <strong>{exceptionCount}</strong>
          <p>Late, remote or missing checkout</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card attendance-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Daily attendance</p>
              <h2>Company Timesheet</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add attendance record'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="attendance-form" aria-label="Add attendance record form">
              <label>
                <span>Employee</span>
                <select onChange={(event) => setEmployeeName(event.target.value)} value={employeeName}>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Work date</span>
                <input
                  onChange={(event) => {
                    setWorkDate(event.target.value)
                    setFormError('')
                  }}
                  placeholder="2026-06-02"
                  type="text"
                  value={workDate}
                />
              </label>
              <label>
                <span>Check-in</span>
                <input
                  onChange={(event) => {
                    setCheckIn(event.target.value)
                    setFormError('')
                  }}
                  placeholder="08:45"
                  type="text"
                  value={checkIn}
                />
              </label>
              <label>
                <span>Check-out</span>
                <input
                  onChange={(event) => {
                    setCheckOut(event.target.value)
                    setFormError('')
                  }}
                  placeholder="17:35"
                  type="text"
                  value={checkOut}
                />
              </label>
              <label>
                <span>Status</span>
                <select onChange={(event) => setStatus(event.target.value as AttendanceStatus)} value={status}>
                  {attendanceStatuses.map((attendanceStatus) => (
                    <option key={attendanceStatus} value={attendanceStatus}>
                      {attendanceStatus}
                    </option>
                  ))}
                </select>
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSaveRecord} type="button">
                Save attendance record
              </button>
            </div>
          )}

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Work date</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employee}</strong>
                      <span>{record.id}</span>
                    </td>
                    <td>{record.date}</td>
                    <td>{record.checkIn}</td>
                    <td>{record.checkOut}</td>
                    <td>
                      <span className={`attendance-status ${getStatusClassName(record.status)}`}>{record.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card attendance-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Work schedule</p>
              <h2>Standard Working Hours</h2>
            </div>
          </div>
          <div className="attendance-policy-list">
            <article className="attendance-policy-item">
              <strong>Working days</strong>
              <span>Monday to Friday</span>
            </article>
            <article className="attendance-policy-item">
              <strong>Standard check-in</strong>
              <span>09:00</span>
            </article>
            <article className="attendance-policy-item">
              <strong>Standard check-out</strong>
              <span>17:30</span>
            </article>
            <article className="attendance-policy-item">
              <strong>Late threshold</strong>
              <span>After 09:05</span>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}

function getNextAttendanceId(records: AttendanceRecord[]) {
  const nextNumber = Math.max(...records.map((record) => Number(record.id.replace('ATT-', '')))) + 1
  return `ATT-${String(nextNumber).padStart(3, '0')}`
}

function getStatusClassName(status: AttendanceStatus) {
  return status.toLowerCase().replace(/\s+/g, '-')
}
