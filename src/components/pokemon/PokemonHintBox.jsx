// PokemonHintBox.jsx
// Caixa de dicas do jogo PokeSombra.
// Sistema de mosaico 4x4 sobre a imagem real do Pokemon alvo.
// Maximo de 10 dicas por alvo. O jogador clica diretamente em um tile fechado
// para revelar aquela parte da imagem.
// Com 10/10 dicas, os tiles restantes ficam bloqueados.
//
// Props:
//   variant  'mosaic'   -> renderiza so o card mosaico (vai para o centro da arena)
//   variant  'controls' -> renderiza so o contador de dicas (vai para o header)
//   variant  undefined  -> renderiza tudo junto (fallback compativel)

import { useMemo } from 'react';
import { FaLightbulb } from 'react-icons/fa';
import {
  MAX_HINTS_PER_TARGET,
  MOSAIC_TOTAL_TILES,
  MOSAIC_GRID_SIZE,
  HINT_PENALTY_TABLE,
} from '../../data/pokemonGameConfig';

// ─── Componente principal ─────────────────────────────────────────────────────

const PokemonHintBox = ({
  currentTarget,
  currentHintIndex,
  revealedTiles,    // Set<number> — indices dos tiles revelados pelo jogador
  onTileClick,      // (tileIndex: number) => void — callback ao clicar em tile fechado
  disabled,
  variant, // 'mosaic' | 'controls' | undefined (tudo)
}) => {
  if (!currentTarget) return null;

  const hintsMaxed = currentHintIndex >= MAX_HINTS_PER_TARGET;
  const revealedSet = revealedTiles || new Set();

  // Calcular a penalidade da proxima dica para exibir no tooltip dos tiles
  const nextPenalty =
    HINT_PENALTY_TABLE[currentHintIndex] ??
    HINT_PENALTY_TABLE[HINT_PENALTY_TABLE.length - 1];

  // Gerar as 16 pecas do mosaico 4x4
  const mosaicTiles = useMemo(() => {
    const tiles = [];
    for (let i = 0; i < MOSAIC_TOTAL_TILES; i++) {
      const isRevealed = revealedSet.has(i);
      const isBlocked = hintsMaxed && !isRevealed;
      tiles.push({
        index: i,
        isRevealed,
        isBlocked,
      });
    }
    return tiles;
  }, [revealedSet, hintsMaxed]);

  // Handler de clique em um tile individual
  const handleTileClick = (tileIndex) => {
    if (disabled) return;
    if (revealedSet.has(tileIndex)) return;
    if (hintsMaxed) return;
    if (onTileClick) {
      onTileClick(tileIndex);
    }
  };

  // ─── So o card mosaico (vai para o centro da arena) ──────────────────────
  if (variant === 'mosaic') {
    return (
      <div className="pks-hint-panel-wrapper">
        {/* Legenda compacta acima do mosaico */}
        <div className="pks-hint-panel-info">
          <div className="pks-hint-panel-title">Painel de Dicas</div>
          <div className="pks-hint-panel-desc">
            Clique nos blocos para revelar a sombra
          </div>
          <div className="pks-hint-panel-meta">
            {!hintsMaxed && (
              <span className="pks-hint-panel-next-penalty">
                Próxima dica: +{nextPenalty}s
              </span>
            )}
            {hintsMaxed && (
              <span className="pks-hint-panel-maxed">
                Dicas esgotadas
              </span>
            )}
          </div>
        </div>

        {/* Card mosaico */}
        <div className="pks-mosaic-card">
          <div className="pks-mosaic-image-container">
            {currentTarget.image ? (
              <img
                className="pks-mosaic-image"
                src={currentTarget.image}
                alt="Imagem oculta do alvo"
                draggable="false"
              />
            ) : (
              <div className="pks-shadow-fallback">?</div>
            )}
            <div className="pks-mosaic-overlay">
              {mosaicTiles.map((tile) => {
                if (tile.isRevealed) {
                  // Tile ja revelado: sem interacao
                  return (
                    <div
                      key={tile.index}
                      className="pks-mosaic-tile pks-mosaic-tile-revealed"
                      aria-hidden="true"
                    />
                  );
                }

                if (tile.isBlocked) {
                  // Tile bloqueado (10/10 dicas): sem interacao
                  return (
                    <div
                      key={tile.index}
                      className="pks-mosaic-tile pks-mosaic-tile-blocked"
                      aria-label="Dicas esgotadas"
                      role="presentation"
                    />
                  );
                }

                // Tile fechado e clicavel
                return (
                  <button
                    key={tile.index}
                    type="button"
                    className="pks-mosaic-tile pks-mosaic-tile-clickable"
                    onClick={() => handleTileClick(tile.index)}
                    disabled={disabled}
                    aria-label={`Revelar dica, penalidade de ${nextPenalty} segundos`}
                    title={`Revelar dica (+${nextPenalty}s)`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── So os controles (contador, vai para o header) ───────────────────────
  if (variant === 'controls') {
    return (
      <div className="pks-hint-controls">
        <div className="pks-hint-counter">
          <FaLightbulb className="pks-hint-icon" />
          <span>Dicas {currentHintIndex}/{MAX_HINTS_PER_TARGET}</span>
        </div>
      </div>
    );
  }

  // ─── Fallback: tudo junto (compatibilidade) ───────────────────────────────
  return (
    <div className="pks-mosaic-hint">
      <div className="pks-mosaic-card">
        <div className="pks-mosaic-image-container">
          {currentTarget.image ? (
            <img
              className="pks-mosaic-image"
              src={currentTarget.image}
              alt="Imagem oculta do alvo"
              draggable="false"
            />
          ) : (
            <div className="pks-shadow-fallback">?</div>
          )}
          <div className="pks-mosaic-overlay">
            {mosaicTiles.map((tile) => {
              if (tile.isRevealed) {
                return (
                  <div
                    key={tile.index}
                    className="pks-mosaic-tile pks-mosaic-tile-revealed"
                    aria-hidden="true"
                  />
                );
              }

              if (tile.isBlocked) {
                return (
                  <div
                    key={tile.index}
                    className="pks-mosaic-tile pks-mosaic-tile-blocked"
                    aria-label="Dicas esgotadas"
                    role="presentation"
                  />
                );
              }

              return (
                <button
                  key={tile.index}
                  type="button"
                  className="pks-mosaic-tile pks-mosaic-tile-clickable"
                  onClick={() => handleTileClick(tile.index)}
                  disabled={disabled}
                  aria-label={`Revelar dica, penalidade de ${nextPenalty} segundos`}
                  title={`Revelar dica (+${nextPenalty}s)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="pks-hint-action">
        <div className="pks-hint-counter">
          <FaLightbulb className="pks-hint-icon" />
          <span>Dicas {currentHintIndex}/{MAX_HINTS_PER_TARGET}</span>
        </div>
      </div>
    </div>
  );
};

export default PokemonHintBox;
