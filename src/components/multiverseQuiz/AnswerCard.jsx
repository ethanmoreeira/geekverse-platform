// AnswerCard.jsx
// Card clicável para cada alternativa do quiz.
// Modo personagem: exibe imagem grande e nome.
// Antes da resposta: esconde status, espécie, origem, localização e episódios.
// Depois da resposta: revela todos os dados como confirmação.
// Modo texto: exibe apenas texto (usado somente em question-image visual type).

import {
  FaCircle,
  FaSkull,
  FaQuestionCircle,
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaTv,
} from 'react-icons/fa';

/** Retorna o ícone de status com a classe de cor adequada. */
const getStatusIcon = (status) => {
  switch (status) {
    case 'Alive':
      return <FaCircle aria-hidden="true" className="smv-status-icon smv-status-alive" />;
    case 'Dead':
      return <FaSkull aria-hidden="true" className="smv-status-icon smv-status-dead" />;
    default:
      return <FaQuestionCircle aria-hidden="true" className="smv-status-icon smv-status-unknown" />;
  }
};

const AnswerCard = ({
  option,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onClick,
  index,
  questionFocus,
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D
  const isCharacter = option && typeof option === 'object' && option.image;

  // Estado visual
  let stateClass = '';
  if (showResult && isCorrect) {
    stateClass = 'smv-answer-correct';
  } else if (showResult && isSelected && !isCorrect) {
    stateClass = 'smv-answer-wrong';
  } else if (isSelected && !showResult) {
    stateClass = 'smv-answer-selected';
  }

  return (
    <button
      className={`smv-answer-card ${stateClass} ${isCharacter ? 'smv-answer-has-character' : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
      id={`answer-option-${index}`}
    >
      <span className="smv-answer-letter">{letter}</span>

      {isCharacter ? (
        <div className="smv-answer-character">
          <img
            className="smv-answer-character-img"
            src={option.image}
            alt={option.name}
            loading="lazy"
          />
          <div className="smv-answer-character-info">
            <span className="smv-answer-character-name">{option.name}</span>

            {/* Dados técnicos: ocultos antes da resposta, revelados depois */}
            {showResult && (
              <>
                <span className="smv-answer-character-details smv-inline-meta">
                  {getStatusIcon(option.status)}
                  {' '}{option.status || '?'}
                  {' · '}
                  {option.species || '?'}
                </span>
                <span className="smv-answer-character-extra smv-inline-meta">
                  {option.origin && option.origin !== 'Desconhecida' && (
                    <>
                      <FaGlobeAmericas aria-hidden="true" className="smv-meta-icon" />
                      {' '}{option.origin}
                    </>
                  )}
                  {option.location && option.location !== 'Desconhecida' && (
                    <>
                      {' · '}
                      <FaMapMarkerAlt aria-hidden="true" className="smv-meta-icon" />
                      {' '}{option.location}
                    </>
                  )}
                </span>
                {option.episodeCount != null && (
                  <span className="smv-answer-character-episodes smv-inline-meta">
                    <FaTv aria-hidden="true" className="smv-meta-icon" />
                    {' '}{option.episodeCount} episódio{option.episodeCount !== 1 ? 's' : ''}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <span className="smv-answer-text">{String(option)}</span>
      )}
    </button>
  );
};

export default AnswerCard;
