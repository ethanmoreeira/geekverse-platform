// GameFooter.jsx
// Rodapé do jogo com pontuação e nível.

const DIFFICULTY_MAP = {
  easy: { label: 'Portal Verde', color: '#22c55e' },
  medium: { label: 'Viagem Interdimensional', color: '#f59e0b' },
  hard: { label: 'Desafio da Citadel', color: '#ef4444' },
};

const formatNumber = (value) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const GameFooter = ({
  difficulty,
  score,
  showResult,
  gameOver,
  onNextQuestion,
  onRestart,
  onBack,
}) => {
  const config = DIFFICULTY_MAP[difficulty] || DIFFICULTY_MAP.easy;

  return (
    <div className="smv-game-footer">
      <div className="smv-footer-info">
        <span className="smv-footer-level" style={{ color: config.color }}>
          {config.label}
        </span>
        <span className="smv-footer-score">
          Pontuação: {formatNumber(score)}
        </span>
      </div>

    </div>
  );
};

export default GameFooter;
