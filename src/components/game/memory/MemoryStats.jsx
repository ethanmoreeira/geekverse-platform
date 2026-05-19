// MemoryStats.jsx
// Estatísticas do jogo da memória.
// Mostra tentativas, pares encontrados, dificuldade atual e tempo de partida.

import { FaSearch, FaCheckCircle, FaStar, FaHourglass } from 'react-icons/fa';

const MemoryStats = ({ attempts, pairsFound, totalPairs, difficultyLabel, elapsedTime, formatTime }) => {
  return (
    <div className="gv-memory-stats" id="game-stats">
      <div className="gv-stat-item" id="stat-attempts">
        <FaSearch className="gv-stat-icon" />
        <span className="gv-stat-value">{attempts}</span>
        <span className="gv-stat-label">Tentativas</span>
      </div>
      <div className="gv-stat-item" id="stat-pairs">
        <FaCheckCircle className="gv-stat-icon" />
        <span className="gv-stat-value">{pairsFound}/{totalPairs}</span>
        <span className="gv-stat-label">Pares</span>
      </div>
      <div className="gv-stat-item" id="stat-difficulty">
        <FaStar className="gv-stat-icon" />
        <span className="gv-stat-value">{difficultyLabel}</span>
        <span className="gv-stat-label">Dificuldade</span>
      </div>
      <div className="gv-stat-item gv-stat-timer" id="stat-timer">
        <FaHourglass className="gv-stat-icon gv-hourglass-spin" />
        <span className="gv-stat-value">{formatTime(elapsedTime)}</span>
        <span className="gv-stat-label">Tempo</span>
      </div>
    </div>
  );
};

export default MemoryStats;

