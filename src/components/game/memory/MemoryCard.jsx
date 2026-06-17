
// Carta individual do jogo da memória.
// Contém efeito de flip, imagem do personagem e estado (virada/oculta/encontrada).

import cardBackImg from '../../../assets/backgrounds/harry-potter/golden_snitch_background.png';

const MemoryCard = ({ card, onClick, isFlipped, isMatched, isShuffling, shuffleIndex, isZoomed }) => {
  const handleClick = () => {
    if (isShuffling) return; // Bloquear durante embaralhamento
    if (!isFlipped && !isMatched && onClick) {
      onClick(card);
    }
  };

  // Determinar cor da borda pela casa de Hogwarts
  const getHouseClass = () => {
    if (!card.house) return '';
    const house = card.house.toLowerCase();
    if (house === 'gryffindor') return 'gv-house-gryffindor';
    if (house === 'slytherin') return 'gv-house-slytherin';
    if (house === 'ravenclaw') return 'gv-house-ravenclaw';
    if (house === 'hufflepuff') return 'gv-house-hufflepuff';
    return '';
  };

  // Delay escalonado para efeito cascata durante shuffle
  const shuffleDelay = isShuffling ? `${(shuffleIndex % 12) * 0.08}s` : undefined;

  return (
    <div
      className={`gv-memory-card ${isFlipped ? 'gv-card-flipped' : ''} ${
        isMatched ? 'gv-card-matched' : ''
      } ${isShuffling ? 'gv-card-shuffling' : ''} ${isZoomed ? 'gv-card-zoomed' : ''}`}
      onClick={handleClick}
      id={`card-${card.uniqueId}`}
      style={isShuffling ? { animationDelay: shuffleDelay } : undefined}
    >
      <div className="gv-memory-card-flipper">
        {/* VERSO (parte de trás) — visível quando NÃO virada */}
        <div className="gv-memory-card-back">
          <img src={cardBackImg} alt="Card Back" className="gv-card-back-img" />
        </div>

        {/* FRENTE — visível quando virada */}
        <div className={`gv-memory-card-front ${getHouseClass()}`}>
          <div className="gv-card-image-wrapper">
            <img
              src={card.image}
              alt={card.name}
              className="gv-card-character-img"
              loading="lazy"
            />
          </div>
          <div className="gv-card-name-label">
            <span>{card.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCard;
