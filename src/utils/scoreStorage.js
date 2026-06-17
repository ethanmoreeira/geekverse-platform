// Arquivo responsável por organizar o Ranking (Placar) do site.
// Ele lê os resultados salvos no navegador e cria o pódio de cada jogo.

import { getGameResults, getResultsByGame } from '../services/gameHistoryService';

// Pega a lista de vitórias de um jogo (ex: Star Wars) e separa os Top 10 melhores jogadores.
export const getRankingByGame = (gameId, limit = 10) => {
  const results = getResultsByGame(gameId);
  return sortByScore(results).slice(0, limit);
};

// Pega todo o histórico de tudo que já foi jogado no site, misturando todos os jogos.
// Serve para preencher a aba "Todos os resultados" lá na tela de Ranking.
export const getGeneralHistory = (limit = 50) => {
  return getGameResults().slice(0, limit);
};

// A "Calculadora de Empate".
// Essa função pega uma lista de jogadores e coloca quem tem mais ponto em cima.
// Se duas pessoas tiverem a mesma pontuação, ela olha no relógio e dá a vitória
// para quem terminou o jogo mais rápido!
export const sortByScore = (results) => {
  return [...results].sort((a, b) => {
    // Quem tem o score maior fica na frente
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    // Desempate: quem jogou no menor tempo ganha a posição
    return (a.durationSeconds || 0) - (b.durationSeconds || 0);
  });
};

// Busca quem é o Top 1 (o Rei) de um jogo específico.
export const getBestScore = (gameId) => {
  const ranking = getRankingByGame(gameId, 1);
  return ranking.length > 0 ? ranking[0] : null;
};
