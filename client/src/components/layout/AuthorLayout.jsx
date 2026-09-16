import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Sidebar from '../common/Sidebar'

const items = [
  { label: 'Home', to: '/author/home' },
  { label: 'Browse', to: '/author/browse' },
  { label: 'Create', to: '/author/create' },
  { label: 'Notifications', to: '/author/notifications' },
  { label: 'Profile', to: '/author/profile' },
{ label: 'Chat', to: '/chat' },
]

export default function AuthorLayout() {
  return <RoleLayout role="author" items={items} title="Author studio" description="Create and shape your next story." />
}

function RoleLayout({ role, items, title, description }) {
  return (
    <div className="app-shell">
      <Navbar role={role} items={items} />
      <div className="workspace">
        <Sidebar title={title} description={description} />
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
