import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-[#147a4a] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Strictly enforce role checks
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their respective home dashboard if they try to access wrong role dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />
    if (user.role === 'teacher') return <Navigate to="/teacher" replace />
    if (user.role === 'clerk') return <Navigate to="/clerk" replace />
    if (user.role === 'student') return <Navigate to="/dashboard" replace />
    
    // Fallback if role is unknown
    return <Navigate to="/" replace />
  }

  return children
}
