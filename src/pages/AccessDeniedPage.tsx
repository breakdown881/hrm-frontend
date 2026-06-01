import './AccessDeniedPage.css'
import '../components/EmptyState.css'
import { Link } from 'react-router-dom'
import type { Module, UserRole } from '../data/hrmData'

type AccessDeniedPageProps = {
  module: Module
  role: UserRole
}

export function AccessDeniedPage({ module, role }: AccessDeniedPageProps) {
  return (
    <section className="access-denied-card" aria-label="Access denied">
      <div className="empty-icon" aria-hidden="true">
        !
      </div>
      <p className="eyebrow">Protected route</p>
      <h2>Access Denied</h2>
      <p>
        {role} cannot access {module.label.toLowerCase()}. Switch to an authorized role or return to Dashboard.
      </p>
      <Link className="ghost-button" to="/dashboard">
        Back to dashboard
      </Link>
    </section>
  )
}
