// gameCatalog.js
// Catálogo de jogos do GeekVerse G8.
// Define informações de cada jogo para uso no Dashboard e navegação.

export const GAME_CATALOG = [
  {
    id: 'harry-potter',
    name: 'Memória dos Bruxos',
    route: '/app/harry-potter',
    api: 'Harry Potter API',
    description: 'Jogo da memória com personagens de Harry Potter.',
    icon: 'GiWizardStaff',
  },
  {
    id: 'pokemon',
    name: 'Duelo Pokémon',
    route: '/app/pokemon',
    api: 'PokéAPI',
    description: 'Duelo de cartas com atributos reais de Pokémon.',
    icon: 'GiPokecog',
  },
  {
    id: 'rick-morty',
    name: 'Caçada Dimensional',
    route: '/app/rick-morty',
    api: 'Rick and Morty API',
    description: 'Encontre o personagem-alvo antes do tempo acabar.',
    icon: 'GiPortal',
  },
  {
    id: 'star-wars',
    name: 'Desafio das Galáxias',
    route: '/app/star-wars',
    api: 'SWAPI',
    description: 'Compare dados de personagens, planetas e naves.',
    icon: 'GiLightSabers',
  },
  {
    id: 'ice-fire',
    name: 'Guerra dos Reinos',
    route: '/app/ice-fire',
    api: 'An API of Ice and Fire',
    description: 'Batalha épica entre casas e reinos.',
    icon: 'GiCastle',
  },
  {
    id: 'multiverse-hunt',
    name: 'Caçada Multiverso',
    route: '/app/multiverse-hunt',
    api: 'Todas as APIs',
    description: 'Jogo final: encontre personagens de vários universos.',
    icon: 'GiGalaxy',
  },
];
