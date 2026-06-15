// PokemonLevelSelector.jsx
// Componente de seleção de nível para o jogo PokéSombra.
// Mostra três cards de nível: Fácil, Médio, Difícil.
// Apenas UI e evento, não busca API.

import { POKEMON_LEVELS } from '../../data/pokemonGameConfig';

const LEVEL_COLORS = {
  easy: '#22c55e',
  medium: '#f59e0b',
  hard: '#ef4444',
};

const PokemonLevelSelector = ({ onSelectLevel }) => {
  return (
    <div className="pks-level-grid">
      {Object.values(POKEMON_LEVELS).map((level) => {
        const color = LEVEL_COLORS[level.id];
        return (
          <div key={level.id} className="pks-level-item">
            <div
              className={`pks-level-orb ${level.id}`}
              style={{ '--level-color': color }}
              onClick={() => onSelectLevel(level.id)}
              role="button"
              tabIndex={0}
              aria-label={`Selecionar nível ${level.label}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectLevel(level.id);
                }
              }}
            >
              <div className="pks-level-orb-content">
                <h3 className="pks-level-title">{level.label}</h3>
                <div className="pks-level-meta">
                  <span>{level.boardSize} silhuetas &bull; {level.targetsCount} alvos</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PokemonLevelSelector;
