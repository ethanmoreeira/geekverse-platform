import { useState, useCallback, useEffect } from 'react';
import { generateQuestions } from '../utils/questionGenerator';
import { preloadImages } from '../utils/preloadImages';
import { logAuditEvent } from '../services/auditService';
import { FaStar, FaBolt, FaSkull } from 'react-icons/fa';

export const GAME_MODES = {
  easy: {
    key: 'easy',
    name: 'Portal Verde',
    subtitle: 'Identifique personagens principais',
    icon: FaStar,
    color: '#22c55e',
    questionCount: 8,
    description: 'Pistas sobre a família Smith e aliados de Rick.',
    prizes: [100, 250, 500, 1000, 2000, 5000, 10000, 20000],
  },
  medium: {
    key: 'medium',
    name: 'Viagem Interdimensional',
    subtitle: 'Descubra personagens secundários e versões alternativas',
    icon: FaBolt,
    color: '#f59e0b',
    questionCount: 12,
    description: 'Pistas narrativas sobre personagens secundários e variantes.',
    prizes: [500, 1000, 2000, 5000, 10000, 20000, 35000, 50000, 75000, 100000, 150000, 200000],
  },
  hard: {
    key: 'hard',
    name: 'Desafio da Citadel',
    subtitle: 'Identifique personagens obscuros e conexões complexas',
    icon: FaSkull,
    color: '#ef4444',
    questionCount: 15,
    description: 'Pistas sobre personagens específicos, versões transformadas e papéis narrativos.',
    prizes: [1000, 2000, 5000, 10000, 20000, 35000, 50000, 75000, 100000, 150000, 200000, 300000, 400000, 500000, 1000000],
  },
};

const INITIAL_HINTS = 3;
const HINT_PENALTY_PERCENT = 0.2;

