// cardMappers.js
// Mapeadores para transformar dados de API em cards de jogo.
// Cada API tem seu mapeador específico para formato de card unificado.

/**
 * Mapeia dados genéricos de uma API para o formato padrão de card.
 */
export const mapToGameCard = (data, apiSource) => {
  return {
    id: data.id || null,
    name: data.name || 'Desconhecido',
    image: data.image || null,
    source: apiSource,
  };
};

/**
 * Mapeia um personagem da Harry Potter API para o formato de card do jogo da memória.
 */
export const mapHarryPotterCard = (character) => {
  return {
    id: character.id,
    name: character.name,
    image: character.image,
    house: character.house || '',
    species: character.species || '',
    source: 'harry-potter',
  };
};
