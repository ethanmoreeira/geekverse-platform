// GameFooter.jsx
// Rodapé do jogo com pontuação, nível, botão voltar e botão próxima.

import { FaStar, FaBolt, FaSkull, FaArrowRight, FaRedo, FaArrowLeft } from 'react-icons/fa';

const DIFFICULTY_MAP = {
  easy: { label: 'Portal Verde', icon: FaStar, color: '#22c55e' },
  medium: { label: 'Viagem Interdimensional', icon: FaBolt, color: '#f59e0b' },
  hard: { label: 'Desafio da Citadel', icon: FaSkull, color: '#ef4444' },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
  const DiffIcon = config.icon;

  return (
    <div className="smv-game-footer">
      <div className="smv-footer-info">
        <span className="smv-footer-level" style={{ color: config.color }}>
          <DiffIcon /> {config.label}
        </span>
        <span className="smv-footer-score">
          Pontuação: {formatCurrency(score)}
        </span>
      </div>

    </div>
  );
};

export default GameFooter;
