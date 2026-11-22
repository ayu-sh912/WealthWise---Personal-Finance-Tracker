import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner size="lg" text="Loading WealthWise..." />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
