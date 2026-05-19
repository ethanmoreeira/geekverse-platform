// emailService.js
// Serviço de envio de e-mail via EmailJS (@emailjs/browser).
// Todas as funções estão preparadas mas NÃO implementadas ainda.
// O envio real será ativado quando as chaves do EmailJS forem configuradas no .env.
//
// Funções:
// - sendContactEmail      — formulário de contato da página Sobre
// - sendGameResultsEmail  — resultados de jogos selecionados (página Exportar)
// - sendRankingEmail      — ranking local por jogo (página Exportar)
// - sendAuditEmail        — relatório de auditoria de navegação (página Exportar)
//
// Fluxo:
// 1. O usuário joga um ou mais jogos.
// 2. Os resultados são salvos automaticamente no localStorage via gameHistoryService.
// 3. O usuário acessa /app/exportar e seleciona o que quer enviar.
// 4. O sistema monta o payload e envia via EmailJS.
//
// IMPORTANTE:
// - NÃO fazer envio automático a cada navegação.
// - O envio é sempre MANUAL, feito pelo usuário na página Exportar ou Sobre.

// import emailjs from '@emailjs/browser';

// Chaves futuras via .env (NUNCA colocar chaves reais no código):
// const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
// const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
// const TEMPLATE_CONTACT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT_ID;
// const TEMPLATE_REPORT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_REPORT_ID;

/**
 * Envia e-mail de contato a partir do formulário da página Sobre.
 * @param {Object} formData - { name, email, subject, message }
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendContactEmail = async (formData) => {
  // Implementação futura com EmailJS
  console.log('[emailService] sendContactEmail — aguardando configuração do EmailJS', formData);
  return { success: false, message: 'EmailJS ainda não configurado.' };
};

/**
 * Envia resultados de jogos selecionados por e-mail.
 * @param {Object} data - { recipientEmail, results, gameName }
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendGameResultsEmail = async (data) => {
  // Implementação futura com EmailJS
  console.log('[emailService] sendGameResultsEmail — aguardando configuração do EmailJS', data);
  return { success: false, message: 'EmailJS ainda não configurado.' };
};

/**
 * Envia ranking local de um ou todos os jogos por e-mail.
 * @param {Object} data - { recipientEmail, ranking, gameFilter }
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendRankingEmail = async (data) => {
  // Implementação futura com EmailJS
  console.log('[emailService] sendRankingEmail — aguardando configuração do EmailJS', data);
  return { success: false, message: 'EmailJS ainda não configurado.' };
};

/**
 * Envia relatório de auditoria de navegação por e-mail.
 * @param {Object} data - { recipientEmail, auditEvents }
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendAuditEmail = async (data) => {
  // Implementação futura com EmailJS
  console.log('[emailService] sendAuditEmail — aguardando configuração do EmailJS', data);
  return { success: false, message: 'EmailJS ainda não configurado.' };
};
