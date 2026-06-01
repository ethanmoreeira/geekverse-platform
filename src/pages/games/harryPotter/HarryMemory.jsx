// HarryMemory.jsx
// Página: Memória dos Bruxos | Rota: /app/harry-potter | API: Harry Potter API
// Mecânica: Jogo da memória com personagens. Fácil (30), Médio (40), Desafio (50).
// Controlador principal: gerencia estados do jogo, lógica de pares e vitória.

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemoryBoard from '../../../components/game/memory/MemoryBoard';
import FloatingMemoryCards from '../../../components/game/memory/FloatingMemoryCards';
import MemoryStats from '../../../components/game/memory/MemoryStats';
import DifficultySelector from '../../../components/ui/DifficultySelector';
import JsonViewer from '../../../components/feedback/JsonViewer';
import { DIFFICULTIES } from '../../../utils/difficultyConfig';
import { useAuth } from '../../../hooks/useAuth';
import { saveResult } from '../../../services/rankingService';
import { logAuditEvent } from '../../../services/auditService';
import { FaArrowLeft, FaSyncAlt, FaTrophy, FaRedoAlt, FaVolumeUp, FaVolumeMute, FaFileExport } from 'react-icons/fa';
import { sendGameResultEmail } from '../../../services/emailService';
import { hasEmailExportBeenSent, markEmailExportAsSent, buildResultKey } from '../../../utils/emailExportControl';
import ThemedGameLoader from '../../../components/feedback/ThemedGameLoader';
import ThemedLogoutScreen from '../../../components/feedback/ThemedLogoutScreen';
import { useHarryMemoryGame } from '../../../hooks/useHarryMemoryGame';
import '../../../styles/games.css';
import boardBg from '../../../assets/backgrounds/harry-potter/harry-memory-board-bg.png';
import victoryBg from '../../../assets/backgrounds/harry-potter/f087384f-df83-4ea0-bcbc-63a9473ae699.jpg';
import magicAmbient from '../../../assets/audio/geoffharvey-let-the-mystery-unfold-122118.mp3';

