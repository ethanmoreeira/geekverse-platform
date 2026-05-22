// HyperdriveEscape.jsx
// Arena jogável: Fuga do Hiperespaço.
// Movimento em 4 direções com aceleração, efeito de profundidade,
// cristais de hiperespaço, 4 tipos de obstáculos, pontuação por ação.
// Usa requestAnimationFrame (rAF) para o game loop.
// Dados mutáveis em useRef; apenas o que precisa de render em useState.

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaArrowLeft, FaRedo, FaTrophy, FaSkullCrossbones,
  FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown,
} from 'react-icons/fa';
import { GiSpaceship } from 'react-icons/gi';

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
  { type: 'small',  css: 'sw-obstacle-small',  w: 3, h: 3, speedMult: 1.3, weight: 35 },
  { type: 'medium', css: 'sw-obstacle-medium', w: 4.5, h: 4.5, speedMult: 1.0, weight: 35 },
  { type: 'large',  css: 'sw-obstacle-large',  w: 6, h: 6, speedMult: 0.7, weight: 15 },
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

  // Ship movement params derived from stats
  const maxMoveSpeed = 0.35 + finalSpeed * 0.035; // px/frame in %
  const accel = 0.04 + finalAcceleration * 0.025;
  const friction = 0.85 + finalHandling * 0.005; // higher handling = less friction (more control)
  const hitboxHalf = shipHitboxSize / 2;

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
  });

  if (!gameRef.current) {
    gameRef.current = initGameState();
  }

  // ──────────────────────────────────────────────────────────────────
  // KEYBOARD
  // ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onDown = (e) => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','a','d','w','s','A','D','W','S'].includes(e.key)) {
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
      g.velX *= (1 - (1 - friction) * 3); // apply friction when no input
    }
    if (dirY !== 0) {
      g.velY += dirY * accel;
    } else {
      g.velY *= (1 - (1 - friction) * 3);
    }

    // Clamp velocity
    g.velX = clamp(g.velX, -maxMoveSpeed, maxMoveSpeed);
    g.velY = clamp(g.velY, -maxMoveSpeed, maxMoveSpeed);

    // Apply velocity
    g.shipX = clamp(g.shipX + g.velX, hitboxHalf + 1, ARENA_W - hitboxHalf - 1);
    g.shipY = clamp(g.shipY + g.velY, 15, ARENA_H - 5);

    // ── Spawn obstacles ──
    if (now - g.lastObstacleSpawn > obstacleSpawnRate) {
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

    // ── Spawn crystals ──
    if (now - g.lastCrystalSpawn > crystalSpawnRate) {
      g.lastCrystalSpawn = now;
      const x = 10 + Math.random() * 80;
      g.crystals.push({
        id: now + Math.random(),
        x,
        y: -2,
        speed: obstacleSpeed * 0.85,
        w: 2.5,
        h: 2.5,
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
    const collectRadiusPct = collectionRadius / 10; // convert to % units
    const aliveCrystals = [];
    for (const c of g.crystals) {
      c.y += c.speed * 0.14;

      if (c.y > 105) {
        continue; // missed
      }

      // Collection check (more generous radius)
      const dx = c.x - g.shipX;
      const dy = c.y - g.shipY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < collectRadiusPct) {
        g.crystalsCollected += 1;
        g.score += Math.round(crystalValue * scoreMultiplier);
        // Add floating feedback
        g.feedbacks.push({
          id: now + Math.random(),
          x: c.x,
          y: c.y,
          text: `+${Math.round(crystalValue * scoreMultiplier)}`,
          created: now,
        });
        continue;
      }
      aliveCrystals.push(c);
    }
    g.crystals = aliveCrystals;

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
      obstaclesDodged: 0,
      collisions: 0,
      timeLeft: duration,
      keysDown: {},
      mobileDir: { x: 0, y: 0 },
      startTime: performance.now(),
      lastObstacleSpawn: performance.now(),
      lastCrystalSpawn: performance.now(),
      flashUntil: 0,
    });

    setGameStatus(GAME_STATUS.PLAYING);
    setRenderTick(0);

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

    return (
      <div className="sw-game-result">
        <div className="sw-result-card">
          <div className="sw-result-header">
            {isWin ? (
              <FaTrophy className="sw-result-trophy" />
            ) : (
              <FaSkullCrossbones className="sw-result-trophy" style={{ color: 'var(--sw-danger)' }} />
            )}
            <h2 className="sw-result-title">
              {isWin ? 'Fuga concluida com sucesso' : 'Nave destruida'}
            </h2>
            <p className="sw-result-subtitle">
              {isWin
                ? 'A missao escapou do campo de asteroides.'
                : 'A missao falhou antes do salto final.'}
            </p>
          </div>

          <div className="sw-result-stats">
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Nave</span>
              <span className="sw-result-stat-value">{combinationSummary.shipName || starship?.name || '—'}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Piloto</span>
              <span className="sw-result-stat-value">{combinationSummary.pilotName || pilot?.name || '—'}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Destino</span>
              <span className="sw-result-stat-value">{combinationSummary.planetName || planet?.name || '—'}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Equipamento</span>
              <span className="sw-result-stat-value">{combinationSummary.vehicleName || vehicle?.name || '—'}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Dificuldade</span>
              <span className="sw-result-stat-value">{difficultyLabel}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Tempo sobrevivido</span>
              <span className="sw-result-stat-value">{timeSurvived}s / {duration}s</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Cristais coletados</span>
              <span className="sw-result-stat-value">{g.crystalsCollected}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Obstaculos desviados</span>
              <span className="sw-result-stat-value">{g.obstaclesDodged}</span>
            </div>
            <div className="sw-result-stat">
              <span className="sw-result-stat-label">Colisoes</span>
              <span className="sw-result-stat-value">{g.collisions}</span>
            </div>
            <div className="sw-result-stat sw-result-stat-highlight">
              <span className="sw-result-stat-label">Pontuacao final</span>
              <span className="sw-result-stat-value">
                {finalScore.toLocaleString('pt-BR')} pts
              </span>
            </div>
          </div>

          {/* Effects & Synergies */}
          {activeEffects.length > 0 && (
            <div className="sw-result-effects">
              <div className="sw-result-effects-title">Efeitos ativos</div>
              {activeEffects.map((e, i) => (
                <div
                  key={i}
                  className={`sw-result-effect-item ${e.type === 'synergy' ? 'sw-effect-synergy' : ''}`}
                >
                  {e.text}
                </div>
              ))}
            </div>
          )}

          <div className="sw-result-actions">
            <button className="sw-btn sw-btn-primary" onClick={startGame} type="button">
              <FaRedo /> Jogar novamente
            </button>
            <button className="sw-btn sw-btn-secondary" onClick={onBackToBuilder} type="button">
              <FaArrowLeft /> Editar missao
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
      <div className="sw-arena-preview">
        <div className="sw-playable-arena sw-game-field">
          <StarField />
          <div className="sw-arena-ready-overlay">
            <GiSpaceship className="sw-arena-ready-icon" />
            <h2 className="sw-arena-ready-title">Pronto para a fuga?</h2>
            <p className="sw-arena-ready-sub">
              Nave: {starship?.name || 'Nave Estelar'} | Dificuldade: {difficultyLabel}
            </p>
            <p className="sw-arena-ready-sub" style={{ fontSize: '0.72rem' }}>
              Use WASD ou setas para mover em 4 direcoes
            </p>
            <button className="sw-btn sw-btn-primary sw-btn-glow" onClick={startGame} type="button">
              Iniciar Fuga
            </button>
          </div>
        </div>
        <div className="sw-arena-actions">
          <button className="sw-btn sw-btn-secondary" onClick={onBackToBuilder} type="button">
            <FaArrowLeft /> Editar missao
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
    <div className="sw-arena-preview">
      <div
        className="sw-playable-arena sw-game-field"
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
              <span className="sw-hud-label">NAVE</span>
              <span className="sw-hud-value sw-hud-value-sm">{starship?.name || '—'}</span>
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

        {/* Crystals with depth effect */}
        {g.crystals.map((c) => {
          const progress = clamp(c.y / 100, 0, 1);
          const scale = getDepthScale(progress);
          const opacity = getDepthOpacity(progress);
          return (
            <div
              key={c.id}
              className="sw-crystal"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
            >
              <div className="sw-crystal-inner" />
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
            <GiSpaceship className="sw-game-ship-icon" />
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
