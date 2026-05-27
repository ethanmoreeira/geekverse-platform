// DifficultyRankingCard.jsx
// Card de ranking por dificuldade. Mostra pódio, lista 4º–10º,
// posição do jogador logado, e botões de ação.
// Fonte oficial: Supabase (global). Fallback: localStorage.

import { useState, useEffect } from 'react';
import { FaListOl, FaFileExport } from 'react-icons/fa';
import Podium from './Podium';
import RankingList from './RankingList';
import UserPositionCard from './UserPositionCard';
import {
  getTopTen,
  getRankedResults,
  getUserPosition,
  fetchTopTen,
  fetchRankedResults,
  fetchUserPosition,
  RANKING_GAMES,
} from '../../services/rankingService';
import { isSupabaseConfigured } from '../../services/supabaseClient';

const DifficultyRankingCard = ({ gameId, difficulty, difficultyLabel, currentUserEmail }) => {
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [toast, setToast] = useState(null);

  const gameConfig = RANKING_GAMES[gameId];
  const formatMetric = gameConfig?.formatMainMetric;

  // Se Supabase configurado: iniciar vazio (traços) e esperar resposta global.
  // Se não configurado: usar localStorage imediatamente.
  const [topTen, setTopTen] = useState(() =>
    isSupabaseConfigured ? [] : getTopTen(gameId, difficulty)
  );
  const [allResults, setAllResults] = useState([]);
  const [userPos, setUserPos] = useState(() =>
    isSupabaseConfigured ? null : getUserPosition(gameId, difficulty, currentUserEmail)
  );

  // Busca dados da fonte oficial ao montar
  useEffect(() => {
    let cancelled = false;

    fetchTopTen(gameId, difficulty).then((data) => {
      if (!cancelled) setTopTen(data);
    });

    fetchUserPosition(gameId, difficulty, currentUserEmail).then((pos) => {
      if (!cancelled) setUserPos(pos);
    });

    return () => { cancelled = true; };
  }, [gameId, difficulty, currentUserEmail]);

  // Busca ranking completo quando "Ver completo" é aberto
  useEffect(() => {
    if (!showFullRanking) {
      setAllResults([]);
      return;
    }

    let cancelled = false;

    fetchRankedResults(gameId, difficulty).then((data) => {
      if (!cancelled) setAllResults(data);
    });

    return () => { cancelled = true; };
  }, [gameId, difficulty, showFullRanking]);

  const topThree = topTen.slice(0, 3);
  const rest = topTen.slice(3);

  // Mostra "Sua colocação" apenas se fora do Top 10
  const showUserPos = userPos && userPos.position > 10;

  const handleExport = () => {
    setToast('Exportação por e-mail será configurada na próxima etapa.');
    setTimeout(() => setToast(null), 3000);
  };

  const diffClass = `rk-diff-${difficulty}`;

  return (
    <div className={`rk-diff-card ${diffClass}`} data-game-id={gameId}>
      <div className="rk-diff-header">
        <span className="rk-diff-label">
          <span className="rk-diff-badge" />
          {difficultyLabel}
        </span>
      </div>

      {showFullRanking ? (
        <div style={{ marginTop: 8 }}>
          <RankingList
            results={allResults}
            startPosition={1}
            formatMetric={formatMetric}
            currentUserEmail={currentUserEmail}
            padTo={10}
          />
        </div>
      ) : (
        <>
          <Podium topThree={topThree} formatMetric={formatMetric} />

          <RankingList
            results={rest}
            startPosition={4}
            formatMetric={formatMetric}
            currentUserEmail={currentUserEmail}
            padTo={7}
          />

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
        <button
          className="rk-btn-action"
          onClick={() => setShowFullRanking(!showFullRanking)}
          aria-label="Ver ranking completo"
        >
          <FaListOl /> {showFullRanking ? 'Fechar' : 'Ver completo'}
        </button>
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

