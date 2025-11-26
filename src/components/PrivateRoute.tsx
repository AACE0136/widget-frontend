import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}
