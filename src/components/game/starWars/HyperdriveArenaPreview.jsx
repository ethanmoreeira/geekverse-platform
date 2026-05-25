// HyperdriveArenaPreview.jsx
// Esqueleto visual da futura arena do jogo (sem física/canvas).
// Apenas mostra o layout visual que será usado no futuro.

import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import { GiSpaceship } from 'react-icons/gi';

const HyperdriveArenaPreview = ({ missionStats, starship, onSimulateResult, onBackToBuilder }) => {
  return (
    <div className="sw-arena-preview">
      {/* Arena visual (esqueleto) */}
      <div className="sw-arena-viewport">
        {/* Fundo estrelado estilizado em CSS */}
        <div className="sw-arena-stars" />

        {/* HUD Preview */}
        <div className="sw-hud-preview">
          <div className="sw-hud-row">
            <div className="sw-hud-item">
              <span className="sw-hud-label">VEL</span>
              <span className="sw-hud-value">{missionStats?.finalSpeed || 0}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">ESCUDO</span>
              <span className="sw-hud-value">{missionStats?.finalShield || 0}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">CONTROLE</span>
              <span className="sw-hud-value">{missionStats?.finalHandling || 0}</span>
            </div>
          </div>
          <div className="sw-hud-row">
            <div className="sw-hud-item sw-hud-lives">
              <span className="sw-hud-label">VIDAS</span>
              <span className="sw-hud-value">
                {'❤️'.repeat(missionStats?.finalLives || 3)}
              </span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">TEMPO</span>
              <span className="sw-hud-value">{missionStats?.duration || 0}s</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">RISCO</span>
              <span className="sw-hud-value">{missionStats?.riskLevel || '?'}</span>
            </div>
          </div>
        </div>

        {/* Nave placeholder no centro */}
        <div className="sw-arena-ship">
          <GiSpaceship className="sw-arena-ship-icon" />
          <span className="sw-arena-ship-label">{starship?.name || 'Nave'}</span>
        </div>

        {/* Asteroides placeholder */}
        <div className="sw-arena-asteroid sw-arena-asteroid-1">☄️</div>
        <div className="sw-arena-asteroid sw-arena-asteroid-2">🪨</div>
        <div className="sw-arena-asteroid sw-arena-asteroid-3">☄️</div>

        {/* Aviso de preview */}
        <div className="sw-arena-preview-badge">
          ⚠️ PREVIEW — Mecânica será implementada na próxima etapa
        </div>
      </div>

      {/* Ações */}
      <div className="sw-arena-actions">

        <button
          className="sw-btn sw-btn-primary"
          onClick={onSimulateResult}
          type="button"
        >
          <FaPlay /> Simular Resultado
        </button>
      </div>
    </div>
  );
};

export default HyperdriveArenaPreview;
