// EquipmentCard.jsx
// Card de equipamento (veículo) para a tela de montagem da missão Star Wars.
// Exibe dados normalizados da SWAPI com espaço reservado para imagem.

import { GiCartwheel } from 'react-icons/gi';

const EQUIP_TYPE_LABELS = {
  speed: 'Velocidade',
  heavy: 'Pesado',
  light: 'Leve',
  utility: 'Utilitário',
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

const CLASS_LABELS = {
  airspeeder: 'Aerodeslizador',
  walker: 'Caminhante',
  submarine: 'Submarino',
  repulsorcraft: 'Nave repulsora',
  speeder: 'Speeder',
  'wheeled walker': 'Caminhante com rodas'
};

const translateClass = (val) => CLASS_LABELS[val.toLowerCase()] || val;

import veiculoGeloImg from '../../../assets/backgrounds/star-wars/veiculo_terrestre_gelo.png';
import veiculoPesadoImg from '../../../assets/backgrounds/star-wars/veiculo_pesado_quadrupede.png';
import veiculoBipedeImg from '../../../assets/backgrounds/star-wars/veiculo_bipede_reconhecimento.png';
import veiculoMineracaoImg from '../../../assets/backgrounds/star-wars/veiculo_transporte_mineracao.png';
import veiculoTreinamentoImg from '../../../assets/backgrounds/star-wars/veiculo_treinamento_atmosferico.png';
import veiculoSubmarinoImg from '../../../assets/backgrounds/star-wars/veiculo_submarino_organico.png';

const EquipmentCard = ({ vehicle, isSelected, onSelect }) => {
  return (
    <div
      className={`sw-card sw-card-compact ${isSelected ? 'sw-card-selected' : ''}`}
      onClick={() => onSelect(vehicle)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(vehicle)}
      aria-label={`Selecionar equipamento ${vehicle.name}`}
      aria-pressed={isSelected}
    >
      {vehicle.name === 'Snowspeeder' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoGeloImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : vehicle.name === 'AT-AT' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoPesadoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : vehicle.name === 'AT-ST' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoBipedeImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : vehicle.name === 'Sand Crawler' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoMineracaoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : vehicle.name === 'T-16 skyhopper' || vehicle.name === 'X-34 landspeeder' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoTreinamentoImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '160px',
            borderBottom: '1px solid var(--sw-border)',
          }}
        />
      ) : vehicle.name === 'Tribubble bongo' || vehicle.name === 'Sail barge' ? (
        <div 
          className="sw-card-image-compact"
          style={{
            backgroundImage: `url(${veiculoSubmarinoImg})`,
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
          <GiCartwheel className="sw-card-placeholder-icon" style={{ fontSize: '3rem' }} />
        </div>
      )}

      <div className="sw-card-body sw-card-body-compact">
        <h4 className="sw-card-title">{vehicle.name}</h4>
        {isValidValue(vehicle.model) && (
          <p className="sw-card-subtitle">{vehicle.model}</p>
        )}

        <div className="sw-card-info sw-card-info-compact">
          {isValidValue(vehicle.vehicleClass) && (
            <span className="sw-card-info-item"><strong>Classe:</strong> {translateClass(vehicle.vehicleClass)}</span>
          )}
          {isValidValue(vehicle.cargoCapacity) && vehicle.cargoCapacity > 0 && (
            <span className="sw-card-info-item"><strong>Carga:</strong> {vehicle.cargoCapacity.toLocaleString('pt-BR')}</span>
          )}
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-speed" title="Bônus de velocidade">Velocidade +{vehicle.equipmentSpeedBonus}</span>
          <span className="sw-badge sw-badge-shield" title="Bônus de escudo">Escudo +{vehicle.equipmentShieldBonus}</span>
          <span className="sw-badge sw-badge-handling" title="Bônus de controle">Controle +{vehicle.equipmentHandlingBonus}</span>
          {isValidValue(vehicle.equipmentType) && (
            <span className="sw-badge sw-badge-role">Perfil: {EQUIP_TYPE_LABELS[vehicle.equipmentType] || vehicle.equipmentType}</span>
          )}
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default EquipmentCard;
