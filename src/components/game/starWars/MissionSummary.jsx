
// Tela de resumo completo da missão com todos os stats calculados.
// Inclui seção "Efeitos da Combinação" com atributos finais e sinergias.

// Imports de ícones removidosnão usados neste componente.

const StatRow = ({ label, value, unit }) => (
  <div className="sw-summary-stat">
    <span className="sw-summary-stat-label">{label}</span>
    <span className="sw-summary-stat-value">
      {value}{unit ? <small> {unit}</small> : null}
    </span>
  </div>
);

const MissionSummary = ({
  starship,
  pilot,
  planet,
  vehicle,
  missionStats,
  onStartArena,
}) => {
  if (!missionStats) return null;

  const effects = missionStats.activeEffects || [];
  const synergies = effects.filter(e => e.type === 'synergy');
  const nonSynergies = effects.filter(e => e.type !== 'synergy');

  return (
    <div className="sw-mission-report">
      <div className="sw-summary-header">
        <h2 className="sw-summary-title">Relatorio da Missao</h2>
      </div>

      {/* Seleções do jogador */}
      <div className="sw-summary-selections">
        <div className="sw-summary-selection">
          <span className="sw-summary-selection-label">Nave</span>
          <span className="sw-summary-selection-value">{starship?.name || '—'}</span>
        </div>
        <div className="sw-summary-selection">
          <span className="sw-summary-selection-label">Piloto</span>
          <span className="sw-summary-selection-value">{pilot?.name || '—'}</span>
        </div>
        <div className="sw-summary-selection">
          <span className="sw-summary-selection-label">Planeta</span>
          <span className="sw-summary-selection-value">{planet?.name || '—'}</span>
        </div>
        <div className="sw-summary-selection">
          <span className="sw-summary-selection-label">Equipamento</span>
          <span className="sw-summary-selection-value">{vehicle?.name || '—'}</span>
        </div>
        <div className="sw-summary-selection">
          <span className="sw-summary-selection-label">Dificuldade</span>
          <span className="sw-summary-selection-value">{missionStats.difficultyLabel}</span>
        </div>
      </div>

      {/* Corpo em duas colunas no desktop */}
      <div className="sw-mission-report-body">
        {/* Stats calculados */}
        <div className="sw-summary-stats-grid">
          <div className="sw-summary-stats-group">
            <h3 className="sw-summary-group-title">Nave + Piloto + Equipamento</h3>
            <StatRow label="Velocidade Final" value={missionStats.finalSpeed} />
            <StatRow label="Aceleracao" value={missionStats.finalAcceleration?.toFixed(2)} />
            <StatRow label="Escudo Final" value={missionStats.finalShield} />
            <StatRow label="Controle Final" value={missionStats.finalHandling} />
            <StatRow label="Vidas" value={missionStats.finalLives} />
            <StatRow label="Hitbox" value={missionStats.shipHitboxSize} />
          </div>

          <div className="sw-summary-stats-group">
            <h3 className="sw-summary-group-title">Ambiente + Dificuldade</h3>
            <StatRow label="Perigo do Planeta" value={`${missionStats.planetDanger}/5`} />
            <StatRow label="Vel. Obstaculos" value={missionStats.obstacleSpeed || missionStats.asteroidSpeed} />
            <StatRow label="Freq. Obstaculos" value={missionStats.obstacleSpawnRate || missionStats.spawnRate} unit="ms" />
            <StatRow label="Freq. Cristais" value={missionStats.crystalSpawnRate} unit="ms" />
            <StatRow label="Duracao" value={missionStats.routeDuration || missionStats.duration} unit="s" />
            <StatRow label="Multiplicador" value={`x${missionStats.scoreMultiplier}`} />
          </div>

          <div className="sw-summary-stats-group">
            <h3 className="sw-summary-group-title">Coleta + Defesa</h3>
            <StatRow label="Valor do Cristal" value={missionStats.crystalValue} unit="pts" />
            <StatRow label="Raio de Coleta" value={missionStats.collectionRadius} />
            <StatRow label="Penalidade Colisao" value={`-${missionStats.collisionPenalty}`} unit="pts" />
            <StatRow label="Nivel de Risco" value={missionStats.riskLevel} />
            <StatRow label="Score Estimado" value={missionStats.scorePreview?.toLocaleString('pt-BR')} unit="pts" />
          </div>
        </div>

        {/* Efeitos da Combinação */}
        {effects.length > 0 && (
          <div className="sw-effects-section sw-effects-compact">
            <h3 className="sw-effects-title">Efeitos da Combinação</h3>

            {/* Attribute highlights */}
            <div className="sw-effects-attrs">
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Velocidade</span>
                <span className="sw-effects-attr-value">{missionStats.finalSpeed}</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Controle</span>
                <span className="sw-effects-attr-value">{missionStats.finalHandling}</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Escudo</span>
                <span className="sw-effects-attr-value">{missionStats.finalShield}</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Raio Coleta</span>
                <span className="sw-effects-attr-value">{missionStats.collectionRadius}</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Perigo</span>
                <span className="sw-effects-attr-value">{missionStats.planetDanger}/5</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Duracao</span>
                <span className="sw-effects-attr-value">{missionStats.routeDuration || missionStats.duration}s</span>
              </div>
              <div className="sw-effects-attr">
                <span className="sw-effects-attr-label">Multiplicador</span>
                <span className="sw-effects-attr-value">x{missionStats.scoreMultiplier}</span>
              </div>
            </div>

            {/* Effects list */}
            <ul className="sw-effects-list">
              {nonSynergies.map((e, i) => (
                <li key={i} className="sw-effect-item">
                  {e.text}
                </li>
              ))}
              {synergies.map((e, i) => (
                <li key={`syn-${i}`} className="sw-effect-item sw-effect-synergy">
                  {e.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="sw-summary-actions">

        <button
          className="sw-btn sw-btn-primary sw-btn-glow"
          onClick={onStartArena}
          type="button"
        >
          Iniciar Fuga
        </button>
      </div>
    </div>
  );
};

export default MissionSummary;
