// apiCatalog.js
// Catálogo das APIs públicas usadas no GeekVerse G8.
// Contém URLs base e informações de cada API.

export const API_CATALOG = [
  {
    id: 'harry-potter',
    name: 'Harry Potter API',
    baseUrl: 'https://hp-api.onrender.com/api',
    docs: 'https://hp-api.onrender.com/',
    description: 'API gratuita de personagens do universo Harry Potter.',
  },
  {
    id: 'pokemon',
    name: 'PokéAPI',
    baseUrl: 'https://pokeapi.co/api/v2',
    docs: 'https://pokeapi.co/docs/v2',
    description: 'API RESTful com dados detalhados de todos os Pokémon.',
  },
  {
    id: 'rick-morty',
    name: 'Rick and Morty API',
    baseUrl: 'https://rickandmortyapi.com/api',
    docs: 'https://rickandmortyapi.com/documentation',
    description: 'API de personagens, localizações e episódios de Rick and Morty.',
  },
  {
    id: 'star-wars',
    name: 'SWAPI',
    baseUrl: 'https://swapi.dev/api',
    docs: 'https://swapi.dev/documentation',
    description: 'Star Wars API com dados de personagens, planetas, naves e mais.',
  },
  {
    id: 'ice-fire',
    name: 'An API of Ice and Fire',
    baseUrl: 'https://anapioficeandfire.com/api',
    docs: 'https://anapioficeandfire.com/Documentation',
    description: 'API com dados de livros, personagens e casas de Game of Thrones.',
  },
];
