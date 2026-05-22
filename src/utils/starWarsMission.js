// starWarsMission.js
// Configuração de dificuldade e cálculo de atributos da missão
// para o jogo Fuga do Hiperespaço (Star Wars).
// Cada escolha do jogador gera impacto real e perceptível na arena.

// ─── Configuração de Dificuldade ────────────────────────────────────

export const DIFFICULTY_CONFIG = {
  easy: {
    key: 'easy',
    label: 'Fácil',
    description: 'Menos asteroides, mais tempo.',
    detail: 'Ideal para iniciantes',
    duration: 45,
    baseLives: 3,
    asteroidSpeedBase: 2,
    spawnRateBase: 2000,
    crystalSpawnBase: 3500,
    scoreMultiplier: 1,
    color: '#34d399',
  },
  medium: {
    key: 'medium',
    label: 'Médio',
    description: 'Asteroides moderados, missão longa.',
    detail: 'Bom equilíbrio entre risco e recompensa',
    duration: 60,
    baseLives: 3,
    asteroidSpeedBase: 3.5,
    spawnRateBase: 1400,
    crystalSpawnBase: 3000,
    scoreMultiplier: 1.5,
    color: '#facc15',
  },
  hard: {
    key: 'hard',
    label: 'Difícil',
    description: 'Campo denso, poucos escudos.',
    detail: 'Para pilotos experientes',
    duration: 75,
    baseLives: 2,
    asteroidSpeedBase: 5,
    spawnRateBase: 900,
    crystalSpawnBase: 2500,
    scoreMultiplier: 2,
    color: '#fb7185',
  },
};

// ─── Mapeamento de hitbox por tamanho da nave ───────────────────────

const HITBOX_MAP = {
  small: 5,
  medium: 7,
  large: 9,
  colossal: 12,
};

// ─── Sinergias ──────────────────────────────────────────────────────

const SYNERGY_RULES = [
  {
    id: 'xwing_luke',
    check: (ship, pilot) => ship?.name === 'X-wing' && pilot?.name === 'Luke Skywalker',
    apply: (stats) => {
      stats.finalHandling += 3;
      stats.collectionRadius += 8;
      stats.finalSpeed += 1;
    },
    text: 'Sinergia: X-wing e Luke melhoram manobras e coleta.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'falcon_bespin',
    check: (ship, _pilot, planet) => ship?.name === 'Millennium Falcon' && planet?.name === 'Bespin',
    apply: (stats) => {
      stats.collectionRadius += 6;
      stats.scoreMultiplier += 0.2;
      stats.crystalValue += 20;
    },
    text: 'Sinergia: Millennium Falcon em Bespin aumenta recompensas.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'r2d2_xwing',
    check: (ship, pilot) => pilot?.name === 'R2-D2' && ship?.name === 'X-wing',
    apply: (stats) => {
      stats.collectionRadius += 10;
      stats.collisionPenalty = Math.max(50, stats.collisionPenalty - 50);
    },
    text: 'Sinergia: R2-D2 otimiza sensores da X-wing.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'leia_alderaan',
    check: (_ship, pilot, planet) => pilot?.name === 'Leia Organa' && planet?.name === 'Alderaan',
    apply: (stats) => {
      stats.scoreMultiplier += 0.3;
      stats.crystalValue += 30;
    },
    text: 'Sinergia: Leia em Alderaan aumenta o valor da missão.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'hoth_snowspeeder',
    check: (_ship, _pilot, planet, vehicle) => planet?.name === 'Hoth' && vehicle?.name === 'Snowspeeder',
    apply: (stats) => {
      stats.finalHandling += 3;
    },
    text: 'Sinergia: Snowspeeder compensa o ambiente gelado de Hoth.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'vader_deathstar',
    check: (ship, pilot) => pilot?.name === 'Darth Vader' && ship?.name === 'Death Star',
    apply: (stats) => {
      stats.finalShield += 4;
      stats.finalHandling = Math.max(1, stats.finalHandling - 3);
    },
    text: 'Sinergia: Vader e Death Star priorizam resistência sobre manobra.',
    source: 'Sinergia',
    type: 'synergy',
  },
  {
    id: 'sandcrawler_tatooine',
    check: (_ship, _pilot, planet, vehicle) => vehicle?.name === 'Sand Crawler' && planet?.name === 'Tatooine',
    apply: (stats) => {
      stats.finalShield += 3;
    },
    text: 'Sinergia: Sand Crawler opera melhor no terreno árido de Tatooine.',
    source: 'Sinergia',
    type: 'synergy',
  },
];

// ─── Gerar efeitos descritivos de cada escolha ──────────────────────

