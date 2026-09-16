const API_URL = import.meta.env.VITE_API_URL || '/api'

export async function api(path, options = {}) {
  const token = localStorage.getItem('articleflow_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const content = response.status === 204 ? null : await response.json()
  if (!response.ok) throw new Error(content?.message || 'Request failed.')
  return content
}
