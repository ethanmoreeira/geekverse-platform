// playerModes.js
// Configuração de modos de jogo.
// Multiplayer é local (mesmo computador), sem backend/websocket.

export const PLAYER_MODES = {
  single: {
    id: 'single',
    label: 'Single Player',
    description: 'Jogador contra o sistema',
    players: 1,
  },
  localMultiplayer: {
    id: 'localMultiplayer',
    label: 'Multiplayer Local',
    description: 'Jogador 1 vs Jogador 2 (mesmo computador)',
    players: 2,
  },
};
