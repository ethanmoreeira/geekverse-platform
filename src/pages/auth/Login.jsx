// Login.jsx
// Página de login do GeekVerse G8.
// Credenciais acadêmicas: Usuário G8 / Senha 2026
// Após login correto, redireciona para /app (Dashboard).

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaLock, FaSignInAlt, FaGamepad } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import loginBg from '../../assets/backgrounds/login/login-geekverse-bg.jpg';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já está logado, redireciona direto
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    // Simula um pequeno delay para UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = login(username.trim(), password.trim());

    if (result.success) {
      navigate('/app', { replace: true });
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div
      className="gv-login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="gv-login-overlay"></div>
      <div className="gv-login-container">
        <div className="gv-login-header">
          <FaGamepad className="gv-login-icon" />
          <h1 className="gv-login-title">GeekVerse G8</h1>
          <p className="gv-login-subtitle">
            Arcade interativo com APIs públicas
          </p>
        </div>

        <form className="gv-login-form" onSubmit={handleSubmit}>
          <div className="gv-input-group">
            <FaUser className="gv-input-icon" />
            <input
              id="login-username"
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="gv-input-group">
            <FaLock className="gv-input-icon" />
            <input
              id="login-password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="gv-login-error">
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="gv-btn-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <ClipLoader color="#ffffff" size={20} />
            ) : (
              <>
                <FaSignInAlt />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
