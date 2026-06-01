import './MetricCard.css'
type MetricCardProps = {
  label: string
  value: string
  trend: string
  tone: 'green' | 'orange' | 'purple'
}

export function MetricCard({ label, value, trend, tone }: MetricCardProps) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{trend}</p>
    </article>
  )
}
