import { useMemo, useState } from 'react'
import { approvals, employees } from '../data/hrmData'
import './ReportsPage.css'

type ReportType = 'Headcount by department' | 'Leave summary' | 'Attendance summary' | 'Payroll overview'
type EmployeeStatusFilter = 'All statuses' | 'Official' | 'Probation' | 'Offboarding'

const reportTypes: ReportType[] = ['Headcount by department', 'Leave summary', 'Attendance summary', 'Payroll overview']
const statusFilters: EmployeeStatusFilter[] = ['All statuses', 'Official', 'Probation', 'Offboarding']
const departments = ['All departments', ...Array.from(new Set(employees.map((employee) => employee.department)))]

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('Headcount by department')
  const [departmentFilter, setDepartmentFilter] = useState('All departments')
  const [statusFilter, setStatusFilter] = useState<EmployeeStatusFilter>('All statuses')
  const [feedback, setFeedback] = useState('')
  const [generatedAt, setGeneratedAt] = useState('Not generated yet')

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const matchesDepartment = departmentFilter === 'All departments' || employee.department === departmentFilter
        const matchesStatus = statusFilter === 'All statuses' || employee.status === statusFilter

        return matchesDepartment && matchesStatus
      }),
    [departmentFilter, statusFilter],
  )

  const reportSummary = useMemo(
    () => buildReportSummary(reportType, filteredEmployees, departmentFilter),
    [departmentFilter, filteredEmployees, reportType],
  )

  const handleGenerateReport = () => {
    setGeneratedAt('Generated for current filters')
    setFeedback('Report generated successfully')
  }

  const handleExportReport = () => {
    setFeedback('Report export prepared successfully')
  }

  return (
    <>
      <section className="page-heading reports-heading">
        <p className="eyebrow">Full HR lifecycle</p>
        <h2>Reports & Analytics</h2>
        <p>Build people, leave, attendance and payroll reports with department and status filters.</p>
      </section>

      <section className="reports-summary" aria-label="Reports summary">
        <article className="reports-stat-card">
          <span>Report types</span>
          <strong>{reportTypes.length}</strong>
          <p>People, leave, attendance and payroll</p>
        </article>
        <article className="reports-stat-card">
          <span>Filtered employees</span>
          <strong>{filteredEmployees.length}</strong>
          <p>{departmentFilter}</p>
        </article>
        <article className="reports-stat-card">
          <span>Pending approvals</span>
          <strong>{approvals.filter((approval) => approval.status === 'Pending').length}</strong>
          <p>Available for workflow reports</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card reports-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Filters</p>
              <h2>Report Builder</h2>
            </div>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          <div className="reports-form" aria-label="Report filters">
            <label>
              <span>Report type</span>
              <select onChange={(event) => setReportType(event.target.value as ReportType)} value={reportType}>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Department filter</span>
              <select onChange={(event) => setDepartmentFilter(event.target.value)} value={departmentFilter}>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Employment status</span>
              <select onChange={(event) => setStatusFilter(event.target.value as EmployeeStatusFilter)} value={statusFilter}>
                {statusFilters.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" onClick={handleGenerateReport} type="button">
              Generate report
            </button>
            <button className="ghost-button" onClick={handleExportReport} type="button">
              Export current report
            </button>
          </div>
        </div>

        <div className="card wide-card reports-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">{generatedAt}</p>
              <h2>Report Preview</h2>
            </div>
          </div>

          <div className="reports-preview">
            <article className="reports-preview-main">
              <span>{reportType}</span>
              <strong>{reportSummary.primaryValue}</strong>
              <p>{reportSummary.primaryLabel}</p>
            </article>
            <article className="reports-preview-side">
              <span>Scope</span>
              <strong>{departmentFilter}</strong>
              <p>{statusFilter}</p>
            </article>
          </div>

          <div className="reports-insight-list">
            {reportSummary.insights.map((insight) => (
              <article className="reports-insight-item" key={insight.label}>
                <span>{insight.label}</span>
                <strong>{insight.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function buildReportSummary(reportType: ReportType, filteredEmployees: typeof employees, departmentFilter: string) {
  if (reportType === 'Leave summary') {
    const totalLeaveBalance = filteredEmployees.reduce((total, employee) => total + employee.leaveBalance, 0)

    return {
      primaryValue: `${totalLeaveBalance} days`,
      primaryLabel: 'Remaining leave balance',
      insights: [
        { label: 'Employees included', value: `${filteredEmployees.length}` },
        { label: 'Pending leave approvals', value: `${approvals.filter((approval) => approval.status === 'Pending').length}` },
      ],
    }
  }

  if (reportType === 'Attendance summary') {
    const onTimeCount = filteredEmployees.filter((employee) => employee.attendance === 'On time').length

    return {
      primaryValue: `${onTimeCount} on time`,
      primaryLabel: 'Attendance records in scope',
      insights: [
        { label: 'Late or remote records', value: `${filteredEmployees.length - onTimeCount}` },
        { label: 'Employees included', value: `${filteredEmployees.length}` },
      ],
    }
  }

  if (reportType === 'Payroll overview') {
    return {
      primaryValue: `${filteredEmployees.length} employees`,
      primaryLabel: 'Payroll-ready employee records',
      insights: [
        { label: 'Sensitive payroll data', value: 'Role protected' },
        { label: 'Department scope', value: departmentFilter },
      ],
    }
  }

  const departmentCounts = filteredEmployees.reduce<Record<string, number>>((counts, employee) => {
    counts[employee.department] = (counts[employee.department] ?? 0) + 1
    return counts
  }, {})

  return {
    primaryValue: `${filteredEmployees.length} employees`,
    primaryLabel: 'Headcount in selected scope',
    insights: Object.entries(departmentCounts).map(([department, count]) => ({ label: department, value: `${count} employees` })),
  }
}
