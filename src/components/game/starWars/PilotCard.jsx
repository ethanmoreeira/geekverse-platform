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
        <img src={pilotoEspacialImg} alt="Luke Skywalker" className="sw-card-image-compact" />
      ) : pilot.name === 'Darth Vader' ? (
        <img src={guerreiroEspacialImg} alt="Darth Vader" className="sw-card-image-compact" />
      ) : pilot.name === 'Leia Organa' ? (
        <img src={liderRebeldeImg} alt="Leia Organa" className="sw-card-image-compact" />
      ) : pilot.name === 'R2-D2' ? (
        <img src={droideAstromecanicoImg} alt="R2-D2" className="sw-card-image-compact" />
      ) : pilot.name === 'C-3PO' ? (
        <img src={droideHumanoideDouradoImg} alt="C-3PO" className="sw-card-image-compact" />
      ) : pilot.name === 'Obi-Wan Kenobi' ? (
        <img src={mestreGuerreiroEspacialImg} alt="Obi-Wan Kenobi" className="sw-card-image-compact" />
      ) : (
        <div className="sw-card-image-placeholder sw-card-image-compact">
          <GiPerson className="sw-card-placeholder-icon" style={{ fontSize: '3rem' }} />
        </div>
      )}

      <div className="sw-card-body sw-card-body-compact">
        <h4 className="sw-card-title">{pilot.name}</h4>
        {isValidValue(pilot.gender) && isValidValue(pilot.birthYear) ? (
          <p className="sw-card-subtitle">{translateGender(pilot.gender)} • {pilot.birthYear}</p>
        ) : isValidValue(pilot.gender) ? (
          <p className="sw-card-subtitle">{translateGender(pilot.gender)}</p>
        ) : null}

        <div className="sw-card-info sw-card-info-compact">
          {isValidValue(pilot.height) && pilot.height > 0 && (
            <span className="sw-card-info-item"><strong>Altura:</strong> {pilot.height}cm</span>
          )}
          {isValidValue(pilot.mass) && pilot.mass > 0 && (
            <span className="sw-card-info-item"><strong>Massa:</strong> {pilot.mass}kg</span>
          )}
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-speed" title="Bônus de velocidade">Velocidade {pilot.speedBonus >= 0 ? `+${pilot.speedBonus}` : pilot.speedBonus}</span>
          <span className="sw-badge sw-badge-shield" title="Bônus de escudo">Escudo {pilot.shieldBonus >= 0 ? `+${pilot.shieldBonus}` : pilot.shieldBonus}</span>
          <span className="sw-badge sw-badge-handling" title="Bônus de controle">Controle {pilot.handlingBonus >= 0 ? `+${pilot.handlingBonus}` : pilot.handlingBonus}</span>
          {isValidValue(pilot.pilotType) && (
            <span className="sw-badge sw-badge-role">Perfil: {PILOT_TYPE_LABELS[pilot.pilotType] || pilot.pilotType}</span>
          )}
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default PilotCard;
