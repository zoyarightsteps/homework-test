import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homePathForRoles } from '../utils/roles';

export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, roles } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !roles.includes(role)) return <Navigate to={homePathForRoles(roles)} replace />;
  return children;
}
