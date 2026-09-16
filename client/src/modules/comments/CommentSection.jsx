import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { commentService } from '../../services/commentService'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem.jsx'
import './comments.css'

export default function CommentSection({ articleId, onCommentAdded: onArticleCommentAdded }) {
  const { user } = useAuth()

  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!articleId) return

    async function loadComments() {
      try {
        setLoading(true)
        setError('')

        const data = await commentService.getComments(articleId)

        setComments(data)
      } catch (err) {
        console.error('Load comments error:', err)
        setError(err.message || 'Failed to load comments.')
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [articleId])

  function handleCommentAdded(newComment) {
    setComments((currentComments) => [
      ...currentComments,
      newComment,
    ])
    onArticleCommentAdded?.(newComment)
  }

  function getReplies(commentId) {
    return comments.filter(
      (comment) =>
        comment.parentCommentId === commentId
    )
  }

  const parentComments = comments.filter(
    (comment) => !comment.parentCommentId
  )

  return (
    <section className="comment-section">

      <div className="comment-section-header">
        <h2>Comments</h2>

        <span>
          {comments.length}
        </span>
      </div>

      {/* New Comment */}
      {user ? (
        <CommentForm
          articleId={articleId}
          onCommentAdded={handleCommentAdded}
        />
      ) : (
        <div className="comment-login-message">
          Please log in to join the discussion.
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p>Loading comments...</p>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="comment-error">
          {error}
        </p>
      )}

      {/* Empty State */}
      {!loading && !error && parentComments.length === 0 && (
        <p className="no-comments">
          No comments yet. Be the first to start the discussion!
        </p>
      )}

      {/* Comments */}
      {!loading && !error && parentComments.length > 0 && (
        <div className="comments-list">

          {parentComments.map((comment) => (
            <div
              key={comment._id}
              className="comment-thread"
            >

              <CommentItem
                comment={comment}
                onCommentAdded={handleCommentAdded}
              />

              {/* Replies */}
              {getReplies(comment._id).length > 0 && (
                <div className="comment-replies">

                  {getReplies(comment._id).map((reply) => (
                    <CommentItem
                      key={reply._id}
                      comment={reply}
                      onCommentAdded={handleCommentAdded}
                    />
                  ))}

                </div>
              )}

            </div>
          ))}

        </div>
      )}

    </section>
  )
}
