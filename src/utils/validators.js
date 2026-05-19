// validators.js
// Utilitários de validação para formulários e dados.
// Valida e-mail, campos obrigatórios, credenciais, etc.

export const isValidEmail = (email) => {
  // Implementação futura
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};
