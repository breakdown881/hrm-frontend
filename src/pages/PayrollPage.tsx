import { useMemo, useState } from 'react'
import type { Module } from '../data/hrmData'
import { employees } from '../data/hrmData'
import './PayrollPage.css'

type PayrollStatus = 'Draft' | 'Locked'

type PayrollRun = {
  id: string
  month: string
  employee: string
  basicSalary: number
  workingDays: number
  unpaidLeaveDays: number
  allowances: number
  deductions: number
  netSalary: number
  status: PayrollStatus
}

const initialPayrollRuns: PayrollRun[] = [
  {
    id: 'PAY-001',
    month: '2026-05',
    employee: 'Tran Quoc Huy',
    basicSalary: 38000000,
    workingDays: 22,
    unpaidLeaveDays: 0,
    allowances: 2500000,
    deductions: 1000000,
    netSalary: 39500000,
    status: 'Draft',
  },
]

export function PayrollPage({ module }: { module: Module }) {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initialPayrollRuns)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [month, setMonth] = useState('')
  const [employee, setEmployee] = useState(employees[0].name)
  const [basicSalary, setBasicSalary] = useState('')
  const [workingDays, setWorkingDays] = useState('')
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState('')
  const [allowances, setAllowances] = useState('')
  const [deductions, setDeductions] = useState('')
  const [formError, setFormError] = useState('')
  const [feedback, setFeedback] = useState('')

  const lockedRuns = useMemo(() => payrollRuns.filter((run) => run.status === 'Locked').length, [payrollRuns])
  const totalNetSalary = useMemo(() => payrollRuns.reduce((total, run) => total + run.netSalary, 0), [payrollRuns])
  const selectedRun = payrollRuns[payrollRuns.length - 1]

  const handleSavePayrollRun = () => {
    const parsedBasicSalary = Number(basicSalary)
    const parsedWorkingDays = Number(workingDays)
    const parsedUnpaidLeaveDays = Number(unpaidLeaveDays)
    const parsedAllowances = Number(allowances)
    const parsedDeductions = Number(deductions)

    if (
      !month.trim() ||
      !isPositiveNumber(parsedBasicSalary) ||
      !isPositiveNumber(parsedWorkingDays) ||
      parsedUnpaidLeaveDays < 0 ||
      parsedAllowances < 0 ||
      parsedDeductions < 0
    ) {
      setFormError('Payroll month and valid salary numbers are required.')
      return
    }

    const paidDays = Math.max(parsedWorkingDays - parsedUnpaidLeaveDays, 0)
    const proratedSalary = Math.round((parsedBasicSalary / parsedWorkingDays) * paidDays)
    const nextRun: PayrollRun = {
      id: getNextPayrollId(payrollRuns),
      month: month.trim(),
      employee,
      basicSalary: parsedBasicSalary,
      workingDays: parsedWorkingDays,
      unpaidLeaveDays: parsedUnpaidLeaveDays,
      allowances: parsedAllowances,
      deductions: parsedDeductions,
      netSalary: proratedSalary + parsedAllowances - parsedDeductions,
      status: 'Draft',
    }

    setPayrollRuns((currentRuns) => [...currentRuns, nextRun])
    setMonth('')
    setEmployee(employees[0].name)
    setBasicSalary('')
    setWorkingDays('')
    setUnpaidLeaveDays('')
    setAllowances('')
    setDeductions('')
    setFormError('')
    setFeedback('Payroll run created successfully')
    setIsFormOpen(false)
  }

  const handleLockRun = (runId: string) => {
    setPayrollRuns((currentRuns) =>
      currentRuns.map((run) => (run.id === runId ? { ...run, status: 'Locked' } : run)),
    )
    setFeedback('Payroll cycle locked successfully')
  }

  return (
    <>
      <section className="page-heading payroll-heading">
        <p className="eyebrow">Finance controlled module</p>
        <h2>Payroll Workspace</h2>
        <p>Salary data is restricted by role and should be visible only to Payroll, Finance and approved admins.</p>
      </section>

      <section className="payroll-summary" aria-label="Payroll summary">
        <article className="payroll-stat-card">
          <span>Payroll runs</span>
          <strong>{payrollRuns.length}</strong>
          <p>{module.priority} access controls</p>
        </article>
        <article className="payroll-stat-card">
          <span>Locked cycles</span>
          <strong>{lockedRuns}</strong>
          <p>Protected from changes</p>
        </article>
        <article className="payroll-stat-card">
          <span>Net payroll</span>
          <strong>{formatCompactCurrency(totalNetSalary)}</strong>
          <p>Across visible runs</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card payroll-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Payroll runs</p>
              <h2>Monthly Payroll</h2>
            </div>
            <button className="primary-button" onClick={() => setIsFormOpen((isOpen) => !isOpen)} type="button">
              {isFormOpen ? 'Close form' : 'Add payroll run'}
            </button>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          {isFormOpen && (
            <div className="payroll-form" aria-label="Add payroll run form">
              <label>
                <span>Payroll month</span>
                <input
                  onChange={(event) => {
                    setMonth(event.target.value)
                    setFormError('')
                  }}
                  placeholder="2026-06"
                  type="text"
                  value={month}
                />
              </label>
              <label>
                <span>Employee</span>
                <select onChange={(event) => setEmployee(event.target.value)} value={employee}>
                  {employees.map((employeeOption) => (
                    <option key={employeeOption.id} value={employeeOption.name}>
                      {employeeOption.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Basic salary</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setBasicSalary(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={basicSalary}
                />
              </label>
              <label>
                <span>Working days</span>
                <input
                  min="1"
                  onChange={(event) => {
                    setWorkingDays(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={workingDays}
                />
              </label>
              <label>
                <span>Unpaid leave days</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setUnpaidLeaveDays(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={unpaidLeaveDays}
                />
              </label>
              <label>
                <span>Allowances</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setAllowances(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={allowances}
                />
              </label>
              <label>
                <span>Deductions</span>
                <input
                  min="0"
                  onChange={(event) => {
                    setDeductions(event.target.value)
                    setFormError('')
                  }}
                  type="number"
                  value={deductions}
                />
              </label>
              {formError && <p className="form-error">{formError}</p>}
              <button className="primary-button" onClick={handleSavePayrollRun} type="button">
                Save payroll run
              </button>
            </div>
          )}

          <div className="payroll-run-list">
            {payrollRuns.map((run) => (
              <article className="payroll-run-item" key={run.id}>
                <div>
                  <span className="payroll-run-id">{run.id}</span>
                  <h3>{run.employee}</h3>
                  <p>{run.month}</p>
                </div>
                <div className="payroll-run-values">
                  <span>Net salary</span>
                  <strong>{formatCurrency(run.netSalary)}</strong>
                </div>
                <div className="payroll-run-actions">
                  <span className={`payroll-status ${run.status.toLowerCase()}`}>{run.status}</span>
                  {run.status === 'Draft' && (
                    <button
                      aria-label={`Lock ${run.employee} ${run.month} payroll run`}
                      className="ghost-button"
                      onClick={() => handleLockRun(run.id)}
                      type="button"
                    >
                      Lock cycle
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card payroll-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Payslip</p>
              <h2>Payslip Preview</h2>
            </div>
          </div>
          <div className="payslip-preview">
            <span>{selectedRun.employee}</span>
            <strong>{formatCurrency(selectedRun.netSalary)}</strong>
            <p>
              Basic {formatCurrency(selectedRun.basicSalary)} | Allowances {formatCurrency(selectedRun.allowances)}
            </p>
            <p>
              Deductions {formatCurrency(selectedRun.deductions)} | Status {selectedRun.status}
            </p>
          </div>
        </div>

        <div className="card payroll-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Controls</p>
              <h2>Payroll Safeguards</h2>
            </div>
          </div>
          <ul className="check-list">
            <li>Lock payroll cycle after approval</li>
            <li>Audit every salary change</li>
            <li>Hide payslips from unauthorized users</li>
          </ul>
        </div>
      </section>
    </>
  )
}

function isPositiveNumber(value: number) {
  return Number.isFinite(value) && value > 0
}

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} VND`
}

function formatCompactCurrency(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }

  return formatCurrency(value)
}

function getNextPayrollId(runs: PayrollRun[]) {
  const nextNumber = Math.max(...runs.map((run) => Number(run.id.replace('PAY-', '')))) + 1
  return `PAY-${String(nextNumber).padStart(3, '0')}`
}
