import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // If the user is not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute
