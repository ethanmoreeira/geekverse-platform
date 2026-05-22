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
    name: 'PokeSombra',
    route: '/app/pokemon',
    api: 'PokeAPI',
    description: 'Cacada visual por silhuetas usando dados reais da PokeAPI.',
    icon: 'GiPokecog',
  },
  {
    id: 'rick-morty',
    name: 'Show do Multiverso',
    route: '/app/rick-morty',
    api: 'Rick and Morty API',
    description: 'Quiz interdimensional com dados da Rick and Morty API.',
    icon: 'GiPortal',
  },
  {
    id: 'star-wars',
    name: 'Fuga do Hiperespaço',
    route: '/app/star-wars',
    api: 'SWAPI',
    description: 'Monte sua missão e escape do campo de asteroides com dados reais da SWAPI.',
    icon: 'GiSpaceship',
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
