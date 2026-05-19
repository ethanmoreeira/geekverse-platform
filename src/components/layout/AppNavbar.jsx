// AppNavbar.jsx
// Barra de navegação principal do GeekVerse G8.
// Links para Dashboard, jogos, ranking, exportar e sobre.
// Botão Sair com limpeza de autenticação.

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaGamepad,
  FaTrophy,
  FaFileExport,
  FaInfoCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import { GiJoystick } from 'react-icons/gi';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="gv-navbar">
      <div className="gv-navbar-inner">
        <Link to="/app" className="gv-navbar-brand">
          <GiJoystick className="gv-navbar-brand-icon" />
          <span>GeekVerse G8</span>
        </Link>

        <div className="gv-navbar-links">
          <Link
            to="/app"
            className={`gv-nav-link ${isActive('/app') ? 'active' : ''}`}
          >
            <FaGamepad />
            <span>Jogos</span>
          </Link>
          <Link
            to="/app/ranking"
            className={`gv-nav-link ${isActive('/app/ranking') ? 'active' : ''}`}
          >
            <FaTrophy />
            <span>Ranking</span>
          </Link>
          <Link
            to="/app/exportar"
            className={`gv-nav-link ${isActive('/app/exportar') ? 'active' : ''}`}
          >
            <FaFileExport />
            <span>Exportar</span>
          </Link>
          <Link
            to="/app/sobre"
            className={`gv-nav-link ${isActive('/app/sobre') ? 'active' : ''}`}
          >
            <FaInfoCircle />
            <span>Sobre</span>
          </Link>
        </div>

        <div className="gv-navbar-user">
          {user && (
            <span className="gv-navbar-username">
              Olá, {user.username}
            </span>
          )}
          <button
            className="gv-btn-logout"
            onClick={handleLogout}
            title="Sair do sistema"
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AppNavbar;
