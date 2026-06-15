// pokeApi.js
// Servico de integracao com a PokeAPI.
// Busca Pokemon com dados reais: tipos, stats, habilidades, sprites.
// URL base: https://pokeapi.co/api/v2
// Inclui cache em sessionStorage para evitar requisicoes repetidas.

import apiClient from '../apiClient';

const POKE_API_BASE = 'https://pokeapi.co/api/v2';
const CACHE_PREFIX = 'pokemon_cache_';

/**
 * Le cache do sessionStorage.
 * @param {number} id - ID do Pokemon.
 * @returns {Object|null} Dados do cache ou null.
 */
const readCache = (id) => {
  try {
    const cached = sessionStorage.getItem(`${CACHE_PREFIX}${id}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Ignora erros de parse ou sessionStorage indisponivel
  }
  return null;
};

/**
 * Salva dados no cache do sessionStorage.
 * @param {number} id - ID do Pokemon.
 * @param {Object} data - Dados normalizados.
 */
const writeCache = (id, data) => {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${id}`, JSON.stringify(data));
  } catch {
    // Ignora erros de quota ou sessionStorage indisponivel
  }
};

/**
 * Formata o nome do Pokemon para exibicao.
 * Primeira letra maiuscula, hifens substituidos por espacos.
 * @param {string} name - Nome bruto da API.
 * @returns {string} Nome formatado.
 */
const formatPokemonName = (name) => {
  if (!name) return '';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Normaliza os dados brutos de um Pokemon da API.
 * @param {Object} raw - Resposta bruta da PokeAPI.
 * @returns {Object} Pokemon normalizado.
 */
export const normalizePokemon = (raw, species = null) => {
  const officialArtwork =
    raw.sprites?.other?.['official-artwork']?.front_default || null;
  const sprite = raw.sprites?.front_default || null;
  const image = officialArtwork || sprite || null;

  return {
    id: raw.id,
    name: raw.name,
    displayName: formatPokemonName(raw.name),
    image,
    sprite,
    types: (raw.types || []).map((t) => t.type?.name).filter(Boolean),
    abilities: (raw.abilities || []).map((a) => a.ability?.name).filter(Boolean),
    heightMeters: raw.height != null ? raw.height / 10 : null,
    weightKg: raw.weight != null ? raw.weight / 10 : null,
    baseExperience: raw.base_experience || null,
    habitat: species?.habitat?.name || null,
    shape: species?.shape?.name || null,
    stats: (raw.stats || []).map((s) => ({
      name: s.stat?.name || '',
      value: s.base_stat || 0,
    })),
    raw,
  };
};

/**
 * Busca um Pokemon por ID, com cache.
 * @param {number} id - ID do Pokemon.
 * @returns {Promise<Object|null>} Pokemon normalizado ou null em caso de erro.
 */
export const getPokemonById = async (id) => {
  // Verificar cache primeiro
  const cached = readCache(id);
  if (cached) {
    return cached;
  }

  try {
    const response = await apiClient.get(`${POKE_API_BASE}/pokemon/${id}`);
    
    let speciesData = null;
    try {
      const speciesResponse = await apiClient.get(`${POKE_API_BASE}/pokemon-species/${id}`);
      speciesData = speciesResponse.data;
    } catch {
      console.warn(`[PokeAPI] Falha ao buscar species ID ${id}`);
    }

    const normalized = normalizePokemon(response.data, speciesData);
    writeCache(id, normalized);
    return normalized;
  } catch (err) {
    console.warn(`[PokeAPI] Falha ao buscar Pokemon ID ${id}:`, err.message);
    return null;
  }
};

/**
 * Gera IDs aleatorios unicos dentro de um intervalo.
 * @param {number} count - Quantidade de IDs.
 * @param {number} maxId - ID maximo (inclusive).
 * @returns {number[]} Array de IDs unicos.
 */
const generateRandomIds = (count, maxId) => {
  const ids = new Set();
  const safeCount = Math.min(count, maxId);
  while (ids.size < safeCount) {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    ids.add(randomId);
  }
  return Array.from(ids);
};

/**
 * Busca um lote de Pokemon por IDs aleatorios.
 * Se alguma requisicao individual falhar, tenta substituir por outro ID.
 * @param {Object} params
 * @param {number} params.count - Quantidade desejada de Pokemon.
 * @param {number} params.maxPokemonId - ID maximo para sorteio.
 * @returns {Promise<Object>} Resultado com pokemon e metadados.
 */
export const getPokemonBatchByRandomIds = async ({ count, maxPokemonId }) => {
  const ids = generateRandomIds(count, maxPokemonId);
  const usedIds = new Set(ids);

  // Buscar todos em paralelo
  const results = await Promise.all(ids.map((id) => getPokemonById(id)));

  // Separar sucessos e falhas
  const successfulPokemon = [];
  const failedCount = { value: 0 };

  results.forEach((pokemon) => {
    if (pokemon && pokemon.image) {
      successfulPokemon.push(pokemon);
    } else {
      failedCount.value += 1;
    }
  });

  // Tentar substituir falhas
  let retryAttempts = 0;
  const maxRetries = failedCount.value * 3;

  while (successfulPokemon.length < count && retryAttempts < maxRetries) {
    retryAttempts += 1;
    const newId = Math.floor(Math.random() * maxPokemonId) + 1;
    if (usedIds.has(newId)) continue;
    usedIds.add(newId);

    const pokemon = await getPokemonById(newId);
    if (pokemon && pokemon.image) {
      successfulPokemon.push(pokemon);
    }
  }

  return {
    pokemon: successfulPokemon,
    metadata: {
      requested: count,
      received: successfulPokemon.length,
      failed: count - successfulPokemon.length,
      maxPokemonId,
      cachedCount: ids.filter((id) => readCache(id) !== null).length,
    },
  };
};
