
// Grade de silhuetas para o jogo PokeSombra.
// Layout estilo moldura: silhuetas ao redor do card misterioso central.
// Divide a lista de Pokemon em 4 blocos (topo, esquerda, direita, base)
// e posiciona o card misterioso no centro da arena.

import PokemonShadowCard from './PokemonShadowCard';

/**
 * getArenaLayout
 * Divide o array boardPokemon em 4 grupos visuais para a moldura da arena.
 * Nao busca API, nao duplica, nao remove Pokemon.
 * So organiza visualmente os Pokemon reais ja carregados.
 *
 * Distribuicao por nivel:
 *   Facil  (30): topo=6, esq=9, dir=9, base=6   | sideCols=3 (3 cols x 3 linhas)
 *   Medio  (40): topo=8, esq=12, dir=12, base=8  | sideCols=3 (3 cols x 4 linhas)
 *   Dificil(64): topo=16, esq=16, dir=16, base=16 | sideCols=4 (4 cols x 4 linhas)
 */
const getArenaLayout = (boardPokemon) => {
  const total = boardPokemon.length;

  let top, side, sideCols;

  if (total === 30) {
    top = 6; side = 9; sideCols = 3;
  } else if (total === 40) {
    top = 8; side = 12; sideCols = 3;
  } else if (total === 64) {
    top = 16; side = 16; sideCols = 4;
  } else {
    return null;
  }


  return {
    topCards:    boardPokemon.slice(0, top),
    leftCards:   boardPokemon.slice(top, top + side),
    rightCards:  boardPokemon.slice(top + side, top + side * 2),
    bottomCards: boardPokemon.slice(top + side * 2),
    sideCols,
    levelSize: total,
  };
};

/**
 * Renderiza um PokemonShadowCard com as props corretas.
 */
const renderCard = (pokemon, revealedId, foundIds, wrongRecentlyId, onCardClick) => (
  <PokemonShadowCard
    key={pokemon.id}
    pokemon={pokemon}
    isRevealed={revealedId === pokemon.id}
    isFound={foundIds.has(pokemon.id)}
    isWrongRecently={wrongRecentlyId === pokemon.id}
    onClick={onCardClick}
  />
);

const PokemonShadowGrid = ({
  boardPokemon,
  foundIds,
  revealedId,
  wrongRecentlyId,
  onCardClick,
  hintBoxElement,
}) => {
  const layout = getArenaLayout(boardPokemon);

  // Fallback: layout simples se a quantidade nao corresponder a 30, 40 ou 64
  if (!layout) {
    return (
      <div className="pks-selection-arena pks-arena-fallback">
        {hintBoxElement && (
          <div className="pks-arena-core">{hintBoxElement}</div>
        )}
        <div className="pks-arena-top">
          {boardPokemon.map((p) =>
            renderCard(p, revealedId, foundIds, wrongRecentlyId, onCardClick)
          )}
        </div>
      </div>
    );
  }

  const { topCards, leftCards, rightCards, bottomCards, sideCols, levelSize } = layout;

  return (
    <div
      className="pks-selection-arena"
      data-level-size={levelSize}
      style={{ '--pks-side-cols': sideCols }}
    >
      <div className="pks-arena-top">
        {topCards.map((p) =>
          renderCard(p, revealedId, foundIds, wrongRecentlyId, onCardClick)
        )}
      </div>

      <div className="pks-arena-middle">
        <div className="pks-arena-side pks-arena-left">
          {leftCards.map((p) =>
            renderCard(p, revealedId, foundIds, wrongRecentlyId, onCardClick)
          )}
        </div>

        <div className="pks-arena-core">
          {hintBoxElement}
        </div>

        <div className="pks-arena-side pks-arena-right">
          {rightCards.map((p) =>
            renderCard(p, revealedId, foundIds, wrongRecentlyId, onCardClick)
          )}
        </div>
      </div>

      <div className="pks-arena-bottom">
        {bottomCards.map((p) =>
          renderCard(p, revealedId, foundIds, wrongRecentlyId, onCardClick)
        )}
      </div>
    </div>
  );
};

export default PokemonShadowGrid;
