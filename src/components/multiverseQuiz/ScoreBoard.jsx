// ScoreBoard.jsx
// Painel de pontuação estilo escada para o Show do Multiverso.
// Adapta-se aos valores de pontuação de cada modo.

import { FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const formatNumber = (value) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const ScoreBoard = ({ prizeValues, currentQuestionIndex, score, gameOver, onBack, timeStr }) => {
  if (!prizeValues || prizeValues.length === 0) return null;

  return (
    <div className="smv-scoreboard">
      <div className="smv-scoreboard-header" style={{ paddingBottom: '0', borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="smv-btn-top-back"
          onClick={onBack}
          type="button"
          id="btn-back-dashboard-playing"
        >
          <FaArrowLeft /> Voltar aos portais
        </button>
        {timeStr && (
          <span style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {timeStr}
          </span>
        )}
      </div>
      <div className="smv-scoreboard-current">
        <span className="smv-scoreboard-current-label">Prêmio atual</span>
        <span className="smv-scoreboard-current-value">
          {formatNumber(score)}
        </span>
      </div>
      <ul className="smv-prize-list">
        {[...prizeValues].reverse().map((value, reversedIdx) => {
          const idx = prizeValues.length - 1 - reversedIdx;
          const isCurrent = idx === currentQuestionIndex && !gameOver;
          const isCompleted = idx < currentQuestionIndex;

          let itemClass = 'smv-prize-item';
          if (isCurrent) itemClass += ' smv-prize-current';
          if (isCompleted) itemClass += ' smv-prize-completed';

          return (
            <li key={idx} className={itemClass}>
              <span className="smv-prize-number">{idx + 1}</span>
              <span className="smv-prize-value">{formatNumber(value)}</span>
              <span className="smv-prize-status">
                {isCompleted && <FaCheck />}
                {isCurrent && <FaArrowRight />}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ScoreBoard;
