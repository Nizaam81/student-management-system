import { Navigate, Outlet } from 'react-router-dom';
import { getAccessTokenRole } from '../../config/jwt';

export const PublicOnlyRoute = () => {
  const role = getAccessTokenRole();

  if (role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (role === 'student') {
    return <Navigate to="/student-home" replace />;
  }

  return <Outlet />;
};
