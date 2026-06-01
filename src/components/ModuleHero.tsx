import type { Module } from '../data/hrmData'

export function ModuleHero({ module }: { module: Module }) {
  return (
    <div className="hero-panel">
      <div className="panel-heading">
        <span className="module-icon" aria-hidden="true">
          {module.icon}
        </span>
        <div>
          <p className="eyebrow">Active module</p>
          <h2>{module.label}</h2>
        </div>
      </div>
      <p>{module.description}</p>
      <div className="progress-block" aria-label={`${module.label} readiness ${module.progress}%`}>
        <div className="progress-meta">
          <span>Requirement coverage</span>
          <strong>{module.progress}%</strong>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${module.progress}%` }} />
        </div>
      </div>
      <div className="module-meta">
        <span>{module.priority}</span>
        <span>Owner: {module.owner}</span>
      </div>
    </div>
  )
}
