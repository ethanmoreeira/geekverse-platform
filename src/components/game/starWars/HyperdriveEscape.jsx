// HyperdriveEscape.jsx
// Arena jogável: Fuga do Hiperespaço.
// Movimento em 4 direções com aceleração, efeito de profundidade,
// cristais de hiperespaço, 4 tipos de obstáculos, pontuação por ação.
// Usa requestAnimationFrame (rAF) para o game loop.
// Dados mutáveis em useRef; apenas o que precisa de render em useState.

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaArrowLeft, FaRedo, FaTrophy, FaSkullCrossbones,
  FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaShare, FaFileExport
} from 'react-icons/fa';
import { GiSpaceship } from 'react-icons/gi';
import { useAuth } from '../../../hooks/useAuth';
import { saveResult } from '../../../services/rankingService';
import { exportJsonFile } from '../../../utils/exportResult';
import { logAuditEvent } from '../../../services/auditService';
import spaceshipSpriteImg from '../../../assets/backgrounds/star-wars/spaceship_sprite_topdown.png';
import { stopAllFugaMusic, switchToFugaArenaMusic } from '../../../services/audioService';

// ─── Constantes ─────────────────────────────────────────────────────

const GAME_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  WON: 'won',
  LOST: 'lost',
};

const ARENA_W = 100; // percentual
const ARENA_H = 100;

// Tipos de obstáculo
const OBSTACLE_TYPES = [
  { type: 'small', css: 'sw-obstacle-small', w: 3, h: 3, speedMult: 1.3, weight: 35 },
  { type: 'medium', css: 'sw-obstacle-medium', w: 4.5, h: 4.5, speedMult: 1.0, weight: 35 },
  { type: 'large', css: 'sw-obstacle-large', w: 6, h: 6, speedMult: 0.7, weight: 15 },
  { type: 'debris', css: 'sw-obstacle-debris', w: 4, h: 2.2, speedMult: 1.15, weight: 15 },
];

// ─── Helpers ────────────────────────────────────────────────────────

