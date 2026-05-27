// PokemonResultScreen.jsx
// Tela final do jogo PokéSombra.
// Mostra resumo da partida, Pokémon encontrados e JSON formatado.

import { FaTrophy, FaRedo, FaArrowLeft, FaClock, FaExclamationTriangle, FaLightbulb, FaStopwatch } from 'react-icons/fa';
import { GiPodiumWinner } from 'react-icons/gi';
import JsonViewer from '../feedback/JsonViewer';
import { translateType } from '../../data/pokemonGameConfig';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PokemonResultScreen = ({
  levelConfig,
  foundPokemon,
  elapsedSeconds,
  penaltySeconds,
  mistakes,
  hintsUsed,
  onPlayAgain,
  onChooseLevel,
  onBack,
}) => {
  const finalTime = elapsedSeconds + penaltySeconds;

  const resultData = {
    gameId: 'pokemon',
    gameName: 'PokéSombra',
    mode: levelConfig.label,
    boardSize: levelConfig.boardSize,
    targetsCount: levelConfig.targetsCount,
    foundCount: foundPokemon.length,
    elapsedSeconds,
    penaltySeconds,
    finalTime,
    mistakes,
    hintsUsed,
    result: 'completed',
    foundPokemon: foundPokemon.map((p) => ({
      id: p.id,
      name: p.displayName,
      types: p.types.map(translateType),
    })),
    apiData: foundPokemon.map((p) => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      types: p.types,
      abilities: p.abilities,
      heightMeters: p.heightMeters,
      weightKg: p.weightKg,
      baseExperience: p.baseExperience,
      stats: p.stats,
    })),
  };

  return (
    <div className="pks-result-screen">
      <div className="pks-result-card">
        <div className="pks-result-icon">
          <FaTrophy />
        </div>

        <h2 className="pks-result-title">Caçada Completa!</h2>
        <p className="pks-result-subtitle">
          Você encontrou todos os Pokémon no nível {levelConfig.label}.
        </p>

        <div className="pks-result-found-grid">
          {foundPokemon.map((p) => (
            <div key={p.id} className="pks-result-found-item">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.displayName}
                  className="pks-result-found-img"
                  draggable="false"
                />
              )}
              <span className="pks-result-found-name">{p.displayName}</span>
            </div>
          ))}
        </div>

        <div className="pks-result-stats">
          <div className="pks-result-stat">
            <FaClock className="pks-result-stat-icon" />
            <span className="pks-result-stat-value">{formatTime(elapsedSeconds)}</span>
            <span className="pks-result-stat-label">Tempo Real</span>
          </div>
          <div className="pks-result-stat">
            <FaExclamationTriangle className="pks-result-stat-icon" />
            <span className="pks-result-stat-value">+{penaltySeconds}s</span>
            <span className="pks-result-stat-label">Penalidades</span>
          </div>
          <div className="pks-result-stat">
            <FaStopwatch className="pks-result-stat-icon" />
            <span className="pks-result-stat-value">{formatTime(finalTime)}</span>
            <span className="pks-result-stat-label">Tempo Final</span>
          </div>
          <div className="pks-result-stat">
            <FaExclamationTriangle className="pks-result-stat-icon pks-icon-error" />
            <span className="pks-result-stat-value">{mistakes}</span>
            <span className="pks-result-stat-label">Erros</span>
          </div>
          <div className="pks-result-stat">
            <FaLightbulb className="pks-result-stat-icon pks-icon-hint" />
            <span className="pks-result-stat-value">{hintsUsed}</span>
            <span className="pks-result-stat-label">Dicas totais</span>
          </div>
        </div>

        <div className="pks-result-actions">
          <button
            className="pks-btn-primary"
            onClick={onPlayAgain}
            type="button"
            id="pks-btn-play-again"
          >
            <FaRedo /> Jogar Novamente
          </button>
          <button
            className="pks-btn-secondary"
            onClick={onChooseLevel}
            type="button"
            id="pks-btn-choose-level"
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <JsonViewer
          data={resultData}
          title="Dados da Rodada - PokéSombra (JSON)"
        />
      </div>
    </div>
  );
};

export default PokemonResultScreen;
