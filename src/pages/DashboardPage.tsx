import type { Module } from '../data/hrmData'
import { ApprovalsCard } from '../components/ApprovalsCard'
import { MetricCard } from '../components/MetricCard'
import { ModuleHero } from '../components/ModuleHero'
import { PayrollSummaryCard } from '../components/PayrollSummaryCard'
import { PipelineCard } from '../components/PipelineCard'
import { RequirementsCard } from '../components/RequirementsCard'
import { RoadmapCard } from '../components/RoadmapCard'

export function DashboardPage({ module }: { module: Module }) {
  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Workflow coverage</p>
        <h2>Dashboard Overview</h2>
        <p>One place to monitor core HR, recruitment, approvals, attendance and payroll readiness.</p>
      </section>

      <section className="hero-grid" aria-label="HRM overview">
        <ModuleHero module={module} />
        <MetricCard label="Employees" value="248" trend="+12 this month" tone="green" />
        <MetricCard label="Pending approvals" value="17" trend="Leave + timesheet" tone="orange" />
        <MetricCard label="Payroll status" value="Draft" trend="May cycle open" tone="purple" />
      </section>

      <section className="content-grid">
        <ApprovalsCard />
        <PipelineCard />
        <RequirementsCard module={module} />
        <PayrollSummaryCard />
        <RoadmapCard />
      </section>
    </>
  )
}
