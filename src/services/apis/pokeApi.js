
// Servico de integracao com a PokeAPI.
// Busca Pokemon com dados reais: tipos, stats, habilidades, sprites.
// URL base: https://pokeapi.co/api/v2
// Inclui cache em sessionStorage para evitar requisicoes repetidas.

import apiClient from '../apiClient';

const POKE_API_BASE = 'https://pokeapi.co/api/v2';
const CACHE_PREFIX = 'pokemon_cache_';

// Passo 1: Lê o Pokémon que já foi baixado na memória do navegador
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

// Passo 2: Salva um Pokémon que acabou de ser baixado na memória do navegador
const writeCache = (id, data) => {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${id}`, JSON.stringify(data));
  } catch {
    // Ignora erros de quota ou sessionStorage indisponivel
  }
};

// Passo 3: Limpa o nome do Pokémon (ex: "bulbasaur" vira "Bulbasaur")
const formatPokemonName = (name) => {
  if (!name) return '';
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Passo 4: A API do Pokémon vem com muita lixeira.
// Essa função limpa o arquivo gigante e deixa só o que a gente precisa: ID, Nome, Imagem, Status, etc.
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

// Passo 5: Tenta achar o Pokémon no Cache. Se não achar, bate na PokeAPI para baixar os dados dele.
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

// Passo 6: Cria uma lista de números sorteados sem repetir (IDs dos Pokémons)
const generateRandomIds = (count, maxId) => {
  const ids = new Set();
  const safeCount = Math.min(count, maxId);
  while (ids.size < safeCount) {
    const randomId = Math.floor(Math.random() * maxId) + 1;
    ids.add(randomId);
  }
  return Array.from(ids);
};

// Função Principal: É a que o jogo PokeSombra chama de verdade.
// Ela baixa os Pokémons em lote e tem um truque: se um ID der erro na API, ela sorteia outro para não quebrar o jogo!
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
