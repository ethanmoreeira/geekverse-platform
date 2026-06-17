
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

// Passo 1: Busca todos os personagens da API.
// Aqui eu também salvo no Cache (memória do navegador) pra não travar se o jogador der reload.
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

// Passo 2: A API tem muito personagem inútil ou sem foto.
// Essa função filtra só os que têm nome e imagem de verdade.
export const filterValidCharacters = (characters) => {
  return characters.filter(
    (char) => char.name && char.image && char.image.trim() !== ''
  );
};

// Passo 3: Pega os personagens filtrados e tenta encaixar os "Principais" primeiro (Harry, Rony, etc).
// Se faltar gente para completar a dificuldade, ele pega os figurantes para inteirar.
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

// Passo 4: O jogo da memória precisa de PARES.
// Essa função pega cada personagem, duplica ele (carta A e carta B) e embaralha tudo.
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

// Função Principal: É essa que a página do jogo chama de verdade.
// Ela junta todos os 4 passos anteriores e devolve o tabuleiro de cartas pronto pro React.
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

// Export antigo, mantido só pra não quebrar outras partes do código
export const fetchCharacters = fetchAllCharacters;
