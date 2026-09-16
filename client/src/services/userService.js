import { api } from './api.js'

export const userService = {
  getPublicProfile: (userId) => api(`/users/${userId}/profile`),

  getFollowStatus: (userId) =>
    api(`/users/${userId}/follow`),

  toggleFollow: (userId) =>
    api(`/users/${userId}/follow`, {
      method: 'PATCH',
      body: '{}',
    }),
}