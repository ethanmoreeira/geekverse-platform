// MemoryStats.jsx
// Estatísticas do jogo da memória.
// Mostra tentativas, pares encontrados e dificuldade atual.

import { FaSearch, FaCheckCircle, FaStar } from 'react-icons/fa';

const MemoryStats = ({ attempts, pairsFound, totalPairs, difficultyLabel }) => {
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
    </div>
  );
};

export default MemoryStats;
