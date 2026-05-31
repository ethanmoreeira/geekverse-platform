// emailExportControl.js
// Utilitário para controle de envios únicos por e-mail no GeekVerse G8.
// Usa sessionStorage para evitar múltiplos envios na mesma sessão/partida.
// Não usa localStorage — o bloqueio é por sessão de navegador, não permanente.
//
// Chaves:
//   geekverse_email_sent_result_${gameId}_${matchKey}  — resultado de jogo
//   geekverse_email_sent_ranking_${gameId}_${difficulty} — ranking
//   geekverse_email_sent_audit_session                 — auditoria da sessão

const PREFIX = 'geekverse_email_sent_';

/**
 * Verifica se um e-mail com determinada chave já foi enviado nesta sessão.
 * @param {string} key - Chave de controle (sem o prefixo).
 * @returns {boolean} true se já foi enviado, false caso contrário.
 */
export function hasEmailExportBeenSent(key) {
  try {
    return sessionStorage.getItem(PREFIX + key) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marca um e-mail como já enviado nesta sessão.
 * Deve ser chamado APENAS após sucesso confirmado do envio.
 * @param {string} key - Chave de controle (sem o prefixo).
 */
export function markEmailExportAsSent(key) {
  try {
    sessionStorage.setItem(PREFIX + key, 'true');
  } catch {
    // Falha silenciosa — não impede o fluxo principal
  }
}

/**
 * Monta a chave de controle para resultado de um jogo.
 * @param {string} gameId - ID do jogo (ex: 'harry-memory').
 * @param {string} matchKey - Identificador único da partida.
 * @returns {string} Chave composta.
 */
export function buildResultKey(gameId, matchKey) {
  return `result_${gameId}_${matchKey}`;
}

/**
 * Monta a chave de controle para ranking de um jogo/dificuldade.
 * @param {string} gameId - ID do jogo (ex: 'show-multiverso').
 * @param {string} difficulty - Dificuldade (ex: 'easy', 'medium', 'challenge').
 * @returns {string} Chave composta.
 */
export function buildRankingKey(gameId, difficulty) {
  return `ranking_${gameId}_${difficulty}`;
}

/**
 * Chave fixa para a auditoria da sessão atual.
 */
export const AUDIT_SESSION_KEY = 'audit_session';
