// ShowDoMultiverso.jsx
// Página: Show do Multiverso | Rota: /app/rick-morty
// Quiz dinâmico com perguntas geradas a partir da Rick and Morty API.
// 3 modos: Portal Verde (fácil), Viagem Interdimensional (médio), Desafio da Citadel (difícil).

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestions } from '../../../utils/questionGenerator';
import QuestionCard from '../../../components/multiverseQuiz/QuestionCard';
import AnswerCard from '../../../components/multiverseQuiz/AnswerCard';
import ScoreBoard from '../../../components/multiverseQuiz/ScoreBoard';
import JsonViewer from '../../../components/multiverseQuiz/JsonViewer';
import GameFooter from '../../../components/multiverseQuiz/GameFooter';
import RickMortyLoader from '../../../components/multiverseQuiz/RickMortyLoader';
import { GiPortal } from 'react-icons/gi';
import {
  FaStar, FaBolt, FaSkull, FaTrophy, FaTimesCircle,
  FaArrowLeft, FaRedo
} from 'react-icons/fa';

import '../../../styles/showDoMultiverso.css';
import menuBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_epic_style.png';

// ─── Configuração dos Modos ─────────────────────────────────────────
const GAME_MODES = {
  easy: {
    key: 'easy',
    name: 'Portal Verde',
    subtitle: 'Perguntas simples sobre personagens',
    icon: FaStar,
    color: '#22c55e',
    questionCount: 8,
    description: 'Status, espécie, gênero, origem e localização dos personagens.',
    prizes: [100, 250, 500, 1000, 2000, 3000, 4000, 5000],
  },
  medium: {
    key: 'medium',
    name: 'Viagem Interdimensional',
    subtitle: 'Compare personagens e descubra diferenças',
    icon: FaBolt,
    color: '#f59e0b',
    questionCount: 12,
    description: 'Quem apareceu em mais episódios, quem não é humano, origens desconhecidas.',
    prizes: [1000, 2000, 5000, 10000, 25000, 50000, 75000, 100000, 150000, 200000, 300000, 500000],
  },
  hard: {
    key: 'hard',
    name: 'Desafio da Citadel',
    subtitle: 'Cruze personagens, episódios e locais',
    icon: FaSkull,
    color: '#ef4444',
    questionCount: 15,
    description: 'Quem aparece em um episódio, quem pertence a uma localização, conexões complexas.',
    prizes: [1000, 2000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 750000, 850000, 950000, 1000000],
  },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const getQuestionFocus = (questionText) => {
  if (!questionText) return null;
  const q = questionText.toLowerCase();
  if (q.includes('vivo') || q.includes('morto') || q.includes('status')) return 'status';
  if (q.includes('humano') || q.includes('alien') || q.includes('espécie')) return 'species';
  if (q.includes('feminino') || q.includes('masculino') || q.includes('gênero')) return 'gender';
  if (q.includes('origem')) return 'origin';
  if (q.includes('localização')) return 'location';
  if (q.includes('episódio') || q.includes('aparições')) return 'episodes';
  return null;
};

// ─── Componente Principal ───────────────────────────────────────────
const ShowDoMultiverso = () => {
  const navigate = useNavigate();

  // Estado geral
  const [isEntering, setIsEntering] = useState(true);
  const [gamePhase, setGamePhase] = useState('menu'); // menu | loading | playing | gameover
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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
  const currentFocus = currentQuestion ? getQuestionFocus(currentQuestion.question) : null;

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

  const handleBackToMenu = () => {
    setGamePhase('menu');
    setSelectedMode(null);
    setQuestions([]);
    setLoadError(null);
  };

  const handleBackToDashboard = () => {
    navigate('/app');
  };

  if (isEntering) {
    return <RickMortyLoader />;
  }

  // ─── TELA: MENU ──────────────────────────────────────────────────
  if (gamePhase === 'menu') {
    return (
      <div className="smv-menu-page">
        {/* Fundo fixo em tela cheia — padrão gv-harry-page-bg */}
        <div
          className="smv-menu-bg"
          style={{ backgroundImage: `url(${menuBg})` }}
        />

        {/* Top bar */}
        <div className="smv-menu-topbar">
          <button
            className="smv-btn-top-back"
            onClick={handleBackToDashboard}
            type="button"
            id="btn-back-dashboard-menu"
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <div className="smv-menu-screen">
          <div className="smv-menu-header">
            <GiPortal className="smv-menu-icon" />
            <h1 className="smv-menu-title">Show do Multiverso</h1>
            <p className="smv-menu-subtitle">
              Quiz interdimensional com perguntas criadas a partir dos dados da Rick and Morty API.
              Escolha um modo e teste seu conhecimento multiversal.
            </p>
          </div>

          {loadError && (
            <div className="smv-error" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
              <p>⚠️ {loadError}</p>
            </div>
          )}

          <div className="smv-mode-grid">
            {Object.values(GAME_MODES).map((mode) => {
              const ModeIcon = mode.icon;
              return (
                <button
                  key={mode.key}
                  className="smv-mode-card"
                  onClick={() => startGame(mode.key)}
                  type="button"
                  id={`mode-${mode.key}`}
                >
                  <div className="smv-mode-portal">
                    <div
                      className="smv-mode-icon-wrapper"
                      style={{ color: mode.color }}
                    >
                      <ModeIcon />
                    </div>
                  </div>
                  <h3 className="smv-mode-name">{mode.name}</h3>
                  <p className="smv-mode-subtitle">{mode.subtitle}</p>
                  <p className="smv-mode-desc">{mode.description}</p>
                  <div className="smv-mode-meta">
                    <span className="smv-mode-questions">
                      📝 {mode.questionCount} perguntas
                    </span>
                    <span className="smv-mode-prize" style={{ color: mode.color }}>
                      🏆 Até {formatCurrency(mode.prizes[mode.prizes.length - 1])}
                    </span>
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
    return <RickMortyLoader message="Gerando perguntas do multiverso..." />;
  }

  // ─── TELA: GAME OVER ─────────────────────────────────────────────
  if (gamePhase === 'gameover') {
    return (
      <div className="smv-page">
        {/* Top bar — padrão Harry Potter */}
        <div className="smv-top-bar">
          <button
            className="smv-btn-top-back"
            onClick={handleBackToDashboard}
            type="button"
            id="btn-back-dashboard-gameover"
          >
            <FaArrowLeft /> Voltar
          </button>
        </div>

        <div className="smv-gameover-screen">
          <div className="smv-gameover-card">
            {gameWon ? (
              <>
                <FaTrophy className="smv-gameover-icon smv-gameover-win" />
                <h1 className="smv-gameover-title">Parabéns!</h1>
                <p className="smv-gameover-subtitle">
                  Você completou o modo <strong>{modeConfig?.name}</strong> e conquistou o prêmio máximo!
                </p>
              </>
            ) : (
              <>
                <FaTimesCircle className="smv-gameover-icon smv-gameover-lose" />
                <h1 className="smv-gameover-title">Fim de Jogo</h1>
                <p className="smv-gameover-subtitle">
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

            <JsonViewer data={apiData} title="📋 JSON da última rodada" />

            <div className="smv-gameover-actions">
              <button
                className="smv-btn-primary"
                onClick={handleRestart}
                type="button"
                id="btn-restart-gameover"
              >
                <FaRedo /> Jogar Novamente
              </button>
              <button
                className="smv-btn-secondary"
                onClick={handleBackToMenu}
                type="button"
              >
                Escolher Outro Modo
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
      <div className="smv-page">
        <div className="smv-error" style={{ margin: '60px auto', maxWidth: 480 }}>
          <p>⚠️ Erro: pergunta não encontrada.</p>
          <button className="smv-btn-primary" onClick={handleBackToMenu} type="button">
            Voltar ao Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smv-page">
      {/* Top bar — padrão Harry Potter */}
      <div className="smv-top-bar">
        <button
          className="smv-btn-top-back"
          onClick={handleBackToMenu}
          type="button"
          id="btn-back-dashboard-playing"
        >
          <FaArrowLeft /> Voltar
        </button>
      </div>

      <div className="smv-game-layout">
        {/* Sidebar — ScoreBoard */}
        <aside className="smv-sidebar">
          <ScoreBoard
            prizeValues={prizeValues}
            currentQuestionIndex={currentQuestionIndex}
            score={score}
            gameOver={false}
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

          {/* JSON Viewer (após responder) */}
          {showResult && apiData && (
            <JsonViewer data={apiData} title="📋 Dados da API desta rodada" />
          )}

          {/* Footer — sem botão voltar (ele ficou no top bar) */}
          <GameFooter
            difficulty={selectedMode}
            score={score}
            showResult={showResult}
            gameOver={false}
            onNextQuestion={handleNextQuestion}
            onRestart={handleRestart}
            onBack={handleBackToMenu}
          />
        </main>
      </div>
    </div>
  );
};

export default ShowDoMultiverso;