export function useMultiverseQuiz() {
  const [gamePhase, setGamePhase] = useState('menu'); // menu | loading | playing | gameover
  const [selectedMode, setSelectedMode] = useState(null);
  
  // Estado do jogo
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Estado das dicas
  const [hintsRemaining, setHintsRemaining] = useState(INITIAL_HINTS);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [hintPenaltyTotal, setHintPenaltyTotal] = useState(0);
  const [scoreBeforeHints, setScoreBeforeHints] = useState(0);

  // API / Dados
  const [apiData, setApiData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Derivados
  const modeConfig = selectedMode ? GAME_MODES[selectedMode] : null;
  const currentQuestion = questions[currentQuestionIndex] || null;
  const prizeValues = modeConfig?.prizes || [];
  const currentFocus = currentQuestion?.questionFocus || null;
  const currentPrizeValue = prizeValues[currentQuestionIndex] || 0;
  const currentHintPenalty = Math.floor(currentPrizeValue * HINT_PENALTY_PERCENT);
  
  // Pontuação final com desconto de dicas (nunca negativa)
  const finalScore = Math.max(0, score - hintPenaltyTotal);

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (gamePhase === 'playing') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase]);

  const startGame = useCallback(async (mode) => {
    setSelectedMode(mode);
    setGamePhase('loading');
    setLoadError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setGameWon(false);
    setCorrectCount(0);
    setApiData(null);
    
    // Reset dicas
    setHintsRemaining(INITIAL_HINTS);
    setHintsUsed(0);
    setEliminatedOptions([]);
    setHintPenaltyTotal(0);
    setScoreBeforeHints(0);
    setDurationSeconds(0);

    try {
      const config = GAME_MODES[mode];
      const generated = await generateQuestions(mode, config.questionCount);

      if (generated.length === 0) {
        setLoadError(
          'Não foi possível gerar perguntas. A API pode estar indisponível. Tente novamente.'
        );
        return;
      }

      if (generated.length < config.questionCount) {
        if (import.meta.env.DEV) {
          console.warn(
            `[ShowDoMultiverso] Apenas ${generated.length} de ${config.questionCount} perguntas geradas.`
          );
        }
      }

      // Pré-carregar imagens
      const imageUrls = generated.flatMap((q) =>
        (q.options || []).map((opt) => (typeof opt === 'object' ? opt.image : null))
      ).filter(Boolean);
      await preloadImages(imageUrls);

      setQuestions(generated);
      setGamePhase('playing');
      
      logAuditEvent({
        eventType: 'game_start',
        description: 'Usuário iniciou uma partida em Show do Multiverso',
        gameId: 'show-multiverso',
        gameName: 'Show do Multiverso',
        metadata: {
          difficulty: mode,
          startedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[ShowDoMultiverso] Erro ao gerar perguntas:', err);
      }
      setLoadError(
        'Erro ao carregar o quiz. Verifique sua conexão com a internet e tente novamente.'
      );
    }
  }, []);

  const handleUseHint = useCallback((hintIndex) => {
    if (hintsRemaining <= 0) return;
    if (showResult) return;
    if (!currentQuestion) return;

    const wrongOptions = currentQuestion.options.filter((option) => {
      const optionId = typeof option === 'object' ? option.id : option;
      return optionId !== currentQuestion.correctId && !eliminatedOptions.includes(optionId);
    });

    if (wrongOptions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * wrongOptions.length);
    const optionToEliminate = wrongOptions[randomIndex];
    const eliminatedId = typeof optionToEliminate === 'object' ? optionToEliminate.id : optionToEliminate;

    if (selectedOptionId === eliminatedId) {
      setSelectedOptionId(null);
    }

    setEliminatedOptions((prev) => [...prev, eliminatedId]);
    setHintsRemaining((prev) => prev - 1);
    setHintsUsed((prev) => prev + 1);
    setHintPenaltyTotal((prev) => prev + currentHintPenalty);
  }, [hintsRemaining, showResult, currentQuestion, eliminatedOptions, selectedOptionId, currentHintPenalty]);

  const handleSelectOption = useCallback((optionId) => {
    if (showResult) return;
    if (eliminatedOptions.includes(optionId)) return;
    setSelectedOptionId(optionId);
  }, [showResult, eliminatedOptions]);

  const handleConfirmAnswer = useCallback(() => {
    if (selectedOptionId === null || !currentQuestion) return;
    setShowResult(true);

    const isCorrect = selectedOptionId === currentQuestion.correctId;

    setApiData({
      rodada: currentQuestionIndex + 1,
      modo: modeConfig.name,
      visualType: currentQuestion.visualType || 'answer-cards',
      pergunta: currentQuestion.question,
      explicacao: currentQuestion.explanation || null,
      respostaCorreta: currentQuestion.options.find(
        (o) => (typeof o === 'object' ? o.id : o) === currentQuestion.correctId
      ),
      respostaSelecionada: currentQuestion.options.find(
        (o) => (typeof o === 'object' ? o.id : o) === selectedOptionId
      ),
      acertou: isCorrect,
      ...(currentQuestion.apiData || {}),
    });

    if (isCorrect) {
      const prize = prizeValues[currentQuestionIndex] || 0;
      setScoreBeforeHints(prize);
      setScore(prize);
      setCorrectCount((prev) => prev + 1);

      if (currentQuestionIndex >= questions.length - 1) {
        setGameWon(true);
        setGamePhase('gameover');
      }
    } else {
      setGameWon(false);
      setGamePhase('gameover');
    }
  }, [selectedOptionId, currentQuestion, currentQuestionIndex, modeConfig, prizeValues, questions.length]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowResult(false);
      setApiData(null);
      setEliminatedOptions([]);
    }
  }, [currentQuestionIndex, questions.length]);

  const handleRestart = useCallback(() => {
    if (selectedMode) {
      startGame(selectedMode);
    }
  }, [selectedMode, startGame]);

  const handleBackToMenu = useCallback(() => {
    setGamePhase('menu');
    setSelectedMode(null);
    setQuestions([]);
    setLoadError(null);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setShowResult(false);
    setGameWon(false);
    setScore(0);
    setCorrectCount(0);
    setApiData(null);
    setHintsRemaining(INITIAL_HINTS);
    setHintsUsed(0);
    setEliminatedOptions([]);
    setHintPenaltyTotal(0);
    setScoreBeforeHints(0);
    setDurationSeconds(0);
  }, []);

  return {
    gamePhase,
    setGamePhase,
    selectedMode,
    setSelectedMode,
    questions,
    currentQuestionIndex,
    currentQuestion,
    selectedOptionId,
    showResult,
    gameWon,
    correctCount,
    hintsRemaining,
    hintsUsed,
    eliminatedOptions,
    hintPenaltyTotal,
    scoreBeforeHints,
    apiData,
    loadError,
    durationSeconds,
    score,
    finalScore,
    modeConfig,
    prizeValues,
    currentFocus,
    currentPrizeValue,
    currentHintPenalty,
    formatTime,
    startGame,
    handleUseHint,
    handleSelectOption,
    handleConfirmAnswer,
    handleNextQuestion,
    handleRestart,
    handleBackToMenu,
  };
}
