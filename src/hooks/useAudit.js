// useAudit.js
// Hook customizado para auditoria de navegação e ações.
// Registra: login, logout, acesso a jogos, fim de partida.
// Futuramente enviará relatório por e-mail via EmailJS.

// Implementação futura.
export const useAudit = () => {
  return {
    logAction: () => {},
    getAuditLog: () => [],
    sendAuditReport: () => {},
  };
};
