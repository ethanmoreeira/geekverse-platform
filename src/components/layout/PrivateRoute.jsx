// PrivateRoute.jsx
// Componente de rota privada com controle de acesso.
// Redireciona para /login se o usuário não estiver autenticado.
// Exibe loader durante verificação inicial de autenticação.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ClipLoader } from 'react-spinners';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0f0f1a',
      }}>
        <ClipLoader color="#a855f7" size={50} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
