import { useState } from 'react'
import type { UserRole } from '../data/hrmData'
import { userRoles } from '../data/hrmData'
import './AuthPage.css'

type AuthPageProps = {
  onChangePassword: () => void
  onSignIn: (email: string, password: string, role: UserRole) => void | Promise<void>
}

export function AuthPage({ onChangePassword, onSignIn }: AuthPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('HR')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [passwordFeedback, setPasswordFeedback] = useState('')

  const handleSignIn = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setFormError('Email and password are required.')
      return
    }

    setFormError('')
    await onSignIn(trimmedEmail, password, role)
  }

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      setFormError('Current password and new password are required.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setFormError('')
    setPasswordFeedback('Password changed successfully')
    onChangePassword()
  }

  return (
    <>
      <section className="page-heading auth-heading">
        <p className="eyebrow">Session management</p>
        <h2>Authentication</h2>
        <p>Sign in with a role, protect HRM routes and support basic password updates.</p>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card auth-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Access</p>
              <h2>Sign in</h2>
            </div>
          </div>

          <div className="auth-form" aria-label="Sign in form">
            <label>
              <span>Email</span>
              <input
                onChange={(event) => {
                  setEmail(event.target.value)
                  setFormError('')
                }}
                placeholder="name@company.com"
                type="email"
                value={email}
              />
            </label>
            <label>
              <span>Password</span>
              <input
                onChange={(event) => {
                  setPassword(event.target.value)
                  setFormError('')
                }}
                type="password"
                value={password}
              />
            </label>
            <label>
              <span>Sign in role</span>
              <select onChange={(event) => setRole(event.target.value as UserRole)} value={role}>
                {userRoles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {roleOption}
                  </option>
                ))}
              </select>
            </label>
            {formError && <p className="form-error">{formError}</p>}
            <button className="primary-button" onClick={handleSignIn} type="button">
              Sign in
            </button>
          </div>
        </div>

        <div className="card auth-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Account</p>
              <h2>Password</h2>
            </div>
            <button className="ghost-button" onClick={() => setIsPasswordFormOpen((isOpen) => !isOpen)} type="button">
              Change password
            </button>
          </div>

          {passwordFeedback && (
            <div className="success-banner" role="status">
              {passwordFeedback}
            </div>
          )}

          {isPasswordFormOpen && (
            <div className="auth-form" aria-label="Change password form">
              <label>
                <span>Current password</span>
                <input
                  onChange={(event) => {
                    setCurrentPassword(event.target.value)
                    setFormError('')
                  }}
                  type="password"
                  value={currentPassword}
                />
              </label>
              <label>
                <span>New password</span>
                <input
                  onChange={(event) => {
                    setNewPassword(event.target.value)
                    setFormError('')
                  }}
                  type="password"
                  value={newPassword}
                />
              </label>
              <button className="primary-button" onClick={handleChangePassword} type="button">
                Save password
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
