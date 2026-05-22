// PokeSombra.jsx
// Pagina: PokeSombra | Rota: /app/pokemon | API: PokeAPI
// Cacada visual por silhuetas de Pokemon.
// Controlador principal: gerencia estados, logica de alvos, cronometro e penalidades.

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonLevelSelector from '../../../components/pokemon/PokemonLevelSelector';
import PokemonGameHeader from '../../../components/pokemon/PokemonGameHeader';
import PokemonShadowGrid from '../../../components/pokemon/PokemonShadowGrid';
import PokemonRevealPanel from '../../../components/pokemon/PokemonRevealPanel';
import PokemonHintBox from '../../../components/pokemon/PokemonHintBox';
import PokemonResultScreen from '../../../components/pokemon/PokemonResultScreen';
import PokemonEntryLoader from '../../../components/pokemon/PokemonEntryLoader';
import PokemonExitLoader from '../../../components/pokemon/PokemonExitLoader';
import { getPokemonBatchByRandomIds } from '../../../services/apis/pokeApi';
import { POKEMON_LEVELS, MAX_HINTS_PER_TARGET, HINT_PENALTY_TABLE } from '../../../data/pokemonGameConfig';
import { shuffleArray } from '../../../utils/shuffleArray';
import { FaArrowLeft, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { usePokemonMusic } from '../../../hooks/usePokemonMusic';
import PokemonMusicButton from '../../../components/pokemon/PokemonMusicButton';
import '../../../styles/pokeSombra.css';

// Status do jogo
const GAME_STATUS = {
  INTRO: 'intro',
  LOADING: 'loading',
  PLAYING: 'playing',
  REVEAL: 'reveal',
  FINISHED: 'finished',
  ERROR: 'error',
};

const PokeSombra = () => {
  const navigate = useNavigate();

  // --- Musica Tematica ---
  const { isPlaying, toggleMusic } = usePokemonMusic();

  // --- Estado do jogo ---
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.INTRO);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [boardPokemon, setBoardPokemon] = useState([]);
  const [targetPokemon, setTargetPokemon] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [foundIds, setFoundIds] = useState(new Set());
  const [foundPokemon, setFoundPokemon] = useState([]);
  const [revealedPokemon, setRevealedPokemon] = useState(null);
  const [wrongRecentlyId, setWrongRecentlyId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // --- Loader de Entrada ---
  const [showEntryLoader, setShowEntryLoader] = useState(true);

  // --- Timer ---
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  // --- Penalidades e stats ---
  const [penaltySeconds, setPenaltySeconds] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [revealedTiles, setRevealedTiles] = useState(new Set());

  // --- Estado de saida ---
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef(null);

  // --- Transicao de entrada ---
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- Timer effect ---
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning]);

  // --- Limpar timer no status finished ---
  useEffect(() => {
    if (gameStatus === GAME_STATUS.FINISHED || gameStatus === GAME_STATUS.ERROR) {
      setIsTimerRunning(false);
    }
  }, [gameStatus]);

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

  // --- Ref para timeout do wrong ---
  const wrongTimerRef = useRef(null);

  // --- Timeout do Entry Loader ---
  useEffect(() => {
    const loaderTimer = setTimeout(() => {
      setShowEntryLoader(false);
    }, 2000); // 2 segundos

    return () => clearTimeout(loaderTimer);
  }, []);

  /**
   * Inicia o jogo com o nivel selecionado.
   */
  const startGame = useCallback(async (levelId) => {
    const level = POKEMON_LEVELS[levelId];
    if (!level) return;

    setSelectedLevel(level);
    setGameStatus(GAME_STATUS.LOADING);
    setIsTransitioning(true);
    setErrorMessage(null);
    setElapsedSeconds(0);
    setPenaltySeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentHintIndex(0);
    setRevealedTiles(new Set());
    setFoundIds(new Set());
    setFoundPokemon([]);
    setRevealedPokemon(null);
    setWrongRecentlyId(null);
    setCurrentTargetIndex(0);

    try {
      const startTime = Date.now();
      const result = await getPokemonBatchByRandomIds({
        count: level.boardSize,
        maxPokemonId: level.maxPokemonId,
      });

      if (result.pokemon.length < level.targetsCount) {
        setErrorMessage(
          'Não foi possível carregar Pokémon suficientes da API. Tente novamente.'
        );
        setGameStatus(GAME_STATUS.ERROR);
        setIsTransitioning(false);
        return;
      }

      // Embaralhar e selecionar alvos
      const shuffled = shuffleArray(result.pokemon);
      const targets = shuffled.slice(0, level.targetsCount);
      const board = shuffleArray(shuffled);

      setBoardPokemon(board);
      setTargetPokemon(targets);
      setCurrentTargetIndex(0);
      setCurrentHintIndex(0);
      setRevealedTiles(new Set());
      setGameStatus(GAME_STATUS.PLAYING);
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 800 - elapsed);
      
      setTimeout(() => {
        setIsTransitioning(false);
        setIsTimerRunning(true);
      }, remainingTime);

    } catch (err) {
      console.error('[PokeSombra] Erro ao carregar Pokemon:', err);
      setErrorMessage(
        'Não foi possível carregar os Pokémon agora. Verifique sua conexão e tente novamente.'
      );
      setGameStatus(GAME_STATUS.ERROR);
      setIsTransitioning(false);
    }
  }, []);

  /**
   * Handler de clique em um card.
   */
  const handleCardClick = useCallback(
    (pokemon) => {
      if (gameStatus !== GAME_STATUS.PLAYING) return;
      if (foundIds.has(pokemon.id)) return;

      const currentTarget = targetPokemon[currentTargetIndex];
      if (!currentTarget) return;

      if (pokemon.id === currentTarget.id) {
        // --- ACERTO ---
        const newFoundIds = new Set(foundIds);
        newFoundIds.add(pokemon.id);
        setFoundIds(newFoundIds);
        setFoundPokemon((prev) => [...prev, pokemon]);
        setRevealedPokemon(pokemon);
        setGameStatus(GAME_STATUS.REVEAL);
        setWrongRecentlyId(null);
      } else {
        // --- ERRO ---
        setMistakes((prev) => prev + 1);
        setPenaltySeconds((prev) => prev + selectedLevel.mistakePenalty);
        setWrongRecentlyId(pokemon.id);

        // Limpar animacao de erro apos 600ms
        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        wrongTimerRef.current = setTimeout(() => {
          setWrongRecentlyId(null);
        }, 600);
      }
    },
    [gameStatus, foundIds, targetPokemon, currentTargetIndex, selectedLevel]
  );

  /**
   * Avanca para o proximo alvo.
   */
  const handleNextTarget = useCallback(() => {
    const nextIndex = currentTargetIndex + 1;

    if (nextIndex >= targetPokemon.length) {
      // Todos os alvos encontrados
      setIsTimerRunning(false);
      setGameStatus(GAME_STATUS.FINISHED);
      setRevealedPokemon(null);
      return;
    }

    setCurrentTargetIndex(nextIndex);
    setCurrentHintIndex(0);
    setRevealedTiles(new Set());
    setRevealedPokemon(null);
    // Embaralhar a grade para o proximo alvo
    setBoardPokemon((prev) => shuffleArray(prev));
    setGameStatus(GAME_STATUS.PLAYING);
  }, [currentTargetIndex, targetPokemon]);

  /**
   * Usar dica clicando em um tile do mosaico.
   * @param {number} tileIndex - indice do tile clicado (0 a 15)
   */
  const handleTileHint = useCallback((tileIndex) => {
    if (!selectedLevel) return;
    if (currentHintIndex >= MAX_HINTS_PER_TARGET) return;
    if (gameStatus !== GAME_STATUS.PLAYING) return;
    if (revealedTiles.has(tileIndex)) return; // tile ja revelado

    // Penalidade progressiva: cada dica seguinte pesa mais
    const penalty = HINT_PENALTY_TABLE[currentHintIndex] ?? HINT_PENALTY_TABLE[HINT_PENALTY_TABLE.length - 1];

    // Revelar o tile clicado
    setRevealedTiles((prev) => {
      const next = new Set(prev);
      next.add(tileIndex);
      return next;
    });

    setCurrentHintIndex((prev) => prev + 1); // dicas do alvo atual
    setHintsUsed((prev) => prev + 1);         // dicas totais da partida
    setPenaltySeconds((prev) => prev + penalty);
  }, [selectedLevel, currentHintIndex, gameStatus, revealedTiles]);

  /**
   * Calcular score.
   */
  const calculateScore = () => {
    if (!selectedLevel) return 0;
    const raw =
      selectedLevel.baseScore -
      mistakes * 150 -
      penaltySeconds * 20;
    return Math.max(raw, 0);
  };

  /**
   * Jogar novamente (mesmo nivel).
   */
  const handlePlayAgain = () => {
    if (selectedLevel) {
      startGame(selectedLevel.id);
    }
  };

  /**
   * Escolher outro nivel.
   */
  const handleChooseLevel = () => {
    setGameStatus(GAME_STATUS.INTRO);
    setSelectedLevel(null);
    setBoardPokemon([]);
    setTargetPokemon([]);
    setFoundIds(new Set());
    setFoundPokemon([]);
    setRevealedPokemon(null);
    setElapsedSeconds(0);
    setPenaltySeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentHintIndex(0);
    setRevealedTiles(new Set());
    setCurrentTargetIndex(0);
    setErrorMessage(null);
  };

  /**
   * Voltar ao dashboard com tela de saida tematica.
   * Usada APENAS pelo botao Voltar da tela de intro (selecao de niveis).
   */
  const handleExitToDashboard = useCallback(() => {
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      navigate('/app');
    }, 1800);
  }, [navigate]);

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

  /**
   * Tentar novamente apos erro.
   */
  const handleRetry = () => {
    if (selectedLevel) {
      startGame(selectedLevel.id);
    } else {
      handleChooseLevel();
    }
  };

  const currentTarget = targetPokemon[currentTargetIndex] || null;

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
            Encontre o alvo entre silhuetas antes que o tempo pese contra você.
          </p>

          <PokemonLevelSelector onSelectLevel={startGame} />
        </div>
      </div>
    );
  }

  // O status LOADING foi removido do fluxo principal de renderização
  // pois agora usamos isTransitioning como overlay flutuante.

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
          score={calculateScore()}
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
          <img
            src="/src/assets/backgrounds/pokemon/pokemon_dark_throw.png"
            alt="Carregando PokeSombra"
            className="pks-loading-bg-img"
          />
        </div>
      )}
    </div>
  );
};

export default PokeSombra;
