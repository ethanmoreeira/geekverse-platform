// QuestionCard.jsx
// Exibe a pergunta, número da rodada, dificuldade, prêmio e imagem quando disponível.
// Suporta visualType: "question-image" e "question-and-answer-cards".

import { FaStar, FaBolt, FaSkull } from 'react-icons/fa';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Fácil', icon: FaStar, color: '#22c55e' },
  medium: { label: 'Médio', icon: FaBolt, color: '#f59e0b' },
  hard: { label: 'Difícil', icon: FaSkull, color: '#ef4444' },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  difficulty,
  prizeValue,
  targetImage,
  targetData,
  questionFocus,
  showResult,
}) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
  const DiffIcon = config.icon;

  return (
    <div className="smv-question-card">
      <div className="smv-question-header">
        <span className="smv-question-number">
          Pergunta {questionNumber} de {totalQuestions}
        </span>
        <div className="smv-question-meta">
          {prizeValue != null && (
            <span className="smv-question-prize">
              🏆 {formatCurrency(prizeValue)}
            </span>
          )}
          <span
            className="smv-difficulty-badge"
            style={{
              background: `${config.color}18`,
              color: config.color,
              borderColor: `${config.color}40`,
            }}
          >
            <DiffIcon /> {config.label}
          </span>
        </div>
      </div>

      {/* Imagem ou dados de contexto no enunciado */}
      {(targetImage || targetData) && (
        <div className="smv-question-target">
          {targetImage && (
            <img
              className="smv-question-target-img"
              src={targetImage}
              alt={targetData?.name || 'Personagem'}
              loading="lazy"
            />
          )}
          {targetData && (
            <div className="smv-question-target-info">
              {targetData.meta && (
                <span className="smv-question-target-meta">{targetData.meta}</span>
              )}
              <span className="smv-question-target-name">{targetData.name}</span>
              {targetData.subtitle && (
                <span className="smv-question-target-subtitle">
                  {(() => {
                    if (showResult) return targetData.subtitle;
                    if (questionFocus === 'species' && targetData.subtitle.includes(' · ')) {
                      return targetData.subtitle.split(' · ')[0] + ' · ???';
                    }
                    if (questionFocus === 'status' && targetData.subtitle.includes(' · ')) {
                      return '??? · ' + targetData.subtitle.split(' · ')[1];
                    }
                    return targetData.subtitle;
                  })()}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <h2 className="smv-question-text">{question}</h2>
    </div>
  );
};

export default QuestionCard;
