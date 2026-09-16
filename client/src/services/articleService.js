import { api } from './api'

export const articleService = {
  async listArticles(filters = {}) {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    return api(`/articles${params.size ? `?${params}` : ''}`)
  },
  getArticleById: (id) => api(`/articles/${id}`),
  createArticle: (article) => api('/articles', { method: 'POST', body: JSON.stringify(article) }),
  updateArticle: (id, article) => api(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(article) }),
  deleteArticle: (id) => api(`/articles/${id}`, { method: 'DELETE' }),
  getSavedArticles: () => api('/articles/saved'),
  getReviewedArticles: () => api('/articles/reviewed'),
  toggleSavedArticle: (id) => api(`/articles/${id}/save`, { method: 'PATCH', body: '{}' }),
  toggleLike: (id) => api(`/articles/${id}/like`, { method: 'PATCH', body: '{}' }),
}
