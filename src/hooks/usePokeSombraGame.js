// usePokeSombraGame.js
// Hook personalizado com a lógica central do jogo PokéSombra.
// Gerencia: estados da partida, timer, carregamento da PokéAPI,
// lógica de alvos, dicas com penalidade e reset.

import { useState, useCallback, useEffect, useRef } from 'react';
import { getPokemonBatchByRandomIds } from '../services/apis/pokeApi';
import { POKEMON_LEVELS, MAX_HINTS_PER_TARGET, HINT_PENALTY_TABLE } from '../data/pokemonGameConfig';
import { shuffleArray } from '../utils/shuffleArray';
import { logAuditEvent } from '../services/auditService';
import { preloadImages, withTimeout } from '../utils/preloadImages';

// Mensagens temáticas para o loader
const LOADING_MESSAGES = [
  'Preparando sombras Pokémon...',
  'Carregando sprites e alternativas...',
  'Buscando Pokémon na PokéAPI...',
];

// Status do jogo
export const GAME_STATUS = {
  INTRO: 'intro',
  LOADING: 'loading',
  PLAYING: 'playing',
  REVEAL: 'reveal',
  FINISHED: 'finished',
  ERROR: 'error',
};

export function usePokeSombraGame() {
  // --- Estado do jogo ---
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.INTRO);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [boardPokemon, setBoardPokemon] = useState([]);
  const [targetPokemon, setTargetPokemon] = useState([]);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [foundIds, setFoundIds] = useState(new Set());
  const [foundPokemon, setFoundPokemon] = useState([]);
  const [revealedPokemon, setRevealedPokemon] = useState(null);
  const [wrongRecentlyId, setWrongRecentlyId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

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

  // --- Transicao de entrada ---
  const [isTransitioning, setIsTransitioning] = useState(false);

  // --- Ref para timeout do wrong ---
  const wrongTimerRef = useRef(null);

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

  // --- Limpar timer no status finished/error ---
  useEffect(() => {
    if (gameStatus === GAME_STATUS.FINISHED || gameStatus === GAME_STATUS.ERROR) {
      setIsTimerRunning(false);
    }
  }, [gameStatus]);

  // Derivado
  const currentTarget = targetPokemon[currentTargetIndex] || null;

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
      // Mensagem rotativa enquanto carrega
      setLoadingMessage(LOADING_MESSAGES[0]);
      const msgTimer = setInterval(() => {
        setLoadingMessage((prev) => {
          const idx = LOADING_MESSAGES.indexOf(prev);
          return LOADING_MESSAGES[(idx + 1) % LOADING_MESSAGES.length];
        });
      }, 2500);

      const result = await withTimeout(
        getPokemonBatchByRandomIds({
          count: level.boardSize,
          maxPokemonId: level.maxPokemonId,
        }),
        12000
      );

      if (result.pokemon.length < level.targetsCount) {
        clearInterval(msgTimer);
        setErrorMessage(
          'Não foi possível carregar Pokémon suficientes da API. Tente novamente.'
        );
        setGameStatus(GAME_STATUS.ERROR);
        setIsTransitioning(false);
        return;
      }

      // Pré-carregar imagens dos Pokémon antes de liberar a arena
      setLoadingMessage('Carregando sprites e alternativas...');
      const imageUrls = result.pokemon
        .map((p) => p.image)
        .filter(Boolean);
      await preloadImages(imageUrls);

      clearInterval(msgTimer);

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

      logAuditEvent({
        eventType: 'game_start',
        description: 'Usuário iniciou uma partida em PokeSombra',
        gameId: 'pokesombra',
        gameName: 'PokeSombra',
        metadata: {
          difficulty: levelId,
          startedAt: new Date().toISOString()
        }
      });

      // Transição suave — mínimo 400ms de overlay
      setTimeout(() => {
        setIsTransitioning(false);
        setIsTimerRunning(true);
      }, 400);

    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PokeSombra] Erro ao carregar Pokemon:', err);
      }
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

      const target = targetPokemon[currentTargetIndex];
      if (!target) return;

      if (pokemon.id === target.id) {
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
   * Jogar novamente (mesmo nivel).
   */
  const handlePlayAgain = useCallback(() => {
    if (selectedLevel) {
      startGame(selectedLevel.id);
    }
  }, [selectedLevel, startGame]);

  /**
   * Escolher outro nivel (volta ao menu).
   */
  const handleChooseLevel = useCallback(() => {
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
  }, []);

  /**
   * Tentar novamente apos erro.
   */
  const handleRetry = useCallback(() => {
    if (selectedLevel) {
      startGame(selectedLevel.id);
    } else {
      handleChooseLevel();
    }
  }, [selectedLevel, startGame, handleChooseLevel]);

  return {
    // Estados
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

    // Funções
    startGame,
    handleCardClick,
    handleNextTarget,
    handleTileHint,
    handlePlayAgain,
    handleChooseLevel,
    handleRetry,
  };
}
