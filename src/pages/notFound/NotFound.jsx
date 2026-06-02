// NotFound.jsx
// Página 404 do GeekVerse G8.
// Exibe imagem de fundo do multiverso e botões para voltar.

import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import bgImage from '../../assets/backgrounds/errors/404_multiverse_error.png';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
          {isAuthenticated && (
            <button className="notfound-btn notfound-btn-secondary" onClick={handleLogin}>
              <FaSignInAlt /> Ir para o Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
