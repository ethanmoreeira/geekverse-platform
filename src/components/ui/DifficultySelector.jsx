// DifficultySelector.jsx
// Seletor de dificuldade para jogos com múltiplos níveis.
// Níveis: Fácil, Médio, Desafio (usado em Memória dos Bruxos).

import { DIFFICULTIES } from '../../utils/difficultyConfig';

const DIFFICULTY_DESCRIPTIONS = {
  easy: '15 pares · 30 cartas',
  medium: '20 pares · 40 cartas',
  challenge: '25 pares · 50 cartas',
};

const DifficultySelector = ({ onSelect, currentDifficulty, disabled }) => {
  return (
    <div className="gv-difficulty-selector" id="difficulty-selector">
      <div className="gv-difficulty-options">
        {Object.entries(DIFFICULTIES).map(([key, config]) => (
          <button
            key={key}
            id={`difficulty-${key}`}
            className={`gv-difficulty-btn gv-difficulty-${key} ${
              currentDifficulty === key ? 'gv-difficulty-active' : ''
            }`}
            onClick={() => onSelect(key)}
            disabled={disabled}
          >
            <span className="gv-difficulty-name">{config.label}</span>
            <span className="gv-difficulty-desc">{DIFFICULTY_DESCRIPTIONS[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
