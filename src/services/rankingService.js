// rankingService.js
// Serviço central do Ranking do GeekVerse G8.
// Gerencia resultados de jogos via localStorage.
// Chave: geekverse-ranking-results

// ============================================
// CONFIGURAÇÃO DOS JOGOS
// ============================================

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
    criterion: 'Maior pontuação vence. Empate por dicas e erros.',
    mainMetricLabel: 'Score',
    formatMainMetric: (r) => `${r.score ?? 0} pts`,
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

// ============================================
// HELPERS
// ============================================

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

// ============================================
// CRITÉRIOS DE ORDENAÇÃO POR JOGO
// ============================================

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
      // Maior score → menor hintsUsed → menor erros
      return (a, b) => {
        if ((b.score ?? 0) !== (a.score ?? 0)) return (b.score ?? 0) - (a.score ?? 0);
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

// ============================================
// CRUD — localStorage (fallback / offline)
// ============================================

export function getAllResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================
// LIMPEZA AUTOMÁTICA DE MOCKS ANTIGOS
// ============================================
// Remove entradas mockadas que usam o domínio @geekverse.com
// (gerado exclusivamente pelo seedMockData). Resultados reais
// usam o e-mail real do jogador, nunca @geekverse.com.
// Roda uma vez por carregamento do módulo; só grava se houve remoção.

function purgeLegacyMockData() {
  try {
    const all = getAllResults();
    if (all.length === 0) return;
    const clean = all.filter(
      (r) => !r.playerEmail || !r.playerEmail.endsWith('@geekverse.com')
    );
    if (clean.length < all.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      if (import.meta.env.DEV) {
        console.log(
          `[rankingService] ${all.length - clean.length} registro(s) mock removido(s) do localStorage.`
        );
      }
    }
  } catch {
    // Falha silenciosa — não impede o funcionamento do ranking
  }
}

// Executa a limpeza automaticamente ao importar o módulo
purgeLegacyMockData();

// ============================================
// SUPABASE — integração global
// ============================================

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

// ============================================
// SAVE — salva no Supabase e/ou localStorage
// ============================================

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

// ============================================
// QUERIES — locais (síncronas, para fallback)
// ============================================

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

// ============================================
// QUERIES ASYNC — Supabase (global)
// ============================================
// Usadas pelo DifficultyRankingCard para buscar dados globais.
// Se Supabase não estiver configurado ou falhar, retorna dados do localStorage.

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

// ============================================
// DADOS SIMULADOS PARA VISUALIZAÇÃO
// ============================================
// Dados temporários para visualização.
// Remover ou substituir quando os jogos salvarem resultados reais.
// Para ativar: chamar seedMockData() uma vez (ex: no console ou num useEffect temporário).

const MOCK_NAMES = [
  'Ítalo', 'Luna', 'Arthur', 'Helena', 'Mateus',
  'Sofia', 'Lucas', 'Valentina', 'Pedro', 'Alice',
  'Kaio', 'Beatriz', 'Gabriel', 'Manuela', 'Rafael',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockHarryMemory(difficulty, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const name = MOCK_NAMES[i % MOCK_NAMES.length];
    const time = randomBetween(45, 300);
    results.push({
      id: generateId(),
      gameId: 'harry-memory',
      gameName: 'Memória dos Bruxos',
      playerName: name,
      playerEmail: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@geekverse.com`,
      difficulty,
      status: 'completed',
      score: null,
      timeInSeconds: time,
      formattedTime: formatTime(time),
      attempts: randomBetween(15, 60),
      errors: 0,
      hits: 0,
      pairs: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 25,
      hints: 0,
      penalties: 0,
      crystals: 0,
      obstaclesDodged: 0,
      collisions: 0,
      mainMetric: time,
      createdAt: new Date(Date.now() - randomBetween(0, 7 * 86400000)).toISOString(),
    });
  }
  return results;
}

function generateMockPokeSombra(difficulty, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const name = MOCK_NAMES[i % MOCK_NAMES.length];
    const time = randomBetween(45, 180);
    const errors = randomBetween(0, 5);
    const hints = randomBetween(0, 3);
    const penalties = errors * 10 + hints * 5;
    const finalTime = time + penalties;
    results.push({
      id: generateId(),
      gameId: 'pokesombra',
      gameName: 'PokeSombra',
      playerName: name,
      playerEmail: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@geekverse.com`,
      difficulty,
      status: 'completed',
      score: randomBetween(500, 5000),
      timeInSeconds: finalTime,
      formattedTime: formatTime(finalTime),
      attempts: randomBetween(1, 10),
      errors,
      hits: 0,
      pairs: 0,
      hintsUsed: hints,
      hints,
      penalties,
      crystals: 0,
      obstaclesDodged: 0,
      collisions: 0,
      mainMetric: formatTime(finalTime),
      createdAt: new Date(Date.now() - randomBetween(0, 7 * 86400000)).toISOString(),
    });
  }
  return results;
}

function generateMockGeneric(gameId, gameName, difficulty, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const name = MOCK_NAMES[i % MOCK_NAMES.length];
    const score = randomBetween(500, 5000);
    const time = randomBetween(30, 180);
    results.push({
      id: generateId(),
      gameId,
      gameName,
      playerName: name,
      playerEmail: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@geekverse.com`,
      difficulty,
      status: 'completed',
      score,
      timeInSeconds: time,
      formattedTime: formatTime(time),
      attempts: randomBetween(1, 30),
      errors: randomBetween(0, 10),
      hits: randomBetween(5, 30),
      pairs: 0,
      hints: randomBetween(0, 5),
      penalties: randomBetween(0, 3),
      crystals: randomBetween(0, 20),
      obstaclesDodged: randomBetween(5, 50),
      collisions: randomBetween(0, 8),
      mainMetric: score,
      createdAt: new Date(Date.now() - randomBetween(0, 7 * 86400000)).toISOString(),
    });
  }
  return results;
}

export function seedMockData() {
  // Não sobrescreve se já houver dados
  const existing = getAllResults();
  if (existing.length > 0) {
    // Força a atualização dos mocks para PokeSombra caso os antigos usem score
    const hasOldPokeSombra = existing.some(r => r.gameId === 'pokesombra' && typeof r.mainMetric === 'number');
    if (hasOldPokeSombra) {
       const filtered = existing.filter(r => r.gameId !== 'pokesombra');
       let pokeMocks = [];
       const diffs = ['easy', 'medium', 'challenge'];
       diffs.forEach((d) => { pokeMocks = pokeMocks.concat(generateMockPokeSombra(d, 12)); });
       localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, ...pokeMocks]));
    }
    return;
  }

  let all = [];
  const diffs = ['easy', 'medium', 'challenge'];

  diffs.forEach((d) => {
    all = all.concat(generateMockHarryMemory(d, 12));
    all = all.concat(generateMockPokeSombra(d, 12));
    all = all.concat(generateMockGeneric('show-multiverso', 'Show do Multiverso', d, 12));
    all = all.concat(generateMockGeneric('fuga-hiperespaco', 'Fuga do Hiperespaço', d, 12));
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
