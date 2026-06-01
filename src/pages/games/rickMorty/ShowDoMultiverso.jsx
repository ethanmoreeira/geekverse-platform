// ShowDoMultiverso.jsx
// Página: Show do Multiverso | Rota: /app/rick-morty
// Quiz dinâmico com perguntas geradas a partir da Rick and Morty API.
// 3 modos: Portal Verde (fácil), Viagem Interdimensional (médio), Desafio da Citadel (difícil).

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { saveResult } from '../../../services/rankingService';
import { logAuditEvent } from '../../../services/auditService';
import QuestionCard from '../../../components/multiverseQuiz/QuestionCard';
import AnswerCard from '../../../components/multiverseQuiz/AnswerCard';
import ScoreBoard from '../../../components/multiverseQuiz/ScoreBoard';
import JsonViewer from '../../../components/multiverseQuiz/JsonViewer';
import RickMortyLoader from '../../../components/multiverseQuiz/RickMortyLoader';
import RickMortyAudioControl from '../../../components/multiverseQuiz/RickMortyAudioControl';
import {
  FaArrowLeft, FaArrowRight, FaRedo, FaExclamationTriangle, FaCheckCircle,
  FaTimesCircle, FaFileExport
} from 'react-icons/fa';
import { sendGameResultEmail } from '../../../services/emailService';
import { hasEmailExportBeenSent, markEmailExportAsSent, buildResultKey } from '../../../utils/emailExportControl';
import { useMultiverseQuiz, GAME_MODES } from '../../../hooks/useMultiverseQuiz';
import rickMortyMusic from '../../../assets/audio/magpiemusic-ambient-meditative-clear-sky-353119.mp3';

import '../../../styles/showDoMultiverso.css';
import gameBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_all_characters_depth.png';
import quizBg from '../../../assets/backgrounds/rick-morty/rick_and_morty_portals_space.png';
import loseBg from '../../../assets/backgrounds/rick-morty/rick_disappointed_no_text.png';
import rickGameOverBg from '../../../assets/backgrounds/rick-morty/rick_game_over.png';
import rickVictoryBg from '../../../assets/backgrounds/rick-morty/rick_trophy_winner.png';
import portalCircleBg from '../../../assets/backgrounds/rick-morty/rick_morty_portal_realistic.png';

