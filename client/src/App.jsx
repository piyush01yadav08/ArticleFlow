import { Navigate, Route, Routes } from 'react-router-dom'
import AuthorLayout from './components/layout/AuthorLayout'
import AdminLayout from './components/layout/AdminLayout'
import ReaderLayout from './components/layout/ReaderLayout'
import Login from './pages/auth/Login'
import ResetPassword from './pages/auth/ResetPassword'
import AuthorHome from './pages/author/AuthorHome'
import AuthorBrowse from './pages/author/AuthorBrowse'
import CreateArticle from './pages/author/CreateArticle'
import AuthorProfile from './pages/author/AuthorProfile'
import AdminHome from './pages/admin/AdminHome'
import AdminBrowse from './pages/admin/AdminBrowse'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProfile from './pages/admin/AdminProfile'
import ReaderHome from './pages/reader/ReaderHome'
import ReaderBrowse from './pages/reader/ReaderBrowse'
import ReaderProfile from './pages/reader/ReaderProfile'
import ArticleDetail from './pages/ArticleDetail'
import NotFound from './pages/NotFound'
import Chat from './pages/Chat'
import Notifications from './pages/author/Notifications'
import ProtectedRoute from './components/common/ProtectedRoute'
import PublicProfile from './pages/PublicProfile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public profile - can be viewed without login */}
      <Route path="/profile/:userId" element={<PublicProfile />} />

      <Route element={<ProtectedRoute role="author" />}>
        <Route path="/author" element={<AuthorLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<AuthorHome />} />
          <Route path="browse" element={<AuthorBrowse />} />
          <Route path="article/:id" element={<ArticleDetail />} />
          <Route path="create" element={<CreateArticle />} />
          <Route path="edit/:id" element={<CreateArticle />} />
          <Route path="profile" element={<AuthorProfile />} />
          <Route path="notifications" element={<Notifications role="author" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<AdminHome />} />
          <Route path="browse" element={<AdminBrowse />} />
          <Route path="article/:id" element={<ArticleDetail />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="notifications" element={<Notifications role="admin" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="reader" />}>
        <Route path="/reader" element={<ReaderLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<ReaderHome />} />
          <Route path="browse" element={<ReaderBrowse />} />
          <Route path="article/:id" element={<ArticleDetail />} />
          <Route path="profile" element={<ReaderProfile />} />
          <Route path="notifications" element={<Notifications role="reader" />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<Chat />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
