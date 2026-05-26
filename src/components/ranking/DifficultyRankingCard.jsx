// DifficultyRankingCard.jsx
// Card de ranking por dificuldade. Mostra pódio, lista 4º–10º,
// posição do jogador logado, e botões de ação.

import { useState, useMemo } from 'react';
import { FaListOl, FaFileExport, FaTrophy } from 'react-icons/fa';
import Podium from './Podium';
import RankingList from './RankingList';
import UserPositionCard from './UserPositionCard';
import {
  getTopTen,
  getUserPosition,
  getRankedResults,
  RANKING_GAMES,
} from '../../services/rankingService';

const DifficultyRankingCard = ({ gameId, difficulty, difficultyLabel, currentUserEmail }) => {
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [toast, setToast] = useState(null);

  const gameConfig = RANKING_GAMES[gameId];
  const formatMetric = gameConfig?.formatMainMetric;

  const topTen = useMemo(() => getTopTen(gameId, difficulty), [gameId, difficulty]);
  const topThree = topTen.slice(0, 3);
  const rest = topTen.slice(3);
  const allResults = useMemo(
    () => showFullRanking ? getRankedResults(gameId, difficulty) : [],
    [gameId, difficulty, showFullRanking]
  );

  const userPos = useMemo(
    () => getUserPosition(gameId, difficulty, currentUserEmail),
    [gameId, difficulty, currentUserEmail]
  );

  // Mostra "Sua colocação" apenas se fora do Top 10
  const showUserPos = userPos && userPos.position > 10;

  const handleExport = () => {
    setToast('Exportação por e-mail será configurada na próxima etapa.');
    setTimeout(() => setToast(null), 3000);
  };

  const diffClass = `rk-diff-${difficulty}`;

  const isEmpty = topTen.length === 0;

  return (
    <div className={`rk-diff-card ${diffClass}`} data-game-id={gameId}>
      <div className="rk-diff-header">
        <span className="rk-diff-label">
          <span className="rk-diff-badge" />
          {difficultyLabel}
        </span>
      </div>

      {isEmpty ? (
        <div className="rk-empty">
          <FaTrophy className="rk-empty-icon" />
          <h4>Sem campeões ainda</h4>
          <p>Jogue uma partida para inaugurar o ranking desta dificuldade.</p>
        </div>
      ) : showFullRanking ? (
        <div style={{ marginTop: 8 }}>
          <RankingList
            results={allResults}
            startPosition={1}
            formatMetric={formatMetric}
            currentUserEmail={currentUserEmail}
          />
        </div>
      ) : (
        <>
          <Podium topThree={topThree} formatMetric={formatMetric} />

          {rest.length > 0 && (
            <RankingList
              results={rest}
              startPosition={4}
              formatMetric={formatMetric}
              currentUserEmail={currentUserEmail}
            />
          )}

          {showUserPos && (
            <UserPositionCard
              position={userPos.position}
              result={userPos.result}
              formatMetric={formatMetric}
            />
          )}
        </>
      )}

      <div className="rk-actions">
        {!isEmpty && (
          <button
            className="rk-btn-action"
            onClick={() => setShowFullRanking(!showFullRanking)}
            aria-label="Ver ranking completo"
          >
            <FaListOl /> {showFullRanking ? 'Fechar' : 'Ver completo'}
          </button>
        )}
        <button
          className="rk-btn-action"
          onClick={handleExport}
          aria-label="Exportar ranking"
        >
          <FaFileExport /> Exportar
        </button>
      </div>

      {/* Toast */}
      {toast && <div className="rk-toast">{toast}</div>}
    </div>
  );
};

export default DifficultyRankingCard;
