// HarryMemory.jsx
// Página: Memória dos Bruxos | Rota: /app/harry-potter | API: Harry Potter API
// Mecânica: Jogo da memória com personagens. Fácil (30), Médio (40), Desafio (50).
// Controlador principal: gerencia estados do jogo, lógica de pares e vitória.

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MemoryBoard from '../../../components/game/memory/MemoryBoard';
import MemoryStats from '../../../components/game/memory/MemoryStats';
import DifficultySelector from '../../../components/ui/DifficultySelector';
import JsonViewer from '../../../components/feedback/JsonViewer';
import { fetchCharactersForGame } from '../../../services/apis/harryPotterApi';
import { DIFFICULTIES } from '../../../utils/difficultyConfig';
import { FaArrowLeft, FaSyncAlt, FaMagic, FaTrophy, FaRedoAlt } from 'react-icons/fa';
import '../../../styles/games.css';
import boardBg from '../../../assets/backgrounds/harry-potter/harry-board-bg.png';

const SHUFFLE_DURATION = 3200; // 3.2 segundos de animação

// Status do jogo
const GAME_STATUS = {
  IDLE: 'idle',           // Aguardando seleção de dificuldade
  SHUFFLING: 'shuffling', // Animação de embaralhamento
  PLAYING: 'playing',     // Jogo em andamento
  FINISHED: 'finished',   // Todos os pares encontrados
};

const HarryMemory = () => {
  const navigate = useNavigate();

  // Estados de carregamento e API
  const [difficulty, setDifficulty] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adjustmentInfo, setAdjustmentInfo] = useState(null);
  const [apiMetadata, setApiMetadata] = useState(null);

  // Estados do jogo
  const [gameStatus, setGameStatus] = useState(GAME_STATUS.IDLE);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [isChecking, setIsChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);

  const shuffleTimerRef = useRef(null);

  /**
   * Reseta todos os estados do jogo (sem alterar cartas/dificuldade).
   */
  const resetGameState = useCallback(() => {
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setIsChecking(false);
    setAttempts(0);
    setPairsFound(0);
  }, []);

  /**
   * Carrega as cartas da API com base na dificuldade selecionada.
   */
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

      setCards(result.cards);
      setTotalPairs(result.metadata.pairsUsed);

      // Iniciar animação de embaralhamento mágico
      setGameStatus(GAME_STATUS.SHUFFLING);
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
      });
    } catch (err) {
      console.error('Erro ao carregar personagens:', err);
      setError(
        'Não foi possível carregar os personagens da API. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [resetGameState]);

  /**
   * Lógica de clique em uma carta.
   */
  const handleCardClick = useCallback(
    (card) => {
      // Bloquear cliques fora do estado PLAYING
      if (gameStatus !== GAME_STATUS.PLAYING) return;
      if (isChecking) return;
      if (flippedCards.length >= 2) return;
      if (flippedCards.find((c) => c.uniqueId === card.uniqueId)) return;
      if (matchedPairs.has(card.pairId)) return;

      const newFlipped = [...flippedCards, card];
      setFlippedCards(newFlipped);

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
    [gameStatus, flippedCards, matchedPairs, isChecking, pairsFound, totalPairs]
  );

  /**
   * Verifica se uma carta está virada (temporariamente ou como par encontrado).
   */
  const isCardFlipped = useCallback(
    (card) => {
      return (
        flippedCards.some((c) => c.uniqueId === card.uniqueId) ||
        matchedPairs.has(card.pairId)
      );
    },
    [flippedCards, matchedPairs]
  );

  /**
   * Verifica se uma carta faz parte de um par encontrado.
   */
  const isCardMatched = useCallback(
    (card) => matchedPairs.has(card.pairId),
    [matchedPairs]
  );

  /**
   * Seleciona dificuldade e carrega cartas.
   */
  const handleDifficultySelect = (key) => {
    setDifficulty(key);
    loadCards(key);
  };

  /**
   * Recarrega (nova rodada, mesma dificuldade).
   */
  const handleReload = () => {
    if (difficulty) {
      loadCards(difficulty);
    }
  };

  /**
   * Jogar novamente (após vitória).
   */
  const handlePlayAgain = () => {
    if (difficulty) {
      loadCards(difficulty);
    }
  };

  const isShuffling = gameStatus === GAME_STATUS.SHUFFLING;
  const isPlaying = gameStatus === GAME_STATUS.PLAYING;
  const isFinished = gameStatus === GAME_STATUS.FINISHED;
  const difficultyConfig = difficulty ? DIFFICULTIES[difficulty] : null;

  return (
    <div className="gv-harry-page" style={{ backgroundImage: `url(${boardBg})` }}>
      
      <div className="gv-harry-top-bar">
        <button className="gv-btn-back-magic" onClick={() => navigate('/app')} id="btn-back">
          <FaArrowLeft /> Voltar
        </button>
      </div>

      <div className="gv-harry-header">
        <h1 className="gv-magic-title">Memória dos Bruxos</h1>
        <p className="gv-magic-subtitle">
          Encontre os pares de personagens e complete o desafio mágico.
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
          />
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
            <p className="gv-loading-text">Convocando personagens mágicos...</p>
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

        {/* Efeito de feitiço durante embaralhamento */}
        {isShuffling && (
          <div className="gv-spell-overlay" id="shuffle-spell">
            <div className="gv-spell-wand">
              <FaMagic className="gv-wand-icon" />
            </div>
            <div className="gv-spell-particles">
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
              <span className="gv-particle"></span>
            </div>
            <p className="gv-spell-text">Embaralhando cartas...</p>
          </div>
        )}

        {/* Tela de Vitória */}
        {isFinished && (
          <div className="gv-victory-overlay" id="victory-screen">
            <div className="gv-victory-card">
              <div className="gv-victory-icon">
                <FaTrophy />
              </div>
              <h2 className="gv-victory-title">Parabéns, Bruxo!</h2>
              <p className="gv-victory-subtitle">Você encontrou todos os pares mágicos!</p>
              <div className="gv-victory-stats">
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
              <button className="gv-btn-play-again" onClick={handlePlayAgain} id="btn-play-again">
                <FaRedoAlt /> Jogar Novamente
              </button>
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
