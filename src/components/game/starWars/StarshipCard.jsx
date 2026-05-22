// StarshipCard.jsx
// Card de nave para a tela de montagem da missão Star Wars.
// Exibe dados normalizados da SWAPI com espaço reservado para imagem.

import { GiSpaceship } from 'react-icons/gi';

const ROLE_LABELS = {
  fighter: 'Caça',
  transport: 'Transporte',
  cruiser: 'Cruzador',
  station: 'Estação',
  unknown: 'Desconhecido',
};

const SIZE_LABELS = {
  small: 'Pequena',
  medium: 'Média',
  large: 'Grande',
  colossal: 'Colossal',
};

const translateValue = (val) => {
  if (!val || val === 'unknown' || val === 'n/a' || val === 'none') return 'Desconhecido';
  return val;
};

import corvetaEspacialImg from '../../../assets/backgrounds/star-wars/corveta_espacial.png';
import estacaoEspacialImg from '../../../assets/backgrounds/star-wars/estacao_espacial.png';
import cacaEspacialImg from '../../../assets/backgrounds/star-wars/caca_espacial.png';
import naveGuerraTriangularImg from '../../../assets/backgrounds/star-wars/nave_guerra_triangular.png';
import cacaAmareloBrancoImg from '../../../assets/backgrounds/star-wars/caca_amarelo_branco.png';
import transporteImperialImg from '../../../assets/backgrounds/star-wars/transporte_imperial.png';

const StarshipCard = ({ starship, isSelected, onSelect }) => {
  return (
    <div
      className={`sw-card sw-card-compact ${isSelected ? 'sw-card-selected' : ''}`}
      onClick={() => onSelect(starship)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(starship)}
      aria-label={`Selecionar nave ${starship.name}`}
      aria-pressed={isSelected}
    >
      {starship.name === 'CR90 corvette' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${corvetaEspacialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : starship.name === 'Death Star' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${estacaoEspacialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : starship.name === 'X-wing' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${cacaEspacialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : starship.name === 'Star Destroyer' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${naveGuerraTriangularImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : starship.name === 'Y-wing' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${cacaAmareloBrancoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : starship.name === 'Imperial shuttle' || starship.name === 'Millennium Falcon' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${transporteImperialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : (
        <div 
          className="sw-card-image-placeholder sw-card-image-compact"
          style={{ height: '160px' }}
        >
          <GiSpaceship className="sw-card-placeholder-icon" style={{ fontSize: '3rem' }} />
        </div>
      )}

      <div className="sw-card-body sw-card-body-compact">
        <h4 className="sw-card-title">{starship.name}</h4>
        <p className="sw-card-subtitle">{translateValue(starship.model)}</p>
        <p className="sw-card-meta">{translateValue(starship.manufacturer)}</p>

        <div className="sw-card-info sw-card-info-compact">
          <span className="sw-card-info-item"><strong>Classe:</strong> {translateValue(starship.starshipClass)}</span>
          <span className="sw-card-info-item"><strong>Tripulação:</strong> {translateValue(starship.crew)}</span>
          <span className="sw-card-info-item"><strong>Passageiros:</strong> {translateValue(starship.passengers)}</span>
          <span className="sw-card-info-item"><strong>Hyperdrive:</strong> {translateValue(starship.hyperdriveRating)}</span>
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-speed" title="Velocidade">Vel {starship.gameSpeed}</span>
          <span className="sw-badge sw-badge-shield" title="Escudo">Esc {starship.baseShield}</span>
          <span className="sw-badge sw-badge-handling" title="Controle">Ctrl {starship.handling}</span>
          <span className="sw-badge sw-badge-role">{ROLE_LABELS[starship.shipRole] || 'Desconhecido'}</span>
          <span className="sw-badge sw-badge-size">{SIZE_LABELS[starship.shipSize] || starship.shipSize}</span>
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default StarshipCard;
