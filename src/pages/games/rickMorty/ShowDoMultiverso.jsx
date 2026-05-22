// ShowDoMultiverso.jsx
// Página: Show do Multiverso | Rota: /app/rick-morty
// Quiz dinâmico com perguntas geradas a partir da Rick and Morty API.
// 3 modos: Portal Verde (fácil), Viagem Interdimensional (médio), Desafio da Citadel (difícil).

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../../../utils/questionGenerator';
import QuestionCard from '../../../components/multiverseQuiz/QuestionCard';
import AnswerCard from '../../../components/multiverseQuiz/AnswerCard';
import ScoreBoard from '../../../components/multiverseQuiz/ScoreBoard';
import JsonViewer from '../../../components/multiverseQuiz/JsonViewer';
import GameFooter from '../../../components/multiverseQuiz/GameFooter';
import RickMortyLoader from '../../../components/multiverseQuiz/RickMortyLoader';
import RickMortyAudioControl from '../../../components/multiverseQuiz/RickMortyAudioControl';
import { GiPortal } from 'react-icons/gi';
import {
  FaStar, FaBolt, FaSkull, FaTrophy, FaTimesCircle,
  FaArrowLeft, FaArrowRight, FaRedo, FaExclamationTriangle, FaCheckCircle,
  FaLightbulb, FaClipboardList,
} from 'react-icons/fa';
import rickMortyMusic from '../../../assets/audio/magpiemusic-ambient-meditative-clear-sky-353119.mp3';

import '../../../styles/showDoMultiverso.css';
import menuBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_epic_style.png';
import gameBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_all_characters_depth.png';
import quizBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_portals_space.png';
import loseBg from '../../../assets/backgrounds/rick-morty/rick_disappointed_no_text.png';
import rickGameOverBg from '../../../assets/backgrounds/rick-morty/rick_game_over.png';
import rickVictoryBg from '../../../assets/backgrounds/rick-morty/rick_trophy_winner.png';
import portalCircleBg from '../../../assets/backgrounds/rick-morty/rick_morty_portal_realistic.png';

