// PlanetCard.jsx
// Card de planeta para a tela de montagem da missão Star Wars.
// Exibe dados normalizados da SWAPI com espaço reservado para imagem.

import { GiPlanetCore } from 'react-icons/gi';

const ENV_LABELS = {
  neutral: 'Neutro',
  rocky: 'Rochoso',
  desert: 'Deserto',
  organic: 'Orgânico',
  frozen: 'Congelado',
  aquatic: 'Aquático',
  urban: 'Urbano',
  gas: 'Gasoso',
};

const isValidValue = (value) => {
  if (value === undefined || value === null) return false;
  const normalized = String(value).trim().toLowerCase();
  return (
    normalized !== "" &&
    normalized !== "unknown" &&
    normalized !== "n/a" &&
    normalized !== "none" &&
    normalized !== "desconhecido" &&
    normalized !== "desconhecida" &&
    normalized !== "nan"
  );
};

import planetaDeserticoImg from '../../../assets/backgrounds/star-wars/planeta_desertico_espaco.png';
import planetaVerdeAzulImg from '../../../assets/backgrounds/star-wars/planeta_verde_azul_espaco.png';
import luaTropicalImg from '../../../assets/backgrounds/star-wars/lua_tropical_espaco.png';
import planetaGeladoImg from '../../../assets/backgrounds/star-wars/planeta_gelado_espaco.png';
import planetaPantanosoImg from '../../../assets/backgrounds/star-wars/planeta_pantanoso_espaco.png';
import planetaGasosoImg from '../../../assets/backgrounds/star-wars/planeta_gasoso_espaco.png';

const PlanetCard = ({ planet, isSelected, onSelect }) => {
  const dangerLevel = `Perigo ${'█'.repeat(planet.planetDanger)}${'░'.repeat(5 - planet.planetDanger)}`;

  return (
    <div
      className={`sw-card sw-card-compact ${isSelected ? 'sw-card-selected' : ''}`}
      onClick={() => onSelect(planet)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(planet)}
      aria-label={`Selecionar planeta ${planet.name}`}
      aria-pressed={isSelected}
    >
      {planet.name === 'Tatooine' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${planetaDeserticoImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : planet.name === 'Alderaan' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${planetaVerdeAzulImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : planet.name === 'Yavin IV' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${luaTropicalImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : planet.name === 'Hoth' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${planetaGeladoImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : planet.name === 'Dagobah' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${planetaPantanosoImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : planet.name === 'Bespin' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${planetaGasosoImg})`,
            backgroundSize: '150%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : (
        <div 
          className="sw-card-image-placeholder sw-card-image-planet sw-card-image-compact"
          style={{ height: '160px' }}
        >
          <GiPlanetCore className="sw-card-placeholder-icon" style={{ fontSize: '3rem' }} />
        </div>
      )}

      <div className="sw-card-body sw-card-body-compact">
        <h4 className="sw-card-title">{planet.name}</h4>
        {isValidValue(planet.climate) && (
          <p className="sw-card-subtitle">{planet.climate}</p>
        )}

        <div className="sw-card-info sw-card-info-compact">
          {isValidValue(planet.terrain) && (
            <span className="sw-card-info-item"><strong>Terreno:</strong> {planet.terrain}</span>
          )}
          {isValidValue(planet.gravity) && (
            <span className="sw-card-info-item"><strong>Gravidade:</strong> {planet.gravity}x</span>
          )}
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-danger" title={`Perigo: ${planet.planetDanger}/5`}>{dangerLevel}</span>
          {isValidValue(planet.environmentType) && (
            <span className="sw-badge sw-badge-env">{ENV_LABELS[planet.environmentType] || planet.environmentType}</span>
          )}
          {planet.handlingPenalty > 0 && (
            <span className="sw-badge sw-badge-penalty" title="Penalidade de controle">Controle -{planet.handlingPenalty}</span>
          )}
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default PlanetCard;
