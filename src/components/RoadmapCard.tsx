import './RoadmapCard.css'
import { roadmap } from '../data/hrmData'

export function RoadmapCard() {
  return (
    <div className="card timeline-card">
      <div className="card-header compact">
        <div>
          <p className="eyebrow">Implementation roadmap</p>
          <h2>Phase plan</h2>
        </div>
      </div>
      <ol className="timeline">
        {roadmap.map((item) => (
          <li key={item.phase}>
            <strong>{item.phase}</strong>
            <span>{item.description}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
