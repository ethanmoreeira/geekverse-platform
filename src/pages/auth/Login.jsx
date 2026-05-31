// Login.jsx
// Página de login do GeekVerse G8.
// Identificação acadêmica: Nome + E-mail + Senha padrão G82026.
// Após login correto, redireciona para /app (Dashboard).
// Registra evento de auditoria ao logar.

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaUser, FaLock, FaSignInAlt, FaEnvelope } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { registerAuditEvent } from '../../services/auditService';
import loginBg from '../../assets/backgrounds/login/login-page-bg.png';
import geekverseLogo from '../../assets/backgrounds/dashboard/geekverse_logo_cropped.png';
import LoginTransitionLoader from '../../components/feedback/LoginTransitionLoader';

const Login = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Se já está logado, redireciona direto
  if (isAuthenticated && !isEntering) {
    return <Navigate to="/app" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    // Simula um pequeno delay para UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = login(nome.trim(), email.trim(), password.trim());

    if (result.success) {
      // Registrar evento de auditoria
      try {
        registerAuditEvent(
          'login_realizado',
          '/login',
          nome.trim(),
          `E-mail: ${email.trim()}`
        );
      } catch (err) {
        // Auditoria não deve impedir o login
        console.warn('Auditoria: erro ao registrar login', err);
      }

      setIsEntering(true);
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1800);
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  if (isEntering) {
    return <LoginTransitionLoader />;
  }

  return (
    <div
      className="gv-login-page"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="gv-login-overlay"></div>

      <div className="gv-login-container">
        <div className="gv-login-header">
          <div className="gv-login-logo-wrapper">
            <img
              src={geekverseLogo}
              alt="GeekVerse G8"
              className="gv-login-logo"
            />
          </div>
          <p className="gv-login-subtitle">
            Identifique-se para acessar o arcade
          </p>
        </div>

        <form className="gv-login-form" onSubmit={handleSubmit}>
          <div className="gv-input-group">
            <label className="gv-input-label" htmlFor="login-nome">Nome do jogador</label>
            <FaUser className="gv-input-icon" />
            <input
              id="login-nome"
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isLoading}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="gv-input-group">
            <label className="gv-input-label" htmlFor="login-email">E-mail</label>
            <FaEnvelope className="gv-input-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <div className="gv-input-group">
            <label className="gv-input-label" htmlFor="login-password">Senha de acesso</label>
            <FaLock className="gv-input-icon" />
            <input
              id="login-password"
              type="password"
              placeholder="Digite a senha G82026"
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

        <div className="gv-login-hint">
          <p>Seu nome será usado no ranking e seu e-mail na exportação e auditoria dos resultados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
