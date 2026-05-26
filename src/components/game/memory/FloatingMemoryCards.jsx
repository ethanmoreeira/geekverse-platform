// FloatingMemoryCards.jsx
// Cartas decorativas flutuantes exibidas na tela inicial do Memória dos Bruxos,
// antes do jogador escolher uma dificuldade. Puramente visuais — não participam da lógica do jogo.

import cardBackImg from '../../../assets/backgrounds/harry-potter/golden_snitch_background.png';

const DECORATIVE_CARDS = [
  { id: 1, top: '8%',  left: '8%',  rotate: -8,  delay: 0,   size: 1    },
  { id: 2, top: '5%',  left: '30%', rotate: 5,   delay: 0.6, size: 0.92 },
  { id: 3, top: '12%', left: '55%', rotate: -3,  delay: 1.2, size: 1.05 },
  { id: 4, top: '6%',  left: '78%', rotate: 7,   delay: 0.3, size: 0.95 },
  { id: 5, top: '42%', left: '5%',  rotate: 4,   delay: 1.5, size: 0.98 },
  { id: 6, top: '38%', left: '85%', rotate: -6,  delay: 0.9, size: 1.02 },
  { id: 7, top: '65%', left: '12%', rotate: -5,  delay: 1.8, size: 0.9  },
  { id: 8, top: '60%', left: '42%', rotate: 3,   delay: 0.4, size: 1.08 },
  { id: 9, top: '68%', left: '72%', rotate: -7,  delay: 1.1, size: 0.96 },
  { id: 10,top: '35%', left: '45%', rotate: 2,   delay: 2.0, size: 1.1  },
];

const FloatingMemoryCards = () => {
  return (
    <div className="gv-floating-cards-layer" aria-hidden="true">
      {DECORATIVE_CARDS.map((card) => (
        <div
          key={card.id}
          className="gv-floating-card"
          style={{
            '--fc-rotate': `${card.rotate}deg`,
            '--fc-delay': `${card.delay}s`,
            '--fc-size': card.size,
            top: card.top,
            left: card.left,
          }}
        >
          <div className="gv-floating-card-inner">
            <img src={cardBackImg} alt="" className="gv-floating-card-img" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatingMemoryCards;
