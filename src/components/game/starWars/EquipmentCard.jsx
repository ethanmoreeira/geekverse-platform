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

const translateValue = (val) => {
  if (!val || val === 'unknown' || val === 'n/a' || val === 'none') return 'Desconhecido';
  return val;
};

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
        <p className="sw-card-subtitle">{translateValue(vehicle.model)}</p>
        <p className="sw-card-meta">{translateValue(vehicle.manufacturer)}</p>

        <div className="sw-card-info sw-card-info-compact">
          <span className="sw-card-info-item"><strong>Classe:</strong> {translateValue(vehicle.vehicleClass)}</span>
          <span className="sw-card-info-item"><strong>Velocidade:</strong> {vehicle.maxSpeed > 0 ? vehicle.maxSpeed : 'Desconhecida'}</span>
          <span className="sw-card-info-item"><strong>Carga:</strong> {vehicle.cargoCapacity > 0 ? vehicle.cargoCapacity.toLocaleString('pt-BR') : 'Desconhecida'}</span>
        </div>

        <div className="sw-card-badges sw-card-badges-compact">
          <span className="sw-badge sw-badge-speed" title="Bônus de velocidade">Vel +{vehicle.equipmentSpeedBonus}</span>
          <span className="sw-badge sw-badge-shield" title="Bônus de escudo">Esc +{vehicle.equipmentShieldBonus}</span>
          <span className="sw-badge sw-badge-handling" title="Bônus de controle">Ctrl +{vehicle.equipmentHandlingBonus}</span>
          <span className="sw-badge sw-badge-role">{EQUIP_TYPE_LABELS[vehicle.equipmentType] || vehicle.equipmentType}</span>
        </div>
      </div>

      {isSelected && <div className="sw-card-check">✓</div>}
    </div>
  );
};

export default EquipmentCard;
