// pokemonGameConfig.js
// Configuracao dos niveis do jogo PokeSombra.
// Define tamanho do board, alvos, limites de ID e penalidades.

export const POKEMON_LEVELS = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    boardSize: 30,
    targetsCount: 5,
    maxPokemonId: 151,
    mistakePenalty: 3,
    hintPenalty: 5,
  },
  medium: {
    id: 'medium',
    label: 'Médio',
    boardSize: 40,
    targetsCount: 10,
    maxPokemonId: 251,
    mistakePenalty: 4,
    hintPenalty: 5,
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    boardSize: 64,
    targetsCount: 15,
    maxPokemonId: 386,
    mistakePenalty: 5,
    hintPenalty: 5,
  },
};

export const MAX_HINTS_PER_TARGET = 10;

// Mosaico 4x4 (16 peças total).
// Cada dica revela exatamente 1 peça. Ao usar as 10 dicas, 10 de 16 peças reveladas.
// Restam 6 fechadas: a imagem nunca fica 100% visível antes do acerto.
export const MOSAIC_TILES_PER_HINT = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
export const MOSAIC_GRID_SIZE = 4;
export const MOSAIC_TOTAL_TILES = MOSAIC_GRID_SIZE * MOSAIC_GRID_SIZE; // 16

// Penalidade progressiva por dica (em segundos).
// Índice 0 = dica 1, índice 9 = dica 10.
export const HINT_PENALTY_TABLE = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15];

// Traducao dos tipos de Pokemon (EN -> PT-BR)
export const POKEMON_TYPE_MAP = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  electric: 'Elétrico',
  grass: 'Planta',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Venenoso',
  ground: 'Terrestre',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

/**
 * Traduz um tipo de Pokemon do ingles para PT-BR.
 * @param {string} type - Tipo em ingles (ex: 'electric').
 * @returns {string} Tipo traduzido (ex: 'Elétrico').
 */
export const translateType = (type) => {
  return POKEMON_TYPE_MAP[type] || type;
};

// Traducao das Habilidades de Pokemon (EN -> PT-BR)
export const POKEMON_ABILITY_MAP = {
  'oblivious': 'Distraído',
  'own-tempo': 'Ritmo Próprio',
  'regenerator': 'Regeneração',
  'overgrow': 'Crescimento Excessivo',
  'blaze': 'Chama',
  'torrent': 'Torrente',
  'swarm': 'Enxame',
  'static': 'Estática',
  'lightning-rod': 'Para-Raios',
  'chlorophyll': 'Clorofila',
  'run-away': 'Fuga',
  'keen-eye': 'Olhar Atento',
  'inner-focus': 'Foco Interno',
  'levitate': 'Levitação',
  'intimidate': 'Intimidação',
  'pressure': 'Pressão',
  'sturdy': 'Robustez',
  'rock-head': 'Cabeça de Pedra',
  'shell-armor': 'Armadura de Concha',
  'water-absorb': 'Absorção de Água',
  'synchronize': 'Sincronismo',
  'natural-cure': 'Cura Natural',
  'early-bird': 'Madrugador',
  'thick-fat': 'Gordura Espessa',
  'hustle': 'Entusiasmo',
  'cute-charm': 'Charme Fofo',
  'flash-fire': 'Fogo Relâmpago',
  'poison-point': 'Ponto Venenoso',
  'shield-dust': 'Pó Escudo',
  'compound-eyes': 'Olhos Compostos'
};

/**
 * Traduz e formata nome de habilidade.
 * Procura no mapa local. Se não encontrar, retorna o texto formatado (fallback seguro).
 * @param {string} ability - Nome bruto (ex: 'lightning-rod').
 * @returns {string} Nome traduzido ou formatado.
 */
export const translatePokemonAbility = (ability) => {
  if (!ability) return '---';
  
  const normalizedAbility = ability.toLowerCase().replace(/\s+/g, '-');
  if (POKEMON_ABILITY_MAP[normalizedAbility]) {
    return POKEMON_ABILITY_MAP[normalizedAbility];
  }

  // Fallback seguro para formatacao padrao
  return ability
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

// Traducao dos nomes de stats (EN -> PT-BR)
export const STAT_NAME_MAP = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

/**
 * Traduz nome de stat para PT-BR.
 */
export const translateStat = (statName) => {
  return STAT_NAME_MAP[statName] || statName;
};

export const HABITAT_MAP = {
  cave: 'cavernas',
  forest: 'florestas',
  grassland: 'campos abertos',
  mountain: 'montanhas',
  rare: 'áreas raras',
  'rough-terrain': 'terrenos acidentados',
  sea: 'mares ou regiões aquáticas',
  urban: 'cidades',
  'waters-edge': 'margens de rios ou lagos'
};

export const SHAPE_MAP = {
  ball: 'formato arredondado',
  squiggle: 'corpo sinuoso',
  fish: 'formato aquático',
  arms: 'braços destacados',
  blob: 'corpo compacto',
  upright: 'postura ereta',
  legs: 'pernas destacadas',
  quadruped: 'quadrúpede',
  wings: 'possui asas',
  tentacles: 'tentáculos',
  heads: 'múltiplas cabeças',
  humanoid: 'formato humanoide',
  'bug-wings': 'asas de inseto',
  armor: 'aparência resistente'
};

export const ENV_BY_TYPE_MAP = {
  water: 'rios, lagos ou mares',
  grass: 'florestas, campos ou jardins',
  fire: 'áreas quentes ou vulcânicas',
  electric: 'áreas urbanas ou locais com energia',
  ice: 'regiões geladas',
  rock: 'montanhas ou cavernas',
  ground: 'cavernas, desertos ou solo aberto',
  flying: 'céu ou áreas abertas',
  bug: 'florestas, árvores ou gramados',
  poison: 'pântanos ou áreas contaminadas',
  psychic: 'locais misteriosos ou urbanos',
  ghost: 'lugares escuros ou abandonados',
  dragon: 'montanhas, cavernas ou locais raros',
  dark: 'ambientes noturnos',
  steel: 'áreas industriais ou metálicas',
  fairy: 'bosques ou locais mágicos',
  normal: 'campos, cidades ou rotas comuns'
};

export const translateHabitat = (habitat) => {
  if (!habitat) return null;
  return HABITAT_MAP[habitat] || habitat;
};

export const translateShape = (shape) => {
  if (!shape) return null;
  return SHAPE_MAP[shape] || shape;
};

export const getEnvByType = (types) => {
  if (!types || types.length === 0) return 'desconhecido';
  return ENV_BY_TYPE_MAP[types[0]] || 'desconhecido';
};
