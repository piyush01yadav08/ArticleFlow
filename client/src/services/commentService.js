import { api } from './api'

export const commentService = {
  // Get all comments for an article
  async getComments(articleId) {
    return api(`/comments/article/${articleId}`)
  },

  // Add a new comment
  async createComment(articleId, content) {
    return api('/comments', {
      method: 'POST',
      body: JSON.stringify({
        articleId,
        content,
      }),
    })
  },

  // Reply to a comment
  async replyToComment(commentId, content) {
    return api(`/comments/${commentId}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        content,
      }),
    })
  },

  // Like / unlike a comment
  async toggleLike(commentId) {
    return api(`/comments/${commentId}/like`, {
      method: 'POST',
    })
  },
}