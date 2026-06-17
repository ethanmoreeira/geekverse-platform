const HyperdriveHUD = ({ g, difficultyLabel }) => {
  return (
    <div className="sw-game-hud">
      <div className="sw-hud-item">
        <span className="sw-hud-label">TEMPO</span>
        <span className="sw-hud-value">{g.timeLeft}s</span>
      </div>
      <div className="sw-hud-item sw-hud-lives">
        <span className="sw-hud-label">VIDAS</span>
        <span className="sw-hud-value">{g.lives}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">PONTOS</span>
        <span className="sw-hud-value">{Math.max(0, g.score)}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">CRISTAIS</span>
        <span className="sw-hud-value">{g.crystalsCollected}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">HIPERCRISTAIS</span>
        <span className="sw-hud-value" style={{ color: '#7dd3fc', textShadow: '0 0 5px rgba(125,211,252,0.5)' }}>{g.hyperCrystalsCollected}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">DESVIOS</span>
        <span className="sw-hud-value">{g.obstaclesDodged}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">COLISOES</span>
        <span className="sw-hud-value">{g.collisions}</span>
      </div>
      <div className="sw-hud-item">
        <span className="sw-hud-label">DIF.</span>
        <span className="sw-hud-value sw-hud-value-sm">{difficultyLabel}</span>
      </div>
    </div>
  );
};

export default HyperdriveHUD;
