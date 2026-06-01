// RankingGameDetails.jsx
// Página de ranking específica de um jogo.
// Rota: /app/ranking/:gameId
// Mostra 3 cards (Fácil, Médio, Difícil) com pódio e classificação.

import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import bgImg from '../../assets/backgrounds/ranking/geekverse_g8_dark_cinematic.png';
import DifficultyRankingCard from '../../components/ranking/DifficultyRankingCard';
import { RANKING_GAMES, DIFFICULTIES } from '../../services/rankingService';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/ranking.css';

const CRITERIA_UI = {
  'harry-memory': {
    main: 'Menor tempo vence',
    tie: 'Desempate: tentativas'
  },
  'pokesombra': {
    main: 'Menor tempo final vence',
    tie: 'Desempate: erros e dicas'
  },
  'show-multiverso': {
    main: 'Maior pontuação vence',
    tie: 'Desempate: tempo, dicas e erros'
  },
  'fuga-hiperespaco': {
    main: 'Maior pontuação vence',
    tie: 'Desempate: colisões e cristais'
  }
};

const RankingGameDetails = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const game = RANKING_GAMES[gameId];
  const customCriterion = CRITERIA_UI[gameId];

  // gameId inválido
  if (!game) {
    return (
      <div className="rk-page">
        <div className="rk-error">
          <FaExclamationTriangle className="rk-error-icon" />
          <h2>Jogo não encontrado</h2>
          <p>O ranking "{gameId}" não existe. Verifique o endereço ou volte ao Hall dos Campeões.</p>
          <button
            className="rk-btn-back"
            onClick={() => navigate('/app/ranking')}
          >
            <FaArrowLeft /> Voltar ao Hall dos Campeões
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `linear-gradient(rgba(5, 6, 20, 0.28), rgba(5, 6, 20, 0.45)), url(${bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'saturate(1.3) brightness(1.1)',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <div className="rk-page" data-game-id={gameId}>
        <div className="rk-back-bar">
          <button
            className="rk-btn-back"
            onClick={() => navigate('/app/ranking')}
          >
            <FaArrowLeft /> Voltar ao Hall dos Campeões
          </button>
        </div>

        <div className="rk-detail-header">
          {customCriterion ? (
            <div className="rk-criterion-card">
              <div className="rk-detail-api">{game.api}</div>
              <p className="rk-criterion-main">{customCriterion.main}</p>
              <p className="rk-criterion-tie">{customCriterion.tie}</p>
            </div>
          ) : (
            <div className="rk-criterion-card">
              <div className="rk-detail-api">{game.api}</div>
              <p className="rk-detail-criterion">{game.criterion}</p>
            </div>
          )}
        </div>

        <div className="rk-difficulties-grid">
          {DIFFICULTIES.map((diff) => (
            <DifficultyRankingCard
              key={diff.key}
              gameId={gameId}
              difficulty={diff.key}
              difficultyLabel={diff.label}
              currentUserEmail={user?.email}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default RankingGameDetails;
