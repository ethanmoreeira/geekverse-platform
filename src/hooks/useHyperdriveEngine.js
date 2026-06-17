import { useState, useEffect, useRef } from 'react';
import { GAME_STATUS, clamp, pickObstacleType, ARENA_H, ARENA_W, TARGETED_OBSTACLE_CHANCE_BY_LEVEL } from '../components/game/starWars/hyperdrive/constants';

import { logAuditEvent } from '../services/auditService';

export const useHyperdriveEngine = (missionStats, gamepadInputRef, musicController) => {
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.READY);
  const [renderTick, setRenderTick] = useState(0);
  const [countdownValue, setCountdownValue] = useState(null);

  const gameRef = useRef(null);
  const tickRef = useRef(null);

  const ms = missionStats || {};
  const duration = ms.routeDuration || ms.duration || 45;
  const obstacleSpawnRate = ms.obstacleSpawnRate || ms.spawnRate || 1500;
  const crystalSpawnRate = ms.crystalSpawnRate || 3500;
  const obstacleSpeed = ms.obstacleSpeed || ms.asteroidSpeed || 2;
  const finalHandling = ms.finalHandling || 10;
  const finalLives = ms.finalLives || 3;
  const finalSpeed = ms.finalSpeed || 10;
  const finalAcceleration = ms.finalAcceleration || 0.8;
  const shipHitboxSize = ms.shipHitboxSize || 7;
  const crystalValue = ms.crystalValue || 100;
  const collectionRadius = ms.collectionRadius || 30;
  const collisionPenalty = ms.collisionPenalty || 150;
  const scoreMultiplier = ms.scoreMultiplier || 1;
  const planetDanger = ms.planetDanger || 1;
  const synergyBonus = ms.synergyBonus || 0;
  const difficultyLabel = ms.difficultyLabel || 'Fácil';

  const diffFactor = planetDanger >= 3 ? 1.0 : (planetDanger >= 2 ? 0.70 : 0.60);
  const maxMoveSpeed = (0.35 + finalSpeed * 0.035) * diffFactor;
  const accel = (0.025 + finalAcceleration * 0.015) * diffFactor;
  const friction = 0.80 + finalHandling * 0.003;
  const hitboxHalf = shipHitboxSize / 2;

  const generateHyperCrystalSchedule = (totalDuration, diffLabel) => {
    const l = diffLabel.toLowerCase();
    let quota = 2;
    if (l.includes('médio') || l.includes('medio')) quota = 4;
    if (l.includes('difícil') || l.includes('dificil')) quota = 6;
    
    const schedule = [];
    const blockTime = totalDuration / quota;
    for (let i = 0; i < quota; i++) {
       const minTime = i * blockTime + (blockTime * 0.15);
       const maxTime = (i + 1) * blockTime - (blockTime * 0.15); 
       schedule.push(minTime + Math.random() * (maxTime - minTime));
    }
    return schedule.sort((a, b) => a - b);
  };

  const initGameState = () => ({
    status: GAME_STATUS.READY,
    shipX: 50,
    shipY: 80,
    velX: 0,
    velY: 0,
    obstacles: [],
    crystals: [],
    feedbacks: [],
    lives: finalLives,
    score: 0,
    crystalsCollected: 0,
    hyperCrystalsCollected: 0,
    obstaclesDodged: 0,
    collisions: 0,
    startTime: 0,
    lastObstacleSpawn: 0,
    lastCrystalSpawn: 0,
    timeLeft: duration,
    keysDown: {},
    mobileDir: { x: 0, y: 0 },
    frameId: null,
    mounted: true,
    flashUntil: 0,
    hyperCrystalsSpawned: 0,
    hyperCrystalSchedule: generateHyperCrystalSchedule(duration, difficultyLabel),
  });

  if (!gameRef.current) {
    gameRef.current = initGameState();
  }

  // KEYBOARD
  useEffect(() => {
    const onDown = (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'a', 'd', 'w', 's', 'A', 'D', 'W', 'S'].includes(e.key)) {
        e.preventDefault();
        gameRef.current.keysDown[e.key] = true;
      }
    };
    const onUp = (e) => {
      delete gameRef.current.keysDown[e.key];
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // GAME LOOP
  tickRef.current = (now) => {
    const g = gameRef.current;
    if (!g.mounted || g.status !== GAME_STATUS.PLAYING) return;

    const elapsed = (now - g.startTime) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    g.timeLeft = Math.ceil(remaining);

    const keys = g.keysDown;
    let dirX = 0, dirY = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dirX -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dirX += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dirY -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dirY += 1;

    if (g.mobileDir.x !== 0) dirX = g.mobileDir.x;
    if (g.mobileDir.y !== 0) dirY = g.mobileDir.y;

    if (gamepadInputRef && gamepadInputRef.current) {
      dirX += gamepadInputRef.current.moveX;
      dirY += gamepadInputRef.current.moveY;
      dirX = Math.max(-1, Math.min(1, dirX));
      dirY = Math.max(-1, Math.min(1, dirY));
    }

    if (dirX !== 0) {
      g.velX += dirX * accel;
    } else {
      g.velX *= (1 - (1 - friction) * 4);
    }
    if (dirY !== 0) {
      g.velY += dirY * accel;
    } else {
      g.velY *= (1 - (1 - friction) * 4);
    }

    g.velX = clamp(g.velX, -maxMoveSpeed, maxMoveSpeed);
    g.velY = clamp(g.velY, -maxMoveSpeed, maxMoveSpeed);

    g.shipX = clamp(g.shipX + g.velX, hitboxHalf + 1, ARENA_W - hitboxHalf - 1);
    g.shipY = clamp(g.shipY + g.velY, 15, ARENA_H - 5);

    const spawnMult = planetDanger >= 3 ? 0.65 : (planetDanger >= 2 ? 0.75 : 0.85);
    const finalSpawnRate = obstacleSpawnRate * spawnMult;
    if (now - g.lastObstacleSpawn > finalSpawnRate) {
      g.lastObstacleSpawn = now;
      const oType = pickObstacleType(planetDanger);
      const x = 10 + Math.random() * 80;
      const speedVariance = 0.8 + Math.random() * 0.4;
      const computedSpeed = obstacleSpeed * oType.speedMult * speedVariance;

      let isTargeted = false;
      let velX = 0;
      let velY = 0;

      const targetedChance = TARGETED_OBSTACLE_CHANCE_BY_LEVEL[difficultyLabel] ?? 0.40;

      if (Math.random() < targetedChance) {
        isTargeted = true;
        const dx = g.shipX - x;
        const dy = g.shipY - (-2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const baseSpeed = computedSpeed * 0.15;
        velX = (dx / dist) * baseSpeed;
        velY = (dy / dist) * baseSpeed;
      }

      g.obstacles.push({
        id: now + Math.random(),
        x,
        y: -2,
        speed: computedSpeed,
        isTargeted,
        velX,
        velY,
        ...oType,
      });
    }

    if (g.hyperCrystalSchedule.length > 0 && elapsed >= g.hyperCrystalSchedule[0]) {
      g.hyperCrystalSchedule.shift();
      g.hyperCrystalsSpawned += 1;
      
      g.crystals.push({
        id: now + Math.random(),
        x: 10 + Math.random() * 80,
        y: -2,
        speed: obstacleSpeed * 1.0,
        isHyper: true
      });
    }

    if (now - g.lastCrystalSpawn > crystalSpawnRate) {
      g.lastCrystalSpawn = now;
      g.crystals.push({
        id: now + Math.random(),
        x: 10 + Math.random() * 80,
        y: -2,
        speed: obstacleSpeed * 0.8,
        isHyper: false
      });
    }

    const shipL = g.shipX - hitboxHalf;
    const shipR = g.shipX + hitboxHalf;
    const shipT = g.shipY - hitboxHalf;
    const shipB = g.shipY + hitboxHalf;

    const aliveObstacles = [];
    for (const o of g.obstacles) {
      if (o.isTargeted) {
        o.x += o.velX;
        o.y += o.velY;
      } else {
        o.y += o.speed * 0.14;
      }

      if (o.y > 105 || o.x < -20 || o.x > 120) {
        if (o.y > 105) {
          g.obstaclesDodged += 1;
          g.score += 30;
        }
        continue;
      }

      const oL = o.x - o.w / 2;
      const oR = o.x + o.w / 2;
      const oT = o.y - o.h / 2;
      const oB = o.y + o.h / 2;

      if (oR > shipL && oL < shipR && oB > shipT && oT < shipB) {
        g.lives -= 1;
        g.collisions += 1;
        g.score = Math.max(0, g.score - collisionPenalty);
        g.flashUntil = now + 300;
        continue;
      }
      aliveObstacles.push(o);
    }
    g.obstacles = aliveObstacles;

    g.crystals = g.crystals.filter(c => {
      c.y += c.speed * 0.14;
      if (c.y > 105) {
        return false;
      }

      const dx = c.x - g.shipX;
      const dy = c.y - g.shipY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < collectionRadius / 10) {
        if (c.isHyper) {
          g.score += 300 * scoreMultiplier;
          g.hyperCrystalsCollected += 1;
          g.feedbacks.push({ id: Date.now(), x: c.x, y: c.y, text: `+${300 * scoreMultiplier} Hipercristal!`, created: now });
        } else {
          g.score += crystalValue * scoreMultiplier;
          g.crystalsCollected += 1;
          g.feedbacks.push({ id: Date.now(), x: c.x, y: c.y, text: `+${crystalValue * scoreMultiplier}`, created: now });
        }
        return false;
      }
      return true;
    });

    g.feedbacks = g.feedbacks.filter(f => now - f.created < 800);

    if (g.lives <= 0) {
      g.status = GAME_STATUS.LOST;
      setGameStatus(GAME_STATUS.LOST);
      setRenderTick(t => t + 1);
      return;
    }
    if (remaining <= 0) {
      g.status = GAME_STATUS.WON;
      g.score += 500;
      g.score += synergyBonus;
      g.score = Math.round(g.score * scoreMultiplier);
      g.score = Math.max(0, g.score);
      setGameStatus(GAME_STATUS.WON);
      setRenderTick(t => t + 1);
      return;
    }

    setRenderTick(t => t + 1);
    g.frameId = requestAnimationFrame(tickRef.current);
  };

  const startGame = () => {
    const g = gameRef.current;
    if (g.frameId) {
      cancelAnimationFrame(g.frameId);
      g.frameId = null;
    }

    Object.assign(g, {
      status: GAME_STATUS.COUNTDOWN,
      shipX: 50,
      shipY: 80,
      velX: 0,
      velY: 0,
      obstacles: [],
      crystals: [],
      feedbacks: [],
      lives: finalLives,
      score: 0,
      crystalsCollected: 0,
      hyperCrystalsCollected: 0,
      obstaclesDodged: 0,
      collisions: 0,
      timeLeft: duration,
      keysDown: {},
      mobileDir: { x: 0, y: 0 },
    });

    setGameStatus(GAME_STATUS.COUNTDOWN);
    setCountdownValue(3);
    setRenderTick(0);

    musicController?.switchToArenaMusic?.();
  };

  useEffect(() => {
    if (gameStatus === GAME_STATUS.COUNTDOWN && countdownValue !== null) {
      if (typeof countdownValue === 'number') {
        if (countdownValue > 1) {
          const t = setTimeout(() => {
            setCountdownValue(countdownValue - 1);
          }, 1000);
          return () => clearTimeout(t);
        } else if (countdownValue === 1) {
          const t = setTimeout(() => {
            setCountdownValue(null);

            const g = gameRef.current;
            Object.assign(g, {
              status: GAME_STATUS.PLAYING,
              startTime: performance.now(),
              lastObstacleSpawn: performance.now(),
              lastCrystalSpawn: performance.now(),
              flashUntil: 0,
              hyperCrystalsSpawned: 0,
              hyperCrystalSchedule: generateHyperCrystalSchedule(duration, difficultyLabel),
            });

            setGameStatus(GAME_STATUS.PLAYING);

            try {
              logAuditEvent({
                eventType: 'game_start',
                description: 'Usuário iniciou uma partida em Fuga do Hiperespaço',
                gameId: 'fuga-hiperespaco',
                gameName: 'Fuga do Hiperespaço',
                metadata: {
                  difficulty: difficultyLabel,
                  startedAt: new Date().toISOString()
                }
              });
            } catch { /* auditoria opcional */ }

            g.frameId = requestAnimationFrame(tickRef.current);
          }, 1000);
          return () => clearTimeout(t);
        }
      }
    }
  }, [gameStatus, countdownValue, difficultyLabel, duration]);

  useEffect(() => {
    const g = gameRef.current;
    g.mounted = true;
    return () => {
      g.mounted = false;
      if (g.frameId) {
        cancelAnimationFrame(g.frameId);
        g.frameId = null;
      }
      g.keysDown = {};
      g.mobileDir = { x: 0, y: 0 };
      musicController?.stopMusic?.();
    };
  }, []);

  const handleMobileDown = (dx, dy) => {
    gameRef.current.mobileDir = { x: dx, y: dy };
  };
  const handleMobileUp = () => {
    gameRef.current.mobileDir = { x: 0, y: 0 };
  };

  return {
    gameStatus,
    setGameStatus,
    renderTick,
    countdownValue,
    gameRef,
    startGame,
    handleMobileDown,
    handleMobileUp,
  };
};
