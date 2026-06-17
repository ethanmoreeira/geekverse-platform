
// Configuração de dificuldades dos jogos.
// Define número de cartas, pares e tempo por nível de dificuldade.

export const DIFFICULTIES = {
  easy: {
    label: 'Fácil',
    pairs: 15,
    totalCards: 30,
    timeMultiplier: 1.0,
    gridColumns: { desktop: 6, tablet: 5, mobile: 4 },
  },
  medium: {
    label: 'Médio',
    pairs: 20,
    totalCards: 40,
    timeMultiplier: 0.8,
    gridColumns: { desktop: 8, tablet: 6, mobile: 4 },
  },
  challenge: {
    label: 'Difícil',
    pairs: 25,
    totalCards: 50,
    timeMultiplier: 0.6,
    gridColumns: { desktop: 10, tablet: 8, mobile: 5 },
  },
};
