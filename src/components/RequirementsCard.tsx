import type { Module } from '../data/hrmData'
import { moduleRequirements } from '../data/hrmData'

export function RequirementsCard({ module }: { module: Module }) {
  return (
    <div className="card requirements-card">
      <div className="card-header compact">
        <div>
          <p className="eyebrow">From REQUIREMENT.md</p>
          <h2>{module.label} scope</h2>
        </div>
      </div>
      <ul className="check-list">
        {moduleRequirements[module.id].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
