// emailService.js
// Serviço de envio de e-mail via EmailJS (@emailjs/browser).
// Todas as funções estão preparadas mas NÃO implementadas ainda.
// O envio real será ativado quando as chaves do EmailJS forem configuradas no .env.
//
// Funções:
// - sendContactEmail      — formulário de contato da página Sobre
// - sendGameResultEmail   — resultado pessoal de uma partida (enviado ao jogador)
// - sendRankingEmail      — ranking local por jogo (página Exportar)
// - sendAuditEmail        — relatório de auditoria de navegação (página Sobre)
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

import emailjs from '@emailjs/browser';

// Chaves via .env (NUNCA colocar chaves reais no código):
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const TEMPLATE_CONTACT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTATO;
const TEMPLATE_GAME_RESULT_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_GAME_RESULT;

/**
 * Envia e-mail de contato a partir do formulário da página Sobre.
 * @param {Object} formData - { name, email, subject, message }
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendContactEmail = async (formData) => {
  // Validar variáveis de ambiente
  if (!SERVICE_ID || !TEMPLATE_CONTACT_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS não configurado. Verifique as variáveis VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_CONTATO e VITE_EMAILJS_PUBLIC_KEY no arquivo .env.'
    );
  }

  // Mapear campos do formulário para o template do EmailJS
  const templateParams = {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    sent_at: new Date().toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    }),
  };

  try {
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_CONTACT_ID, templateParams, PUBLIC_KEY);
    return { success: true, message: 'Mensagem enviada com sucesso!', response };
  } catch (error) {
    throw new Error(error?.text || 'Erro ao enviar mensagem. Tente novamente mais tarde.');
  }
};

/**
 * Envia resultado pessoal de uma partida por e-mail ao jogador.
 * @param {Object} resultData - Dados mapeados para o template EmailJS.
 * @param {string} resultData.game_name
 * @param {string} resultData.player_name
 * @param {string} resultData.player_email
 * @param {string} resultData.difficulty
 * @param {string} resultData.status
 * @param {string} resultData.result_title
 * @param {string} resultData.result_message
 * @param {string} resultData.main_metric_label
 * @param {string} resultData.main_metric_value
 * @param {string} resultData.secondary_metrics
 * @param {string} resultData.generated_at
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendGameResultEmail = async (resultData) => {
  // Validar variáveis de ambiente
  if (!SERVICE_ID || !TEMPLATE_GAME_RESULT_ID || !PUBLIC_KEY) {
    throw new Error(
      'EmailJS de resultado não configurado. Verifique VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_GAME_RESULT e VITE_EMAILJS_PUBLIC_KEY no .env.'
    );
  }

  // Validar e-mail do jogador
  if (!resultData.player_email) {
    throw new Error('E-mail do jogador não encontrado.');
  }

  const templateParams = {
    game_name: resultData.game_name,
    player_name: resultData.player_name,
    player_email: resultData.player_email,
    difficulty: resultData.difficulty,
    status: resultData.status,
    result_title: resultData.result_title,
    result_message: resultData.result_message,
    main_metric_label: resultData.main_metric_label,
    main_metric_value: resultData.main_metric_value,
    secondary_metrics: resultData.secondary_metrics,
    generated_at: resultData.generated_at,
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_GAME_RESULT_ID, templateParams, PUBLIC_KEY);
    return { success: true, message: 'Resultado enviado por e-mail com sucesso.' };
  } catch (error) {
    throw new Error(error?.text || 'Erro ao enviar resultado por e-mail.');
  }
};


/**
 * Envia ranking de um jogo por e-mail usando o serviço EmailJS de Ranking.
 *
 * Usa variáveis de ambiente dedicadas ao ranking (conta/serviço separado):
 *   VITE_EMAILJS_RANKING_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_RANKING
 *   VITE_EMAILJS_RANKING_PUBLIC_KEY
 *
 * @param {Object} rankingData
 * @param {string} rankingData.ranking_title   — Título do card/ranking
 * @param {string} rankingData.game_name       — Nome do jogo
 * @param {string} rankingData.difficulty      — Dificuldade atual
 * @param {string} rankingData.player_name     — Nome do jogador logado
 * @param {string} rankingData.player_email    — E-mail do jogador logado
 * @param {string} rankingData.ranking_list    — Lista formatada em texto
 * @param {string} rankingData.generated_at    — Data/hora em pt-BR
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendRankingEmail = async (rankingData) => {
  const serviceId = import.meta.env.VITE_EMAILJS_RANKING_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_RANKING;
  const publicKey = import.meta.env.VITE_EMAILJS_RANKING_PUBLIC_KEY;

  // Validar variáveis de ambiente
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS de ranking não configurado. Verifique VITE_EMAILJS_RANKING_SERVICE_ID, VITE_EMAILJS_TEMPLATE_RANKING e VITE_EMAILJS_RANKING_PUBLIC_KEY no .env.'
    );
  }

  // Validar e-mail do jogador
  if (!rankingData.player_email) {
    throw new Error(
      'E-mail do jogador não encontrado. Faça login novamente para enviar o ranking.'
    );
  }

  const templateParams = {
    ranking_title: rankingData.ranking_title,
    game_name: rankingData.game_name,
    difficulty: rankingData.difficulty,
    player_name: rankingData.player_name,
    player_email: rankingData.player_email,
    ranking_list: rankingData.ranking_list,
    generated_at: rankingData.generated_at,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: 'Ranking enviado com sucesso para o e-mail cadastrado.' };
  } catch (error) {
    throw new Error(
      error?.text || 'Não foi possível enviar o ranking por e-mail. Tente novamente.'
    );
  }
};

/**
 * Envia relatório de auditoria da sessão por e-mail.
 *
 * Usa o mesmo serviço/chave do ranking:
 *   VITE_EMAILJS_RANKING_SERVICE_ID
 *   VITE_EMAILJS_RANKING_PUBLIC_KEY
 * Com template dedicado de auditoria:
 *   VITE_EMAILJS_TEMPLATE_AUDIT
 *
 * @param {Object} auditData
 * @param {string} auditData.audit_title      — Título do relatório
 * @param {string} auditData.user_name        — Nome do usuário
 * @param {string} auditData.user_email       — E-mail do usuário
 * @param {number} auditData.total_events     — Total de eventos registrados
 * @param {number} auditData.game_enters      — Jogos acessados
 * @param {number} auditData.game_starts      — Partidas iniciadas
 * @param {number} auditData.game_finishes    — Partidas finalizadas
 * @param {number} auditData.result_exports   — Exportações realizadas
 * @param {string} auditData.summary          — Resumo descritivo
 * @param {string} auditData.generated_at     — Data/hora em pt-BR
 * @returns {Promise<Object>} Resultado do envio.
 */
export const sendAuditEmail = async (auditData) => {
  const serviceId = import.meta.env.VITE_EMAILJS_RANKING_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_AUDIT;
  const publicKey = import.meta.env.VITE_EMAILJS_RANKING_PUBLIC_KEY;

  // Validar variáveis de ambiente
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS de auditoria não configurado. Verifique VITE_EMAILJS_RANKING_SERVICE_ID, VITE_EMAILJS_TEMPLATE_AUDIT e VITE_EMAILJS_RANKING_PUBLIC_KEY no .env.'
    );
  }

  const templateParams = {
    audit_title: auditData.audit_title,
    user_name: auditData.user_name,
    user_email: auditData.user_email,
    total_events: auditData.total_events,
    game_enters: auditData.game_enters,
    game_starts: auditData.game_starts,
    game_finishes: auditData.game_finishes,
    result_exports: auditData.result_exports,
    summary: auditData.summary,
    generated_at: auditData.generated_at,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return { success: true, message: 'Auditoria da sessão enviada com sucesso para o e-mail do projeto.' };
  } catch (error) {
    throw new Error(
      error?.text || 'Não foi possível enviar a auditoria da sessão. Tente novamente.'
    );
  }
};
