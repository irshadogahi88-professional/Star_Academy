import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer Token if available in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sea_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized responses (Token expiry)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth tokens
      localStorage.removeItem('sea_token')
      localStorage.removeItem('sea_user')
      
      // Redirect to login if not already there and not just checking auth status
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login?expired=true'
      }
    }
    return Promise.reject(error)
  }
)

export default api
