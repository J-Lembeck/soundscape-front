import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../services/api';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        await api.get('/auth/validate-token', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true); 
      } catch (err) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    };

    validateToken();
  }, [token]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
