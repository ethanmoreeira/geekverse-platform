
// Card individual de silhueta para o jogo PokéSombra.
// Renderiza imagem como silhueta via CSS filter.
// Usa button para acessibilidade.

const PokemonShadowCard = ({
  pokemon,
  isRevealed,
  isFound,
  isWrongRecently,
  onClick,
}) => {
  const handleClick = () => {
    if (isFound) return;
    onClick(pokemon);
  };

  const cardClasses = [
    'pks-shadow-card',
    isFound ? 'pks-shadow-card-found' : '',
    isWrongRecently ? 'pks-shadow-card-wrong' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const imgClasses = [
    'pks-shadow-img',
    isRevealed || isFound ? 'pks-shadow-img-revealed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={cardClasses}
      onClick={handleClick}
      type="button"
      disabled={isFound}
      aria-label={
        isRevealed || isFound
          ? pokemon.displayName
          : 'Silhueta de Pokémon'
      }
      id={`pks-card-${pokemon.id}`}
    >
      {pokemon.image ? (
        <img
          className={imgClasses}
          src={pokemon.image}
          alt={
            isRevealed || isFound
              ? pokemon.displayName
              : 'Silhueta de Pokémon'
          }
          draggable="false"
          loading="lazy"
        />
      ) : (
        <div className="pks-shadow-fallback">?</div>
      )}
    </button>
  );
};

export default PokemonShadowCard;