const pickObstacleType = (planetDanger) => {
  // Higher danger = more large asteroids
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

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// Depth scale: objects start small and grow as they approach
const getDepthScale = (progress) => 0.3 + progress * 0.7; // 0.3 → 1.0
const getDepthOpacity = (progress) => 0.2 + progress * 0.8; // 0.2 → 1.0

// ─── Star streaks for background ────────────────────────────────────

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      height: 8 + Math.random() * 25,
      duration: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="sw-arena-starfield">
      {stars.map(s => (
        <div
          key={s.id}
          className="sw-star-streak"
          style={{
            left: `${s.left}%`,
            height: `${s.height}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
};

// ─── Componente ─────────────────────────────────────────────────────

const HyperdriveEscape = ({
  missionStats,
  starship,
  pilot,
  planet,
  vehicle,
  onBackToBuilder,
  onPlayAgain,
}) => {
  // ── Estado para render ──
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.READY);
  const [renderTick, setRenderTick] = useState(0);

  // ── Auth & Ranking ──
  const { user } = useAuth();
  const hasSavedRankingRef = useRef(false);

  // ── Refs mutáveis (dados de frame, nunca causam re-render) ──
  const gameRef = useRef(null);
  const arenaRef = useRef(null);
  const tickRef = useRef(null);

  // ── Parâmetros derivados de missionStats (com fallbacks seguros) ──
  const ms = missionStats || {};
  const duration = ms.routeDuration || ms.duration || 45;
  const obstacleSpawnRate = ms.obstacleSpawnRate || ms.spawnRate || 1500;
  const crystalSpawnRate = ms.crystalSpawnRate || 3500;
  const obstacleSpeed = ms.obstacleSpeed || ms.asteroidSpeed || 2;
  const finalHandling = ms.finalHandling || 10;
  const finalLives = ms.finalLives || 3;
  const finalSpeed = ms.finalSpeed || 10;
  const finalAcceleration = ms.finalAcceleration || 0.8;
  const finalShield = ms.finalShield || 5;
  const shipHitboxSize = ms.shipHitboxSize || 7;
  const crystalValue = ms.crystalValue || 100;
  const collectionRadius = ms.collectionRadius || 30;
  const collisionPenalty = ms.collisionPenalty || 150;
  const scoreMultiplier = ms.scoreMultiplier || 1;
  const planetDanger = ms.planetDanger || 1;
  const synergyBonus = ms.synergyBonus || 0;
  const activeEffects = ms.activeEffects || [];
  const combinationSummary = ms.combinationSummary || {};
  const difficultyLabel = ms.difficultyLabel || 'Fácil';

  // Ship movement params derived from stats (suavizado)
  const diffFactor = planetDanger >= 3 ? 1.0 : (planetDanger >= 2 ? 0.70 : 0.60);
  const maxMoveSpeed = (0.35 + finalSpeed * 0.035) * diffFactor; // px/frame in %
  const accel = (0.025 + finalAcceleration * 0.015) * diffFactor;
  const friction = 0.80 + finalHandling * 0.003; // menor = para mais rápido = mais controle
  const hitboxHalf = shipHitboxSize / 2;

  // ── Hypercrystal Schedule Helper ──
  const generateHyperCrystalSchedule = (totalDuration, diffLabel) => {
    const l = diffLabel.toLowerCase();
    let quota = 2; // Default for easy
    if (l.includes('médio') || l.includes('medio')) quota = 4;
    if (l.includes('difícil') || l.includes('dificil')) quota = 6;
    
    const schedule = [];
    const blockTime = totalDuration / quota;
    for (let i = 0; i < quota; i++) {
       const minTime = i * blockTime + (blockTime * 0.15); // avoid exact borders
       const maxTime = (i + 1) * blockTime - (blockTime * 0.15); 
       schedule.push(minTime + Math.random() * (maxTime - minTime));
    }
    return schedule.sort((a, b) => a - b);
  };

  // ── Init game ref ──
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

  // ──────────────────────────────────────────────────────────────────
  // KEYBOARD
  // ──────────────────────────────────────────────────────────────────

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

  // ──────────────────────────────────────────────────────────────────
  // GAME LOOP
  // ──────────────────────────────────────────────────────────────────

  tickRef.current = (now) => {
    const g = gameRef.current;
    if (!g.mounted || g.status !== GAME_STATUS.PLAYING) return;

    const elapsed = (now - g.startTime) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    g.timeLeft = Math.ceil(remaining);

    // ── Move ship with acceleration ──
    const keys = g.keysDown;
    let dirX = 0, dirY = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) dirX -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) dirX += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) dirY -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) dirY += 1;

    // Mobile overrides
    if (g.mobileDir.x !== 0) dirX = g.mobileDir.x;
    if (g.mobileDir.y !== 0) dirY = g.mobileDir.y;

    // Apply acceleration
    if (dirX !== 0) {
      g.velX += dirX * accel;
    } else {
      g.velX *= (1 - (1 - friction) * 4); // drag mais forte (para mais rápido)
    }
    if (dirY !== 0) {
      g.velY += dirY * accel;
    } else {
      g.velY *= (1 - (1 - friction) * 4);
    }

    // Clamp velocity
    g.velX = clamp(g.velX, -maxMoveSpeed, maxMoveSpeed);
    g.velY = clamp(g.velY, -maxMoveSpeed, maxMoveSpeed);

    // Apply velocity
    g.shipX = clamp(g.shipX + g.velX, hitboxHalf + 1, ARENA_W - hitboxHalf - 1);
    g.shipY = clamp(g.shipY + g.velY, 15, ARENA_H - 5);

    // ── Spawn obstacles ──
    const spawnMult = planetDanger >= 3 ? 0.65 : (planetDanger >= 2 ? 0.75 : 0.85);
    const finalSpawnRate = obstacleSpawnRate * spawnMult;
    if (now - g.lastObstacleSpawn > finalSpawnRate) {
      g.lastObstacleSpawn = now;
      const oType = pickObstacleType(planetDanger);
      const x = 10 + Math.random() * 80; // spawn across width
      const speedVariance = 0.8 + Math.random() * 0.4;
      g.obstacles.push({
        id: now + Math.random(),
        x,
        y: -2, // start above arena
        speed: obstacleSpeed * oType.speedMult * speedVariance,
        ...oType,
      });
    }

    // ── Spawn crystals and hypercrystals ──
    
    // Independent Hypercrystal spawn
    if (g.hyperCrystalSchedule.length > 0 && elapsed >= g.hyperCrystalSchedule[0]) {
      g.hyperCrystalSchedule.shift(); // Remove da fila
      g.hyperCrystalsSpawned += 1;
      
      if (import.meta.env.DEV) {
        console.log(`[HyperdriveEscape] Hipercristal gerado ${g.hyperCrystalsSpawned}`);
      }

      g.crystals.push({
        id: now + Math.random(),
        x: 10 + Math.random() * 80,
        y: -2,
        speed: obstacleSpeed * 1.0,
        isHyper: true
      });
    }

    // Common Crystal spawn
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

    // ── Move obstacles & check collisions ──
    const shipL = g.shipX - hitboxHalf;
    const shipR = g.shipX + hitboxHalf;
    const shipT = g.shipY - hitboxHalf;
    const shipB = g.shipY + hitboxHalf;

    const aliveObstacles = [];
    for (const o of g.obstacles) {
      o.y += o.speed * 0.14;

      if (o.y > 105) {
        // Dodged
        g.obstaclesDodged += 1;
        g.score += 30;
        continue;
      }

      // Collision check
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

    // ── Move crystals & check collection ──
    g.crystals = g.crystals.filter(c => {
      c.y += c.speed * 0.14;
      if (c.y > 105) {
        if (c.isHyper && import.meta.env.DEV) {
           console.log('[HyperdriveEscape] Hipercristal saiu da arena sem coleta');
        }
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
          if (import.meta.env.DEV) {
            console.log(`[HyperdriveEscape] Hipercristal coletado ${g.hyperCrystalsCollected}`);
          }
        } else {
          g.score += crystalValue * scoreMultiplier;
          g.crystalsCollected += 1;
          g.feedbacks.push({ id: Date.now(), x: c.x, y: c.y, text: `+${crystalValue * scoreMultiplier}`, created: now });
        }
        return false;
      }
      return true;
    });

    // Clean old feedbacks
    g.feedbacks = g.feedbacks.filter(f => now - f.created < 800);

    // ── End conditions ──
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

    // ── Trigger re-render ──
    setRenderTick(t => t + 1);

    // Schedule next frame
    g.frameId = requestAnimationFrame(tickRef.current);
  };

  // ──────────────────────────────────────────────────────────────────
  // START / RESTART
  // ──────────────────────────────────────────────────────────────────

  const startGame = () => {
    const g = gameRef.current;

    if (g.frameId) {
      cancelAnimationFrame(g.frameId);
      g.frameId = null;
    }

    // Reset
    Object.assign(g, {
      status: GAME_STATUS.PLAYING,
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
      startTime: performance.now(),
      lastObstacleSpawn: performance.now(),
      lastCrystalSpawn: performance.now(),
      flashUntil: 0,
      hyperCrystalsSpawned: 0,
      hyperCrystalSchedule: generateHyperCrystalSchedule(duration, difficultyLabel),
    });

    setGameStatus(GAME_STATUS.PLAYING);
    setRenderTick(0);
    hasSavedRankingRef.current = false;

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

    switchToFugaArenaMusic();

    g.frameId = requestAnimationFrame(tickRef.current);
  };

  // ── Cleanup on unmount ──
  useEffect(() => {
    const g = gameRef.current;
    g.mounted = true;
    return () => {
      g.mounted = false;
      if (g.frameId) {
        cancelAnimationFrame(g.frameId);
        g.frameId = null;
      }
    };
  }, []);

  // ── Salvar resultado no Ranking quando o jogo terminar (fora do rAF) ──
  useEffect(() => {
    if (gameStatus !== GAME_STATUS.WON && gameStatus !== GAME_STATUS.LOST) return;
    if (hasSavedRankingRef.current) return;

    hasSavedRankingRef.current = true;
    const g = gameRef.current;
    const isWin = gameStatus === GAME_STATUS.WON;

    // Map label back to ranking key
    const labelToKey = { 'fácil': 'easy', 'médio': 'medium', 'difícil': 'challenge' };
    const diffKey = labelToKey[difficultyLabel.toLowerCase()] || 'easy';
    const survived = duration - (g.timeLeft || 0);
    const fmtTime = (s) => {
      const m = Math.floor(s / 60);
      const r = Math.round(s % 60);
      return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    };
    const survBonus = isWin ? Math.round((500 + synergyBonus) * scoreMultiplier) : 0;

    const payload = {
      gameId: 'fuga-hiperespaco',
      gameName: 'Fuga do Hiperespaço',
      playerName: user?.nome || 'Jogador GeekVerse',
      playerEmail: user?.email || '',
      difficulty: diffKey,
      status: isWin ? 'completed' : 'failed',
      score: Math.max(0, g.score),
      timeInSeconds: Math.round(survived),
      formattedTime: fmtTime(survived),
      crystals: g.crystalsCollected,
      hyperCrystalsCollected: g.hyperCrystalsCollected,
      obstaclesDodged: g.obstaclesDodged,
      collisions: g.collisions,
      survivalBonus: survBonus,
      rankingEligible: isWin,
    };

    saveResult(payload);
    
    logAuditEvent({
      eventType: 'game_finish',
      description: `Usuário concluiu uma partida em Fuga do Hiperespaço com ${isWin ? 'vitória' : 'derrota'}`,
      gameId: 'fuga-hiperespaco',
      gameName: 'Fuga do Hiperespaço',
      metadata: {
        difficulty: diffKey,
        status: isWin ? 'completed' : 'failed',
        score: Math.max(0, g.score),
        time: Math.round(survived),
        crystals: g.crystalsCollected,
        collisions: g.collisions,
        rankingEligible: isWin
      }
    });

    stopAllFugaMusic();

    if (import.meta.env.DEV) {
      console.log('[HyperdriveEscape] Resultado salvo no ranking:', payload);
    }
  }, [gameStatus, difficultyLabel, duration, scoreMultiplier, synergyBonus, user]);

  // ── Mobile controls ──
  const handleMobileDown = (dx, dy) => {
    gameRef.current.mobileDir = { x: dx, y: dy };
  };
  const handleMobileUp = () => {
    gameRef.current.mobileDir = { x: 0, y: 0 };
  };

  // ── Read game state for rendering ──
  const g = gameRef.current;
  const timeSurvived = duration - (g.timeLeft || 0);

  // ──────────────────────────────────────────────────────────────────
  // RENDER — RESULT SCREEN
  // ──────────────────────────────────────────────────────────────────

  if (gameStatus === GAME_STATUS.WON || gameStatus === GAME_STATUS.LOST) {
    const isWin = gameStatus === GAME_STATUS.WON;
    const finalScore = Math.max(0, g.score);
    const mult = isWin ? scoreMultiplier : 1;

    // Calcula o detalhamento invertendo as multiplicações do final (com arredondamentos seguros)
    const crystalsPts = Math.round(g.crystalsCollected * crystalValue * scoreMultiplier * mult);
    const hyperPts = Math.round(g.hyperCrystalsCollected * 300 * scoreMultiplier * mult);
    const dodgePts = Math.round(g.obstaclesDodged * 30 * mult);
    const colPts = Math.round(g.collisions * collisionPenalty * mult);
    const survPts = isWin ? Math.round((500 + synergyBonus) * mult) : 0;

    return (
      <div className="sw-game-result">
        <div className={`sw-result-card ${isWin ? 'sw-result-card-victory' : 'sw-result-card-defeat'}`}>
          <div className="sw-result-header">
            <h2 className="sw-result-title">
              {isWin ? 'Fuga concluida com sucesso' : 'Nave destruida'}
            </h2>
          </div>

          <div className="sw-result-body" style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Coluna Única: Resultado */}
            <div className="sw-result-column" style={{ width: '100%', maxWidth: '450px' }}>
              <h3 className="sw-result-column-title">Resultado da Partida</h3>
              <div className="sw-result-stat sw-result-stat-highlight">
                <span className="sw-result-stat-label">Pontuacao final</span>
                <span className="sw-result-stat-value">
                  {finalScore.toLocaleString('pt-BR')} pts
                </span>
              </div>
              <div className="sw-result-stats">
                <div className="sw-result-stat">
                  <span className="sw-result-stat-label">Cristais</span>
                  <span className="sw-result-stat-value">{g.crystalsCollected}</span>
                </div>
                {g.hyperCrystalsCollected > 0 && (
                  <div className="sw-result-stat">
                    <span className="sw-result-stat-label">Hipercristais</span>
                    <span className="sw-result-stat-value sw-text-cyan-bright">{g.hyperCrystalsCollected}</span>
                  </div>
                )}
                <div className="sw-result-stat">
                  <span className="sw-result-stat-label">Desvios</span>
                  <span className="sw-result-stat-value">{g.obstaclesDodged}</span>
                </div>
                <div className="sw-result-stat">
                  <span className="sw-result-stat-label">Colisoes</span>
                  <span className="sw-result-stat-value">{g.collisions}</span>
                </div>
              </div>

              <div className="sw-result-breakdown">
                <div className="sw-result-breakdown-title">Detalhamento</div>
                <div className="sw-result-breakdown-grid">
                  <div className="sw-result-breakdown-item">
                    <span>Cristais ({g.crystalsCollected}):</span>
                    <span className="sw-text-cyan">+{crystalsPts}</span>
                  </div>
                  {g.hyperCrystalsCollected > 0 && (
                    <div className="sw-result-breakdown-item">
                      <span>Hipercristais ({g.hyperCrystalsCollected}):</span>
                      <span className="sw-text-cyan-bright">+{hyperPts}</span>
                    </div>
                  )}
                  <div className="sw-result-breakdown-item">
                    <span>Desvios ({g.obstaclesDodged}):</span>
                    <span className="sw-text-cyan">+{dodgePts}</span>
                  </div>
                  {g.collisions > 0 && (
                    <div className="sw-result-breakdown-item">
                      <span>Colisoes ({g.collisions}):</span>
                      <span className="sw-text-cyan-dim">-{colPts}</span>
                    </div>
                  )}
                  {isWin && (
                    <div className="sw-result-breakdown-item">
                      <span>Sobrevivencia:</span>
                      <span className="sw-text-cyan">+{survPts}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Effects & Synergies */}
          {activeEffects.length > 0 && (
            <details className="sw-result-effects-details">
              <summary className="sw-result-effects-summary">Ver efeitos da build</summary>
              <div className="sw-result-effects-content">
                {activeEffects.map((e, i) => (
                  <div
                    key={i}
                    className={`sw-result-effect-item ${e.type === 'synergy' ? 'sw-effect-synergy' : ''}`}
                  >
                    {e.text}
                  </div>
                ))}
              </div>
            </details>
          )}

          <div className="sw-result-actions">
            <button className="sw-btn sw-btn-primary" onClick={startGame} type="button">
              <FaRedo /> Jogar novamente
            </button>
            <button className="sw-btn sw-btn-secondary" onClick={onBackToBuilder} type="button">
              <FaArrowLeft /> Editar missao
            </button>
            <button
              className="sw-btn sw-btn-secondary starwars-export-button"
              type="button"
              id="btn-export-starwars"
              onClick={() => {
                const exportData = {
                  jogo: 'Fuga do Hiperespaço',
                  gameId: 'fuga-hiperespaco',
                  jogador: user?.nome || 'Jogador GeekVerse',
                  email: user?.email || '',
                  dificuldade: difficultyLabel,
                  status: isWin ? 'vitória' : 'derrota',
                  pontuacaoFinal: finalScore,
                  cristais: g.crystalsCollected,
                  hipercristais: g.hyperCrystalsCollected,
                  desvios: g.obstaclesDodged,
                  colisoes: g.collisions,
                  nave: starship?.name || '',
                  piloto: pilot?.name || '',
                  planeta: planet?.name || '',
                  equipamento: vehicle?.name || '',
                  dataExportacao: new Date().toLocaleString('pt-BR'),
                };
                
                logAuditEvent({
                  eventType: 'result_export',
                  description: `Usuário exportou ${isWin ? 'o resultado' : 'uma tentativa'} de Fuga do Hiperespaço`,
                  gameId: 'fuga-hiperespaco',
                  gameName: 'Fuga do Hiperespaço',
                  metadata: {
                    status: isWin ? 'vitória' : 'derrota',
                    difficulty: difficultyLabel,
                    fileType: 'json',
                    filename: 'geekverse-fuga-hiperespaco-resultado'
                  }
                });

                exportJsonFile(exportData, 'geekverse-fuga-hiperespaco-resultado');
              }}
            >
              <FaFileExport /> {isWin ? 'Exportar resultado' : 'Exportar tentativa'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // RENDER — READY SCREEN
  // ──────────────────────────────────────────────────────────────────

  if (gameStatus === GAME_STATUS.READY) {
    return (
      <div className="sw-ready-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
        <div className="sw-arena-ready-overlay">
          <img src={spaceshipSpriteImg} alt="Nave" className="sw-arena-ready-icon" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <h2 className="sw-arena-ready-title" style={{ color: '#38d9ff' }}>Pronto para a fuga?</h2>

          <p className="sw-arena-ready-sub" style={{ fontSize: '0.72rem', color: '#38d9ff' }}>
            Use WASD ou setas para mover em 4 direcoes
          </p>
          <button className="sw-btn sw-btn-primary sw-btn-glow" onClick={startGame} type="button">
            Iniciar Fuga
          </button>
        </div>

      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // RENDER — PLAYING SCREEN
  // ──────────────────────────────────────────────────────────────────

  const showFlash = g.flashUntil > performance.now();

  return (
    <div className="sw-arena-screen">
      <div
        className="sw-arena-shell"
        ref={arenaRef}
        tabIndex={0}
      >
        <StarField />

        {/* Collision flash */}
        {showFlash && <div className="sw-collision-flash" />}

        {/* HUD */}
        <div className="sw-game-hud">
          <div className="sw-hud-row">
            <div className="sw-hud-item">
              <span className="sw-hud-label">TEMPO</span>
              <span className="sw-hud-value">{g.timeLeft}s</span>
            </div>
            <div className="sw-hud-item sw-hud-lives">
              <span className="sw-hud-label">VIDAS</span>
              <span className="sw-hud-value">{g.lives}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">PONTOS</span>
              <span className="sw-hud-value">{Math.max(0, g.score)}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">CRISTAIS</span>
              <span className="sw-hud-value">{g.crystalsCollected}</span>
            </div>
          </div>
          <div className="sw-hud-row">
            <div className="sw-hud-item">
              <span className="sw-hud-label">HIPERCRISTAIS</span>
              <span className="sw-hud-value" style={{ color: '#7dd3fc', textShadow: '0 0 5px rgba(125,211,252,0.5)' }}>{g.hyperCrystalsCollected}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">DESVIOS</span>
              <span className="sw-hud-value">{g.obstaclesDodged}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">COLISOES</span>
              <span className="sw-hud-value">{g.collisions}</span>
            </div>
            <div className="sw-hud-item">
              <span className="sw-hud-label">DIF.</span>
              <span className="sw-hud-value sw-hud-value-sm">{difficultyLabel}</span>
            </div>
          </div>
        </div>

        {/* Obstacles with depth effect */}
        {g.obstacles.map((o) => {
          const progress = clamp(o.y / 100, 0, 1);
          const scale = getDepthScale(progress);
          const opacity = getDepthOpacity(progress);
          return (
            <div
              key={o.id}
              className={`sw-obstacle ${o.css}`}
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
            />
          );
        })}

        {/* Crystals and Hypercrystals with depth effect */}
        {g.crystals.map((c) => {
          const progress = clamp(c.y / 100, 0, 1);
          const scale = getDepthScale(progress);
          const opacity = getDepthOpacity(progress);
          return (
            <div
              key={c.id}
              className={c.isHyper ? "sw-hypercrystal" : "sw-crystal"}
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                zIndex: c.isHyper ? 20 : 5
              }}
            >
              {c.isHyper ? (
                <span style={{ 
                  fontSize: '48px', 
                  filter: 'drop-shadow(0 0 20px #facc15) drop-shadow(0 0 40px #eab308) drop-shadow(0 0 60px #ca8a04)', 
                  display: 'block',
                  transform: 'translateY(-4px)'
                }}>💎</span>
              ) : <div className="sw-crystal-inner" />}
            </div>
          );
        })}

        {/* Collection feedbacks */}
        {g.feedbacks.map((f) => (
          <div
            key={f.id}
            className="sw-collect-feedback"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {f.text}
          </div>
        ))}

        {/* Ship */}
        <div
          className="sw-player-ship"
          style={{
            left: `${g.shipX}%`,
            top: `${g.shipY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="sw-player-ship-core">
            <img src={spaceshipSpriteImg} alt="Nave" className="sw-game-ship-icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      {/* Mobile controls — 4 directions */}
      <div className="sw-mobile-controls">
        <div className="sw-mobile-dpad">
          <button
            className="sw-mobile-btn sw-mobile-btn-up"
            onPointerDown={() => handleMobileDown(0, -1)}
            onPointerUp={handleMobileUp}
            onPointerLeave={handleMobileUp}
            type="button"
            aria-label="Mover cima"
          >
            <FaChevronUp />
          </button>
          <button
            className="sw-mobile-btn sw-mobile-btn-left"
            onPointerDown={() => handleMobileDown(-1, 0)}
            onPointerUp={handleMobileUp}
            onPointerLeave={handleMobileUp}
            type="button"
            aria-label="Mover esquerda"
          >
            <FaChevronLeft />
          </button>
          <button
            className="sw-mobile-btn sw-mobile-btn-down"
            onPointerDown={() => handleMobileDown(0, 1)}
            onPointerUp={handleMobileUp}
            onPointerLeave={handleMobileUp}
            type="button"
            aria-label="Mover baixo"
          >
            <FaChevronDown />
          </button>
          <button
            className="sw-mobile-btn sw-mobile-btn-right"
            onPointerDown={() => handleMobileDown(1, 0)}
            onPointerUp={handleMobileUp}
            onPointerLeave={handleMobileUp}
            type="button"
            aria-label="Mover direita"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HyperdriveEscape;
