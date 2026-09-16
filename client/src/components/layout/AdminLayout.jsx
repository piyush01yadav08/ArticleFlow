import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'

const items = [
  { label: 'Home', to: '/admin/home' },
  { label: 'Browse', to: '/admin/browse' },
  { label: 'Admin', to: '/admin/dashboard' },
  { label: 'Notifications', to: '/admin/notifications' },
  { label: 'Profile', to: '/admin/profile' },
{ label: 'Chat', to: '/chat' },
]

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <Navbar role="admin" items={items} />
      <div className="workspace">
        <Sidebar title="Admin console" description="Review and manage the publishing workspace." />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
