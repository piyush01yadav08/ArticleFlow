import { NavLink, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SignOutButton from './SignOutButton'
import { getNotifications } from '../../services/notificationService'
import { chatService } from '../../services/chatService'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ items, role }) {
  const { user } = useAuth()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('articleflow_theme') === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('articleflow_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    let active = true
    async function refreshNotifications() {
      try {
        const notifications = await getNotifications()
        if (active) setUnreadCount(notifications.filter(notification => String(notification.recipient) === String(user?.id || user?._id) && !notification.isRead).length)
      } catch {
        if (active) setUnreadCount(0)
      }
    }
    refreshNotifications()
    const interval = window.setInterval(refreshNotifications, 30000)
    window.addEventListener('articleflow:notifications-changed', refreshNotifications)
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('articleflow:notifications-changed', refreshNotifications) }
  }, [location.pathname, user?.id, user?._id])

  useEffect(() => {
    let active = true
    async function refreshMessages() {
      try { const contacts = await chatService.getUsers(); if (active) setUnreadMessages(contacts.reduce((total, contact) => total + (contact.unreadCount || 0), 0)) } catch { if (active) setUnreadMessages(0) }
    }
    refreshMessages()
    const interval = window.setInterval(refreshMessages, 30000)
    window.addEventListener('articleflow:messages-changed', refreshMessages)
    return () => { active = false; window.clearInterval(interval); window.removeEventListener('articleflow:messages-changed', refreshMessages) }
  }, [location.pathname, user?.id, user?._id])

  return (
    <header className="navbar">
      <NavLink className="brand" to={`/${role}/home`}>
        <span className="brand-mark">A</span>
        ArticleFlow
      </NavLink>
      <nav className="nav-links" aria-label={`${role} navigation`}>
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            {item.label}{item.label === 'Notifications' && unreadCount > 0 && <span className="notification-nav-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}{item.label === 'Chat' && unreadMessages > 0 && <span className="notification-nav-count chat-nav-count" aria-label={`${unreadMessages} unread messages`}>{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="user-actions">
        <button className="theme-toggle" type="button" onClick={() => setDarkMode(current => !current)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>{darkMode ? '☀' : '☾'}</button>
        <span className="role-pill">{role}</span>
        <SignOutButton />
      </div>
    </header>
  )
}
