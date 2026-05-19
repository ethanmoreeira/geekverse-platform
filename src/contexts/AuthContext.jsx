// AuthContext.jsx
// Contexto de autenticação do GeekVerse G8.
// Gerencia estado de login/logout com credenciais acadêmicas simuladas.
// Usuário: G8 | Senha: 2026
// Persistência via localStorage.

import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// Credenciais acadêmicas do grupo
const VALID_USER = 'G8';
const VALID_PASS = '2026';
const STORAGE_KEY = 'geekverse_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera sessão do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.username) {
          setUser(parsed);
        }
      }
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    if (username === VALID_USER && password === VALID_PASS) {
      const userData = {
        username,
        loginTime: new Date().toISOString(),
      };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Usuário ou senha inválidos.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
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
