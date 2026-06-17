
// Hook customizado para acessar o contexto de autenticação.
// Fornece: user, login, logout, isAuthenticated, loading.

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
  }
  return context;
};
