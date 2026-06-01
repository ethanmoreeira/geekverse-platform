import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchCharactersForGame } from '../services/apis/harryPotterApi';
import { DIFFICULTIES } from '../utils/difficultyConfig';
import { preloadImages } from '../utils/preloadImages';
import { logAuditEvent } from '../services/auditService';

const SHUFFLE_DURATION = 3200; // 3.2 segundos de animação

export const GAME_STATUS = {
  IDLE: 'idle',           // Aguardando seleção de dificuldade
  SHUFFLING: 'shuffling', // Animação de embaralhamento
  PLAYING: 'playing',     // Jogo em andamento
  FINISHED: 'finished',   // Todos os pares encontrados
};

export function useHarryMemoryGame() {
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adjustmentInfo, setAdjustmentInfo] = useState(null);
  const [apiMetadata, setApiMetadata] = useState(null);

  const [gameStatus, setGameStatus] = useState(GAME_STATUS.IDLE);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [finalTime, setFinalTime] = useState(0);

  // Zoom temporário no card revelado
  const [zoomedCardId, setZoomedCardId] = useState(null);
  const zoomTimerRef = useRef(null);
  const shuffleTimerRef = useRef(null);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }, []);

  const resetGameState = useCallback(() => {
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setIsChecking(false);
    setAttempts(0);
    setPairsFound(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setHasGameStarted(false);
    setFinalTime(0);
    setZoomedCardId(null);
    if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
  }, []);

  const loadCards = useCallback(async (selectedDifficulty) => {
    setLoading(true);
    setError(null);
    setAdjustmentInfo(null);
    setCards([]);
    setApiMetadata(null);
    resetGameState();
    setGameStatus(GAME_STATUS.IDLE);

    try {
      const config = DIFFICULTIES[selectedDifficulty];
      if (!config) {
        throw new Error('Dificuldade inválida.');
      }

      const result = await fetchCharactersForGame(config.pairs);

      // Se não há nenhum personagem válido, mostrar erro
      if (result.metadata.selectedCount === 0) {
        setError(
          'A API não retornou nenhum personagem com imagem válida. Tente novamente mais tarde.'
        );
        setLoading(false);
        return;
      }

      // Se houve ajuste automático, informar o usuário
      if (result.metadata.wasAdjusted) {
        setAdjustmentInfo(result.metadata.adjustmentMessage);
      }

      // Pré-carregar imagens dos personagens selecionados
      const imageUrls = result.cards.map((c) => c.image).filter(Boolean);
      const preloadResult = await preloadImages(imageUrls);

      // Filtrar cartas cujas imagens falharam no preload
      let finalCards = result.cards;
      if (preloadResult.failed > 0 && preloadResult.failedUrls) {
        // Criar set de URLs que falharam
        const failedUrls = new Set(preloadResult.failedUrls);
        
        // Filtra os cards que possuem alguma imagem quebrada
        finalCards = result.cards.filter(c => !failedUrls.has(c.image));

        if (import.meta.env.DEV) {
          console.warn(`[HarryMemory] ${preloadResult.failed} imagens falharam no preload, removendo cartas com erro.`);
        }
      }

      setCards(finalCards);
      setTotalPairs(finalCards.length / 2);

      // Iniciar animação de embaralhamento mágico (timer inicia no primeiro clique)
      setGameStatus(GAME_STATUS.SHUFFLING);
      setElapsedTime(0);
      setIsTimerRunning(false);
      setHasGameStarted(false);
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
      shuffleTimerRef.current = setTimeout(() => {
        setGameStatus(GAME_STATUS.PLAYING);
      }, SHUFFLE_DURATION);

      setApiMetadata({
        totalPersonagensRetornadosAPI: result.metadata.totalFromApi,
        totalComImagemValida: result.metadata.totalWithValidImage,
        dificuldadeEscolhida: config.label,
        paresSolicitados: result.metadata.pairsRequested,
        paresUtilizados: result.metadata.pairsUsed,
        totalCartasGeradas: result.cards.length,
        ajusteAutomatico: result.metadata.wasAdjusted ? 'Sim' : 'Não',
        mensagemAjuste: result.metadata.adjustmentMessage || 'Nenhum ajuste necessário.',
        personagensPriorizados: result.metadata.prioritizedCharacters,
        personagensSelecionados: result.metadata.selectedCharacters,
        imagensPrecarregadas: preloadResult.loaded,
        imagensFalharam: preloadResult.failed,
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar personagens:', err);
      }
      setError(
        'Não foi possível carregar os personagens da API. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [resetGameState]);

  const handleCardClick = useCallback(
    (card) => {
      // Bloquear cliques fora do estado PLAYING
      if (gameStatus !== GAME_STATUS.PLAYING) return;
      if (isChecking) return;
      if (flippedCards.length >= 2) return;
      if (flippedCards.find((c) => c.uniqueId === card.uniqueId)) return;
      if (matchedPairs.has(card.pairId)) return;

      // Iniciar timer no primeiro clique válido da partida
      if (!hasGameStarted) {
        setHasGameStarted(true);
        setIsTimerRunning(true);
        
        logAuditEvent({
          eventType: 'game_start',
          description: 'Usuário iniciou uma partida em Memória dos Bruxos',
          gameId: 'memoria-bruxos',
          gameName: 'Memória dos Bruxos',
          metadata: {
            difficulty: difficulty,
            startedAt: new Date().toISOString()
          }
        });
      }

      const newFlipped = [...flippedCards, card];
      setFlippedCards(newFlipped);

      // Zoom temporário no card revelado
      setZoomedCardId(card.uniqueId);
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = setTimeout(() => {
        setZoomedCardId(null);
      }, 1200);

      // Quando 2 cartas viradas, verificar par
      if (newFlipped.length === 2) {
        setIsChecking(true);
        setAttempts((prev) => prev + 1);
        const [first, second] = newFlipped;

        if (first.pairId === second.pairId) {
          // Par encontrado
          setTimeout(() => {
            const newMatched = new Set([...matchedPairs, first.pairId]);
            setMatchedPairs(newMatched);
            setFlippedCards([]);
            setIsChecking(false);

            const newPairsFound = pairsFound + 1;
            setPairsFound(newPairsFound);

            // Verificar vitória
            if (newPairsFound >= totalPairs) {
              setGameStatus(GAME_STATUS.FINISHED);
            }
          }, 600);
        } else {
          // Não é par — desvirar após delay
          setTimeout(() => {
            setFlippedCards([]);
            setIsChecking(false);
          }, 1000);
        }
      }
    },
    [gameStatus, flippedCards, matchedPairs, isChecking, pairsFound, totalPairs, hasGameStarted, difficulty]
  );

  const isCardFlipped = useCallback(
    (card) => {
      return (
        flippedCards.some((c) => c.uniqueId === card.uniqueId) ||
        matchedPairs.has(card.pairId)
      );
    },
    [flippedCards, matchedPairs]
  );

  const isCardMatched = useCallback(
    (card) => matchedPairs.has(card.pairId),
    [matchedPairs]
  );

  const handleDifficultySelect = useCallback((key) => {
    setDifficulty(key);
    loadCards(key);
  }, [loadCards]);

  const handleReload = useCallback(() => {
    if (difficulty) {
      loadCards(difficulty);
    }
  }, [difficulty, loadCards]);

  const handlePlayAgain = useCallback(() => {
    if (difficulty) {
      loadCards(difficulty);
    }
  }, [difficulty, loadCards]);

  // Intervalo do timer — inicia/para com isTimerRunning
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Para o timer e salva o tempo final quando o jogo termina
  useEffect(() => {
    if (gameStatus === GAME_STATUS.FINISHED) {
      setIsTimerRunning(false);
      setFinalTime(elapsedTime);
    }
  }, [gameStatus, elapsedTime]);

  // Cleanup de timers do zoom ao desmontar
  useEffect(() => {
    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

  return {
    difficulty,
    cards,
    loading,
    error,
    adjustmentInfo,
    apiMetadata,
    gameStatus,
    flippedCards,
    matchedPairs,
    isChecking,
    attempts,
    pairsFound,
    totalPairs,
    elapsedTime,
    hasGameStarted,
    finalTime,
    zoomedCardId,
    formatTime,
    loadCards,
    handleCardClick,
    isCardFlipped,
    isCardMatched,
    handleDifficultySelect,
    handleReload,
    handlePlayAgain,
    GAME_STATUS,
  };
}
