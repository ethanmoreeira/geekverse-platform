
// Painel de revelação do Pokémon encontrado no jogo PokéSombra.
// Mostra imagem oficial colorida, nome, ID, tipos, altura, peso, habilidades e stats.

import { FaArrowRight, FaRulerVertical, FaWeight, FaStar } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { translateType, translatePokemonAbility, translateStat } from '../../../data/pokemonGameConfig';

const PokemonRevealPanel = ({ pokemon, onNextTarget, isLastTarget }) => {
  if (!pokemon) return null;

  return (
    <div className="pks-reveal-panel">
      <div className="pks-reveal-card">
        <div className="pks-reveal-image-wrapper">
          {pokemon.image ? (
            <img
              className="pks-reveal-image"
              src={pokemon.image}
              alt={pokemon.displayName}
              draggable="false"
            />
          ) : (
            <div className="pks-shadow-fallback pks-reveal-fallback">?</div>
          )}
        </div>

        <div className="pks-reveal-info">
          <h2 className="pks-reveal-name">{pokemon.displayName}</h2>
          <span className="pks-reveal-id">#{String(pokemon.id).padStart(3, '0')}</span>

          <div className="pks-reveal-types">
            {pokemon.types.map((type) => (
              <span key={type} className={`pks-type-badge pks-type-${type}`}>
                {translateType(type)}
              </span>
            ))}
          </div>

          <div className="pks-reveal-details">
            <div className="pks-reveal-detail">
              <FaRulerVertical className="pks-reveal-detail-icon" />
              <span>{pokemon.heightMeters != null ? `${pokemon.heightMeters} m` : '---'}</span>
            </div>
            <div className="pks-reveal-detail">
              <FaWeight className="pks-reveal-detail-icon" />
              <span>{pokemon.weightKg != null ? `${pokemon.weightKg} kg` : '---'}</span>
            </div>
            {pokemon.baseExperience && (
              <div className="pks-reveal-detail">
                <FaStar className="pks-reveal-detail-icon" />
                <span>{pokemon.baseExperience} XP</span>
              </div>
            )}
          </div>

          <div className="pks-reveal-section">
            <h4 className="pks-reveal-section-title">
              <GiMuscleUp /> Habilidades
            </h4>
            <div className="pks-reveal-abilities">
              {pokemon.abilities.map((ability) => (
                <span key={ability} className="pks-ability-badge">
                  {translatePokemonAbility(ability)}
                </span>
              ))}
            </div>
          </div>

          <div className="pks-reveal-section">
            <h4 className="pks-reveal-section-title">Stats</h4>
            <div className="pks-reveal-stats">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="pks-stat-row">
                  <span className="pks-stat-name">{translateStat(stat.name)}</span>
                  <div className="pks-stat-bar-bg">
                    <div
                      className="pks-stat-bar-fill"
                      style={{ width: `${Math.min((stat.value / 255) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="pks-stat-value">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="pks-btn-next-target"
            onClick={onNextTarget}
            type="button"
            id="pks-btn-next-target"
          >
            {isLastTarget ? 'Ver Resultado' : 'Próximo alvo'} <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PokemonRevealPanel;
