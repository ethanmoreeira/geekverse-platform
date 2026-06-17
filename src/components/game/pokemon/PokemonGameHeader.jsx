
// Cabecalho do jogo PokeSombra durante a partida.
// Mostra nivel, alvo atual, progresso, tempo, penalidades, erros e contador de dicas.

import { FaBullseye, FaLayerGroup } from 'react-icons/fa';
import { MAX_HINTS_PER_TARGET } from '../../../data/pokemonGameConfig';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PokemonGameHeader = ({
  levelLabel,
  currentTarget,
  currentTargetIndex,
  targetsCount,
  elapsedSeconds,
  penaltySeconds,
  mistakes,
  // Contador de dicas do alvo atual
  currentHintIndex,
}) => {
  const finalTime = elapsedSeconds + penaltySeconds;

  return (
    <div className="pks-header">
      <div className="pks-header-row">
        {/* Lado Esquerdo: Nivel, Alvo */}
        <div className="pks-header-group pks-header-left">
          {/* Nivel */}
          <div className="pks-header-stat pks-stat-secondary">
            <FaLayerGroup className="pks-header-icon" />
            <span className="pks-header-value">{levelLabel}</span>
          </div>

          {/* Alvo atual */}
          <div className="pks-header-stat pks-header-stat-target pks-stat-primary">
            <FaBullseye className="pks-header-icon" />
            <span className="pks-header-label pks-target-label">ALVO</span>
            <span className="pks-header-value pks-target-value">
              {currentTarget ? currentTarget.displayName : '---'}
            </span>
          </div>
        </div>

        {/* Lado Direito: Indicadores de Status e Espaco Futuro */}
        <div className="pks-header-group pks-header-right">
          {/* Progresso */}
          <div className="pks-header-stat pks-stat-primary">
            <span className="pks-header-label">Progresso</span>
            <span className="pks-header-value">
              {currentTargetIndex}/{targetsCount}
            </span>
          </div>

          {/* Tempo final (cronometro + penalidade) */}
          <div className="pks-header-stat pks-stat-primary">
            <span className="pks-header-label">Tempo</span>
            <span className="pks-header-value">{formatTime(finalTime)}</span>
          </div>

          {/* Penalidade acumulada */}
          <div className="pks-header-stat pks-stat-secondary">
            <span className="pks-header-label">Penalidade</span>
            <span className="pks-header-value">+{penaltySeconds}s</span>
          </div>

          {/* Erros */}
          <div className="pks-header-stat pks-stat-secondary">
            <span className="pks-header-label">Erros</span>
            <span className="pks-header-value">{mistakes}</span>
          </div>

          {/* Contador de dicas do alvo atual */}
          <div className="pks-header-stat pks-stat-secondary">
            <span className="pks-header-label">Dicas usadas</span>
            <span className="pks-header-value">
              {currentHintIndex}/{MAX_HINTS_PER_TARGET}
            </span>
          </div>

          {/* Area futura: Botoes de Som e Pausa */}
          <div className="pks-header-future-actions" aria-hidden="true">
             {/* Reservado */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonGameHeader;
