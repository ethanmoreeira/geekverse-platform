// auditService.js
// Serviço de auditoria de navegação e ações do usuário no GeekVerse G8.
// Registra eventos localmente no localStorage.
// O envio por e-mail é feito MANUALMENTE pela página Exportar (não automático).
//
// Eventos registrados:
// - login        — quando o usuário faz login
// - logout       — quando o usuário faz logout
// - page_access  — quando acessa uma página/jogo
// - game_start   — quando inicia uma partida
// - game_end     — quando finaliza uma partida
// - export_sent  — quando envia um relatório por e-mail
//
// Estrutura de evento de auditoria:
// {
//   id,          — identificador único
//   action,      — tipo da ação (login, logout, page_access, etc.)
//   page,        — rota/página acessada
//   user,        — nome do usuário autenticado
//   details,     — informações extras (ex: nome do jogo, resultado, etc.)
//   createdAt    — data/hora ISO string
// }

const STORAGE_KEY = 'geekverse_audit_log';
const MAX_EVENTS = 200; // Limite para evitar crescimento excessivo no localStorage

/**
 * Gera um ID único para cada evento de auditoria.
 */
const generateAuditId = () => {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Lê todos os eventos do localStorage.
 * @returns {Array} Lista de eventos ou array vazio.
 */
const readEvents = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Persiste a lista de eventos no localStorage.
 * Limita automaticamente para MAX_EVENTS mais recentes.
 * @param {Array} events - Lista de eventos a salvar.
 */
const writeEvents = (events) => {
  try {
    const trimmed = events.slice(0, MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('auditService: Erro ao salvar no localStorage', err);
  }
};

/**
 * Registra um novo evento de auditoria.
 * @param {string} action - Tipo da ação (login, logout, page_access, etc.).
 * @param {string} page - Rota/página onde o evento ocorreu.
 * @param {string} user - Nome do usuário autenticado.
 * @param {string} details - Informações extras opcionais.
 * @returns {Object} O evento registrado.
 */
export const registerAuditEvent = (action, page = '', user = '', details = '') => {
  const event = {
    id: generateAuditId(),
    action,
    page,
    user,
    details,
    createdAt: new Date().toISOString(),
  };

  const all = readEvents();
  all.unshift(event); // Mais recente primeiro
  writeEvents(all);

  return event;
};

/**
 * Retorna todos os eventos de auditoria registrados.
 * @param {number} limit - Quantidade máxima (padrão: 100).
 * @returns {Array} Lista de eventos de auditoria.
 */
export const getAuditEvents = (limit = 100) => {
  return readEvents().slice(0, limit);
};

/**
 * Remove todos os eventos de auditoria do localStorage.
 */
export const clearAuditEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('auditService: Erro ao limpar auditoria', err);
  }
};
