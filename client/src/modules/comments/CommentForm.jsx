import { useState } from 'react'
import { commentService } from '../../services/commentService'

export default function CommentForm({
  articleId,
  parentCommentId = null,
  onCommentAdded,
  onCancel,
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (!content.trim()) {
      setError('Please write something before submitting.')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      const comment = parentCommentId
        ? await commentService.replyToComment(
            parentCommentId,
            content.trim()
          )
        : await commentService.createComment(
            articleId,
            content.trim()
          )

      setContent('')

      if (onCommentAdded) {
        onCommentAdded(comment)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={
          parentCommentId
            ? 'Write a reply...'
            : 'Share your thoughts...'
        }
        maxLength={1000}
        rows={parentCommentId ? 3 : 4}
        disabled={submitting}
      />

      <div className="comment-form-footer">
        <span>{content.length}/1000</span>

        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || !content.trim()}
          >
            {submitting
              ? 'Posting...'
              : parentCommentId
              ? 'Reply'
              : 'Post Comment'}
          </button>
        </div>
      </div>

      {error && (
        <p className="comment-error">
          {error}
        </p>
      )}
    </form>
  )
}