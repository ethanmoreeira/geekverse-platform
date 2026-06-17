
// Serviço de integração com a Rick and Morty API.
// Funções seguras para buscar personagens, episódios e locais.
// URL base: https://rickandmortyapi.com/api

const RM_API_BASE = 'https://rickandmortyapi.com/api';

// ─── Helpers ────────────────────────────────────────────────────────

// Função de segurança: se a API der erro ou cair, isso avisa o código em vez de explodir a tela
const safeFetch = async (url, label = 'recurso') => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${label} (status ${response.status}).`
    );
  }
  return response.json();
};

// Padronizador: às vezes a API manda um objeto solto, às vezes manda uma lista.
// Essa função obriga a sempre retornar uma lista (Array) pra facilitar a nossa vida no código.
const normalizeToArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  if (data && data.id) return [data];
  return [];
};

// ─── Personagens ────────────────────────────────────────────────────

// Passo 1: Busca apenas 1 personagem pelo seu número de ID (ex: 1 é o Rick)
export const getCharacterById = async (id) => {
  const data = await safeFetch(
    `${RM_API_BASE}/character/${id}`,
    `personagem #${id}`
  );
  return data;
};

// Passo 2: Busca vários personagens de uma vez só usando uma lista de IDs
export const getCharactersByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const data = await safeFetch(
    `${RM_API_BASE}/character/${ids.join(',')}`,
    `personagens [${ids.join(',')}]`
  );
  return normalizeToArray(data);
};

// Passo 3: Busca personagens pelo Nome.
// O quiz usa isso para carregar personagens específicos (ex: pegar a foto do 'Evil Morty')
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

// Passo 4: Sorteia personagens aleatórios.
// Primeiro descobre quantos existem no total (hoje são mais de 800), e depois sorteia.
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
