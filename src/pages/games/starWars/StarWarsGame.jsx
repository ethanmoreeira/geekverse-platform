// StarWarsGame.jsx
// Página principal: Fuga do Hiperespaço | Rota: /app/star-wars
// Jogo de montagem de missão com dados reais da SWAPI.
// Fluxo: BUILDER → SUMMARY → ARENA_PREVIEW → RESULT_PREVIEW

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logAuditEvent } from '../../../services/auditService';
import { fetchStarWarsMissionData } from '../../../services/apis/starWarsApi';
import { calculateMissionStats } from '../../../utils/starWarsMission';
import { stopAllFugaMusic, toggleActiveFugaMusic, playFugaMusic, switchToFugaIntroMusic } from '../../../services/audioService';

// Componentes
import StarshipCard from '../../../components/game/starWars/StarshipCard';
import PilotCard from '../../../components/game/starWars/PilotCard';
import PlanetCard from '../../../components/game/starWars/PlanetCard';
import EquipmentCard from '../../../components/game/starWars/EquipmentCard';
import DifficultySelector from '../../../components/game/starWars/DifficultySelector';
import MissionSummary from '../../../components/game/starWars/MissionSummary';
import StarWarsJsonPanel from '../../../components/game/starWars/StarWarsJsonPanel';
import HyperdriveEscape from '../../../components/game/starWars/HyperdriveEscape';

// Ícones
import {
  FaArrowLeft,
  FaRocket,
  FaExclamationTriangle,
  FaRedo,
  FaPause,
} from 'react-icons/fa';
import {
  GiSpaceship,
  GiPerson,
  GiPlanetCore,
  GiCartwheel,
  GiCrossedSwords,
} from 'react-icons/gi';

// CSS
import '../../../styles/starWars.css';

// Imagens
import exitImage from '../../../assets/backgrounds/star-wars/capital_ship_exit_screen_8k.png';
import capitalShipBg from '../../../assets/backgrounds/star-wars/capital_ship_8k_ultra_quality.png';

// ─── Fases do Jogo ──────────────────────────────────────────────────

const GAME_PHASES = {
  BUILDER: 'builder',
  SUMMARY: 'summary',
  ARENA: 'arena',
};

// ─── Badges do Hero ─────────────────────────────────────────────────

const HERO_BADGES = [
  'SWAPI',
  'Naves',
  'Pilotos',
  'Planetas',
  'Equipamentos',
  'Missão Dinâmica',
];

// ─── Passos do Builder ──────────────────────────────────────────────

const BUILDER_STEPS = {
  STARSHIP: 'starship',
  PILOT: 'pilot',
  PLANET: 'planet',
  EQUIPMENT: 'equipment',
  DIFFICULTY: 'difficulty',
};

const STEP_ORDER = [
  BUILDER_STEPS.STARSHIP,
  BUILDER_STEPS.PILOT,
  BUILDER_STEPS.PLANET,
  BUILDER_STEPS.EQUIPMENT,
  BUILDER_STEPS.DIFFICULTY,
];

const STEP_LABELS = {
  [BUILDER_STEPS.STARSHIP]: 'Nave',
  [BUILDER_STEPS.PILOT]: 'Piloto',
  [BUILDER_STEPS.PLANET]: 'Planeta',
  [BUILDER_STEPS.EQUIPMENT]: 'Equip.',
  [BUILDER_STEPS.DIFFICULTY]: 'Dif.',
};

const STEP_LABELS_FULL = {
  [BUILDER_STEPS.STARSHIP]: 'Nave',
  [BUILDER_STEPS.PILOT]: 'Piloto',
  [BUILDER_STEPS.PLANET]: 'Planeta',
  [BUILDER_STEPS.EQUIPMENT]: 'Equipamento',
  [BUILDER_STEPS.DIFFICULTY]: 'Dificuldade',
};

const DIFFICULTY_LABELS = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
};

// ─── Componente Principal ───────────────────────────────────────────

