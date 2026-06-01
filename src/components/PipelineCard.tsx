import { pipeline } from '../data/hrmData'

export function PipelineCard({ title = 'Hiring pipeline' }: { title?: string }) {
  return (
    <div className="card">
      <div className="card-header compact">
        <div>
          <p className="eyebrow">Recruitment</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="pipeline-list">
        {pipeline.map((stage) => (
          <div className={`pipeline-item ${stage.tone}`} key={stage.label}>
            <span>{stage.label}</span>
            <strong>{stage.count}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
