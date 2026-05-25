// DifficultySelector.jsx
// Seletor de dificuldade para o jogo Star Wars Fuga do Hiperespaço.

import { DIFFICULTY_CONFIG } from '../../../utils/starWarsMission';



const DifficultySelector = ({ selected, onSelect }) => {
  return (
    <div className="sw-difficulty-selector">
      <div className="sw-difficulty-options">
        {Object.values(DIFFICULTY_CONFIG).map((diff) => (
          <button
            key={diff.key}
            className={`sw-difficulty-btn sw-difficulty-btn-compact ${selected === diff.key ? 'sw-difficulty-active' : ''}`}
            onClick={() => onSelect(diff.key)}
            type="button"
            aria-pressed={selected === diff.key}
            aria-label={`Dificuldade: ${diff.label}`}
            style={{ '--diff-color': diff.color }}
          >

            <div className="sw-difficulty-name-compact">{diff.label}</div>
            <div className="sw-difficulty-desc-compact">{diff.description}</div>
            <div className="sw-difficulty-stats-compact">
              <span>{diff.duration}s</span>
              <span>{diff.baseLives} vidas</span>
              <span>x{diff.scoreMultiplier}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
