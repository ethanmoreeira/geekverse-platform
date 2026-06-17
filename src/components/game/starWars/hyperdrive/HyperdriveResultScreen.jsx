import { FaRedo, FaArrowLeft, FaFileExport } from 'react-icons/fa';
import { GAME_STATUS } from './constants';
import { hasEmailExportBeenSent, buildResultKey } from '../../../../utils/emailExportControl';

const HyperdriveResultScreen = ({
  gameStatus,
  g,
  scoreMultiplier,
  crystalValue,
  collisionPenalty,
  synergyBonus,
  activeEffects,
  startGame,
  onBackToBuilder,
  isExporting,
  exportFeedback,
  onExport,
  matchKey
}) => {
  const isWin = gameStatus === GAME_STATUS.WON;
  const finalScore = Math.max(0, g.score);
  const mult = isWin ? scoreMultiplier : 1;

  const crystalsPts = Math.round(g.crystalsCollected * crystalValue * scoreMultiplier * mult);
  const hyperPts = Math.round(g.hyperCrystalsCollected * 300 * scoreMultiplier * mult);
  const dodgePts = Math.round(g.obstaclesDodged * 30 * mult);
  const colPts = Math.round(g.collisions * collisionPenalty * mult);
  const survPts = isWin ? Math.round((500 + synergyBonus) * mult) : 0;

  return (
    <div className="sw-game-result">
      <div className={`sw-result-card ${isWin ? 'sw-result-card-victory' : 'sw-result-card-defeat'}`}>
        <div className="sw-result-header">
          <h2 className="sw-result-title">
            {isWin ? 'Fuga concluida com sucesso' : 'Nave destruida'}
          </h2>
        </div>

        <div className="sw-result-body" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="sw-result-column" style={{ width: '100%', maxWidth: '450px' }}>
            <h3 className="sw-result-column-title">Resultado da Partida</h3>
            <div className="sw-result-stat sw-result-stat-highlight">
              <span className="sw-result-stat-label">Pontuacao final</span>
              <span className="sw-result-stat-value">
                {finalScore.toLocaleString('pt-BR')} pts
              </span>
            </div>
            <div className="sw-result-stats">
              <div className="sw-result-stat">
                <span className="sw-result-stat-label">Cristais</span>
                <span className="sw-result-stat-value">{g.crystalsCollected}</span>
              </div>
              {g.hyperCrystalsCollected > 0 && (
                <div className="sw-result-stat">
                  <span className="sw-result-stat-label">Hipercristais</span>
                  <span className="sw-result-stat-value sw-text-cyan-bright">{g.hyperCrystalsCollected}</span>
                </div>
              )}
              <div className="sw-result-stat">
                <span className="sw-result-stat-label">Desvios</span>
                <span className="sw-result-stat-value">{g.obstaclesDodged}</span>
              </div>
              <div className="sw-result-stat">
                <span className="sw-result-stat-label">Colisoes</span>
                <span className="sw-result-stat-value">{g.collisions}</span>
              </div>
            </div>

            <div className="sw-result-breakdown">
              <div className="sw-result-breakdown-title">Detalhamento</div>
              <div className="sw-result-breakdown-grid">
                <div className="sw-result-breakdown-item">
                  <span>Cristais ({g.crystalsCollected}):</span>
                  <span className="sw-text-cyan">+{crystalsPts}</span>
                </div>
                {g.hyperCrystalsCollected > 0 && (
                  <div className="sw-result-breakdown-item">
                    <span>Hipercristais ({g.hyperCrystalsCollected}):</span>
                    <span className="sw-text-cyan-bright">+{hyperPts}</span>
                  </div>
                )}
                <div className="sw-result-breakdown-item">
                  <span>Desvios ({g.obstaclesDodged}):</span>
                  <span className="sw-text-cyan">+{dodgePts}</span>
                </div>
                {g.collisions > 0 && (
                  <div className="sw-result-breakdown-item">
                    <span>Colisoes ({g.collisions}):</span>
                    <span className="sw-text-cyan-dim">-{colPts}</span>
                  </div>
                )}
                {isWin && (
                  <div className="sw-result-breakdown-item">
                    <span>Sobrevivencia:</span>
                    <span className="sw-text-cyan">+{survPts}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeEffects.length > 0 && (
          <details className="sw-result-effects-details">
            <summary className="sw-result-effects-summary">Ver efeitos da build</summary>
            <div className="sw-result-effects-content">
              {activeEffects.map((e, i) => (
                <div
                  key={i}
                  className={`sw-result-effect-item ${e.type === 'synergy' ? 'sw-effect-synergy' : ''}`}
                >
                  {e.text}
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="sw-result-actions">
          <button className="sw-btn sw-btn-primary" onClick={startGame} type="button">
            <FaRedo /> Jogar novamente
          </button>
          <button className="sw-btn sw-btn-secondary" onClick={onBackToBuilder} type="button">
            <FaArrowLeft /> Editar missao
          </button>
          <button
            className="sw-btn sw-btn-secondary starwars-export-button"
            type="button"
            id="btn-export-starwars"
            disabled={isExporting || (matchKey && hasEmailExportBeenSent(buildResultKey('fuga-hiperespaco', matchKey)))}
            onClick={onExport}
          >
            <FaFileExport /> {isExporting ? 'Enviando...' : (isWin ? 'Exportar resultado' : 'Exportar tentativa')}
          </button>
          {exportFeedback && (
            <span className={`gv-export-feedback gv-export-feedback--${exportFeedback.type}`}>{exportFeedback.text}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HyperdriveResultScreen;
