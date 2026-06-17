// Serviço de Histórico: O caderno de anotações do jogo!
// Tudo o que o jogador faz (vitórias, derrotas, tempo, pontuação) é salvo aqui na memória do navegador (localStorage).
// É daqui que a página de Ranking e a de Exportar por E-mail tiram os dados para mostrar para o usuário.

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

