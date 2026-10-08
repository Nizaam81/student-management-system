import { Navigate, Outlet } from 'react-router-dom';
import { getAccessTokenRole } from '../../config/jwt';

export const ProtectedRoute = ({ requiredRole = 'student' }) => {
  const isAuthorized = getAccessTokenRole() === requiredRole;
  const redirectPath = requiredRole === 'admin' ? '/admin-login' : '/';

  return isAuthorized ? (
    <Outlet />
  ) : (
    <Navigate to={redirectPath} replace />
  );
};
