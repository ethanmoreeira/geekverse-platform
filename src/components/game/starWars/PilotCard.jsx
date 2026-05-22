// PilotCard.jsx
// Card de piloto para a tela de montagem da missão Star Wars.
// Exibe dados normalizados da SWAPI com espaço reservado para imagem.

import { GiPerson } from 'react-icons/gi';

const PILOT_TYPE_LABELS = {
  agile: 'Ágil',
  balanced: 'Equilibrado',
  tank: 'Tanque',
};

const translateGender = (gender) => {
  if (gender === 'male') return 'Masculino';
  if (gender === 'female') return 'Feminino';
  if (gender === 'hermaphrodite') return 'Hermafrodita';
  if (!gender || gender === 'n/a' || gender === 'none' || gender === 'unknown') return 'Desconhecido';
  return gender;
};

const translateValue = (val) => {
  if (!val || val === 'unknown' || val === 'n/a' || val === 'none') return 'Desconhecido';
  return val;
};

import pilotoEspacialImg from '../../../assets/backgrounds/star-wars/piloto_espacial.png';
import liderRebeldeImg from '../../../assets/backgrounds/star-wars/lider_rebelde_refinada.png';
import droideAstromecanicoImg from '../../../assets/backgrounds/star-wars/droide_astromecanico.png';
import guerreiroEspacialImg from '../../../assets/backgrounds/star-wars/guerreiro_espacial.png';
import droideHumanoideDouradoImg from '../../../assets/backgrounds/star-wars/droide_humanoide_dourado.png';
import mestreGuerreiroEspacialImg from '../../../assets/backgrounds/star-wars/mestre_guerreiro_espacial.png';

const PilotCard = ({ pilot, isSelected, onSelect }) => {
  return (
    <div
      className={`sw-card sw-card-compact ${isSelected ? 'sw-card-selected' : ''}`}
      onClick={() => onSelect(pilot)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(pilot)}
      aria-label={`Selecionar piloto ${pilot.name}`}
      aria-pressed={isSelected}
    >
      {pilot.name === 'Luke Skywalker' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${pilotoEspacialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : pilot.name === 'Darth Vader' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${guerreiroEspacialImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : pilot.name === 'Leia Organa' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${liderRebeldeImg})`,
            backgroundSize: '140%',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : pilot.name === 'R2-D2' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${droideAstromecanicoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : pilot.name === 'C-3PO' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${droideHumanoideDouradoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : pilot.name === 'Obi-Wan Kenobi' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${mestreGuerreiroEspacialImg})`,
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
          <GiPerson className="sw-card-placeholder-icon" style={{ fontSize: '3rem' }} />
        </div>
      )}

      <div className="sw-card-body sw-card-body-compact">
        <h4 className="sw-card-title">{pilot.name}</h4>
        <p className="sw-card-subtitle">
          {translateGender(pilot.gender)}
          {translateValue(pilot.birthYear) !== 'Desconhecido' ? ` • ${pilot.birthYear}` : ''}
        </p>

        <div className="sw-card-info sw-card-info-compact">
          <span className="sw-card-info-item"><strong>Altura:</strong> {pilot.height > 0 ? `${pilot.height}cm` : 'Desconhecido'}</span>
          <span className="sw-card-info-item"><strong>Massa:</strong> {pilot.mass > 0 ? `${pilot.mass}kg` : 'Desconhecido'}</span>
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-speed" title="Bônus de velocidade">Vel {pilot.speedBonus >= 0 ? `+${pilot.speedBonus}` : pilot.speedBonus}</span>
          <span className="sw-badge sw-badge-shield" title="Bônus de escudo">Esc {pilot.shieldBonus >= 0 ? `+${pilot.shieldBonus}` : pilot.shieldBonus}</span>
          <span className="sw-badge sw-badge-handling" title="Bônus de controle">Ctrl {pilot.handlingBonus >= 0 ? `+${pilot.handlingBonus}` : pilot.handlingBonus}</span>
          <span className="sw-badge sw-badge-role">{PILOT_TYPE_LABELS[pilot.pilotType] || pilot.pilotType}</span>
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default PilotCard;
