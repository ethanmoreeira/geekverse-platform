// MemoryBoard.jsx
// Tabuleiro do jogo da memória (Memória dos Bruxos - Harry Potter).
// Renderiza a grade de cartas. Lógica de jogo controlada pelo componente pai.

import MemoryCard from './MemoryCard';

const MemoryBoard = ({ cards, difficulty, isShuffling, onCardClick, isCardFlipped, isCardMatched }) => {
  // Determinar classe de grid conforme dificuldade
  const getGridClass = () => {
    if (!difficulty) return 'gv-grid-easy';
    return `gv-grid-${difficulty}`;
  };

  // Se não há cartas, não renderizar
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="gv-memory-board-wrapper">
      <div className={`gv-memory-grid ${getGridClass()} ${isShuffling ? 'gv-grid-shuffling' : ''}`}>
        {cards.map((card, index) => (
          <MemoryCard
            key={card.uniqueId}
            card={card}
            onClick={onCardClick}
            isFlipped={isCardFlipped(card)}
            isMatched={isCardMatched(card)}
            isShuffling={isShuffling}
            shuffleIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default MemoryBoard;
