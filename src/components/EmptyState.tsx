import './EmptyState.css'
type EmptyStateProps = {
  actionLabel: string
  description: string
  onAction: () => void
  title: string
}

export function EmptyState({ actionLabel, description, onAction, title }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        ??
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="ghost-button" onClick={onAction} type="button">
        {actionLabel}
      </button>
    </div>
  )
}
