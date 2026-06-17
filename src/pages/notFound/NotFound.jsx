
// Tela de "Página Não Encontrada" (Famoso Erro 404).
// Aparece quando o usuário digita um link que não existe no nosso site.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { logPageViewOnce } from '../../services/auditService';
import bgImage from '../../assets/backgrounds/errors/404_multiverse_error.png';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Anota no banco de dados que alguém tentou acessar uma página que não existe
  useEffect(() => {
    logPageViewOnce({
      description: 'Acessou uma rota inválida (404)',
      path: window.location.pathname,
      metadata: { page: 'NotFound' }
    });
  }, []);

  const handleDashboard = () => {
    navigate('/app', { replace: true });
  };

  const handleLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="notfound-page">
      <img src={bgImage} alt="" className="notfound-bg" />
      <div className="notfound-overlay" />

      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Portal não encontrado</h2>
        <p className="notfound-desc">
          A rota que você tentou acessar se perdeu no multiverso.
        </p>

        <div className="notfound-actions">
          {isAuthenticated ? (
            <button className="notfound-btn notfound-btn-primary" onClick={handleDashboard}>
              <FaHome /> Voltar ao Dashboard
            </button>
          ) : (
            <button className="notfound-btn notfound-btn-primary" onClick={handleLogin}>
              <FaSignInAlt /> Ir para o Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
