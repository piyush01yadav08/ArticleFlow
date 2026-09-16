const API_URL = `${import.meta.env.VITE_API_URL || '/api'}/chat`

function getToken() {
  return localStorage.getItem('articleflow_token')
}

async function request(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {})
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export const chatService = {
  getUsers: () => request('/users'),

  getMessageRequests: () => request('/requests'),

  createMessageRequest: (userId) => request(`/requests/${userId}`, { method: 'POST' }),

  respondToMessageRequest: (requestId, accept) => request(`/requests/${requestId}`, {
    method: 'PATCH',
    body: JSON.stringify({ accept }),
  }),

  getConversation: (userId) => request(`/${userId}`),

  sendMessage: (userId, text) =>
    request(`/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    })
}