// ─── Configuração dos Modos ─────────────────────────────────────────
const GAME_MODES = {
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

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// questionFocus agora vem direto da pergunta curada (curatedQ.questionFocus)

// ─── Componente Principal ───────────────────────────────────────────
const ShowDoMultiverso = () => {
  const navigate = useNavigate();

  // Estado geral
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [gamePhase, setGamePhase] = useState('menu'); // menu | loading | playing | gameover
  const [selectedMode, setSelectedMode] = useState(null);
  const [enteringPortal, setEnteringPortal] = useState(null);
  const [isPortalTransitioning, setIsPortalTransitioning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  // ─── Música ambiente — padrão Harry Potter ──────────────────────
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Toca a música quando o intro loader terminar (usuário já clicou para entrar no jogo)
  useEffect(() => {
    if (!isEntering && audioRef.current) {
      audioRef.current.volume = 0.18;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        // Navegador bloqueou autoplay — o usuário pode clicar no botão
        setIsMusicPlaying(false);
      });
    }
  }, [isEntering]);

  // Para a música ao desmontar o componente (sair da página)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch((err) => {
        console.warn('[ShowDoMultiverso] Não foi possível tocar a música:', err.message);
      });
    }
  };

  // Estado do jogo
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // API / Dados
  const [apiData, setApiData] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // Derivados
  const modeConfig = selectedMode ? GAME_MODES[selectedMode] : null;
  const currentQuestion = questions[currentQuestionIndex] || null;
  const prizeValues = modeConfig?.prizes || [];
  const currentFocus = currentQuestion?.questionFocus || null;

  // ─── Iniciar Jogo ───────────────────────────────────────────────
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

    try {
      const config = GAME_MODES[mode];
      const generated = await generateQuestions(mode, config.questionCount);

      if (generated.length === 0) {
        setLoadError(
          'Não foi possível gerar perguntas. A API pode estar indisponível. Tente novamente.'
        );
        setGamePhase('menu');
        return;
      }

      if (generated.length < config.questionCount) {
        console.warn(
          `[ShowDoMultiverso] Apenas ${generated.length} de ${config.questionCount} perguntas geradas.`
        );
      }

      setQuestions(generated);
      setGamePhase('playing');
    } catch (err) {
      console.error('[ShowDoMultiverso] Erro ao gerar perguntas:', err);
      setLoadError(
        'Erro ao carregar o quiz. Verifique sua conexão com a internet e tente novamente.'
      );
      setGamePhase('menu');
    }
  }, []);

  // ─── Handlers do Jogo ──────────────────────────────────────────
  const handleSelectOption = (optionId) => {
    if (showResult) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionId === null || !currentQuestion) return;
    setShowResult(true);

    const isCorrect = selectedOptionId === currentQuestion.correctId;

    // Montar JSON da rodada (usa apiData do gerador + meta da jogada)
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
      setScore((prev) => prev + prize);
      setCorrectCount((prev) => prev + 1);

      // Última pergunta?
      if (currentQuestionIndex >= questions.length - 1) {
        setGameWon(true);
        setGamePhase('gameover');
      }
    } else {
      // Errou — game over
      setGameWon(false);
      setGamePhase('gameover');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setShowResult(false);
      setApiData(null);
    }
  };

  const handleRestart = () => {
    if (selectedMode) {
      startGame(selectedMode);
    }
  };

  const handlePortalClick = (modeKey) => {
    if (isPortalTransitioning) return;
    setEnteringPortal(modeKey);
    setIsPortalTransitioning(true);

    // Fase 1 — aguarda a animação do portal cobrir a tela (900ms)
    // Fase 2 — inicia o quiz; o overlay ainda está visível em cima
    // Fase 3 — limpa isPortalTransitioning após a troca de fase
    setTimeout(() => {
      startGame(modeKey);
      // Limpa o estado de transição com pequeno delay para
      // garantir que a tela do quiz já foi montada sob o overlay
      setTimeout(() => {
        setEnteringPortal(null);
        setIsPortalTransitioning(false);
      }, 150);
    }, 950);
  };

  const handleBackToMenu = () => {
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
  };

  const handleBackToDashboard = () => {
    navigate('/app');
  };

  const handleExitToDashboard = () => {
    if (isExiting) return;
    setIsExiting(true);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsMusicPlaying(false);
    setTimeout(() => {
      navigate('/app');
    }, 2000);
  };

  const renderScreen = () => {
    if (isEntering) {
      return <RickMortyLoader />;
    }

  if (isExiting) {
    return <RickMortyLoader variant="exit" />;
  }

  // ─── TELA: MENU ──────────────────────────────────────────────────
  if (gamePhase === 'menu') {
    return (
      <div className="smv-menu-page">
        {/* Fundo fixo em tela cheia */}
        <div
          className="smv-menu-bg"
          style={{ backgroundImage: `url(${gameBg})` }}
        />

        {/* Top bar */}
        <div className="smv-menu-topbar">
          <button
            className="smv-btn-top-back"
            onClick={handleExitToDashboard}
            type="button"
            id="btn-back-dashboard-menu"
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        {/* O overlay escuro de fundo (tela cheia) */}
        {isPortalTransitioning && (
          <div className="rick-portal-fullscreen" aria-hidden="true">
            <div className="rick-portal-overlay"></div>
          </div>
        )}

        <div className={`smv-menu-screen ${isPortalTransitioning ? 'smv-portal-transition-active' : ''}`}>
          <div className="smv-menu-header">
            <h1 className="smv-brand-title smv-portal-hero-title">Show do Multiverso</h1>
            <p className="smv-brand-subtitle">
              Escolha um portal, descubra personagens e explore dados reais da Rick and Morty API.
            </p>
          </div>

          {loadError && (
            <div className="smv-error" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
              <p><FaExclamationTriangle aria-hidden="true" className="smv-icon smv-icon-warning" /> {loadError}</p>
            </div>
          )}

          <div className="smv-mode-grid">
            {Object.values(GAME_MODES).map((mode) => {
              const ModeIcon = mode.icon;
              const diffLabel = mode.key === 'easy' ? 'Fácil'
                : mode.key === 'medium' ? 'Médio' : 'Difícil';
              return (
                <button
                  key={mode.key}
                  className={`smv-mode-card ${enteringPortal === mode.key ? 'smv-portal-entering' : ''}`}
                  onClick={() => handlePortalClick(mode.key)}
                  type="button"
                  id={`mode-${mode.key}`}
                >
                  <div className="smv-mode-portal">
                    <div className="smv-mode-portal-bg" style={{ backgroundImage: `url(${portalCircleBg})` }} />
                    <div className="smv-mode-portal-content">
                      <h3 className="smv-mode-name">{mode.name}</h3>
                      <span className="smv-mode-difficulty">
                        {diffLabel.toUpperCase()}
                      </span>
                      <span className="smv-mode-questions">
                        {mode.questionCount} perguntas
                      </span>
                    </div>
                    {/* Animação que nasce de dentro do portal clicado */}
                    {isPortalTransitioning && enteringPortal === mode.key && (
                      <div className="rick-portal-explosion">
                        <div className="rick-portal-ring"></div>
                        <div className="rick-portal-core"></div>
                        <div className="rick-portal-vortex"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── TELA: LOADING ────────────────────────────────────────────────
  if (gamePhase === 'loading') {
    let loaderTitle = 'Abrindo o Portal';
    let loaderSubtitle = 'Sincronizando personagens e dimensões...';

    if (selectedMode === 'easy') {
      loaderTitle = 'Portal Verde';
      loaderSubtitle = 'Carregando personagens principais...';
    } else if (selectedMode === 'medium') {
      loaderTitle = 'Viagem Interdimensional';
      loaderSubtitle = 'Sincronizando versões alternativas...';
    } else if (selectedMode === 'hard') {
      loaderTitle = 'Desafio da Citadel';
      loaderSubtitle = 'Preparando os desafios...';
    }

    return <RickMortyLoader title={loaderTitle} subtitle={loaderSubtitle} />;
  }

  // ─── TELA: GAME OVER ─────────────────────────────────────────────
  if (gamePhase === 'gameover') {
    return (
      <div className="smv-page smv-bg-result" style={{ '--smv-rick-bg': `url(${gameWon ? quizBg : loseBg})` }}>
        {/* Top bar — padrão Harry Potter */}
        <div className="smv-top-bar">
          <button
            className="smv-btn-top-back"
            onClick={handleBackToMenu}
            type="button"
            id="btn-back-dashboard-gameover"
          >
            <FaArrowLeft /> Voltar aos portais
          </button>
        </div>

        <div className="smv-gameover-screen">
          <div 
            className={`smv-gameover-card ${gameWon ? 'smv-gameover-win-card' : 'smv-gameover-lose-card'}`}
            style={{ '--smv-game-over-bg': `url(${gameWon ? rickVictoryBg : rickGameOverBg})` }}
          >
            {gameWon ? (
              <>
                <FaTrophy className="smv-gameover-icon smv-gameover-win" />
                <h1 className="smv-brand-title smv-final-title">Parabéns!</h1>
                <p className="smv-brand-subtitle" style={{marginBottom: 20}}>
                  Você completou o modo <strong>{modeConfig?.name}</strong> e conquistou o prêmio máximo!
                </p>
              </>
            ) : (
              <>
                <FaTimesCircle className="smv-gameover-icon smv-gameover-lose" />
                <h1 className="smv-brand-title smv-final-title">Fim de Jogo</h1>
                <p className="smv-brand-subtitle" style={{marginBottom: 20}}>
                  Você errou na pergunta {currentQuestionIndex + 1}.
                  {currentQuestion && (
                    <>
                      {' '}A resposta correta era:{' '}
                      <strong>
                        {currentQuestion.options.find(
                          (o) => (typeof o === 'object' ? o.id : o) === currentQuestion.correctId
                        )?.name || currentQuestion.correctId}
                      </strong>
                    </>
                  )}
                </p>
              </>
            )}

            <div className="smv-gameover-score">
              <span className="smv-gameover-score-label">Pontuação Final</span>
              <span className="smv-gameover-score-value">
                {formatCurrency(score)}
              </span>
            </div>

            <div className="smv-gameover-stats">
              <div className="smv-gameover-stat">
                <span className="smv-gameover-stat-value">{correctCount}</span>
                <span className="smv-gameover-stat-label">Acertos</span>
              </div>
              <div className="smv-gameover-stat">
                <span className="smv-gameover-stat-value">{gameWon ? 0 : 1}</span>
                <span className="smv-gameover-stat-label">Erros</span>
              </div>
              <div className="smv-gameover-stat">
                <span className="smv-gameover-stat-value">{modeConfig?.name || '?'}</span>
                <span className="smv-gameover-stat-label">Modo</span>
              </div>
            </div>

            <JsonViewer data={apiData} title="JSON da última rodada" />

            <div className="smv-gameover-actions">
              <button
                className="smv-btn-primary"
                onClick={handleRestart}
                type="button"
                id="btn-restart-gameover"
              >
                <FaRedo /> Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── TELA: PLAYING ────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <div className="smv-page smv-bg-game" style={{ '--smv-rick-bg': `url(${quizBg})` }}>
        <div className="smv-error" style={{ margin: '60px auto', maxWidth: 480 }}>
          <p><FaExclamationTriangle aria-hidden="true" className="smv-icon smv-icon-warning" /> Erro: pergunta não encontrada.</p>
          <button className="smv-btn-primary" onClick={handleBackToMenu} type="button">
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smv-page smv-bg-game" style={{ '--smv-rick-bg': `url(${quizBg})` }}>
      {/* Top bar — padrão Harry Potter */}
      <div className="smv-top-bar">
        <button
          className="smv-btn-top-back"
          onClick={handleBackToMenu}
          type="button"
          id="btn-back-dashboard-playing"
        >
          <FaArrowLeft /> Voltar aos portais
        </button>
      </div>

      <div className="smv-game-layout">
        {/* Sidebar — ScoreBoard + Footer */}
        <aside className="smv-sidebar">
          <ScoreBoard
            prizeValues={prizeValues}
            currentQuestionIndex={currentQuestionIndex}
            score={score}
            gameOver={false}
          />
          <GameFooter
            difficulty={selectedMode}
            score={score}
            showResult={showResult}
            gameOver={false}
            onNextQuestion={handleNextQuestion}
            onRestart={handleRestart}
            onBack={handleBackToMenu}
          />
        </aside>

        {/* Área principal */}
        <main className="smv-main">
          <QuestionCard
            question={currentQuestion.question}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            difficulty={selectedMode}
            prizeValue={prizeValues[currentQuestionIndex]}
            targetImage={currentQuestion.targetImage}
            targetData={currentQuestion.targetData}
            questionFocus={currentFocus}
            showResult={showResult}
          />

          {/* Alternativas */}
          <div className="smv-answers-grid">
            {currentQuestion.options.map((option, idx) => {
              const optionId = typeof option === 'object' ? option.id : option;
              return (
                <AnswerCard
                  key={`q${currentQuestion.id}-opt${idx}`}
                  option={option}
                  isSelected={selectedOptionId === optionId}
                  isCorrect={optionId === currentQuestion.correctId}
                  showResult={showResult}
                  disabled={showResult}
                  onClick={() => handleSelectOption(optionId)}
                  index={idx}
                  questionFocus={currentFocus}
                />
              );
            })}
          </div>

          {/* Botão Confirmar */}
          {selectedOptionId !== null && !showResult && (
            <div className="smv-confirm-area">
              <button
                className="smv-btn-confirm"
                onClick={handleConfirmAnswer}
                type="button"
                id="btn-confirm-answer"
              >
                Confirmar Resposta
              </button>
            </div>
          )}

          {/* Feedback da resposta (após responder) */}
          {showResult && currentQuestion && (
            <div className={`smv-feedback-block ${
              selectedOptionId === currentQuestion.correctId
                ? 'smv-feedback-block-correct'
                : 'smv-feedback-block-wrong'
            }`}>
              <p className="smv-feedback-title">
                {selectedOptionId === currentQuestion.correctId
                  ? <><FaCheckCircle aria-hidden="true" className="smv-icon smv-feedback-icon smv-feedback-correct" /> Resposta Correta!</>
                  : <><FaTimesCircle aria-hidden="true" className="smv-icon smv-feedback-icon smv-feedback-wrong" /> Resposta Errada!</>}
              </p>
              {currentQuestion.explanation && (
                <p className="smv-feedback-explanation">
                  <FaLightbulb aria-hidden="true" className="smv-icon smv-icon-hint" /> {currentQuestion.explanation}
                </p>
              )}
              <div className="smv-feedback-actions">
                <button
                  className="smv-btn-next"
                  onClick={handleNextQuestion}
                  type="button"
                  id="btn-next-question"
                >
                  Próxima Pergunta <FaArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* JSON Viewer (após responder) */}
          {showResult && apiData && (
            <JsonViewer data={apiData} title="Dados da API desta rodada" />
          )}
        </main>
      </div>
    </div>
    );
  };

  return (
    <>
      <audio ref={audioRef} src={rickMortyMusic} loop preload="auto" />
      <RickMortyAudioControl isMusicPlaying={isMusicPlaying} onToggle={toggleMusic} />
      {renderScreen()}
    </>
  );
};

export default ShowDoMultiverso;