const getShipEffects = (starship) => {
  if (!starship) return [];
  const effects = [];
  const size = starship.shipSize || 'medium';
  const role = starship.shipRole || 'unknown';

  if (size === 'small') {
    effects.push({ source: starship.name, text: `${starship.name}: nave ágil com hitbox reduzida.`, type: 'ship' });
  } else if (size === 'colossal') {
    effects.push({ source: starship.name, text: `${starship.name}: nave colossal com hitbox enorme, mas escudo superior.`, type: 'ship' });
  } else if (size === 'large') {
    effects.push({ source: starship.name, text: `${starship.name}: nave grande e resistente, porém menos ágil.`, type: 'ship' });
  } else {
    effects.push({ source: starship.name, text: `${starship.name}: nave equilibrada em tamanho e manobrabilidade.`, type: 'ship' });
  }

  if (role === 'fighter') {
    effects.push({ source: starship.name, text: `Classe caça: velocidade e controle priorizados.`, type: 'ship' });
  } else if (role === 'station') {
    effects.push({ source: starship.name, text: `Estação de combate: lenta, mas praticamente indestrutível.`, type: 'ship' });
  }

  return effects;
};

const getPilotEffects = (pilot) => {
  if (!pilot) return [];
  const effects = [];
  const type = pilot.pilotType || 'balanced';

  if (type === 'agile') {
    effects.push({ source: pilot.name, text: `${pilot.name}: bônus de controle e velocidade leve.`, type: 'pilot' });
  } else if (type === 'tank') {
    effects.push({ source: pilot.name, text: `${pilot.name}: bônus de escudo, pequena penalidade de controle.`, type: 'pilot' });
  } else {
    effects.push({ source: pilot.name, text: `${pilot.name}: piloto equilibrado com bônus moderados.`, type: 'pilot' });
  }

  // Named pilot specific flavor
  if (pilot.name === 'Luke Skywalker') {
    effects.push({ source: pilot.name, text: `Luke: bônus de coleta e manobras.`, type: 'pilot' });
  } else if (pilot.name === 'Darth Vader') {
    effects.push({ source: pilot.name, text: `Vader: bônus de escudo, reduz dano por colisão.`, type: 'pilot' });
  } else if (pilot.name === 'Leia Organa') {
    effects.push({ source: pilot.name, text: `Leia: bônus de pontuação e controle leve.`, type: 'pilot' });
  } else if (pilot.name === 'R2-D2') {
    effects.push({ source: pilot.name, text: `R2-D2: reduz penalidade por colisão, aumenta raio de coleta.`, type: 'pilot' });
  } else if (pilot.name === 'C-3PO') {
    effects.push({ source: pilot.name, text: `C-3PO: bônus defensivo pequeno, sem bônus de velocidade.`, type: 'pilot' });
  } else if (pilot.name === 'Obi-Wan Kenobi') {
    effects.push({ source: pilot.name, text: `Obi-Wan: bônus equilibrado, redução leve de risco.`, type: 'pilot' });
  }

  return effects;
};

const getPlanetEffects = (planet) => {
  if (!planet) return [];
  const effects = [];
  const env = planet.environmentType || 'neutral';
  const danger = planet.planetDanger || 1;

  if (env === 'frozen') {
    effects.push({ source: planet.name, text: `${planet.name}: controle reduzido por ambiente gelado.`, type: 'planet' });
  } else if (env === 'desert') {
    effects.push({ source: planet.name, text: `${planet.name}: perigo moderado, asteroides um pouco mais rápidos.`, type: 'planet' });
  } else if (env === 'organic') {
    effects.push({ source: planet.name, text: `${planet.name}: vegetação densa reduz manobrabilidade.`, type: 'planet' });
  } else if (env === 'gas') {
    effects.push({ source: planet.name, text: `${planet.name}: obstáculos rápidos, cristais mais valiosos.`, type: 'planet' });
  } else if (env === 'neutral' || env === 'rocky') {
    effects.push({ source: planet.name, text: `${planet.name}: ambiente ${danger <= 2 ? 'relativamente seguro' : 'com risco moderado'}.`, type: 'planet' });
  }

  if (danger >= 4) {
    effects.push({ source: planet.name, text: `Perigo extremo: mais obstáculos e mais rápidos.`, type: 'planet' });
  }

  return effects;
};

const getVehicleEffects = (vehicle) => {
  if (!vehicle) return [];
  const effects = [];
  const eType = vehicle.equipmentType || 'utility';

  if (eType === 'speed') {
    effects.push({ source: vehicle.name, text: `${vehicle.name}: bônus alto de velocidade.`, type: 'vehicle' });
  } else if (eType === 'heavy') {
    effects.push({ source: vehicle.name, text: `${vehicle.name}: muito escudo, mas reduz velocidade.`, type: 'vehicle' });
  } else if (eType === 'light') {
    effects.push({ source: vehicle.name, text: `${vehicle.name}: leve e ágil, bônus de controle.`, type: 'vehicle' });
  } else {
    effects.push({ source: vehicle.name, text: `${vehicle.name}: equipamento utilitário com bônus moderados.`, type: 'vehicle' });
  }

  return effects;
};

