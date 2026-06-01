import type { Employee } from '../data/hrmData'

export function StatusBadge({ status }: { status: Employee['status'] }) {
  return <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
}