const StarWarsGame = () => {
  const navigate = useNavigate();

  // Estado de carregamento
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasLoggedEnter = useRef(false);

  useEffect(() => {
    if (!hasLoggedEnter.current) {
      hasLoggedEnter.current = true;
      logAuditEvent({
        eventType: 'game_enter',
        description: 'Usuário entrou no jogo Fuga do Hiperespaço',
        gameId: 'fuga-hiperespaco',
        gameName: 'Fuga do Hiperespaço'
      });
    }
  }, []);

  useEffect(() => {
    // Garante que a música toque caso o React StrictMode ou um reload cancele o play do Dashboard
    playFugaMusic();

    return () => {
      stopAllFugaMusic();
    };
  }, []);

  // Dados da API
  const [missionData, setMissionData] = useState(null);

  // Seleções do jogador
  const [selectedStarship, setSelectedStarship] = useState(null);
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  // Estado do jogo
  const [missionStats, setMissionStats] = useState(null);
  const [gamePhase, setGamePhase] = useState(GAME_PHASES.BUILDER);
  const [activeBuilderStep, setActiveBuilderStep] = useState(BUILDER_STEPS.STARSHIP);
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = () => {
    // Se não estiver na tela de construção, volta para a tela de construção
    if (gamePhase !== GAME_PHASES.BUILDER) {
      setGamePhase(GAME_PHASES.BUILDER);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      switchToFugaIntroMusic();
      return;
    }

    // Se estiver na tela de construção mas NÃO no primeiro passo, volta um passo
    const currentStepIndex = STEP_ORDER.indexOf(activeBuilderStep);
    if (currentStepIndex > 0) {
      setActiveBuilderStep(STEP_ORDER[currentStepIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Se estiver no primeiro passo da construção, sai para o dashboard
    setIsExiting(true);
    setTimeout(() => {
      navigate('/app');
    }, 1500);
  };

  // ── Carregar dados ──
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStarWarsMissionData();

      // Verificar se tem dados mínimos
      if (
        data.starships.length === 0 &&
        data.pilots.length === 0 &&
        data.planets.length === 0 &&
        data.vehicles.length === 0
      ) {
        setError(
          'Não foi possível carregar dados da SWAPI. A API pode estar temporariamente indisponível.'
        );
      } else {
        setMissionData(data);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[StarWarsGame] Erro ao carregar dados:', err);
      }
      setError(
        'Erro ao conectar com a SWAPI. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Navegação do Stepper ──
  const currentStepIndex = STEP_ORDER.indexOf(activeBuilderStep);

  const getStepSelection = (step) => {
    switch (step) {
      case BUILDER_STEPS.STARSHIP: return selectedStarship;
      case BUILDER_STEPS.PILOT: return selectedPilot;
      case BUILDER_STEPS.PLANET: return selectedPlanet;
      case BUILDER_STEPS.EQUIPMENT: return selectedVehicle;
      case BUILDER_STEPS.DIFFICULTY: return selectedDifficulty;
      default: return null;
    }
  };

  const isCurrentStepComplete = !!getStepSelection(activeBuilderStep);
  const isMissionComplete = STEP_ORDER.every(step => !!getStepSelection(step));

  const handleNextStep = () => {
    if (!isCurrentStepComplete) return;
    if (currentStepIndex < STEP_ORDER.length - 1) {
      setActiveBuilderStep(STEP_ORDER[currentStepIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStepIndex === STEP_ORDER.length - 1) {
      handlePrepareMission();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveBuilderStep(STEP_ORDER[currentStepIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step) => {
    // Permitir clicar em qualquer step, mas é bom UX só permitir se o anterior estiver preenchido ou se for step anterior
    const clickedIndex = STEP_ORDER.indexOf(step);
    if (clickedIndex <= currentStepIndex || !!getStepSelection(STEP_ORDER[clickedIndex - 1])) {
      setActiveBuilderStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Handlers de seleção ──
  const handleSelectStarship = (ship) => {
    setSelectedStarship(selectedStarship?.id === ship.id ? null : ship);
  };

  const handleSelectPilot = (pilot) => {
    setSelectedPilot(selectedPilot?.id === pilot.id ? null : pilot);
  };

  const handleSelectPlanet = (planet) => {
    setSelectedPlanet(selectedPlanet?.id === planet.id ? null : planet);
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(selectedVehicle?.id === vehicle.id ? null : vehicle);
  };

  const handleSelectDifficulty = (diff) => {
    setSelectedDifficulty(selectedDifficulty === diff ? null : diff);
  };

  // ── Preparar missão ──
  const handlePrepareMission = () => {
    if (!isMissionComplete) return;

    const stats = calculateMissionStats({
      starship: selectedStarship,
      pilot: selectedPilot,
      planet: selectedPlanet,
      vehicle: selectedVehicle,
      difficulty: selectedDifficulty,
    });

    setMissionStats(stats);
    setGamePhase(GAME_PHASES.SUMMARY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Navegação entre fases ──
  const handleStartArena = () => {
    setGamePhase(GAME_PHASES.ARENA);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBuilder = () => {
    setGamePhase(GAME_PHASES.BUILDER);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayAgain = () => {
    setGamePhase(GAME_PHASES.ARENA);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Contagem de seleções ──
  const selectionCount = STEP_ORDER.filter(step => !!getStepSelection(step)).length;

  // ──────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────

  return (
    <div className="sw-game-page">
      {/* Top Bar */}
      <div className="sw-top-bar">
        <button
          className="sw-btn-back"
          onClick={handleExit}
          type="button"
        >
          <FaArrowLeft /> Voltar
        </button>

        {gamePhase !== GAME_PHASES.ARENA && (
          <button
            className="fuga-audio-button"
            onClick={toggleActiveFugaMusic}
            type="button"
            title="Pausar/Retomar música"
          >
            <FaPause /> Pausar
          </button>
        )}
      </div>

      {/* ── EXIT LOADING ── */}
      {isExiting && (
        <section
          className="starwars-transition-screen"
          style={{
            backgroundImage: `linear-gradient(rgba(3, 7, 18, 0.4), rgba(3, 7, 18, 0.7)), url(${exitImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <span className="starwars-transition-kicker">FUGA DO HIPERESPAÇO</span>
          <h1>Saindo do Hiperespaço</h1>
        </section>
      )}

      {/* Hero */}
      {gamePhase === GAME_PHASES.BUILDER && (
        <div className="sw-hero sw-hero-compact">
          <h1 className="sw-hero-title">Fuga do Hiperespaço</h1>
          <p className="sw-hero-subtitle">
            Monte sua missão e sobreviva à fuga pelo hiperespaço.
          </p>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <section
          className="starwars-transition-screen"
          style={{ 
            backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.32)), url(${capitalShipBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <span className="starwars-transition-kicker">FUGA DO HIPERESPAÇO</span>
          <h1>Calculando rota hiperespacial</h1>
          <p style={{ color: 'rgba(56, 217, 255, 0.7)', fontSize: '0.9rem', marginTop: '12px' }}>Carregando frota, pilotos e planetas...</p>
        </section>
      )}

      {/* ── ERROR ── */}
      {error && !loading && (
        <div className="sw-error">
          <FaExclamationTriangle className="sw-error-icon" />
          <p>{error}</p>
          <button className="sw-btn sw-btn-primary" onClick={loadData} type="button">
            <FaRedo /> Tentar Novamente
          </button>
        </div>
      )}

      {/* ── BUILDER PHASE ── */}
      {!loading && !error && missionData && gamePhase === GAME_PHASES.BUILDER && (
        <div className="sw-builder-layout">

          <div className="sw-builder-main">
            {/* Stepper Header */}
            <div className="sw-stepper">
              {STEP_ORDER.map((step, index) => {
                const isActive = step === activeBuilderStep;
                const isCompleted = !!getStepSelection(step);
                const isClickable = index <= currentStepIndex || !!getStepSelection(STEP_ORDER[index - 1]);

                return (
                  <div
                    key={step}
                    className={`sw-step ${isActive ? 'sw-step-active' : ''} ${isCompleted ? 'sw-step-completed' : ''} ${isClickable ? 'sw-step-clickable' : ''}`}
                    onClick={() => isClickable && handleStepClick(step)}
                    role="button"
                    tabIndex={isClickable ? 0 : -1}
                  >
                    <div className="sw-step-indicator">
                      {isCompleted && !isActive ? '✓' : index + 1}
                    </div>
                    <span className="sw-step-label">{STEP_LABELS[step]}</span>
                    {index < STEP_ORDER.length - 1 && <div className="sw-step-line" />}
                  </div>
                );
              })}
            </div>

            {/* Step Content */}
            <div className="sw-step-content">
              {activeBuilderStep === BUILDER_STEPS.STARSHIP && (
                <section className="sw-section">
                  <h2 className="sw-section-title">
                    Escolha sua Nave
                  </h2>
                  <div className="sw-cards-grid sw-cards-grid-compact">
                    {missionData.starships.map((ship) => (
                      <StarshipCard key={ship.id} starship={ship} isSelected={selectedStarship?.id === ship.id} onSelect={handleSelectStarship} />
                    ))}
                  </div>
                </section>
              )}

              {activeBuilderStep === BUILDER_STEPS.PILOT && (
                <section className="sw-section">
                  <h2 className="sw-section-title">
                    Escolha seu Piloto
                  </h2>
                  <div className="sw-cards-grid sw-cards-grid-compact">
                    {missionData.pilots.map((pilot) => (
                      <PilotCard key={pilot.id} pilot={pilot} isSelected={selectedPilot?.id === pilot.id} onSelect={handleSelectPilot} />
                    ))}
                  </div>
                </section>
              )}

              {activeBuilderStep === BUILDER_STEPS.PLANET && (
                <section className="sw-section">
                  <h2 className="sw-section-title">
                    Escolha o Planeta de Destino
                  </h2>
                  <div className="sw-cards-grid sw-cards-grid-compact">
                    {missionData.planets.map((planet) => (
                      <PlanetCard key={planet.id} planet={planet} isSelected={selectedPlanet?.id === planet.id} onSelect={handleSelectPlanet} />
                    ))}
                  </div>
                </section>
              )}

              {activeBuilderStep === BUILDER_STEPS.EQUIPMENT && (
                <section className="sw-section">
                  <h2 className="sw-section-title">
                    Escolha o Equipamento Auxiliar
                  </h2>
                  <div className="sw-cards-grid sw-cards-grid-compact">
                    {missionData.vehicles.map((vehicle) => (
                      <EquipmentCard key={vehicle.id} vehicle={vehicle} isSelected={selectedVehicle?.id === vehicle.id} onSelect={handleSelectVehicle} />
                    ))}
                  </div>
                </section>
              )}

              {activeBuilderStep === BUILDER_STEPS.DIFFICULTY && (
                <section className="sw-section">
                  <h2 className="sw-section-title">
                    Escolha a Dificuldade
                  </h2>
                  <DifficultySelector selected={selectedDifficulty} onSelect={handleSelectDifficulty} />
                </section>
              )}
            </div>

            {/* Stepper Footer Actions */}
            <div className="sw-stepper-actions">
              <div />
              {currentStepIndex < STEP_ORDER.length - 1 ? (
                <button
                  className="sw-btn sw-btn-primary"
                  onClick={handleNextStep}
                  disabled={!isCurrentStepComplete}
                  type="button"
                >
                  Continuar
                </button>
              ) : (
                <button
                  className={`sw-btn sw-btn-primary ${isMissionComplete ? 'sw-btn-glow' : ''}`}
                  onClick={handlePrepareMission}
                  disabled={!isMissionComplete}
                  type="button"
                >
                  Preparar Missão
                </button>
              )}
            </div>

            <StarWarsJsonPanel
              starship={activeBuilderStep === BUILDER_STEPS.STARSHIP ? selectedStarship : null}
              pilot={activeBuilderStep === BUILDER_STEPS.PILOT ? selectedPilot : null}
              planet={activeBuilderStep === BUILDER_STEPS.PLANET ? selectedPlanet : null}
              vehicle={activeBuilderStep === BUILDER_STEPS.EQUIPMENT ? selectedVehicle : null}
            />
          </div>

          {/* Sidebar — Resumo ao vivo (Compacta) */}
          <aside className="sw-sidebar">
            <div className="sw-sidebar-card sw-sidebar-card-compact">
              <h3 className="sw-sidebar-title">Resumo</h3>

              <div className="sw-sidebar-item">
                <span className="sw-sidebar-item-label">Nave</span>
                <span className={`sw-sidebar-item-value ${!selectedStarship ? 'sw-sidebar-item-empty' : ''}`}>
                  {selectedStarship?.name || 'Não selecionada'}
                </span>
              </div>

              <div className="sw-sidebar-item">
                <span className="sw-sidebar-item-label">Piloto</span>
                <span className={`sw-sidebar-item-value ${!selectedPilot ? 'sw-sidebar-item-empty' : ''}`}>
                  {selectedPilot?.name || 'Não selecionado'}
                </span>
              </div>

              <div className="sw-sidebar-item">
                <span className="sw-sidebar-item-label">Planeta</span>
                <span className={`sw-sidebar-item-value ${!selectedPlanet ? 'sw-sidebar-item-empty' : ''}`}>
                  {selectedPlanet?.name || 'Não selecionado'}
                </span>
              </div>

              <div className="sw-sidebar-item">
                <span className="sw-sidebar-item-label">Equipamento</span>
                <span className={`sw-sidebar-item-value ${!selectedVehicle ? 'sw-sidebar-item-empty' : ''}`}>
                  {selectedVehicle?.name || 'Não selecionado'}
                </span>
              </div>

              <div className="sw-sidebar-item">
                <span className="sw-sidebar-item-label">Dificuldade</span>
                <span className={`sw-sidebar-item-value ${!selectedDifficulty ? 'sw-sidebar-item-empty' : ''}`}>
                  {selectedDifficulty ? DIFFICULTY_LABELS[selectedDifficulty] : 'Não selecionada'}
                </span>
              </div>

              <div className={`sw-sidebar-status sw-sidebar-status-compact ${isMissionComplete ? 'sw-sidebar-status-complete' : 'sw-sidebar-status-incomplete'}`}>
                {isMissionComplete ? 'Missão pronta' : `${selectionCount}/5 concluído`}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── SUMMARY PHASE ── */}
      {gamePhase === GAME_PHASES.SUMMARY && missionStats && (
        <>
          <MissionSummary
            starship={selectedStarship}
            pilot={selectedPilot}
            planet={selectedPlanet}
            vehicle={selectedVehicle}
            difficulty={selectedDifficulty}
            missionStats={missionStats}
            onStartArena={handleStartArena}
            onBackToBuilder={handleBackToBuilder}
          />
          <StarWarsJsonPanel
            starship={selectedStarship}
            pilot={selectedPilot}
            planet={selectedPlanet}
            vehicle={selectedVehicle}
          />
        </>
      )}

      {/* ── ARENA PHASE (PLAYABLE) ── */}
      {gamePhase === GAME_PHASES.ARENA && missionStats && (
        <HyperdriveEscape
          missionStats={missionStats}
          starship={selectedStarship}
          pilot={selectedPilot}
          planet={selectedPlanet}
          vehicle={selectedVehicle}
          onBackToBuilder={handleBackToBuilder}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default StarWarsGame;
