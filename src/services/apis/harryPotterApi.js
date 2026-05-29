// harryPotterApi.js
// Serviço de integração com a Harry Potter API.
// Busca personagens com imagem e nome para o jogo Memória dos Bruxos.
// URL base: https://hp-api.onrender.com/api

import apiClient from '../apiClient';

const HP_API_BASE = 'https://hp-api.onrender.com/api';
const CACHE_KEY = 'geekverse_hp_characters';

// Lista de personagens prioritários para o jogo
const PRIORITY_CHARACTERS = [
  'Harry Potter',
  'Hermione Granger',
  'Ron Weasley',
  'Albus Dumbledore',
  'Severus Snape',
  'Draco Malfoy',
  'Rubeus Hagrid',
  'Lord Voldemort',
  'Sirius Black',
  'Remus Lupin',
  'Minerva McGonagall',
  'Bellatrix Lestrange',
  'Neville Longbottom',
  'Luna Lovegood',
  'Ginny Weasley',
  'Fred Weasley',
  'George Weasley',
  'Cedric Diggory',
  'Cho Chang',
  'Lucius Malfoy',
  'Molly Weasley',
  'Arthur Weasley',
  'Nymphadora Tonks',
  'Kingsley Shacklebolt',
  'Dolores Umbridge',
  'Horace Slughorn',
  'Filius Flitwick',
  'Pomona Sprout',
  'Peter Pettigrew',
  'Viktor Krum',
  'Fleur Delacour',
  'Dobby',
  'Hedwig',
];

/**
 * Busca todos os personagens da Harry Potter API.
 * @returns {Promise<Array>} Lista completa de personagens.
 */
export const fetchAllCharacters = async () => {
  // Tentar cache primeiro
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        return cached.data;
      }
    }
  } catch {
    // Cache corrompido — ignorar
  }

  const response = await apiClient.get(`${HP_API_BASE}/characters`);
  const data = response.data;

  // Salvar no cache
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data }));
  } catch {
    // Quota excedida — ignorar
  }

  return data;
};

/**
 * Filtra personagens que possuem nome e imagem válidos.
 * @param {Array} characters - Lista completa de personagens.
 * @returns {Array} Personagens com nome e imagem válidos.
 */
export const filterValidCharacters = (characters) => {
  return characters.filter(
    (char) => char.name && char.image && char.image.trim() !== ''
  );
};

/**
 * Seleciona personagens priorizando os principais.
 * Se algum personagem principal não tiver imagem válida, é ignorado.
 * Completa com outros personagens válidos se necessário.
 * @param {Array} validCharacters - Personagens com imagem válida.
 * @param {number} count - Quantidade necessária de personagens.
 * @returns {Array} Personagens selecionados para o jogo.
 */
export const selectPrioritizedCharacters = (validCharacters, count) => {
  const selected = [];
  const usedIds = new Set();

  // 1. Buscar personagens prioritários que existem na lista válida
  for (const priorityName of PRIORITY_CHARACTERS) {
    if (selected.length >= count) break;
    const found = validCharacters.find(
      (char) =>
        char.name.toLowerCase() === priorityName.toLowerCase() &&
        !usedIds.has(char.id)
    );
    if (found) {
      selected.push(found);
      usedIds.add(found.id);
    }
  }

  // 2. Se ainda faltam, completar com outros personagens válidos
  if (selected.length < count) {
    const remaining = validCharacters.filter(
      (char) => !usedIds.has(char.id)
    );
    for (const char of remaining) {
      if (selected.length >= count) break;
      selected.push(char);
      usedIds.add(char.id);
    }
  }

  return selected;
};

/**
 * Gera pares de cartas para o jogo da memória.
 * Cada personagem é duplicado, recebe um ID único e o array é embaralhado.
 * @param {Array} characters - Personagens selecionados.
 * @returns {Array} Cartas duplicadas com IDs únicos e embaralhadas.
 */
export const generateCardPairs = (characters) => {
  const pairs = [];
  characters.forEach((char) => {
    // Cria duas cartas para cada personagem (par)
    pairs.push({
      uniqueId: `${char.id}-a`,
      pairId: char.id,
      name: char.name,
      image: char.image,
      house: char.house || '',
      species: char.species || '',
      isFlipped: false,
      isMatched: false,
    });
    pairs.push({
      uniqueId: `${char.id}-b`,
      pairId: char.id,
      name: char.name,
      image: char.image,
      house: char.house || '',
      species: char.species || '',
      isFlipped: false,
      isMatched: false,
    });
  });

  // Embaralhar usando Fisher-Yates
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
};

/**
 * Busca personagens formatados para o jogo conforme a dificuldade.
 * Se a API não retornar personagens suficientes, ajusta automaticamente
 * para o máximo disponível e sinaliza no metadata.
 * @param {number} pairsNeeded - Número de pares (personagens únicos).
 * @returns {Promise<Object>} Dados do jogo com cartas e metadados.
 */
export const fetchCharactersForGame = async (pairsNeeded) => {
  const allCharacters = await fetchAllCharacters();
  const validCharacters = filterValidCharacters(allCharacters);

  // Segurança: nunca solicitar mais do que existe
  const availableCount = validCharacters.length;
  const wasAdjusted = availableCount < pairsNeeded;
  const actualPairs = wasAdjusted ? availableCount : pairsNeeded;

  const selectedCharacters = selectPrioritizedCharacters(validCharacters, actualPairs);
  const cards = generateCardPairs(selectedCharacters);

  // Identifica quais personagens priorizados foram encontrados
  const prioritizedFound = selectedCharacters
    .filter((char) =>
      PRIORITY_CHARACTERS.some(
        (p) => p.toLowerCase() === char.name.toLowerCase()
      )
    )
    .map((char) => char.name);

  return {
    cards,
    metadata: {
      totalFromApi: allCharacters.length,
      totalWithValidImage: availableCount,
      pairsRequested: pairsNeeded,
      pairsUsed: actualPairs,
      selectedCount: selectedCharacters.length,
      totalCardsGenerated: cards.length,
      wasAdjusted,
      adjustmentMessage: wasAdjusted
        ? `A API possui apenas ${availableCount} personagens com imagem válida. O modo solicitava ${pairsNeeded} pares (${pairsNeeded * 2} cartas), mas foi ajustado para ${actualPairs} pares (${actualPairs * 2} cartas).`
        : null,
      prioritizedCharacters: prioritizedFound,
      selectedCharacters: selectedCharacters.map((c) => ({
        name: c.name,
        house: c.house || 'N/A',
        species: c.species || 'N/A',
      })),
    },
  };
};

// Manter export legado para compatibilidade
export const fetchCharacters = fetchAllCharacters;
