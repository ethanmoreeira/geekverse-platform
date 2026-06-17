// Serviço de auditoria: Olheiro invisível que anota tudo que o usuário faz no jogo
// Isso serve para termos estatísticas de quantas partidas foram jogadas.
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
  } catch {
    // Silently ignore parsing errors
  }
  return { user_name: 'Visitante', user_email: '' };
};

// Função Principal: Salva tudo o que o usuário faz direto no Banco de Dados (Supabase).
// Ela anota: O que o usuário fez, em qual página, em qual jogo, etc.

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

    // Incrementa a sessão local independentemente do sucesso do banco de dados
    // Isso garante que a tela Sobre atualize mesmo se o RLS do Supabase bloquear o INSERT
    incrementAuditSessionSummary(eventType, description, gameName, path);

    const { error } = await supabase.from('audit_logs').insert([payload]);

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[AuditService] Falha ao registrar log:', error.message);
      }
      return false;
    }

    return true;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[AuditService] Erro inesperado ao registrar log:', err);
    }
    return false;
  }
};

// Passo 1: Pega o "Placar de Auditoria" da sessão atual na memória do navegador
export const getAuditSessionSummary = () => {
  try {
    const data = sessionStorage.getItem('geekverse_audit_session_summary');
    if (data) {
      return JSON.parse(data);
    }
  } catch {
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

// Passo 2: Adiciona +1 no Placar toda vez que o usuário faz alguma coisa (ex: entra num jogo)
export const incrementAuditSessionSummary = (eventType, description = '', gameName = '', path = '') => {
  try {
    const summary = getAuditSessionSummary();
    summary.totalEvents += 1;

    if (eventType === 'game_enter') summary.gameEnters += 1;
    if (eventType === 'game_start') summary.gameStarts += 1;
    if (eventType === 'game_finish') summary.gameFinishes += 1;
    if (eventType === 'result_export' || eventType === 'result_email_send') summary.resultExports += 1;

    sessionStorage.setItem('geekverse_audit_session_summary', JSON.stringify(summary));
  } catch {
    // Ignore
  }

  // Também registra o evento detalhado na linha do tempo da sessão
  appendAuditSessionEvent(eventType, description, gameName, path);
};

// --- LINHA DO TEMPO DETALHADA DA SESSÃO ---

const SESSION_EVENTS_KEY = 'geekverse_audit_session_events';
const MAX_SESSION_EVENTS = 100;

// Tradutor: Transforma os códigos feios do sistema em português claro para enviar por e-mail
const EVENT_TYPE_LABELS = {
  login: 'Login realizado',
  logout: 'Logout realizado',
  page_view: 'Acessou página',
  game_enter: 'Acessou jogo',
  game_start: 'Iniciou partida',
  game_finish: 'Finalizou partida',
  result_export: 'Exportou resultado',
  result_email_send: 'Exportou resultado por e-mail',
  ranking_save: 'Salvou ranking',
  contact_sent: 'Enviou formulário de contato',
  audit_email_send: 'Enviou auditoria por e-mail',
};

// Anota o passo a passo exato do que o usuário fez (a "linha do tempo" da sessão)
const appendAuditSessionEvent = (eventType, description = '', gameName = '', path = '') => {
  try {
    const raw = sessionStorage.getItem(SESSION_EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];

    events.push({
      eventType,
      description,
      gameName,
      path,
      createdAt: new Date().toISOString()
    });

    // Limitar para evitar crescimento excessivo
    const trimmed = events.slice(-MAX_SESSION_EVENTS);
    sessionStorage.setItem(SESSION_EVENTS_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore
  }
};

// Junta toda a linha do tempo da sessão, coloca as horas certinhas [14:30:00], 
// e formata como um texto único pra gente mandar por e-mail no final.
export const getAuditSessionTimelineText = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_EVENTS_KEY);
    const events = raw ? JSON.parse(raw) : [];

    if (events.length === 0) {
      return 'Nenhum evento detalhado encontrado nesta sessão.';
    }

    return events.map((evt) => {
      const date = new Date(evt.createdAt);
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Usar description se existir; senão, montar fallback com label + contexto
      let text = evt.description;
      if (!text) {
        const label = EVENT_TYPE_LABELS[evt.eventType] || evt.eventType;
        if (evt.gameName) {
          text = `${label}: ${evt.gameName}`;
        } else if (evt.path) {
          text = `${label}: ${evt.path}`;
        } else {
          text = label;
        }
      }

      return `[${time}] ${text}`;
    }).join('\n');
  } catch {
    return 'Erro ao carregar linha do tempo da sessão.';
  }
};

// Limpa o Placar da Auditoria (Acionado quando a pessoa clica em Sair/Logout)
export const resetAuditSessionSummary = () => {
  try {
    sessionStorage.removeItem('geekverse_audit_session_summary');
    sessionStorage.removeItem(SESSION_EVENTS_KEY);
  } catch {
    // Ignore
  }
};

// Função Anti-Spam: Garante que a gente não anote "Acessou a Página X" 500 vezes
// se o usuário ficar apertando F5 sem parar. Só anota uma vez por sessão.
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



