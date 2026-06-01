// PokeSombra.jsx
// Pagina: PokeSombra | Rota: /app/pokemon | API: PokeAPI
// Cacada visual por silhuetas de Pokemon.
// Casca visual: renderiza telas, integra ranking, auditoria, áudio e navegação.
// A lógica central do jogo está no hook usePokeSombraGame.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonLevelSelector from '../../../components/pokemon/PokemonLevelSelector';
import PokemonGameHeader from '../../../components/pokemon/PokemonGameHeader';
import PokemonShadowGrid from '../../../components/pokemon/PokemonShadowGrid';
import PokemonRevealPanel from '../../../components/pokemon/PokemonRevealPanel';
import PokemonHintBox from '../../../components/pokemon/PokemonHintBox';
import PokemonResultScreen from '../../../components/pokemon/PokemonResultScreen';
import PokemonEntryLoader from '../../../components/pokemon/PokemonEntryLoader';
import PokemonExitLoader from '../../../components/pokemon/PokemonExitLoader';
import { useAuth } from '../../../hooks/useAuth';
import { saveResult } from '../../../services/rankingService';
import { logAuditEvent } from '../../../services/auditService';
import { FaArrowLeft, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { usePokemonMusic } from '../../../hooks/usePokemonMusic';
import PokemonMusicButton from '../../../components/pokemon/PokemonMusicButton';
import { usePokeSombraGame, GAME_STATUS } from '../../../hooks/usePokeSombraGame';
import '../../../styles/pokeSombra.css';

const PokeSombra = () => {
  const navigate = useNavigate();

  // --- Auth & Ranking ---
  const { user } = useAuth();
  const hasSavedRankingRef = useRef(false);

  // --- Musica Tematica ---
  const { isPlaying, toggleMusic } = usePokemonMusic();

  // --- Loader de Entrada ---
  const [showEntryLoader, setShowEntryLoader] = useState(true);

  // --- Estado de saida ---
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef(null);

  // --- Hook do jogo ---
  const {
    gameStatus,
    selectedLevel,
    loadingMessage,
    boardPokemon,
    targetPokemon,
    currentTargetIndex,
    foundIds,
    foundPokemon,
    revealedPokemon,
    wrongRecentlyId,
    errorMessage,
    elapsedSeconds,
    penaltySeconds,
    mistakes,
    hintsUsed,
    currentHintIndex,
    revealedTiles,
    isTransitioning,
    currentTarget,
    startGame,
    handleCardClick,
    handleNextTarget,
    handleTileHint,
    handlePlayAgain: baseHandlePlayAgain,
    handleChooseLevel: baseHandleChooseLevel,
    handleRetry,
  } = usePokeSombraGame();

  // Wrappers que resetam a trava de ranking
  const handlePlayAgain = () => {
    hasSavedRankingRef.current = false;
    baseHandlePlayAgain();
  };

  const handleChooseLevel = () => {
    hasSavedRankingRef.current = false;
    baseHandleChooseLevel();
  };

  const hasLoggedEnter = useRef(false);

  useEffect(() => {
    if (!hasLoggedEnter.current) {
      hasLoggedEnter.current = true;
      logAuditEvent({
        eventType: 'game_enter',
        description: 'Usuário entrou no jogo PokeSombra',
        gameId: 'pokesombra',
        gameName: 'PokeSombra'
      });
    }
  }, []);

  // --- Esconde a scrollbar da página raiz enquanto o jogo estiver aberto ---
  useEffect(() => {
    document.body.classList.add('pks-hide-scrollbar-page');
    document.documentElement.classList.add('pks-hide-scrollbar-root');
    return () => {
      document.body.classList.remove('pks-hide-scrollbar-page');
      document.documentElement.classList.remove('pks-hide-scrollbar-root');
    };
  }, []);

  // --- Background full screen na intro e na partida ---
  useEffect(() => {
    if (gameStatus === GAME_STATUS.INTRO) {
      document.body.classList.add('pks-body-intro-bg');
    } else {
      document.body.classList.remove('pks-body-intro-bg');
    }

    if (
      gameStatus === GAME_STATUS.PLAYING ||
      gameStatus === GAME_STATUS.REVEAL ||
      gameStatus === GAME_STATUS.FINISHED
    ) {
      document.body.classList.add('pks-body-playing-bg');
    } else {
      document.body.classList.remove('pks-body-playing-bg');
    }

    return () => {
      document.body.classList.remove('pks-body-intro-bg');
      document.body.classList.remove('pks-body-playing-bg');
    };
  }, [gameStatus]);

  // --- Timeout do Entry Loader ---
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowEntryLoader(false);
    }, 2000); // 2 segundos

    return () => clearTimeout(loaderTimer);
  }, []);

  // ── Salvar resultado no Ranking quando o jogo terminar (uma única vez) ──
  useEffect(() => {
    if (gameStatus !== GAME_STATUS.FINISHED) return;
    if (!selectedLevel) return;
    if (hasSavedRankingRef.current) return;

    hasSavedRankingRef.current = true;

    const finalTime = elapsedSeconds + penaltySeconds;
    const diffKey = selectedLevel.id === 'hard' ? 'challenge' : selectedLevel.id;
    const fmtTime = (s) => {
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
    };

    const payload = {
      gameId: 'pokesombra',
      gameName: 'PokeSombra',
      playerName: user?.nome || 'Jogador GeekVerse',
      playerEmail: user?.email || '',
      difficulty: diffKey,
      status: 'completed',
      score: null,
      timeInSeconds: finalTime,
      formattedTime: fmtTime(finalTime),
      errors: mistakes,
      hintsUsed,
      hintPenaltyTotal: penaltySeconds,
      penalties: penaltySeconds,
      rankingEligible: true,
    };

    saveResult(payload);

    logAuditEvent({
      eventType: 'game_finish',
      description: 'Usuário concluiu uma partida em PokeSombra',
      gameId: 'pokesombra',
      gameName: 'PokeSombra',
      metadata: {
        difficulty: diffKey,
        status: 'completed',
        time: finalTime,
        errors: mistakes,
        hintsUsed,
        rankingEligible: true
      }
    });

    if (import.meta.env.DEV) {
      console.log('[PokeSombra] Resultado salvo no ranking:', payload);
    }
  }, [gameStatus, selectedLevel, elapsedSeconds, penaltySeconds, mistakes, hintsUsed, user]);

  /**
   * Voltar ao dashboard com tela de saida tematica.
   * Usada APENAS pelo botao Voltar da tela de intro (selecao de niveis).
   */
  const handleExitToDashboard = () => {
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      navigate('/app');
    }, 1800);
  };

  // Cleanup do timer de saida ao desmontar
  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, []);

  /**
   * Voltar ao dashboard (legado, mantido para uso interno se necessario).
   */
  const handleBack = () => {
    navigate('/app');
  };

  // ─── RENDER: SAIDA ─────────────────────────────────────────────────
  if (isExiting) {
    return <PokemonExitLoader />;
  }

  // ─── RENDER: INTRO ─────────────────────────────────────────────────
  if (gameStatus === GAME_STATUS.INTRO) {
    if (showEntryLoader) {
      return <PokemonEntryLoader />;
    }

    return (
      <div className="pks-page pks-intro-page-wrapper">
        <PokemonMusicButton isPlaying={isPlaying} onToggle={toggleMusic} />
        <div className="pks-top-bar">
          <button
            className="pks-btn-back"
            onClick={handleExitToDashboard}
            type="button"
            id="pks-btn-back"
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <div className="pks-intro">
          <h1 className="pks-title">PokéSombra</h1>
          <p className="pks-subtitle">
            Descubra o Pokémon escondido antes que o tempo acabe.
          </p>

          <PokemonLevelSelector onSelectLevel={startGame} />
        </div>
      </div>
    );
  }

  // ─── RENDER: LOADING ────────────────────────────────────────────────
  const isPreparingGame =
    gameStatus === GAME_STATUS.LOADING ||
    (gameStatus === GAME_STATUS.PLAYING && (!boardPokemon.length || !currentTarget));

  if (isPreparingGame) {
    return (
      <div className="pks-loading-screen">
        <ClipLoader color="#ff5e5e" size={60} speedMultiplier={0.8} />
        <p className="pks-error-text" style={{ marginTop: '20px', fontSize: '1.2rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          {loadingMessage || 'Preparando PokéSombra...'}
        </p>
      </div>
    );
  }

  // ─── RENDER: ERROR ─────────────────────────────────────────────────
  if (gameStatus === GAME_STATUS.ERROR) {
    return (
      <div className="pks-page">
        <PokemonMusicButton isPlaying={isPlaying} onToggle={toggleMusic} />
        <div className="pks-error-box">
          <FaExclamationTriangle className="pks-error-icon" />
          <p className="pks-error-text">
            {errorMessage || 'Não foi possível carregar os Pokémon agora.'}
          </p>
          <button
            className="pks-btn-primary"
            onClick={handleRetry}
            type="button"
            id="pks-btn-retry"
          >
            <FaRedo /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // ─── RENDER: FINISHED ──────────────────────────────────────────────
  if (gameStatus === GAME_STATUS.FINISHED && selectedLevel) {
    return (
      <div className="pks-page">
        <PokemonMusicButton isPlaying={isPlaying} onToggle={toggleMusic} />
        <PokemonResultScreen
          levelConfig={selectedLevel}
          foundPokemon={foundPokemon}
          elapsedSeconds={elapsedSeconds}
          penaltySeconds={penaltySeconds}
          mistakes={mistakes}
          hintsUsed={hintsUsed}
          onPlayAgain={handlePlayAgain}
          onChooseLevel={handleChooseLevel}
          onBack={handleBack}
        />
      </div>
    );
  }

  // ─── RENDER: PLAYING / REVEAL ──────────────────────────────────────
  return (
    <div className="pks-page">
      <PokemonMusicButton isPlaying={isPlaying} onToggle={toggleMusic} />
      <div className="pks-top-bar">
        <button
          className="pks-btn-back"
          onClick={handleChooseLevel}
          type="button"
          id="pks-btn-back-playing"
        >
          <FaArrowLeft /> Níveis
        </button>
      </div>

      <div className="pks-arena">
        <PokemonGameHeader
          levelLabel={selectedLevel?.label || '---'}
          currentTarget={currentTarget}
          currentTargetIndex={foundPokemon.length}
          targetsCount={selectedLevel?.targetsCount || 0}
          elapsedSeconds={elapsedSeconds}
          penaltySeconds={penaltySeconds}
          mistakes={mistakes}
          hintsUsed={hintsUsed}
          currentHintIndex={currentHintIndex}
        />

        {gameStatus === GAME_STATUS.REVEAL && revealedPokemon ? (
          <PokemonRevealPanel
            pokemon={revealedPokemon}
            onNextTarget={handleNextTarget}
            isLastTarget={currentTargetIndex + 1 >= targetPokemon.length}
          />
        ) : (
          <PokemonShadowGrid
            boardPokemon={boardPokemon}
            foundIds={foundIds}
            revealedId={revealedPokemon?.id || null}
            wrongRecentlyId={wrongRecentlyId}
            onCardClick={handleCardClick}
            hintBoxElement={
              <PokemonHintBox
                currentTarget={currentTarget}
                currentHintIndex={currentHintIndex}
                revealedTiles={revealedTiles}
                onTileClick={handleTileHint}
                disabled={gameStatus !== GAME_STATUS.PLAYING}
                variant="mosaic"
              />
            }
          />
        )}
      </div>

      {/* Overlay de transição (Red flash e fade out) renderizado por cima do jogo */}
      {isTransitioning && (
        <div className="pks-loading-fullscreen" aria-busy="true" aria-label="Carregando jogo">
          {/* Imagem removida pois o caminho absoluto quebrava em produção e a tela de loading já cumpre o papel visual */}
        </div>
      )}
    </div>
  );
};

export default PokeSombra;
