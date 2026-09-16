import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Loading from '../components/common/Loading'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'

const navItems = {
  reader: [{ label: 'Home', to: '/reader/home' }, { label: 'Browse', to: '/reader/browse' }, { label: 'Notifications', to: '/reader/notifications' }, { label: 'Profile', to: '/reader/profile' }, { label: 'Chat', to: '/chat' }],
  author: [{ label: 'Home', to: '/author/home' }, { label: 'Browse', to: '/author/browse' }, { label: 'Create', to: '/author/create' }, { label: 'Notifications', to: '/author/notifications' }, { label: 'Profile', to: '/author/profile' }, { label: 'Chat', to: '/chat' }],
  admin: [{ label: 'Home', to: '/admin/home' }, { label: 'Browse', to: '/admin/browse' }, { label: 'Admin', to: '/admin/dashboard' }, { label: 'Notifications', to: '/admin/notifications' }, { label: 'Profile', to: '/admin/profile' }, { label: 'Chat', to: '/chat' }],
}

function initials(user) { return user?.name?.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || '?' }
function Avatar({ user, small = false }) { return user?.profilePhoto ? <img className={`chat-avatar ${small ? 'small' : ''}`} src={user.profilePhoto} alt="" /> : <span className={`chat-avatar ${small ? 'small' : ''}`}>{initials(user)}</span> }
function roleLabel(role) { return role === 'admin' ? 'Admin' : role === 'author' ? 'Author' : 'Reader' }

export default function Chat() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEnd = useRef(null)

  useEffect(() => { loadUsers(); const interval = window.setInterval(loadUsers, 30000); return () => window.clearInterval(interval) }, [])
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, selectedUser])

  async function loadUsers() {
    try { setLoading(true); const data = await chatService.getUsers(); setUsers(data) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }
  async function selectUser(user) {
    try { setSelectedUser(user); setMessages([]); setConversationLoading(true); setError(''); const data = await chatService.getConversation(user._id); setMessages(data.messages); setUsers(current => current.map(contact => contact._id === user._id ? { ...contact, unreadCount: 0 } : contact)); window.dispatchEvent(new Event('articleflow:messages-changed')) } catch (err) { setError(err.message) } finally { setConversationLoading(false) }
  }
  async function handleSend(event) {
    event.preventDefault()
    if (!text.trim() || !selectedUser || sending) return
    try { setSending(true); const message = await chatService.sendMessage(selectedUser._id, text); setMessages(current => [...current, message]); setText('') } catch (err) { setError(err.message) } finally { setSending(false) }
  }

  return <div className="app-shell"><Navbar role={currentUser.role} items={navItems[currentUser.role]} /><main className="chat-shell"><section className="chat-page"><header className="chat-header"><div><span className="eyebrow">PRIVATE MESSAGES</span><h1>Conversations.</h1><p>Connect privately with the ArticleFlow community.</p></div><span className="chat-status"><i /> Private & secure</span></header>{error && <div className="chat-error"><span>{error}</span><button type="button" onClick={() => setError('')}>Dismiss</button></div>}<div className="chat-container"><aside className="chat-users"><div className="chat-users-heading"><div><span className="eyebrow">People</span><h2>Messages</h2></div><span>{users.length}</span></div>{loading ? <Loading /> : users.length === 0 ? <div className="chat-list-empty">No conversations yet. Profiles will appear here after you exchange a message.</div> : <div className="chat-user-list">{users.map(user => <button key={user._id} className={selectedUser?._id === user._id ? 'chat-user active' : 'chat-user'} onClick={() => selectUser(user)}><Avatar user={user} small /><span className="chat-user-copy"><strong>{user.name}</strong><small>@{user.username || user.email.split('@')[0]} · {roleLabel(user.role)}</small></span>{user.unreadCount > 0 ? <span className="chat-unread-count">{user.unreadCount > 99 ? '99+' : user.unreadCount}</span> : <span className="chat-chevron">›</span>}</button>)}</div>}</aside><section className="chat-window">{!selectedUser ? <div className="chat-empty"><div className="chat-empty-icon">✦</div><h2>Your conversations start here.</h2><p>Messages from people you have interacted with will appear in this list.</p></div> : <><header className="chat-user-header"><Avatar user={selectedUser} /><Link className="chat-profile-link" to={`/profile/${selectedUser._id}`} title={`View ${selectedUser.name}'s public profile`}><strong>{selectedUser.name}</strong><span>@{selectedUser.username || selectedUser.email.split('@')[0]} · {roleLabel(selectedUser.role)} · View profile ↗</span></Link><span className="chat-online">Available</span></header><div className="messages">{conversationLoading ? <Loading /> : messages.length === 0 ? <div className="chat-empty compact"><div className="chat-empty-icon">✉</div><h2>Say hello.</h2><p>This is the beginning of your conversation with {selectedUser.name}.</p></div> : messages.map(message => { const isMine = message.sender._id === currentUser.id || message.sender._id === currentUser._id; return <div key={message._id} className={isMine ? 'message mine' : 'message'}><span>{message.text}</span><small>{new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></div> })}<div ref={messagesEnd} /></div><form className="message-form" onSubmit={handleSend}><input value={text} onChange={event => setText(event.target.value)} placeholder={`Message ${selectedUser.name}…`} maxLength={2000} /><button type="submit" disabled={!text.trim() || sending}>{sending ? 'Sending…' : 'Send'} <span>→</span></button></form></>}</section></div></section></main></div>
}