const HarryMemory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasSavedRankingRef = useRef(false);

  // Estados de carregamento locais (transições de página)
  const [showIntroLoader, setShowIntroLoader] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [exportFeedback, setExportFeedback] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [matchKey, setMatchKey] = useState(null);

  const hasLoggedEnter = useRef(false);

  useEffect(() => {
    if (!hasLoggedEnter.current) {
      hasLoggedEnter.current = true;
      logAuditEvent({
        eventType: 'game_enter',
        description: 'Usuário entrou no jogo Memória dos Bruxos',
        gameId: 'memoria-bruxos',
        gameName: 'Memória dos Bruxos'
      });
    }
  }, []);

  // Efeito de intro loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntroLoader(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Música ambiente
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Iniciar música quando o intro loader terminar (usuário já clicou para entrar)
  useEffect(() => {
    if (!showIntroLoader && audioRef.current) {
      audioRef.current.volume = 0.18;
      audioRef.current.play().then(() => {
        setIsMusicPlaying(true);
      }).catch(() => {
        // Navegador bloqueou autoplay — o usuário pode clicar no botão
        setIsMusicPlaying(false);
      });
    }
  }, [showIntroLoader]);

  // Pausar música ao sair da página — cleanup robusto
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
        console.warn('Não foi possível tocar a música:', err.message);
      });
    }
  };

  const handleBack = () => {
    setIsLeaving(true);
    setTimeout(() => {
      navigate('/app');
    }, 1800);
  };

  // ── Hook de lógica do jogo ──
  const {
    difficulty,
    cards,
    loading,
    error,
    adjustmentInfo,
    apiMetadata,
    gameStatus,
    attempts,
    pairsFound,
    totalPairs,
    elapsedTime,
    finalTime,
    zoomedCardId,
    formatTime,
    handleCardClick,
    isCardFlipped,
    isCardMatched,
    handleDifficultySelect,
    handleReload,
    handlePlayAgain,
    GAME_STATUS
  } = useHarryMemoryGame();

  // Para o timer e salva o tempo final quando o jogo termina
  useEffect(() => {
    if (gameStatus === GAME_STATUS.FINISHED) {
      // Gerar identificador único desta partida para controle de envio de e-mail
      setMatchKey(`${Date.now()}`);
      // Resetar feedback de exportação para a nova partida
      setExportFeedback(null);

      // ── Salvar resultado no Ranking (uma única vez) ──
      if (!hasSavedRankingRef.current && difficulty) {
        hasSavedRankingRef.current = true;

        const difficultyKey = difficulty === 'hard' ? 'challenge' : difficulty;
        const finalDuration = finalTime || elapsedTime;

        const payload = {
          gameId: 'harry-memory',
          gameName: 'Memória dos Bruxos',
          playerName: user?.nome || 'Jogador GeekVerse',
          playerEmail: user?.email || '',
          difficulty: difficultyKey,
          status: 'completed',
          score: null,
          timeInSeconds: finalDuration,
          formattedTime: formatTime(finalDuration),
          attempts,
          hits: pairsFound,
          errors: 0,
          hintsUsed: 0,
          rankingEligible: true,
        };

        saveResult(payload);

        logAuditEvent({
          eventType: 'game_finish',
          description: 'Usuário concluiu uma partida em Memória dos Bruxos',
          gameId: 'memoria-bruxos',
          gameName: 'Memória dos Bruxos',
          metadata: {
            difficulty: difficultyKey,
            status: 'completed',
            time: finalDuration,
            attempts,
            rankingEligible: true
          }
        });

        if (import.meta.env.DEV) {
          console.log('[HarryMemory] Resultado salvo no ranking:', payload);
        }
      }
    } else if (gameStatus === GAME_STATUS.IDLE) {
      hasSavedRankingRef.current = false;
    }
  }, [gameStatus, difficulty, finalTime, formatTime, attempts, pairsFound, user, GAME_STATUS]);

  const isShuffling = gameStatus === GAME_STATUS.SHUFFLING;
  const isPlaying = gameStatus === GAME_STATUS.PLAYING;
  const isFinished = gameStatus === GAME_STATUS.FINISHED;
  const difficultyConfig = difficulty ? DIFFICULTIES[difficulty] : null;

  if (showIntroLoader) {
    return <ThemedGameLoader />;
  }

  if (isLeaving) {
    return <ThemedLogoutScreen />;
  }

  return (
    <div className="gv-harry-page">
      <div className="gv-harry-page-bg" style={{ backgroundImage: `url(${boardBg})` }}></div>
      
      <audio ref={audioRef} src={magicAmbient} loop preload="auto" />

      <div className="gv-harry-top-bar">
        <button className="gv-btn-back-magic" onClick={handleBack} id="btn-back">
          <FaArrowLeft /> Voltar
        </button>
        <button className="gv-btn-music-toggle" onClick={toggleMusic} id="btn-music" title={isMusicPlaying ? 'Pausar música' : 'Tocar música'}>
          {isMusicPlaying ? <FaVolumeUp /> : <FaVolumeMute />}
          <span>{isMusicPlaying ? 'Pausar' : 'Tocar'}</span>
        </button>
      </div>

      <div className="gv-harry-header">
        <h1 className="gv-magic-title">Memória dos Bruxos</h1>
        <p className="gv-subtitle" style={{ textAlign: 'center', color: 'var(--gv-text-dim)', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
          Escolha uma dificuldade e encontre os pares mágicos.
        </p>
      </div>

      <div className="gv-game-content gv-harry-content">
        {/* Seletor de Dificuldade */}
        {!loading && !isFinished && (
          <DifficultySelector
            onSelect={handleDifficultySelect}
            currentDifficulty={difficulty}
            disabled={loading || isShuffling}
          />
        )}

        {/* Estatísticas do jogo */}
        {(isPlaying || isFinished) && !loading && difficultyConfig && (
          <MemoryStats
            attempts={attempts}
            pairsFound={pairsFound}
            totalPairs={totalPairs}
            difficultyLabel={difficultyConfig.label}
            elapsedTime={elapsedTime}
            formatTime={formatTime}
          />
        )}

        {/* Cartas decorativas flutuantes — somente na tela inicial */}
        {gameStatus === GAME_STATUS.IDLE && !loading && !error && (
          <FloatingMemoryCards />
        )}

        {/* Botão de recarregar */}
        {difficulty && isPlaying && cards.length > 0 && (
          <div className="gv-reload-bar">
            <button className="gv-btn-reload-magic" onClick={handleReload} id="btn-reload">
              <FaSyncAlt /> Embaralhar Novamente
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="gv-loading-magic" id="loading-indicator">
            <div className="gv-loading-spinner"></div>
            <p className="gv-loading-text">Carregando retratos dos bruxos...</p>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="gv-error-magic" id="error-message">
            <span className="gv-error-icon">⚠️</span>
            <p>{error}</p>
            <button className="gv-btn-retry-magic" onClick={handleReload}>
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Aviso de ajuste automático */}
        {adjustmentInfo && !loading && (
          <div className="gv-warning-magic" id="adjustment-warning">
            <span className="gv-warning-icon">🧙‍♂️</span>
            <p>{adjustmentInfo}</p>
          </div>
        )}

        {/* Tela de Vitória */}
        {isFinished && (
          <div className="gv-victory-overlay" id="victory-screen">
            {/* Partículas mágicas flutuantes — atrás do card */}
            <div className="gv-victory-particles" aria-hidden="true">
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
              <span className="gv-vp"></span>
            </div>
            <div
              className="gv-victory-card"
              style={{
                backgroundImage: `linear-gradient(rgba(10, 6, 25, 0.55), rgba(10, 6, 25, 0.65)), url(${victoryBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Aura mágica ao redor da taça */}
              <div className="gv-victory-aura" aria-hidden="true"></div>
              <div className="gv-victory-icon">
                <FaTrophy />
              </div>
              <h2 className="gv-victory-title">Parabéns, Bruxo!</h2>
              <p className="gv-victory-subtitle">Você encontrou todos os pares mágicos!</p>
              <div className="gv-victory-stats">
                <div className="gv-victory-stat">
                  <span className="gv-victory-stat-value">{formatTime(finalTime)}</span>
                  <span className="gv-victory-stat-label">Tempo</span>
                </div>
                <div className="gv-victory-stat">
                  <span className="gv-victory-stat-value">{attempts}</span>
                  <span className="gv-victory-stat-label">Tentativas</span>
                </div>
                <div className="gv-victory-stat">
                  <span className="gv-victory-stat-value">{pairsFound}</span>
                  <span className="gv-victory-stat-label">Pares</span>
                </div>
                <div className="gv-victory-stat">
                  <span className="gv-victory-stat-value">{difficultyConfig?.label}</span>
                  <span className="gv-victory-stat-label">Dificuldade</span>
                </div>
              </div>
              <div className="gv-victory-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="gv-btn-play-again" onClick={handlePlayAgain} id="btn-play-again">
                  <FaRedoAlt /> Jogar Novamente
                </button>
                <button
                  className="gv-btn-play-again memory-export-button"
                  id="btn-export-memory"
                  disabled={isExporting || (matchKey && hasEmailExportBeenSent(buildResultKey('harry-memory', matchKey)))}
                  onClick={async () => {
                    if (!user?.email) {
                      setExportFeedback({ type: 'warn', text: 'E-mail do jogador não encontrado. Faça login novamente para enviar o resultado.' });
                      return;
                    }
                    // Guard: bloquear reenvio da mesma partida
                    const exportKey = buildResultKey('harry-memory', matchKey);
                    if (hasEmailExportBeenSent(exportKey)) {
                      setExportFeedback({ type: 'warn', text: 'Este resultado já foi enviado para o e-mail cadastrado.' });
                      return;
                    }
                    setIsExporting(true);
                    setExportFeedback(null);
                    try {
                      await sendGameResultEmail({
                        game_name: 'Memória dos Bruxos',
                        player_name: user?.nome || user?.name || 'Jogador GeekVerse',
                        player_email: user.email,
                        difficulty: difficultyConfig?.label || 'Padrão',
                        status: 'vitória',
                        result_title: 'Resultado da Memória dos Bruxos',
                        result_message: 'Você concluiu o desafio encontrando todos os pares.',
                        main_metric_label: 'Tempo final',
                        main_metric_value: formatTime(finalTime),
                        secondary_metrics: `Tentativas: ${attempts}\nPares encontrados: ${pairsFound}\nTotal de pares: ${totalPairs}\nTempo em segundos: ${finalTime}`,
                        generated_at: new Date().toLocaleString('pt-BR'),
                      });
                      // Marcar como enviado APENAS após sucesso
                      markEmailExportAsSent(exportKey);
                      setExportFeedback({ type: 'success', text: 'Resultado enviado com sucesso para o e-mail cadastrado.' });
                      try { logAuditEvent({ eventType: 'result_email_send', description: 'E-mail de resultado enviado para Memória dos Bruxos', gameId: 'memoria-bruxos', gameName: 'Memória dos Bruxos' }); } catch (_) {}
                    } catch (err) {
                      setExportFeedback({ type: 'error', text: 'Não foi possível enviar o resultado por e-mail. Tente novamente.' });
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                >
                  <FaFileExport /> {isExporting ? 'Enviando...' : 'Exportar resultado'}
                </button>
                {exportFeedback && (
                  <span className={`gv-export-feedback gv-export-feedback--${exportFeedback.type}`}>{exportFeedback.text}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabuleiro */}
        {cards.length > 0 && !loading && !isFinished && (
          <MemoryBoard
            cards={cards}
            difficulty={difficulty}
            isShuffling={isShuffling}
            onCardClick={handleCardClick}
            isCardFlipped={isCardFlipped}
            isCardMatched={isCardMatched}
            zoomedCardId={zoomedCardId}
          />
        )}

        {/* JSON Viewer */}
        {apiMetadata && !loading && (
          <JsonViewer
            data={apiMetadata}
            title="📋 Dados da API — Harry Potter (JSON)"
          />
        )}
      </div>
    </div>
  );
};

export default HarryMemory;