// ─── Cálculo dos Stats da Missão ────────────────────────────────────

/**
 * Calcula os atributos finais da missão com base nas escolhas do jogador.
 * Cada escolha tem impacto real e perceptível na arena.
 *
 * @param {{ starship: Object, pilot: Object, planet: Object, vehicle: Object, difficulty: string }} params
 * @returns {Object} Stats calculados da missão.
 */
export const calculateMissionStats = ({ starship, pilot, planet, vehicle, difficulty }) => {
  const diff = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;

  // ── Velocidade final ──
  let finalSpeed = Math.max(
    1,
    (starship?.gameSpeed || 5) +
    (pilot?.speedBonus || 0) +
    (vehicle?.equipmentSpeedBonus || 0)
  );

  // ── Aceleração (derivada de speed + handling) ──
  let finalAcceleration = Math.max(
    0.3,
    ((starship?.gameSpeed || 5) * 0.12) + ((starship?.handling || 5) * 0.08)
  );

  // ── Escudo final ──
  let finalShield = Math.max(
    1,
    (starship?.baseShield || 5) +
    (pilot?.shieldBonus || 0) +
    (vehicle?.equipmentShieldBonus || 0)
  );

  // ── Controle final ──
  let finalHandling = Math.max(
    1,
    (starship?.handling || 5) +
    (pilot?.handlingBonus || 0) +
    (vehicle?.equipmentHandlingBonus || 0) -
    (planet?.handlingPenalty || 0)
  );

  // ── Vidas finais ──
  let finalLives = diff.baseLives;
  // Escudo alto dá vida extra
  if (finalShield >= 15) finalLives += 1;

  // ── Hitbox da nave ──
  let shipHitboxSize = HITBOX_MAP[starship?.shipSize || 'medium'] || 7;

  // ── Velocidade dos obstáculos ──
  let obstacleSpeed = Math.round(
    (diff.asteroidSpeedBase * (planet?.asteroidSpeedModifier || 1)) * 100
  ) / 100;

  // ── Taxa de spawn de obstáculos ──
  let obstacleSpawnRate = Math.max(
    400,
    Math.round(diff.spawnRateBase / (planet?.spawnRateModifier || 1))
  );

  // ── Taxa de spawn de cristais ──
  let crystalSpawnRate = diff.crystalSpawnBase;

  // ── Valor do cristal ──
  let crystalValue = 100;

  // ── Raio de coleta ──
  let collectionRadius = 30;

  // ── Penalidade por colisão ──
  let collisionPenalty = 150;

  // ── Perigo do planeta ──
  const planetDanger = planet?.planetDanger || 1;

  // ── Multiplicador de score ──
  let scoreMultiplier = diff.scoreMultiplier;

  // ── Duração da rota ──
  const routeDuration = diff.duration;

  // ── Bonus de sinergia ──
  let synergyBonus = 0;

  // ── Efeitos ativos ──
  let activeEffects = [];

  // ── Aplicar efeitos individuais de cada escolha ──

  // Efeitos específicos por piloto nomeado
  if (pilot?.name === 'Luke Skywalker') {
    finalHandling += 2;
    collectionRadius += 5;
    finalSpeed += 1;
  } else if (pilot?.name === 'Darth Vader') {
    finalShield += 2;
    collisionPenalty = Math.max(80, collisionPenalty - 30);
    finalHandling = Math.max(1, finalHandling - 1);
  } else if (pilot?.name === 'Leia Organa') {
    scoreMultiplier += 0.15;
    finalHandling += 1;
  } else if (pilot?.name === 'R2-D2') {
    collisionPenalty = Math.max(80, collisionPenalty - 40);
    collectionRadius += 8;
  } else if (pilot?.name === 'C-3PO') {
    finalShield += 1;
    finalLives = Math.max(finalLives, diff.baseLives);
  } else if (pilot?.name === 'Obi-Wan Kenobi') {
    finalHandling += 1;
    finalShield += 1;
    collisionPenalty = Math.max(100, collisionPenalty - 20);
  }

  // Efeitos específicos por planeta
  if (planet?.name === 'Bespin') {
    crystalValue += 25;
    obstacleSpeed += 0.5;
  } else if (planet?.name === 'Alderaan') {
    obstacleSpawnRate += 200;
  } else if (planet?.name === 'Yavin IV') {
    obstacleSpawnRate = Math.max(400, obstacleSpawnRate - 150);
    crystalSpawnRate = Math.max(1500, crystalSpawnRate - 500);
  } else if (planet?.name === 'Dagobah') {
    collectionRadius = Math.max(20, collectionRadius - 5);
  }

  // Efeitos específicos por equipamento nomeado
  if (vehicle?.name === 'AT-AT') {
    finalSpeed = Math.max(1, finalSpeed - 1);
  } else if (vehicle?.name === 'Sand Crawler') {
    finalSpeed = Math.max(1, finalSpeed - 1);
  } else if (vehicle?.name === 'Sail barge' || vehicle?.name === 'Tribubble bongo') {
    collectionRadius += 5;
    finalHandling = Math.max(1, finalHandling - 1);
  }

  // ── Aplicar sinergias ──
  const activeSynergies = [];
  for (const rule of SYNERGY_RULES) {
    if (rule.check(starship, pilot, planet, vehicle)) {
      rule.apply({
        finalSpeed,
        finalAcceleration,
        finalHandling,
        finalShield,
        finalLives,
        shipHitboxSize,
        obstacleSpeed,
        obstacleSpawnRate,
        crystalSpawnRate,
        crystalValue,
        collectionRadius,
        collisionPenalty,
        scoreMultiplier,
        synergyBonus,
        // Mutate via object reference
        set finalSpeed(v) { finalSpeed = v; },
        set finalAcceleration(v) { finalAcceleration = v; },
        set finalHandling(v) { finalHandling = v; },
        set finalShield(v) { finalShield = v; },
        set finalLives(v) { finalLives = v; },
        set shipHitboxSize(v) { shipHitboxSize = v; },
        set obstacleSpeed(v) { obstacleSpeed = v; },
        set obstacleSpawnRate(v) { obstacleSpawnRate = v; },
        set crystalSpawnRate(v) { crystalSpawnRate = v; },
        set crystalValue(v) { crystalValue = v; },
        set collectionRadius(v) { collectionRadius = v; },
        set collisionPenalty(v) { collisionPenalty = v; },
        set scoreMultiplier(v) { scoreMultiplier = v; },
        set synergyBonus(v) { synergyBonus = v; },
      });
      synergyBonus += 100;
      activeSynergies.push({
        source: rule.source,
        text: rule.text,
        type: rule.type,
      });
    }
  }

  // ── Coletar efeitos descritivos ──
  activeEffects = [
    ...getShipEffects(starship),
    ...getPilotEffects(pilot),
    ...getPlanetEffects(planet),
    ...getVehicleEffects(vehicle),
    ...activeSynergies,
  ];

  // ── Clamp final values ──
  finalSpeed = Math.min(Math.max(finalSpeed, 1), 25);
  finalAcceleration = Math.min(Math.max(finalAcceleration, 0.2), 3);
  finalHandling = Math.min(Math.max(finalHandling, 1), 25);
  finalShield = Math.min(Math.max(finalShield, 1), 30);
  collectionRadius = Math.min(Math.max(collectionRadius, 15), 60);
  collisionPenalty = Math.min(Math.max(collisionPenalty, 50), 300);
  crystalValue = Math.min(Math.max(crystalValue, 50), 300);

  // ── Label da dificuldade ──
  const difficultyLabel = diff.label;

  // ── Nível de risco geral (1-5) ──
  const riskFactors = (
    (planetDanger / 5) * 0.4 +
    (obstacleSpeed / 10) * 0.3 +
    ((2000 - obstacleSpawnRate) / 2000) * 0.3
  );
  let riskLevel = 'Baixo';
  if (riskFactors > 0.7) riskLevel = 'Extremo';
  else if (riskFactors > 0.5) riskLevel = 'Alto';
  else if (riskFactors > 0.3) riskLevel = 'Moderado';

  // ── Score preview (estimativa) ──
  const baseScore = routeDuration * 100;
  const diffBonus = scoreMultiplier;
  const dangerBonus = 1 + (planetDanger - 1) * 0.1;
  const scorePreview = Math.round(baseScore * diffBonus * dangerBonus);

  // ── Combination summary ──
  const combinationSummary = {
    shipName: starship?.name || '—',
    pilotName: pilot?.name || '—',
    planetName: planet?.name || '—',
    vehicleName: vehicle?.name || '—',
    difficulty: difficultyLabel,
  };

  return {
    finalSpeed,
    finalAcceleration,
    finalHandling,
    finalShield,
    finalLives,
    shipHitboxSize,
    obstacleSpeed,
    obstacleSpawnRate,
    crystalSpawnRate,
    crystalValue,
    collectionRadius,
    collisionPenalty,
    planetDanger,
    scoreMultiplier,
    routeDuration,
    synergyBonus,
    activeEffects,
    combinationSummary,
    // Legacy fields for compatibility
    duration: routeDuration,
    spawnRate: obstacleSpawnRate,
    asteroidSpeed: obstacleSpeed,
    difficultyLabel,
    riskLevel,
    scorePreview,
  };
};
