export const GAME_STATUS = {
  READY: 'ready',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

export const ARENA_W = 100;
export const ARENA_H = 100;

export const OBSTACLE_TYPES = [
  { type: 'small', css: 'sw-obstacle-small', w: 3, h: 3, speedMult: 1.3, weight: 35 },
  { type: 'medium', css: 'sw-obstacle-medium', w: 4.5, h: 4.5, speedMult: 1.0, weight: 35 },
  { type: 'large', css: 'sw-obstacle-large', w: 6, h: 6, speedMult: 0.7, weight: 15 },
  { type: 'debris', css: 'sw-obstacle-debris', w: 4, h: 2.2, speedMult: 1.15, weight: 15 },
];

export const TARGETED_OBSTACLE_CHANCE_BY_LEVEL = {
  'Fácil': 0.30,
  'Médio': 0.40,
  'Difícil': 0.50,
};

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const pickObstacleType = (planetDanger) => {
  const adjusted = OBSTACLE_TYPES.map(o => ({
    ...o,
    weight: o.type === 'large' || o.type === 'debris'
      ? o.weight + planetDanger * 2
      : o.weight,
  }));
  const totalWeight = adjusted.reduce((s, o) => s + o.weight, 0);
  let r = Math.random() * totalWeight;
  for (const o of adjusted) {
    r -= o.weight;
    if (r <= 0) return o;
  }
  return adjusted[1];
};
