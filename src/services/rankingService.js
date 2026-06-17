
// Serviço central do Ranking do GeekVerse G8.
// Gerencia resultados de jogos via localStorage.
// Chave: geekverse-ranking-results

// Configuração Visual e Regras de cada Jogo
// Define como a pontuação funciona e quais ícones/cores usar.

export const RANKING_GAMES = {
  'harry-memory': {
    id: 'harry-memory',
    name: 'Memória dos Bruxos',
    api: 'Harry Potter API',
    icon: 'magic',
    color: '#f59e0b',
    criterion: 'Menor tempo vence. Empate por tentativas.',
    mainMetricLabel: 'Tempo',
    formatMainMetric: (r) => r.formattedTime || formatTime(r.timeInSeconds),
  },
  'pokesombra': {
    id: 'pokesombra',
    name: 'PokeSombra',
    api: 'PokéAPI',
    icon: 'pokemon',
    color: '#ef4444',
    criterion: 'Menor tempo final vence. Empate por erros.',
    mainMetricLabel: 'Tempo',
    formatMainMetric: (r) => r.formattedTime || formatTime(r.timeInSeconds),
  },
  'show-multiverso': {
    id: 'show-multiverso',
    name: 'Show do Multiverso',
    api: 'Rick and Morty API',
    icon: 'portal',
    color: '#22c55e',
    criterion: 'Maior pontuação vence. Empate por tempo, dicas e erros.',
    mainMetricLabel: 'Score',
    formatMainMetric: (r) => {
      let metric = `${r.score ?? 0} pts`;
      if (r.timeInSeconds != null) {
        const timeStr = r.formattedTime || formatTime(r.timeInSeconds);
        metric += ` (${timeStr})`;
      }
      return metric;
    },
  },
  'fuga-hiperespaco': {
    id: 'fuga-hiperespaco',
    name: 'Fuga do Hiperespaço',
    api: 'SWAPI',
    icon: 'spaceship',
    color: '#3b82f6',
    criterion: 'Maior pontuação vence. Empate por colisões e cristais.',
    mainMetricLabel: 'Score',
    formatMainMetric: (r) => `${r.score ?? 0} pts`,
  },
};

export const DIFFICULTIES = [
  { key: 'easy', label: 'Fácil' },
  { key: 'medium', label: 'Médio' },
  { key: 'challenge', label: 'Difícil' },
];

// Ferramentas de Ajuda (Formatar Tempo e Criar IDs)

const STORAGE_KEY = 'geekverse-ranking-results';

