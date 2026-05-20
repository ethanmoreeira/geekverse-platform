// rickMortyApi.js
// Serviço de integração com a Rick and Morty API.
// Funções seguras para buscar personagens, episódios e locais.
// URL base: https://rickandmortyapi.com/api

const RM_API_BASE = 'https://rickandmortyapi.com/api';

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Faz fetch e valida response.ok. Retorna JSON.
 * Lança erro amigável em caso de falha.
 */
const safeFetch = async (url, label = 'recurso') => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${label} (status ${response.status}).`
    );
  }
  return response.json();
};

/**
 * Normaliza a resposta da API para sempre retornar um array.
 * A API retorna objeto único para IDs únicos, ou { results: [] } para buscas.
 */
const normalizeToArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  if (data && data.id) return [data];
  return [];
};

// ─── Personagens ────────────────────────────────────────────────────

/**
 * Busca um personagem pelo ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getCharacterById = async (id) => {
  const data = await safeFetch(
    `${RM_API_BASE}/character/${id}`,
    `personagem #${id}`
  );
  return data;
};

/**
 * Busca múltiplos personagens por IDs.
 * @param {number[]} ids
 * @returns {Promise<Object[]>}
 */
export const getCharactersByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const data = await safeFetch(
    `${RM_API_BASE}/character/${ids.join(',')}`,
    `personagens [${ids.join(',')}]`
  );
  return normalizeToArray(data);
};

/**
 * Busca personagens por nomes (usa o endpoint de filtro da API).
 * Retorna um array com o primeiro resultado para cada nome.
 * @param {string[]} names
 * @returns {Promise<Array<Object|null>>}
 */
export const getCharactersByNames = async (names) => {
  if (!names || names.length === 0) return [];
  const results = await Promise.all(
    names.map(async (name) => {
      try {
        const data = await safeFetch(
          `${RM_API_BASE}/character/?name=${encodeURIComponent(name)}`,
          `personagem "${name}"`
        );
        const list = normalizeToArray(data);
        return list.length > 0 ? list[0] : null;
      } catch {
        return null;
      }
    })
  );
  return results;
};

/**
 * Busca personagens aleatórios da API.
 * Usa a página de info para saber o total e então gera IDs aleatórios.
 * @param {number} quantity - Quantidade de personagens desejados.
 * @returns {Promise<Object[]>}
 */
export const getRandomCharacters = async (quantity) => {
  // Primeiro, descobrir o total de personagens
  const info = await safeFetch(
    `${RM_API_BASE}/character`,
    'lista de personagens'
  );
  const totalCharacters = info.info?.count || 826;

  // Gerar IDs aleatórios únicos
  const ids = new Set();
  let attempts = 0;
  while (ids.size < quantity && attempts < quantity * 5) {
    ids.add(Math.floor(Math.random() * totalCharacters) + 1);
    attempts++;
  }

  const characters = await getCharactersByIds([...ids]);
  // Filtrar personagens sem imagem
  return characters.filter((c) => c && c.image);
};

// ─── Episódios ──────────────────────────────────────────────────────

/**
 * Busca um episódio pelo ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getEpisodeById = async (id) => {
  const data = await safeFetch(
    `${RM_API_BASE}/episode/${id}`,
    `episódio #${id}`
  );
  return data;
};

/**
 * Busca um episódio aleatório.
 * @returns {Promise<Object>}
 */
export const getRandomEpisode = async () => {
  const info = await safeFetch(`${RM_API_BASE}/episode`, 'lista de episódios');
  const totalEpisodes = info.info?.count || 51;
  const randomId = Math.floor(Math.random() * totalEpisodes) + 1;
  return getEpisodeById(randomId);
};

// ─── Locais ─────────────────────────────────────────────────────────

/**
 * Busca um local pelo ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export const getLocationById = async (id) => {
  const data = await safeFetch(
    `${RM_API_BASE}/location/${id}`,
    `local #${id}`
  );
  return data;
};

/**
 * Busca um local aleatório.
 * @returns {Promise<Object>}
 */
export const getRandomLocation = async () => {
  const info = await safeFetch(`${RM_API_BASE}/location`, 'lista de locais');
  const totalLocations = info.info?.count || 126;
  const randomId = Math.floor(Math.random() * totalLocations) + 1;
  return getLocationById(randomId);
};

// ─── Helpers de extração de IDs ─────────────────────────────────────

/**
 * Extrai o ID numérico de uma URL da API Rick and Morty.
 * Ex: "https://rickandmortyapi.com/api/character/1" → 1
 */
export const extractIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? null : id;
};

// ─── Exports legados (compatibilidade) ──────────────────────────────

export const fetchCharacters = async (page) => {
  try {
    const data = await safeFetch(
      `${RM_API_BASE}/character/?page=${page || 1}`,
      'lista de personagens'
    );
    return data.results || [];
  } catch {
    return [];
  }
};

export const fetchCharacterById = getCharacterById;
