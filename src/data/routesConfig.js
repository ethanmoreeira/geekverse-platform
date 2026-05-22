// routesConfig.js
// Configuração de rotas do GeekVerse G8.
// Define rotas públicas e privadas para uso com React Router DOM.

export const PUBLIC_ROUTES = [
  { path: '/', label: 'Login' },
];

export const PRIVATE_ROUTES = [
  { path: '/app/dashboard', label: 'Dashboard' },
  { path: '/app/harry-potter', label: 'Memória dos Bruxos' },
  { path: '/app/pokemon', label: 'PokeSombra' },
  { path: '/app/rick-morty', label: 'Show do Multiverso' },
  { path: '/app/star-wars', label: 'Fuga do Hiperespaço' },
  { path: '/app/ice-fire', label: 'Guerra dos Reinos' },
  { path: '/app/multiverse-hunt', label: 'Caçada Multiverso' },
  { path: '/app/ranking', label: 'Ranking' },
  { path: '/app/exportar', label: 'Exportar' },
  { path: '/app/sobre', label: 'Sobre' },
];
