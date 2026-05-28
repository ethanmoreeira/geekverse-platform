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

// --- SUPABASE AUDIT INTEGRATION ---
import { supabase, isSupabaseConfigured } from './supabaseClient';

const getUserData = () => {
  try {
    let rawUser = localStorage.getItem('geekverse_auth');
    if (!rawUser || rawUser === 'true') {
      rawUser = localStorage.getItem('geekverse-user');
    }
    if (!rawUser || rawUser === 'true') {
      rawUser = localStorage.getItem('auth');
    }

    if (rawUser && rawUser !== 'true') {
      const parsed = JSON.parse(rawUser);
      return {
        user_name: parsed.nome || parsed.name || parsed.username || 'Visitante',
        user_email: parsed.email || ''
      };
    }
  } catch (e) {
    // Silently ignore parsing errors
  }
  return { user_name: 'Visitante', user_email: '' };
};

/**
 * Registra um evento no sistema de auditoria (tabela public.audit_logs).
 * 
 * @param {Object} event - Dados do evento a registrar
 * @param {string} event.eventType - Tipo do evento (ex: "login", "page_view", "game_start")
 * @param {string} event.description - Descrição legível do evento
 * @param {string} [event.path] - Rota atual onde ocorreu (ex: "/app")
 * @param {string} [event.gameId] - ID interno do jogo
 * @param {string} [event.gameName] - Nome do jogo
 * @param {Object} [event.metadata] - Objeto adicional genérico
 * @returns {Promise<boolean>} Sucesso ou falha silenciosa
 */
export const logAuditEvent = async ({
  eventType,
  description,
  path = '',
  gameId = null,
  gameName = null,
  metadata = null
}) => {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { user_name, user_email } = getUserData();

    const payload = {
      user_name,
      user_email,
      event_type: eventType,
      description,
      path,
      game_id: gameId,
      game_name: gameName,
      metadata
    };

    const { error } = await supabase.from('audit_logs').insert([payload]);

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[AuditService] Falha ao registrar log:', error.message);
      }
      return false;
    }

    incrementAuditSessionSummary(eventType);
    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[AuditService] Erro inesperado ao registrar log:', err);
    }
    return false;
  }
};

/**
 * Retorna o resumo da sessão atual salvo no sessionStorage
 */
export const getAuditSessionSummary = () => {
  try {
    const data = sessionStorage.getItem('geekverse_audit_session_summary');
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    // Ignore
  }
  return {
    totalEvents: 0,
    gameEnters: 0,
    gameStarts: 0,
    gameFinishes: 0,
    resultExports: 0
  };
};

/**
 * Atualiza o resumo da sessão local
 */
export const incrementAuditSessionSummary = (eventType) => {
  try {
    const summary = getAuditSessionSummary();
    summary.totalEvents += 1;

    if (eventType === 'game_enter') summary.gameEnters += 1;
    if (eventType === 'game_start') summary.gameStarts += 1;
    if (eventType === 'game_finish') summary.gameFinishes += 1;
    if (eventType === 'result_export') summary.resultExports += 1;

    sessionStorage.setItem('geekverse_audit_session_summary', JSON.stringify(summary));
  } catch (err) {
    // Ignore
  }
};

/**
 * Zera o resumo da sessão local
 */
export const resetAuditSessionSummary = () => {
  try {
    sessionStorage.removeItem('geekverse_audit_session_summary');
  } catch (err) {
    // Ignore
  }
};

/**
 * Registra um page_view apenas uma vez por sessão.
 * 
 * @param {Object} event - Dados do evento
 * @param {string} event.description - Descrição do acesso
 * @param {string} event.path - Rota atual (usada como chave de controle)
 * @param {Object} [event.metadata] - Objeto adicional genérico
 * @returns {Promise<boolean>}
 */
export const logPageViewOnce = async ({
  description,
  path,
  metadata = null
}) => {
  if (!path) return false;

  const sessionKey = `audit_page_view_${path}`;
  if (sessionStorage.getItem(sessionKey)) {
    return false; // Já registrou nesta sessão
  }

  const success = await logAuditEvent({
    eventType: 'page_view',
    description,
    path,
    metadata
  });

  // Salvar a chave na sessão logo após chamar o logAuditEvent para evitar concorrência instantânea
  // O ideal é salvar a chave independentemente do retorno da API para evitar retentativas massivas
  sessionStorage.setItem(sessionKey, 'true');

  return success;
};

/**
 * Busca o resumo agregado de auditoria através da RPC do Supabase.
 * Retorna null se não configurado ou se houver erro.
 */
export const getAuditSummary = async () => {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.rpc('get_audit_summary');

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[AuditService] Erro ao buscar resumo de auditoria:', error.message);
      }
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }
    
    // Retorna objeto zerado fallback
    return {
      total_events: 0,
      total_logins: 0,
      total_page_views: 0,
      total_game_enters: 0,
      total_game_starts: 0,
      total_game_finishes: 0,
      total_exports: 0,
      total_audit_requests: 0
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[AuditService] Erro inesperado ao buscar resumo:', err);
    }
    return null;
  }
};

