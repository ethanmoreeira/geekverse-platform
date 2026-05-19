// gameHistoryService.js
// Serviço de histórico de partidas jogadas no GeekVerse G8.
// Salva e recupera resultados no localStorage.
// Usado para ranking local (separado por jogo), exportação e auditoria.
//
// Estrutura de resultado single player:
// {
//   id,            — identificador único (gerado automaticamente)
//   gameId,        — ex: 'harry-potter', 'pokemon', 'rick-morty', etc.
//   gameName,      — ex: 'Memória dos Bruxos'
//   playerName,    — nome do jogador
//   mode,          — 'single' ou 'localMultiplayer'
//   difficulty,    — 'easy', 'medium', 'challenge' (quando aplicável)
//   score,         — pontuação numérica
//   durationSeconds, — duração da partida em segundos
//   attempts,      — número de tentativas
//   status,        — 'victory', 'defeat', 'timeout', etc.
//   createdAt,     — data/hora ISO string
//   summary,       — resumo textual legível
//   rawData        — dados brutos da API usados na partida (para JSON formatado)
// }
//
// Estrutura de resultado multiplayer local:
// {
//   id,
//   gameId,
//   gameName,
//   mode,          — 'localMultiplayer'
//   players,       — [{ name, score }]
//   winner,        — nome do vencedor
//   createdAt,
//   summary,
//   rawData
// }

const STORAGE_KEY = 'geekverse_game_history';

/**
 * Gera um ID único simples para cada resultado.
 */
const generateId = () => {
  return `result_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Lê todos os resultados do localStorage.
 * @returns {Array} Lista de resultados ou array vazio.
 */
const readAll = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Persiste a lista completa de resultados no localStorage.
 * @param {Array} results - Lista de resultados a salvar.
 */
const writeAll = (results) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (err) {
    console.error('gameHistoryService: Erro ao salvar no localStorage', err);
  }
};

/**
 * Salva um novo resultado de partida no histórico.
 * O campo id e createdAt são preenchidos automaticamente se não informados.
 * @param {Object} result - Dados do resultado da partida.
 * @returns {Object} O resultado salvo com id e createdAt.
 */
export const saveGameResult = (result) => {
  const entry = {
    ...result,
    id: result.id || generateId(),
    createdAt: result.createdAt || new Date().toISOString(),
  };

  const all = readAll();
  all.unshift(entry); // Mais recente primeiro
  writeAll(all);

  return entry;
};

/**
 * Retorna todos os resultados salvos, ordenados do mais recente ao mais antigo.
 * @returns {Array} Lista completa de resultados.
 */
export const getGameResults = () => {
  return readAll();
};

/**
 * Retorna apenas os resultados de um jogo específico.
 * @param {string} gameId - ID do jogo (ex: 'harry-potter').
 * @returns {Array} Resultados filtrados por gameId.
 */
export const getResultsByGame = (gameId) => {
  return readAll().filter((r) => r.gameId === gameId);
};

/**
 * Remove todos os resultados do histórico.
 */
export const clearGameResults = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('gameHistoryService: Erro ao limpar histórico', err);
  }
};

/**
 * Remove um resultado específico pelo id.
 * @param {string} resultId - ID do resultado a remover.
 * @returns {boolean} true se removido, false se não encontrado.
 */
export const removeGameResult = (resultId) => {
  const all = readAll();
  const filtered = all.filter((r) => r.id !== resultId);

  if (filtered.length === all.length) {
    return false; // Não encontrou
  }

  writeAll(filtered);
  return true;
};
