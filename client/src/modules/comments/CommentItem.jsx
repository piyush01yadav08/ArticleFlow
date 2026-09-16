import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import CommentForm from './CommentForm'
import { commentService } from '../../services/commentService'

export default function CommentItem({
  comment,
  onCommentAdded,
}) {
  const { user } = useAuth()

  const [showReplyForm, setShowReplyForm] = useState(false)
  const [liked, setLiked] = useState(
    user ? comment.likes?.some((id) => String(id) === String(user.id || user._id)) : false
  )
  const [likesCount, setLikesCount] = useState(
    comment.likes?.length || 0
  )
  const [likeLoading, setLikeLoading] = useState(false)

  async function handleLike() {
    if (!user || likeLoading) return

    try {
      setLikeLoading(true)

      const result = await commentService.toggleLike(comment._id)

      setLiked(result.liked)
      setLikesCount(result.likesCount)
    } catch (error) {
      console.error('Like error:', error)
    } finally {
      setLikeLoading(false)
    }
  }

  function handleReplyAdded(reply) {
    setShowReplyForm(false)

    if (onCommentAdded) {
      onCommentAdded(reply)
    }
  }

  const author = comment.userId

  return (
    <div className="comment-item">

      {/* Comment Header */}
      <div className="comment-header">

        <div className="comment-avatar">
          {author?.profilePhoto ? (
            <img
              src={author.profilePhoto}
              alt={author.name || 'User'}
            />
          ) : (
            <span>
              {(author?.name || 'U')
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>

        <div>
          {author?._id ? <Link className="comment-author-link" to={`/profile/${author._id}`}><strong>{author?.name || 'Unknown User'}</strong>{author?.username && <span className="comment-username">@{author.username}</span>}</Link> : <><strong>{author?.name || 'Unknown User'}</strong>{author?.username && <span className="comment-username">@{author.username}</span>}</>}
        </div>

      </div>

      {/* Comment Content */}
      <p className="comment-content">
        {comment.content}
      </p>

      {/* Comment Actions */}
      <div className="comment-actions">

        <button
          type="button"
          onClick={handleLike}
          disabled={!user || likeLoading}
          className={liked ? 'liked' : ''}
        >
          {liked ? '♥' : '♡'} {likesCount}
        </button>

        {user && (
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}

        <span className="comment-date">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>

      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="comment-reply-form">
          <CommentForm
            parentCommentId={comment._id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

    </div>
  )
}
