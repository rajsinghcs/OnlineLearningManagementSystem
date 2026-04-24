import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const RoleRoute = ({ role, children }) => {
  const { getRole } = useAuthStore();
  if (getRole() !== role) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default RoleRoute;
