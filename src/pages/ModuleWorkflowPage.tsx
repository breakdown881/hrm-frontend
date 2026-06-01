import type { Module } from '../data/hrmData'
import { MetricCard } from '../components/MetricCard'
import { ModuleHero } from '../components/ModuleHero'
import { RequirementsCard } from '../components/RequirementsCard'

export function ModuleWorkflowPage({ module }: { module: Module }) {
  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Dedicated workspace</p>
        <h2>{module.label} Workspace</h2>
        <p>{module.description}</p>
      </section>

      <section className="hero-grid" aria-label={`${module.label} overview`}>
        <ModuleHero module={module} />
        <MetricCard label="Coverage" value={`${module.progress}%`} trend={module.priority} tone="green" />
        <MetricCard label="Owner" value={module.owner.split(' / ')[0]} trend={module.owner} tone="orange" />
        <MetricCard label="Next step" value="Plan" trend="Break scope into stories" tone="purple" />
      </section>

      <section className="content-grid page-only-grid">
        <RequirementsCard module={module} />
        <div className="card wide-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Page actions</p>
              <h2>{module.label} implementation slice</h2>
            </div>
          </div>
          <ul className="check-list">
            <li>Convert requirement items into user stories</li>
            <li>Define loading, empty and error states before API integration</li>
            <li>Keep sensitive fields behind role-based access controls</li>
          </ul>
        </div>
      </section>
    </>
  )
}
