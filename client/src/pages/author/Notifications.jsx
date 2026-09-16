import { useEffect, useState } from 'react'
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/notificationService'
import { useAuth } from '../../context/AuthContext'

function notificationLabel(type) {
  if (type === 'APPROVED') return 'Article approved'
  if (type === 'REJECTED') return 'Article rejected'
  if (type === 'CHANGES_REQUESTED') return 'Changes requested'
  if (type === 'SUBMITTED') return 'Submission received'
  if (type === 'PUBLISHED') return 'New article published'
  if (type === 'LIKED') return 'New like'
  if (type === 'FOLLOWED') return 'New follower'
  return 'Notification'
}

function notificationClass(type) {
  if (type === 'APPROVED') return 'notification-approved'
  if (type === 'REJECTED') return 'notification-rejected'
  if (type === 'CHANGES_REQUESTED') return 'notification-changes'
  if (type === 'SUBMITTED') return 'notification-submitted'
  if (type === 'PUBLISHED') return 'notification-published'
  if (type === 'LIKED') return 'notification-liked'
  if (type === 'FOLLOWED') return 'notification-followed'
  return ''
}

function notificationIcon(type) {
  if (type === 'APPROVED' || type === 'PUBLISHED') return '✓'
  if (type === 'REJECTED') return '×'
  if (type === 'SUBMITTED') return '↗'
  if (type === 'LIKED') return '♥'
  if (type === 'FOLLOWED') return '＋'
  return '✎'
}

export default function Notifications({ role = 'author' }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadNotifications() {
    try {
      setLoading(true)
      setError('')

      const data = await getNotifications()
      setNotifications(data.filter(notification => String(notification.recipient) === String(user?.id || user?._id)))
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load notifications.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.id, user?._id])

  async function handleRead(id) {
    try {
      await markNotificationAsRead(id)

      setNotifications(current =>
        current.map(notification =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      )
      window.dispatchEvent(new Event('articleflow:notifications-changed'))
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to mark notification as read.'
      )
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead()

      setNotifications(current =>
        current.map(notification => ({
          ...notification,
          isRead: true,
        }))
      )
      window.dispatchEvent(new Event('articleflow:notifications-changed'))
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to mark notifications as read.'
      )
    }
  }

  const unreadCount = notifications.filter(
    notification => !notification.isRead
  ).length

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <span className="eyebrow">{role} workspace</span>
          <h1 className="notifications-title">Notifications.</h1>
          <p className="notifications-description">
            {role === 'author' ? 'Stay updated on the review status of your articles.' : role === 'admin' ? 'See newly submitted content as it arrives for review.' : 'Keep up with new stories published to ArticleFlow.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            className="notification-read-all"
            type="button"
            onClick={handleMarkAllRead}
          >
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="admin-review-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')}>
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="notification-empty-state">
          <span>✦</span>
          <h2>You’re all caught up.</h2>
          <p>{role === 'admin' ? 'New submissions will appear here.' : role === 'reader' ? 'New published stories will appear here.' : 'Article review updates will appear here.'}</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(notification => (
            <article
              key={notification._id}
              className={`notification-card ${
                notification.isRead ? 'read' : 'unread'
              }`}
            >
              <div className="notification-icon">{notificationIcon(notification.type)}</div>

              <div className="notification-content">
                <div className="notification-top">
                  <span
                    className={`notification-type ${notificationClass(
                      notification.type
                    )}`}
                  >
                    {notificationLabel(notification.type)}
                  </span>

                  {!notification.isRead && (
                    <span className="notification-unread">
                      Unread
                    </span>
                  )}
                </div>

                <p className="notification-message">
                  {notification.message}
                </p>

                {notification.createdAt && (
                  <p className="notification-date">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                )}

                {!notification.isRead && (
                  <button
                    className="notification-read-button"
                    type="button"
                    onClick={() => handleRead(notification._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
