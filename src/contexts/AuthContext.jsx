// AuthContext.jsx
// Contexto de autenticação do GeekVerse G8.
// Gerencia estado de login/logout com credenciais acadêmicas simuladas.
// Senha padrão: G82026
// Armazena nome, e-mail e data/hora do login.
// Persistência via localStorage.

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// Senha acadêmica do projeto
const VALID_PASS = 'G82026';
const STORAGE_KEY = 'geekverse_auth';
const USER_STORAGE_KEY = 'geekverse-user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera sessão do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.nome) {
          setUser(parsed);
        }
      }
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  /**
   * Realiza login com validação de nome, e-mail e senha.
   * @param {string} nome - Nome do jogador.
   * @param {string} email - E-mail do jogador.
   * @param {string} password - Senha de acesso.
   * @returns {{ success: boolean, message?: string }}
   */
  const login = (nome, email, password) => {
    // Validação do nome
    if (!nome || !nome.trim()) {
      return { success: false, field: 'nome', message: 'Informe seu nome para continuar.' };
    }

    // Validação do e-mail
    if (!email || !email.trim()) {
      return { success: false, field: 'email', message: 'Informe um e-mail válido para exportação e auditoria.' };
    }

    // Validação de formato de e-mail básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return { success: false, field: 'email', message: 'Informe um e-mail válido para exportação e auditoria.' };
    }

    // Validação da senha
    if (!password || !password.trim()) {
      return { success: false, field: 'password', message: 'Senha inválida. Digite a senha G82026.' };
    }

    if (password.trim() !== VALID_PASS) {
      return { success: false, field: 'password', message: 'Senha inválida. Digite a senha G82026.' };
    }

    // Login aprovado — salva dados do usuário
    const userData = {
      nome: nome.trim(),
      email: email.trim(),
      loggedAt: new Date().toISOString(),
      // Manter compatibilidade com referências antigas
      username: nome.trim(),
    };

    setUser(userData);

    // Persistir nos dois formatos para compatibilidade
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({
      nome: userData.nome,
      email: userData.email,
      loggedAt: userData.loggedAt,
    }));

    // Compatibilidade com chaves legadas
    localStorage.setItem('auth', 'true');

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('auth');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