function formatTime(seconds) {
  if (seconds == null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// O cérebro do Ranking: Como desempatar os jogadores
// Cada jogo tem uma regra de desempate diferente (quem errou menos, quem foi mais rápido, etc)

function getSortFn(gameId) {
  switch (gameId) {
    case 'harry-memory':
      // Menor tempo → menor tentativas → mais antigo
      return (a, b) => {
        if (a.timeInSeconds !== b.timeInSeconds) return a.timeInSeconds - b.timeInSeconds;
        if (a.attempts !== b.attempts) return a.attempts - b.attempts;
        return new Date(a.createdAt) - new Date(b.createdAt);
      };
    case 'pokesombra':
      // Menor timeInSeconds -> menor errors -> menor hintsUsed/hints -> maior score
      return (a, b) => {
        if ((a.timeInSeconds ?? 0) !== (b.timeInSeconds ?? 0)) return (a.timeInSeconds ?? 0) - (b.timeInSeconds ?? 0);
        if ((a.errors ?? 0) !== (b.errors ?? 0)) return (a.errors ?? 0) - (b.errors ?? 0);
        const aHints = a.hintsUsed ?? a.hints ?? 0;
        const bHints = b.hintsUsed ?? b.hints ?? 0;
        if (aHints !== bHints) return aHints - bHints;
        return (b.score ?? 0) - (a.score ?? 0);
      };
    case 'show-multiverso':
      // Maior score → menor tempo → menor hintsUsed → menor erros
      return (a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
        
        const timeA = a.timeInSeconds ?? Infinity;
        const timeB = b.timeInSeconds ?? Infinity;
        if (timeA !== timeB) return timeA - timeB;
        
        if ((a.hintsUsed ?? 0) !== (b.hintsUsed ?? 0)) return (a.hintsUsed ?? 0) - (b.hintsUsed ?? 0);
        return (a.errors ?? 0) - (b.errors ?? 0);
      };
    case 'fuga-hiperespaco':
      // Maior score → menor colisões → maior cristais → maior obstáculos esquivados
      return (a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
        if ((a.collisions ?? 0) !== (b.collisions ?? 0)) return (a.collisions ?? 0) - (b.collisions ?? 0);
        if ((b.crystals ?? 0) !== (a.crystals ?? 0)) return (b.crystals ?? 0) - (a.crystals ?? 0);
        return (b.obstaclesDodged ?? 0) - (a.obstaclesDodged ?? 0);
      };
    default:
      return (a, b) => (b.score ?? 0) - (a.score ?? 0);
  }
}

// Passo 1: Busca o ranking local na memória do navegador (fallback caso a internet caia)

export function getAllResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Conexão com o Banco de Dados Real (Supabase)
import { supabase, isSupabaseConfigured } from './supabaseClient';

// Converte objeto camelCase da app para snake_case do Supabase
function toSnakeCase(obj) {
  return {
    game_id: obj.gameId,
    game_name: obj.gameName,
    player_name: obj.playerName,
    player_email: obj.playerEmail,
    difficulty: obj.difficulty,
    status: obj.status,
    score: obj.score ?? null,
    time_in_seconds: obj.timeInSeconds ?? null,
    formatted_time: obj.formattedTime ?? null,
    attempts: obj.attempts ?? null,
    hits: obj.hits ?? null,
    errors: obj.errors ?? null,
    hints_used: obj.hintsUsed ?? null,
    hint_penalty_total: obj.hintPenaltyTotal ?? null,
    penalties: obj.penalties ?? null,
    crystals: obj.crystals ?? null,
    hyper_crystals_collected: obj.hyperCrystalsCollected ?? null,
    obstacles_dodged: obj.obstaclesDodged ?? null,
    collisions: obj.collisions ?? null,
    survival_bonus: obj.survivalBonus ?? null,
    ranking_eligible: obj.rankingEligible ?? true,
    game_version: obj.gameVersion ?? null,
    payload: obj,
  };
}

// Converte objeto snake_case do Supabase para camelCase da app
function toCamelCase(row) {
  return {
    id: row.id,
    gameId: row.game_id,
    gameName: row.game_name,
    playerName: row.player_name,
    playerEmail: row.player_email,
    difficulty: row.difficulty,
    status: row.status,
    score: row.score,
    timeInSeconds: row.time_in_seconds,
    formattedTime: row.formatted_time,
    attempts: row.attempts,
    hits: row.hits,
    errors: row.errors,
    hintsUsed: row.hints_used,
    hintPenaltyTotal: row.hint_penalty_total,
    penalties: row.penalties,
    crystals: row.crystals,
    hyperCrystalsCollected: row.hyper_crystals_collected,
    obstaclesDodged: row.obstacles_dodged,
    collisions: row.collisions,
    survivalBonus: row.survival_bonus,
    rankingEligible: row.ranking_eligible,
    gameVersion: row.game_version,
    createdAt: row.created_at,
    // Preserva campos extras que possam vir no payload
    ...(row.payload && typeof row.payload === 'object' ? row.payload : {}),
  };
}

// Passo 2: Salva o resultado da partida (Salva na memória local E manda pro Banco de Dados ao mesmo tempo)

export function saveResult(result) {
  // 1. Sempre salva no localStorage (fallback + offline)
  const results = getAllResults();
  const entry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...result,
  };
  results.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));

  // 2. Se Supabase configurado, insere em background (fire-and-forget)
  if (isSupabaseConfigured && supabase) {
    const row = toSnakeCase(entry);
    supabase
      .from('rankings')
      .insert([row])
      .then(({ error }) => {
        if (error) {
          if (import.meta.env.DEV) {
            console.warn('[rankingService] Supabase insert falhou:', error.message);
          }
        } else {
          if (import.meta.env.DEV) {
            console.log('[rankingService] Resultado salvo no Supabase ✓');
          }
        }
      });
  }

  return entry;
}

