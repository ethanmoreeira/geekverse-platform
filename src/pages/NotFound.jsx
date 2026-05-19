// NotFound.jsx
// Página 404 para rotas inválidas.
// Exibe mensagem amigável e link para voltar.

import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate(isAuthenticated ? '/app' : '/login', { replace: true });
  };

  return (
    <div className="gv-not-found">
      <div className="gv-not-found-content">
        <FaExclamationTriangle className="gv-not-found-icon" />
        <h1 className="gv-not-found-code">404</h1>
        <h2 className="gv-not-found-title">Página não encontrada</h2>
        <p className="gv-not-found-desc">
          A rota que você tentou acessar não existe no GeekVerse G8.
        </p>
        <button className="gv-btn-back" onClick={handleGoBack}>
          <FaHome /> Voltar ao início
        </button>
      </div>
    </div>
  );
};

export default NotFound;
