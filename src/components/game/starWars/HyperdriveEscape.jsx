import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { saveResult } from '../../../services/rankingService';
import { sendGameResultEmail } from '../../../services/emailService';
import { hasEmailExportBeenSent, markEmailExportAsSent, buildResultKey } from '../../../utils/emailExportControl';
import { logAuditEvent } from '../../../services/auditService';
import spaceshipSpriteImg from '../../../assets/backgrounds/star-wars/spaceship_sprite_topdown.png';

import { useGamepadControls } from '../../../experimental/gamepad/useGamepadControls';
import { GAME_STATUS, clamp } from './hyperdrive/constants';
import { useHyperdriveEngine } from '../../../hooks/useHyperdriveEngine';
import StarField from './hyperdrive/StarField';
import HyperdriveHUD from './hyperdrive/HyperdriveHUD';
import HyperdriveMobileControls from './hyperdrive/HyperdriveMobileControls';
import HyperdriveResultScreen from './hyperdrive/HyperdriveResultScreen';

const HyperdriveEscape = ({
  missionStats,
  onBackToBuilder,
  musicController
}) => {
  const [exportFeedback, setExportFeedback] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [matchKey, setMatchKey] = useState(null);

  const { user } = useAuth();
  const hasSavedRankingRef = useRef(false);
  const arenaRef = useRef(null);
  
  const { gamepadInputRef } = useGamepadControls();

  const {
    gameStatus,
    setGameStatus,
    renderTick,
    countdownValue,
    gameRef,
    startGame,
    handleMobileDown,
    handleMobileUp,
  } = useHyperdriveEngine(missionStats, gamepadInputRef, musicController);

  const ms = missionStats || {};
  const duration = ms.routeDuration || ms.duration || 45;
  const crystalValue = ms.crystalValue || 100;
  const collisionPenalty = ms.collisionPenalty || 150;
  const scoreMultiplier = ms.scoreMultiplier || 1;
  const synergyBonus = ms.synergyBonus || 0;
  const activeEffects = ms.activeEffects || [];
  const difficultyLabel = ms.difficultyLabel || 'Fácil';

  // ── Salvar resultado no Ranking quando o jogo terminar ──
  useEffect(() => {
    if (gameStatus !== GAME_STATUS.WON && gameStatus !== GAME_STATUS.LOST) return;
    if (hasSavedRankingRef.current) return;

    hasSavedRankingRef.current = true;
    const g = gameRef.current;
    const isWin = gameStatus === GAME_STATUS.WON;

    setMatchKey(`${Date.now()}`);

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

  }, [gameStatus, difficultyLabel, duration, scoreMultiplier, synergyBonus, user, gameRef]);

  // Export
  const handleExport = async () => {
    if (!user?.email) {
      setExportFeedback({ type: 'warn', text: 'E-mail do jogador não encontrado. Faça login novamente para enviar o resultado.' });
      return;
    }
    const exportKey = buildResultKey('fuga-hiperespaco', matchKey);
    if (hasEmailExportBeenSent(exportKey)) {
      setExportFeedback({ type: 'warn', text: 'Este resultado já foi enviado para o e-mail cadastrado.' });
      return;
    }
    setIsExporting(true);
    setExportFeedback(null);
    try {
      const g = gameRef.current;
      const isWin = gameStatus === GAME_STATUS.WON;
      const timeSurvived = duration - (g.timeLeft || 0);
      const fmtSurv = (s) => { const m = Math.floor(s / 60); const r = Math.round(s % 60); return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`; };
      await sendGameResultEmail({
        game_name: 'Fuga do Hiperespaço',
        player_name: user?.nome || user?.name || 'Jogador GeekVerse',
        player_email: user.email,
        difficulty: difficultyLabel,
        status: isWin ? 'vitória' : 'derrota',
        result_title: 'Resultado da Fuga do Hiperespaço',
        result_message: isWin ? 'Você concluiu a missão no hiperespaço.' : 'Você registrou uma tentativa na missão do hiperespaço.',
        main_metric_label: 'Pontuação final',
        main_metric_value: Math.max(0, g.score).toLocaleString('pt-BR'),
        secondary_metrics: `Cristais: ${g.crystalsCollected}\nHipercristais: ${g.hyperCrystalsCollected}\nDesvios: ${g.obstaclesDodged}\nColisões: ${g.collisions}\nTempo de sobrevivência: ${fmtSurv(timeSurvived)}`,
        generated_at: new Date().toLocaleString('pt-BR'),
      });
      markEmailExportAsSent(exportKey);
      setExportFeedback({ type: 'success', text: 'Resultado enviado com sucesso para o e-mail cadastrado.' });
    } catch {
      setExportFeedback({ type: 'error', text: 'Não foi possível enviar o resultado por e-mail. Tente novamente.' });
    } finally {
      setIsExporting(false);
    }
  };

  const getDepthScale = (progress) => 0.3 + progress * 0.7;
  const getDepthOpacity = (progress) => 0.2 + progress * 0.8;

  if (gameStatus === GAME_STATUS.WON || gameStatus === GAME_STATUS.LOST) {
    return (
      <HyperdriveResultScreen 
        gameStatus={gameStatus}
        g={gameRef.current}
        scoreMultiplier={scoreMultiplier}
        crystalValue={crystalValue}
        collisionPenalty={collisionPenalty}
        synergyBonus={synergyBonus}
        activeEffects={activeEffects}
        startGame={() => {
          hasSavedRankingRef.current = false;
          startGame();
        }}
        onBackToBuilder={onBackToBuilder}
        isExporting={isExporting}
        exportFeedback={exportFeedback}
        onExport={handleExport}
        matchKey={matchKey}
      />
    );
  }

  if (gameStatus === GAME_STATUS.READY) {
    return (
      <div className="sw-ready-screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '150px' }}>
        <div className="sw-arena-ready-overlay">
          <img src={spaceshipSpriteImg} alt="Nave" className="sw-arena-ready-icon" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          <h2 className="sw-arena-ready-title" style={{ color: '#38d9ff' }}>Pronto para a fuga?</h2>
          <p className="sw-arena-ready-sub" style={{ fontSize: '0.72rem', color: '#38d9ff' }}>
            Use WASD ou setas para mover em 4 direcoes
          </p>
          <button className="sw-btn sw-btn-primary sw-btn-glow" onClick={() => {
            hasSavedRankingRef.current = false;
            startGame();
          }} type="button">
            Iniciar Fuga
          </button>
        </div>
      </div>
    );
  }

  const g = gameRef.current;
  const showFlash = g.flashUntil > performance.now();

  return (
    <div className="sw-arena-screen">
      <HyperdriveHUD g={g} difficultyLabel={difficultyLabel} />

      <div className="sw-arena-shell" ref={arenaRef} tabIndex={0}>
        <StarField />
        {showFlash && <div className="sw-collision-flash" />}
        {gameStatus === GAME_STATUS.COUNTDOWN && countdownValue && (
          <div className="sw-countdown-overlay">
            <span className="sw-countdown-number">{countdownValue}</span>
          </div>
        )}

        {g.obstacles.map((o) => {
          const progress = clamp(o.y / 100, 0, 1);
          const scale = getDepthScale(progress);
          const opacity = getDepthOpacity(progress);
          return (
            <div
              key={o.id}
              className={`sw-obstacle ${o.css}${o.isTargeted ? ' sw-obstacle-targeted' : ''}`}
              style={{
                left: `${o.x}%`,
                top: `${o.y}%`,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
            />
          );
        })}

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

      <HyperdriveMobileControls handleMobileDown={handleMobileDown} handleMobileUp={handleMobileUp} />
    </div>
  );
};

export default HyperdriveEscape;