// Funções de Leitura Offline (Puxam os dados locais se a internet cair)

export function getResultsByGame(gameId) {
  return getAllResults().filter((r) => r.gameId === gameId);
}

export function getResultsByGameAndDifficulty(gameId, difficulty) {
  return getAllResults().filter(
    (r) => r.gameId === gameId && r.difficulty === difficulty && r.rankingEligible !== false
  );
}

export function sortResults(gameId, results) {
  return [...results].sort(getSortFn(gameId));
}

export function getTopThree(gameId, difficulty) {
  const results = getResultsByGameAndDifficulty(gameId, difficulty);
  return sortResults(gameId, results).slice(0, 3);
}

export function getTopTen(gameId, difficulty) {
  const results = getResultsByGameAndDifficulty(gameId, difficulty);
  return sortResults(gameId, results).slice(0, 10);
}

export function getRankedResults(gameId, difficulty) {
  const results = getResultsByGameAndDifficulty(gameId, difficulty);
  return sortResults(gameId, results);
}

export function getUserPosition(gameId, difficulty, playerEmail) {
  if (!playerEmail) return null;
  const sorted = getRankedResults(gameId, difficulty);
  const index = sorted.findIndex(
    (r) => r.playerEmail?.toLowerCase() === playerEmail.toLowerCase()
  );
  if (index === -1) return null;
  return { position: index + 1, result: sorted[index] };
}

export function getGameSummary(gameId) {
  const results = getResultsByGame(gameId);
  if (results.length === 0) {
    return { totalResults: 0, bestPlayer: null };
  }
  const sorted = sortResults(gameId, results);
  return {
    totalResults: results.length,
    bestPlayer: sorted[0]?.playerName || null,
    bestResult: sorted[0] || null,
  };
}

// Funções de Leitura Online (Puxam os dados direto do Supabase)
// Usadas para montar a tela de "Dashboard / Ranking Global"

export async function fetchTopTen(gameId, difficulty) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('game_id', gameId)
        .eq('difficulty', difficulty)
        .neq('ranking_eligible', false);

      if (!error && data) {
        const camel = data.map(toCamelCase);
        return sortResults(gameId, camel).slice(0, 10);
      }

      if (import.meta.env.DEV) {
        console.warn('[rankingService] Supabase fetchTopTen falhou, usando localStorage:', error?.message);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[rankingService] Supabase fetchTopTen erro:', err);
      }
    }
  }
  return getTopTen(gameId, difficulty);
}

export async function fetchRankedResults(gameId, difficulty) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('rankings')
        .select('*')
        .eq('game_id', gameId)
        .eq('difficulty', difficulty)
        .neq('ranking_eligible', false);

      if (!error && data) {
        return sortResults(gameId, data.map(toCamelCase));
      }

      if (import.meta.env.DEV) {
        console.warn('[rankingService] Supabase fetchRankedResults falhou:', error?.message);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[rankingService] Supabase fetchRankedResults erro:', err);
      }
    }
  }
  return getRankedResults(gameId, difficulty);
}

export async function fetchUserPosition(gameId, difficulty, playerEmail) {
  if (!playerEmail) return null;
  const sorted = await fetchRankedResults(gameId, difficulty);
  const index = sorted.findIndex(
    (r) => r.playerEmail?.toLowerCase() === playerEmail.toLowerCase()
  );
  if (index === -1) return null;
  return { position: index + 1, result: sorted[index] };
}

