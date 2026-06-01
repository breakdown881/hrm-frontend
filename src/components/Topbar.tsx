import type { UserRole } from '../data/hrmData'
import { userRoles } from '../data/hrmData'

type TopbarProps = {
  currentRole: UserRole
  feedback: string
  isSubmitting: boolean
  onCreateRequest: () => void
  onRoleChange: (role: UserRole) => void
}

export function Topbar({ currentRole, feedback, isSubmitting, onCreateRequest, onRoleChange }: TopbarProps) {
  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Enterprise-ready HR workspace</span>
          <h1>Human Resource Management</h1>
        </div>
        <div className="topbar-actions">
          <label className="role-selector">
            <span>Current role</span>
            <select onChange={(event) => onRoleChange(event.target.value as UserRole)} value={currentRole}>
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <button className="ghost-button" type="button">
            Export report
          </button>
          <button className="primary-button" disabled={isSubmitting} onClick={onCreateRequest} type="button">
            {isSubmitting ? 'Creating...' : '+ New request'}
          </button>
        </div>
      </header>

      {feedback && (
        <div className="success-banner" role="status">
          {feedback}
        </div>
      )}
    </>
  )
}
