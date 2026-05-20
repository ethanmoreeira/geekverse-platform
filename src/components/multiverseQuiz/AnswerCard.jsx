// AnswerCard.jsx
// Card clicável para cada alternativa do quiz.
// Modo personagem: exibe imagem grande, nome, status, espécie, gênero e origem/localização.
// Modo texto: exibe apenas texto (usado somente em question-image visual type).

const STATUS_EMOJI = {
  Alive: '🟢',
  Dead: '🔴',
  unknown: '⚪',
};

const GENDER_EMOJI = {
  Male: '♂️',
  Female: '♀️',
  Genderless: '⚧',
  unknown: '❓',
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

  // Helpers to check if we should hide a specific field
  const shouldHide = (field) => !showResult && questionFocus === field;

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
            <span className="smv-answer-character-details">
              {shouldHide('status') ? '❓ ???' : `${STATUS_EMOJI[option.status] || '⚪'} ${option.status || '?'}`} 
              {' · '}
              {shouldHide('species') ? '???' : (option.species || '?')}
            </span>
            <span className="smv-answer-character-extra">
              {shouldHide('gender') ? '❓ ???' : `${GENDER_EMOJI[option.gender] || '❓'} ${option.gender || '?'}`}
              {option.origin && option.origin !== 'Desconhecida' && (
                <> · 🌍 {shouldHide('origin') ? '???' : option.origin}</>
              )}
            </span>
            {option.episodeCount != null && (
              <span className="smv-answer-character-episodes">
                📺 {shouldHide('episodes') ? '??? episódios' : `${option.episodeCount} episódio${option.episodeCount !== 1 ? 's' : ''}`}
              </span>
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
