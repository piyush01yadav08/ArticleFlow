import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { articleService } from '../../services/articleService'
import { userService } from '../../services/userService'
import Loading from '../common/Loading'

const handleFor = (user) => user.username || user.email.split('@')[0].replace(/[^a-z0-9._]/gi, '').toLowerCase()
const initialsFor = (name) => name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()

export default function ProfileSettings({ title, description }) {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, email: user.email, username: handleFor(user), bio: user.bio || '', profilePhoto: user.profilePhoto || '', currentPassword: '', newPassword: '' })
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(user.role === 'author')
  const [savedArticles, setSavedArticles] = useState([])
  const [loadingSavedArticles, setLoadingSavedArticles] = useState(user.role === 'reader')
  const [reviewedArticles, setReviewedArticles] = useState([])
  const [loadingReviewedArticles, setLoadingReviewedArticles] = useState(user.role === 'admin')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsPanel, setSettingsPanel] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInput = useRef(null)
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  useEffect(() => {
    if (user.role !== 'author') return
    articleService.listArticles().then(items => setArticles(items.filter(article => article.status === 'Published'))).catch(() => setArticles([])).finally(() => setLoadingArticles(false))
  }, [user.role])

  useEffect(() => {
    if (user.role !== 'admin') return
    articleService.getReviewedArticles().then(setReviewedArticles).catch(() => setReviewedArticles([])).finally(() => setLoadingReviewedArticles(false))
  }, [user.role])

  useEffect(() => {
    if (user.role !== 'reader') return
    articleService.getSavedArticles().then(setSavedArticles).catch(() => setSavedArticles([])).finally(() => setLoadingSavedArticles(false))
  }, [user.role])

  useEffect(() => {
    userService.getPublicProfile(user.id).then((data) => {
      const { followersCount, followingCount } = data.user
      if (followersCount !== user.followersCount || followingCount !== user.followingCount) {
        updateUser({ ...user, followersCount, followingCount })
      }
    }).catch(() => {})
  }, [user.id])

  function choosePhoto(event) {
    const photo = event.target.files?.[0]
    if (!photo) return
    if (!photo.type.startsWith('image/') || photo.size > 2 * 1024 * 1024) { setError('Choose an image smaller than 2 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setForm(current => ({ ...current, profilePhoto: reader.result }))
    reader.readAsDataURL(photo)
  }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setMessage('')
    try {
      const payload = { name: form.name, email: form.email, username: form.username, bio: form.bio, profilePhoto: form.profilePhoto }
      if (form.newPassword) Object.assign(payload, { currentPassword: form.currentPassword, newPassword: form.newPassword })
      const data = await authService.updateProfile(payload)
      updateUser(data.user)
      setForm(current => ({ ...current, currentPassword: '', newPassword: '' }))
      setMessage('Profile updated.')
      setSettingsOpen(false)
      setSettingsPanel(null)
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  const isAuthor = user.role === 'author'
  const isAdmin = user.role === 'admin'
  const totalViews = articles.reduce((total, article) => total + (article.views || 0), 0)
  const totalLikes = articles.reduce((total, article) => total + (article.likesCount || 0), 0)
  const totalComments = articles.reduce((total, article) => total + (article.commentsCount || 0), 0)
  const approvedArticles = reviewedArticles.filter(article => article.status === 'Published')
  const rejectedArticles = reviewedArticles.filter(article => article.status === 'Rejected')
  const photo = form.profilePhoto || user.profilePhoto
  return <section className="social-profile-page">
    <header className="social-profile-header"><div className="profile-photo-wrap">{photo ? <img src={photo} alt={`${user.name}'s profile`} className="profile-photo" /> : <div className="profile-photo profile-photo-fallback">{initialsFor(user.name)}</div>}<button className="profile-photo-edit" type="button" onClick={() => fileInput.current?.click()} aria-label="Upload profile photo">+</button><input ref={fileInput} className="profile-file-input" type="file" accept="image/*" onChange={choosePhoto} /></div><div className="social-profile-intro"><div className="social-profile-topline"><div><h1>{form.username}</h1><p className="social-profile-name">{user.name} <span>{user.role}</span></p></div><div className="profile-menu"><button type="button" className="profile-menu-button" onClick={() => setSettingsOpen(current => !current)} aria-label="Open account settings">•••</button>{settingsOpen && <div className="profile-menu-panel"><button type="button" onClick={() => { setSettingsPanel('profile'); setSettingsOpen(false) }}>Edit profile</button><button type="button" onClick={() => { setSettingsPanel('security'); setSettingsOpen(false) }}>Password & security</button></div>}</div></div><div className="social-profile-stats">{isAdmin ? <><span><strong>{approvedArticles.length}</strong> approved</span><span><strong>{rejectedArticles.length}</strong> rejected</span></> : <><span><strong>{isAuthor ? articles.length : savedArticles.length}</strong>{isAuthor ? ' articles' : ' saved'}</span><span><strong>{user.followersCount || 0}</strong> followers</span><span><strong>{user.followingCount || 0}</strong> following</span></>}</div><p className="social-profile-bio">{form.bio || description}</p></div></header>
    {message && <p className="profile-success social-profile-message">✓ {message}</p>}{error && <p className="error social-profile-message" role="alert">{error}</p>}
    {isAuthor && <section className="author-profile-content"><div className="author-insights"><div><span>Published articles</span><strong>{articles.length}</strong></div><div><span>Reader views</span><strong>{totalViews.toLocaleString()}</strong></div><div><span>Live likes</span><strong>{totalLikes.toLocaleString()}</strong></div><div><span>Live comments</span><strong>{totalComments.toLocaleString()}</strong></div></div><div className="profile-section-heading"><span className="eyebrow">Published work</span><h2>Stories by {user.name}</h2></div>{loadingArticles ? <Loading /> : articles.length === 0 ? <div className="profile-empty-work"><span>✦</span><h3>Your published stories will appear here.</h3><p>Publish your first article to build your author profile.</p><Link to="/author/create" className="button">Write an article</Link></div> : <div className="author-article-grid">{articles.map(article => <Link to={`/author/article/${article.id}`} className="author-profile-article" key={article.id}><div className="author-profile-cover">{article.coverImage ? <img src={article.coverImage} alt="" /> : <span>{article.category}</span>}<div className="author-profile-overlay"><span>♡ {article.likesCount || 0}</span><span>◌ {article.commentsCount || 0}</span><span>◉ {article.views || 0}</span></div></div><h3>{article.title}</h3><p>{article.category}</p></Link>)}</div>}</section>}
    {user.role === 'reader' && <section className="author-profile-content"><div className="profile-section-heading"><span className="eyebrow">Your reading list</span><h2>Saved articles</h2><p>Stories you saved to return to later.</p></div>{loadingSavedArticles ? <Loading /> : savedArticles.length === 0 ? <div className="profile-empty-work"><span>☆</span><h3>No saved articles yet.</h3><p>Use the save button on any article to build your reading list.</p><Link to="/reader/browse" className="button">Browse articles</Link></div> : <div className="author-article-grid">{savedArticles.map(article => <Link to={`/reader/article/${article.id}`} className="author-profile-article" key={article.id}><div className="author-profile-cover">{article.coverImage ? <img src={article.coverImage} alt="" /> : <span>{article.category}</span>}<div className="author-profile-overlay"><span>♡ {article.likesCount || 0}</span><span>◌ {article.commentsCount || 0}</span><span>◉ {article.views || 0}</span></div></div><h3>{article.title}</h3><p>By {article.author} · ★ Saved</p></Link>)}</div>}</section>}
    {isAdmin && <section className="author-profile-content"><div className="author-insights admin-insights"><div><span>Approved by you</span><strong>{approvedArticles.length}</strong></div><div><span>Rejected by you</span><strong>{rejectedArticles.length}</strong></div></div><div className="profile-section-heading"><span className="eyebrow">Your moderation history</span><h2>Approved and rejected articles</h2><p>Articles reviewed by your admin account.</p></div>{loadingReviewedArticles ? <Loading /> : reviewedArticles.length === 0 ? <div className="profile-empty-work"><span>✓</span><h3>Your review history will appear here.</h3><p>Approve or reject submitted articles to build this record.</p><Link to="/admin/dashboard" className="button">Open review queue</Link></div> : <div className="admin-review-history">{reviewedArticles.map(article => <Link to={`/admin/article/${article.id}`} className={`admin-review-history-card ${article.status === 'Published' ? 'approved' : 'rejected'}`} key={article.id}><span className="admin-review-status">{article.status === 'Published' ? 'Approved' : 'Rejected'}</span><div><h3>{article.title}</h3><p>{article.category} · By {article.author}</p><p className="admin-review-engagement">♡ {article.likesCount || 0} · ◌ {article.commentsCount || 0} · ◉ {article.views || 0}</p></div><span className="admin-review-date">{article.reviewedAt ? new Date(article.reviewedAt).toLocaleDateString() : ''}</span></Link>)}</div>}</section>}
    {settingsPanel && <div className="profile-settings-backdrop" role="presentation" onMouseDown={() => setSettingsPanel(null)}><form className="profile-settings-sheet" onSubmit={submit} onMouseDown={event => event.stopPropagation()}><div className="settings-modal-heading"><div><span className="eyebrow">Account settings</span><h2>{settingsPanel === 'profile' ? 'Edit profile' : 'Password & security'}</h2></div><button type="button" className="settings-close" onClick={() => setSettingsPanel(null)} aria-label="Close settings">×</button></div>{settingsPanel === 'profile' ? <section className="settings-card"><h3>Profile details</h3><div className="settings-grid"><label>Display name<input name="name" value={form.name} onChange={update} required minLength="2" /></label><label>Username<input name="username" value={form.username} onChange={update} required minLength="3" maxLength="30" /><span>Letters, numbers, dots, and underscores only.</span></label><label className="settings-full-width">Bio<textarea name="bio" value={form.bio} onChange={update} rows="3" maxLength="180" placeholder="Tell readers a little about yourself." /><span>{form.bio.length}/180</span></label><label className="settings-full-width">Email address<input name="email" type="email" value={form.email} onChange={update} required /></label></div></section> : <section className="settings-card"><h3>Password & security</h3><p>Use a strong password that you do not reuse elsewhere.</p><div className="settings-grid"><label>Current password<input name="currentPassword" type="password" value={form.currentPassword} onChange={update} autoComplete="current-password" required /></label><label>New password<input name="newPassword" type="password" value={form.newPassword} onChange={update} minLength="8" autoComplete="new-password" placeholder="At least 8 characters" required /></label></div></section>}<button className="profile-save-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></form></div>}
  </section>
}
