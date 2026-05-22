// StarWarsResultPreview.jsx
// Preview da tela de resultado futura.
// Mostra esqueleto de como será exibido o resultado do jogo.

import { FaArrowLeft, FaRedo, FaTrophy } from 'react-icons/fa';

const StarWarsResultPreview = ({ missionStats, starship, pilot, planet, onBackToBuilder }) => {
  return (
    <div className="sw-result-preview">
      <div className="sw-result-card">
        <div className="sw-result-header">
          <FaTrophy className="sw-result-trophy" />
          <h2 className="sw-result-title">Missão Concluída!</h2>
          <p className="sw-result-subtitle">
            (Preview — resultado real será calculado na próxima etapa)
          </p>
        </div>

        <div className="sw-result-stats">
          <div className="sw-result-stat">
            <span className="sw-result-stat-label">Nave</span>
            <span className="sw-result-stat-value">{starship?.name || '—'}</span>
          </div>
          <div className="sw-result-stat">
            <span className="sw-result-stat-label">Piloto</span>
            <span className="sw-result-stat-value">{pilot?.name || '—'}</span>
          </div>
          <div className="sw-result-stat">
            <span className="sw-result-stat-label">Destino</span>
            <span className="sw-result-stat-value">{planet?.name || '—'}</span>
          </div>
          <div className="sw-result-stat">
            <span className="sw-result-stat-label">Dificuldade</span>
            <span className="sw-result-stat-value">{missionStats?.difficultyLabel || '—'}</span>
          </div>
          <div className="sw-result-stat sw-result-stat-highlight">
            <span className="sw-result-stat-label">Score Estimado</span>
            <span className="sw-result-stat-value">
              {missionStats?.scorePreview?.toLocaleString('pt-BR') || 0} pts
            </span>
          </div>
          <div className="sw-result-stat">
            <span className="sw-result-stat-label">Risco</span>
            <span className="sw-result-stat-value">{missionStats?.riskLevel || '—'}</span>
          </div>
        </div>

        {/* Preview badge */}
        <div className="sw-arena-preview-badge" style={{ marginTop: 24 }}>
          ⚠️ PREVIEW — Score real, ranking e histórico serão implementados na próxima etapa
        </div>

        {/* Ações */}
        <div className="sw-result-actions">
          <button
            className="sw-btn sw-btn-primary"
            onClick={onBackToBuilder}
            type="button"
          >
            <FaRedo /> Nova Missão
          </button>
          <button
            className="sw-btn sw-btn-secondary"
            onClick={onBackToBuilder}
            type="button"
          >
            <FaArrowLeft /> Voltar à Montagem
          </button>
        </div>
      </div>
    </div>
  );
};

export default StarWarsResultPreview;
