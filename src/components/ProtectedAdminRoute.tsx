import { Navigate, Outlet } from 'react-router-dom';
import { isAdminAuthenticated } from '@/lib/auth';

const ProtectedAdminRoute = () => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedAdminRoute;
