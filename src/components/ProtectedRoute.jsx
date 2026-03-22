import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../constants/routes'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Wait until auth state is confirmed to avoid flickering unauthenticated redirects
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If no user exists after loading finishes, redirect to login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // All good, render protected content
  return children
}
