import type { Module } from '../data/hrmData'
import { ModuleHero } from '../components/ModuleHero'
import { PayrollSummaryCard } from '../components/PayrollSummaryCard'
import { RequirementsCard } from '../components/RequirementsCard'

export function PayrollPage({ module }: { module: Module }) {
  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Finance controlled module</p>
        <h2>Payroll Workspace</h2>
        <p>Salary data is restricted by role and should be visible only to Payroll, Finance and approved admins.</p>
      </section>

      <section className="hero-grid payroll-hero" aria-label="Payroll overview">
        <ModuleHero module={module} />
        <div className="metric-card green">
          <span>Processed employees</span>
          <strong>248</strong>
          <p>Ready for review</p>
        </div>
        <div className="metric-card orange">
          <span>Adjustments</span>
          <strong>14</strong>
          <p>Pending validation</p>
        </div>
        <div className="metric-card purple">
          <span>Access level</span>
          <strong>RBAC</strong>
          <p>RBAC enabled</p>
        </div>
      </section>

      <section className="content-grid">
        <PayrollSummaryCard />
        <RequirementsCard module={module} />
        <div className="card payroll-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Controls</p>
              <h2>Payroll safeguards</h2>
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
