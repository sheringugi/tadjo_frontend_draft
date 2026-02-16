import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isCustomerAuthenticated } from '@/lib/auth';

const ProtectedCustomerRoute = () => {
  const location = useLocation();

  if (!isCustomerAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default ProtectedCustomerRoute;
