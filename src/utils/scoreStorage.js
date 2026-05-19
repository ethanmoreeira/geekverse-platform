// scoreStorage.js
// Utilitário para ranking local do GeekVerse G8.
// Ranking separado por jogo, armazenado via localStorage.
// Não há ranking global entre computadores (sem backend/banco de dados).
//
// Depende de gameHistoryService.js para ler resultados.
// As funções aqui processam e ordenam os dados para exibição no ranking.

import { getGameResults, getResultsByGame } from '../services/gameHistoryService';

/**
 * Retorna o ranking de um jogo específico, ordenado por score (maior primeiro).
 * Apenas resultados single player são incluídos no ranking individual.
 * @param {string} gameId - ID do jogo (ex: 'harry-potter').
 * @param {number} limit - Quantidade máxima de resultados (padrão: 10).
 * @returns {Array} Ranking ordenado por score descendente.
 */
export const getRankingByGame = (gameId, limit = 10) => {
  const results = getResultsByGame(gameId);
  return sortByScore(results).slice(0, limit);
};

/**
 * Retorna o histórico geral de todos os jogos, do mais recente ao mais antigo.
 * Usado para a aba "Todos os resultados" da página Ranking.
 * @param {number} limit - Quantidade máxima (padrão: 50).
 * @returns {Array} Histórico completo ordenado por data.
 */
export const getGeneralHistory = (limit = 50) => {
  return getGameResults().slice(0, limit);
};

/**
 * Ordena resultados por score (maior primeiro).
 * Em caso de empate, ordena por menor duração.
 * @param {Array} results - Lista de resultados a ordenar.
 * @returns {Array} Lista ordenada.
 */
export const sortByScore = (results) => {
  return [...results].sort((a, b) => {
    // Maior score primeiro
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    // Em empate, menor duração vence
    return (a.durationSeconds || 0) - (b.durationSeconds || 0);
  });
};

/**
 * Retorna o melhor resultado (maior score) de um jogo específico.
 * @param {string} gameId - ID do jogo.
 * @returns {Object|null} Melhor resultado ou null.
 */
export const getBestScore = (gameId) => {
  const ranking = getRankingByGame(gameId, 1);
  return ranking.length > 0 ? ranking[0] : null;
};
