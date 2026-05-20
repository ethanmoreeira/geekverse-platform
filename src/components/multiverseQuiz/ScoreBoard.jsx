// ScoreBoard.jsx
// Painel de prêmios estilo "Show do Milhão" para o Show do Multiverso.
// Adapta-se aos valores de prêmio de cada modo.

import { FaTrophy, FaCheck, FaArrowRight } from 'react-icons/fa';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const ScoreBoard = ({ prizeValues, currentQuestionIndex, score, gameOver }) => {
  if (!prizeValues || prizeValues.length === 0) return null;

  return (
    <div className="smv-scoreboard">
      <div className="smv-scoreboard-header">
        <FaTrophy className="smv-scoreboard-icon" />
        <span className="smv-scoreboard-title">Prêmios</span>
      </div>
      <div className="smv-scoreboard-current">
        <span className="smv-scoreboard-current-label">Acumulado</span>
        <span className="smv-scoreboard-current-value">
          {formatCurrency(score)}
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
              <span className="smv-prize-value">{formatCurrency(value)}</span>
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
