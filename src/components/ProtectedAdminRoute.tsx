import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedAdminRoute - Current state:', {
      isLoading,
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null
    });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
        navigate('/admin/login');
      } else if (user?.role !== 'admin') {
        console.log('User is not admin, redirecting to home. User role:', user?.role);
        navigate('/');
      } else {
        console.log('User is authenticated and is admin, allowing access');
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  // Add a check to prevent redirect loop
  useEffect(() => {
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    if (currentPath === '/admin/login' && isAuthenticated && user?.role === 'admin') {
      console.log('User is already logged in, redirecting to admin dashboard');
      navigate('/admin');
    }
  }, [isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
} 