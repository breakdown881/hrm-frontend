import { useEffect, useMemo, useState } from 'react'
import './NotificationsPage.css'
import { fetchNotifications, markNotificationAsRead } from '../services/hrmApi'

type NotificationStatus = 'Unread' | 'Read'
type NotificationTone = 'warning' | 'info' | 'success'

type HrmNotification = {
  backendId?: number
  id: string
  title: string
  message: string
  module: string
  status: NotificationStatus
  tone: NotificationTone
}

const initialNotifications: HrmNotification[] = [
  {
    id: 'NOT-001',
    title: 'Contract expiring soon',
    message: 'Tran Quoc Huy contract ends on 2026-06-30. HR should prepare renewal steps.',
    module: 'Contracts',
    status: 'Unread',
    tone: 'warning',
  },
  {
    id: 'NOT-002',
    title: 'Onboarding task assigned',
    message: 'Complete account setup for the new Engineering hire before day one.',
    module: 'Onboarding',
    status: 'Unread',
    tone: 'info',
  },
  {
    id: 'NOT-003',
    title: 'Leave request approved',
    message: 'Pham Gia Bao unpaid leave request has been approved by HR.',
    module: 'Leave',
    status: 'Read',
    tone: 'success',
  },
]

export function NotificationsPage({ apiToken }: { apiToken?: string | null }) {
  const [notifications, setNotifications] = useState<HrmNotification[]>(initialNotifications)
  const [feedback, setFeedback] = useState('')

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'Unread').length,
    [notifications],
  )

  useEffect(() => {
    if (!apiToken) {
      return
    }

    let isMounted = true

    fetchNotifications(apiToken)
      .then((apiNotifications) => {
        if (isMounted) {
          setNotifications(apiNotifications)
        }
      })
      .catch(() => {
        // Keep mock data available when the API is offline during local UI work.
      })

    return () => {
      isMounted = false
    }
  }, [apiToken])

  const markAsRead = async (notificationId: string) => {
    const targetNotification = notifications.find((notification) => notification.id === notificationId)
    let updatedNotification: HrmNotification | null = null

    if (apiToken && targetNotification?.backendId) {
      try {
        updatedNotification = await markNotificationAsRead(apiToken, targetNotification.backendId)
      } catch {
        updatedNotification = null
      }
    }

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId ? updatedNotification ?? { ...notification, status: 'Read' } : notification,
      ),
    )
    setFeedback('Notification marked as read')
  }

  return (
    <>
      <section className="page-heading notifications-heading">
        <p className="eyebrow">Core HR workflow</p>
        <h2>Notifications</h2>
        <p>Review in-system alerts for leave approvals, onboarding tasks and expiring contracts.</p>
      </section>

      <section className="notifications-summary" aria-label="Notifications summary">
        <article className="notifications-stat-card">
          <span>Unread notifications</span>
          <strong>{unreadCount}</strong>
          <p>Need user attention</p>
        </article>
        <article className="notifications-stat-card">
          <span>Total alerts</span>
          <strong>{notifications.length}</strong>
          <p>Mock notification feed</p>
        </article>
        <article className="notifications-stat-card">
          <span>Covered modules</span>
          <strong>3</strong>
          <p>Contracts, onboarding and leave</p>
        </article>
      </section>

      <section className="content-grid page-only-grid">
        <div className="card wide-card notifications-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Notification center</p>
              <h2>System Alerts</h2>
            </div>
          </div>

          {feedback && (
            <div className="success-banner" role="status">
              {feedback}
            </div>
          )}

          <div className="notifications-list">
            {notifications.map((notification) => (
              <article className={`notification-item ${notification.status.toLowerCase()}`} key={notification.id}>
                <div className={`notification-icon ${notification.tone}`} aria-hidden="true">
                  {notification.module.slice(0, 2).toUpperCase()}
                </div>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <strong>{notification.title}</strong>
                    <span className={`notification-status ${notification.status.toLowerCase()}`}>{notification.status}</span>
                  </div>
                  <p>{notification.message}</p>
                  <span>{notification.module}</span>
                </div>
                {notification.status === 'Unread' ? (
                  <button className="ghost-button" onClick={() => markAsRead(notification.id)} type="button">
                    Mark {notification.title} as read
                  </button>
                ) : (
                  <span className="notification-muted">No action</span>
                )}
              </article>
            ))}
          </div>
        </div>

        <div className="card notifications-card">
          <div className="card-header compact">
            <div>
              <p className="eyebrow">Rules</p>
              <h2>Notification Triggers</h2>
            </div>
          </div>
          <ul className="notification-trigger-list">
            <li>Leave request approved or rejected</li>
            <li>Onboarding task assigned</li>
            <li>Contract expiring soon</li>
          </ul>
        </div>
      </section>
    </>
  )
}