const formatNumber = (value) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// ─── Componente Principal ───────────────────────────────────────────
const ShowDoMultiverso = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasSavedRankingRef = useRef(false);

  // Estado geral de UI
  const [isEntering, setIsEntering] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [enteringPortal, setEnteringPortal] = useState(null);
  const [isPortalTransitioning, setIsPortalTransitioning] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [matchKey, setMatchKey] = useState(null);

  const {
    gamePhase,
    setGamePhase, // Only needed for handleBackToMenu internally, mas vamos expor se precisar
    selectedMode,
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
    handleBackToMenu: baseHandleBackToMenu,
  } = useMultiverseQuiz();

  const handleBackToMenu = () => {
    hasSavedRankingRef.current = false;
    setMatchKey(null);
    setExportFeedback(null);
    baseHandleBackToMenu();
  };

  const hasLoggedEnter = useRef(false);

  useEffect(() => {
    if (!hasLoggedEnter.current) {
      hasLoggedEnter.current = true;
      logAuditEvent({
        eventType: 'game_enter',
        description: 'Usuário entrou no jogo Show do Multiverso',
        gameId: 'show-multiverso',
        gameName: 'Show do Multiverso'
      });
    }
  }, []);

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

  const handlePortalClick = (modeKey) => {
    if (isPortalTransitioning) return;
    setEnteringPortal(modeKey);
    setIsPortalTransitioning(true);
    hasSavedRankingRef.current = false;

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

  // ── Salvar resultado no Ranking quando o jogo terminar (uma única vez) ──
  useEffect(() => {
    if (gamePhase !== 'gameover') return;
    if (hasSavedRankingRef.current) return;
    if (!selectedMode) return;

    hasSavedRankingRef.current = true;

    // Gerar identificador único desta partida para controle de envio de e-mail
    setMatchKey(`${Date.now()}`);

    const modeKeyMap = { easy: 'easy', medium: 'medium', hard: 'challenge' };
    const diffKey = modeKeyMap[selectedMode] || selectedMode;

    const payload = {
      gameId: 'show-multiverso',
      gameName: 'Show do Multiverso',
      playerName: user?.nome || 'Jogador GeekVerse',
      playerEmail: user?.email || '',
      difficulty: diffKey,
      status: gameWon ? 'completed' : 'failed',
      score: finalScore,
      scoreBeforeHints: score,
      hits: correctCount,
      errors: gameWon ? 0 : 1,
      hintsUsed,
      hintPenaltyTotal,
      timeInSeconds: durationSeconds,
      formattedTime: formatTime(durationSeconds),
      rankingEligible: gameWon,
    };

    saveResult(payload);

    logAuditEvent({
      eventType: 'game_finish',
      description: `Usuário concluiu uma partida em Show do Multiverso com ${gameWon ? 'vitória' : 'derrota'}`,
      gameId: 'show-multiverso',
      gameName: 'Show do Multiverso',
      metadata: {
        difficulty: diffKey,
        status: gameWon ? 'completed' : 'failed',
        score: finalScore,
        attempts: correctCount,
        errors: gameWon ? 0 : 1,
        hintsUsed,
        rankingEligible: gameWon
      }
    });

    if (import.meta.env.DEV) {
      console.log('[ShowDoMultiverso] Resultado salvo no ranking:', payload);
    }
  }, [gamePhase, selectedMode, score, hintPenaltyTotal, gameWon, correctCount, hintsUsed, user, durationSeconds, finalScore, formatTime]);

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
                Escolha um portal, descubra personagens e explore dados de Rick and Morty.
              </p>
            </div>

            {loadError && (
              <div className="smv-error" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
                <p><FaExclamationTriangle aria-hidden="true" className="smv-icon smv-icon-warning" /> {loadError}</p>
              </div>
            )}

            <div className="smv-mode-grid">
              {Object.values(GAME_MODES).map((mode) => {
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
      let loaderSubtitle = 'Sincronizando universos...';

      if (selectedMode === 'easy') {
        loaderTitle = 'Portal Verde';
        loaderSubtitle = 'Preparando perguntas interdimensionais...';
      } else if (selectedMode === 'medium') {
        loaderTitle = 'Viagem Interdimensional';
        loaderSubtitle = 'Sincronizando versões alternativas...';
      } else if (selectedMode === 'hard') {
        loaderTitle = 'Desafio da Citadel';
        loaderSubtitle = 'Preparando os desafios...';
      }

      // Se houve erro durante loading, mostrar retry inline
      if (loadError) {
        return (
          <div className="smv-page smv-bg-game" style={{ '--smv-rick-bg': `url(${quizBg})` }}>
            <div className="smv-top-bar">
              <button
                className="smv-btn-top-back"
                onClick={handleBackToMenu}
                type="button"
                id="btn-back-loading-error"
              >
                <FaArrowLeft /> Voltar aos portais
              </button>
            </div>
            <div className="smv-error" style={{ margin: '60px auto', maxWidth: 520 }}>
              <p><FaExclamationTriangle aria-hidden="true" className="smv-icon smv-icon-warning" /> {loadError}</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button className="smv-btn-primary" onClick={() => startGame(selectedMode)} type="button" id="btn-retry-loading">
                  <FaRedo /> Tentar novamente
                </button>
                <button className="smv-btn-primary" onClick={handleBackToMenu} type="button" style={{ opacity: 0.8 }}>
                  <FaArrowLeft /> Voltar
                </button>
              </div>
            </div>
          </div>
        );
      }

      return <RickMortyLoader title={loaderTitle} subtitle={loaderSubtitle} />;
    }

    // ─── TELA: GAME OVER ─────────────────────────────────────────────
    if (gamePhase === 'gameover') {
      return (
        <div className="smv-page smv-bg-result" style={{ '--smv-rick-bg': `url(${gameWon ? quizBg : loseBg})` }}>
          {/* Top bar */}
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
                  <h1 className="smv-brand-title smv-final-title" style={{ color: '#4ade80', textShadow: '0 0 16px rgba(74, 222, 128, 0.4)', marginBottom: '24px' }}>Parabéns!</h1>
                </>
              ) : (
                <>
                  <h1 className="smv-brand-title smv-final-title" style={{ color: '#4ade80', textShadow: '0 0 16px rgba(74, 222, 128, 0.4)' }}>Fim de Jogo</h1>
                  <div className="smv-brand-subtitle" style={{marginBottom: 20}}>
                    <p style={{ color: '#e2e8f0', marginBottom: '8px' }}>Você caiu em uma armadilha dimensional.</p>
                    {currentQuestion && (
                      <p style={{ color: '#e2e8f0', marginBottom: '8px' }}>
                        Resposta correta:{' '}
                        <strong style={{ color: '#22c55e', textShadow: '0 0 8px rgba(34, 197, 94, 0.3)' }}>
                          {currentQuestion.options.find(
                            (o) => (typeof o === 'object' ? o.id : o) === currentQuestion.correctId
                          )?.name || currentQuestion.correctId}
                        </strong>
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="smv-gameover-score">
                <span className="smv-gameover-score-label">Pontuação Final</span>
                <span className="smv-gameover-score-value">
                  {formatNumber(finalScore)}
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
                  <span className="smv-gameover-stat-value">{hintsUsed}</span>
                  <span className="smv-gameover-stat-label">Ajudas usadas</span>
                </div>
                <div className="smv-gameover-stat">
                  <span className="smv-gameover-stat-value">{hintPenaltyTotal > 0 ? `-${formatNumber(hintPenaltyTotal)}` : '0'}</span>
                  <span className="smv-gameover-stat-label">Penalidade por ajudas</span>
                </div>
                <div className="smv-gameover-stat">
                  <span className="smv-gameover-stat-value" style={{ fontSize: '15px', textAlign: 'center', lineHeight: '1.2' }}>{modeConfig?.name || '?'}</span>
                  <span className="smv-gameover-stat-label">Modo</span>
                </div>
                <div className="smv-gameover-stat">
                  <span className="smv-gameover-stat-value">{formatTime(durationSeconds)}</span>
                  <span className="smv-gameover-stat-label">Tempo final</span>
                </div>
              </div>

              <JsonViewer data={apiData} title="JSON da última rodada" />

              <div className="smv-gameover-actions" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                <button
                  className="smv-btn-primary"
                  onClick={() => {
                    hasSavedRankingRef.current = false;
                    setMatchKey(null);
                    setExportFeedback(null);
                    handleRestart();
                  }}
                  type="button"
                  id="btn-restart-gameover"
                  style={{ padding: '10px 16px', fontSize: '13px', width: 'auto', flex: '1 1 140px', maxWidth: '200px' }}
                >
                  <FaRedo /> Jogar Novamente
                </button>
                <button
                  className="smv-btn-primary multiverse-export-button"
                  type="button"
                  id="btn-export-multiverso"
                  style={{ padding: '10px 16px', fontSize: '13px', width: 'auto', flex: '1 1 140px', maxWidth: '200px' }}
                  disabled={isExporting || (matchKey && hasEmailExportBeenSent(buildResultKey('show-multiverso', matchKey)))}
                  onClick={async () => {
                    if (!user?.email) {
                      setExportFeedback({ type: 'warn', text: 'E-mail do jogador não encontrado. Faça login novamente para enviar o resultado.' });
                      return;
                    }
                    // Guard: bloquear reenvio da mesma partida
                    const exportKey = buildResultKey('show-multiverso', matchKey);
                    if (hasEmailExportBeenSent(exportKey)) {
                      setExportFeedback({ type: 'warn', text: 'Este resultado já foi enviado para o e-mail cadastrado.' });
                      return;
                    }
                    setIsExporting(true);
                    setExportFeedback(null);
                    try {
                      await sendGameResultEmail({
                        game_name: 'Show do Multiverso',
                        player_name: user?.nome || user?.name || 'Jogador GeekVerse',
                        player_email: user.email,
                        difficulty: modeConfig?.name || selectedMode || 'Padrão',
                        status: gameWon ? 'vitória' : 'derrota',
                        result_title: 'Resultado do Show do Multiverso',
                        result_message: gameWon
                          ? 'Você completou o modo atual do Show do Multiverso.'
                          : 'Você registrou uma tentativa no Show do Multiverso.',
                        main_metric_label: 'Pontuação final',
                        main_metric_value: String(finalScore),
                        secondary_metrics: `Acertos: ${correctCount}\nErros: ${gameWon ? 0 : 1}\nAjudas usadas: ${hintsUsed}\nPenalidade por ajudas: ${hintPenaltyTotal}`,
                        generated_at: new Date().toLocaleString('pt-BR'),
                      });
                      // Marcar como enviado APENAS após sucesso
                      markEmailExportAsSent(exportKey);
                      setExportFeedback({ type: 'success', text: 'Resultado enviado com sucesso para o e-mail cadastrado.' });
                      try { logAuditEvent({ eventType: 'result_email_send', description: `E-mail de resultado enviado para Show do Multiverso`, gameId: 'show-multiverso', gameName: 'Show do Multiverso' }); } catch (_) {}
                    } catch (err) {
                      setExportFeedback({ type: 'error', text: 'Não foi possível enviar o resultado por e-mail. Tente novamente.' });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  <FaFileExport /> {isExporting ? 'Enviando...' : (gameWon ? 'Exportar resultado' : 'Exportar tentativa')}
                </button>
                {exportFeedback && (
                  <span className={`gv-export-feedback gv-export-feedback--${exportFeedback.type}`}>{exportFeedback.text}</span>
                )}
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
        <div className="smv-game-layout">
          {/* Sidebar — ScoreBoard + Footer */}
          <aside className="smv-sidebar">
            <ScoreBoard
              prizeValues={prizeValues}
              currentQuestionIndex={currentQuestionIndex}
              score={finalScore}
              gameOver={false}
              onBack={handleBackToMenu}
              timeStr={formatTime(durationSeconds)}
            />
          </aside>

          {/* Área principal */}
          <main className="smv-main">
            <QuestionCard
              question={currentQuestion.question}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              difficulty={selectedMode}
              prizeValue={currentPrizeValue}
              targetImage={currentQuestion.targetImage}
              targetData={currentQuestion.targetData}
              questionFocus={currentFocus}
              showResult={showResult}
            />

            {/* Alternativas */}
            <div className="smv-answers-grid">
              {currentQuestion.options.map((option, idx) => {
                const optionId = typeof option === 'object' ? option.id : option;
                const isEliminated = eliminatedOptions.includes(optionId);
                return (
                  <AnswerCard
                    key={`q${currentQuestion.id}-opt${idx}`}
                    option={option}
                    isSelected={selectedOptionId === optionId}
                    isCorrect={optionId === currentQuestion.correctId}
                    showResult={showResult}
                    disabled={showResult || isEliminated}
                    onClick={() => handleSelectOption(optionId)}
                    index={idx}
                    questionFocus={currentFocus}
                    isEliminated={isEliminated}
                  />
                );
              })}
            </div>

            {/* Cards de dica */}
            {!showResult && (
              <div className="smv-hints-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div className="smv-hints-row">
                  {[0, 1, 2].map((hintIdx) => {
                    const isUsed = hintIdx < hintsUsed;
                    const isDisabled = isUsed || hintsRemaining <= 0 || showResult;
                    return (
                      <button
                        key={hintIdx}
                        className={`smv-hint-card ${isUsed ? 'smv-hint-used' : ''} ${isDisabled && !isUsed ? 'smv-hint-disabled' : ''}`}
                        onClick={() => handleUseHint(hintIdx)}
                        disabled={isDisabled}
                        type="button"
                        id={`hint-btn-${hintIdx}`}
                        title="Remove uma alternativa errada. Custo: -20% do prêmio atual."
                      >
                        <span className="smv-hint-label">Ajuda</span>
                        <span className="smv-hint-cost">-{formatNumber(currentHintPenalty)}</span>
                      </button>
                    );
                  })}
                </div>
                <span style={{ fontSize: '12px', color: '#4ade80', textAlign: 'center', fontWeight: '500' }}>
                  Cada ajuda remove uma alternativa errada. (Custo: -20% do prêmio)
                </span>
              </div>
            )}

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
                <div className="smv-feedback-content">
                  <p className="smv-feedback-title">
                    {selectedOptionId === currentQuestion.correctId
                      ? <><FaCheckCircle aria-hidden="true" className="smv-icon smv-feedback-icon smv-feedback-correct" /> Resposta Correta!</>
                      : <><FaTimesCircle aria-hidden="true" className="smv-icon smv-feedback-icon smv-feedback-wrong" /> Resposta Errada!</>}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="smv-feedback-explanation">
                      {currentQuestion.explanation}
                    </p>
                  )}
                </div>
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
