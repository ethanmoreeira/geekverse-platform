// Dashboard.jsx
// Painel principal do GeekVerse G8.
// Exibe cards dos 6 jogos + links para Ranking, Exportar e Sobre.
// Estilo arcade geek com grid responsivo.

import { useNavigate } from 'react-router-dom';
import {
  GiMagicSwirl,
  GiSwordsPower,
  GiPortal,
  GiSpaceship,
  GiCastle,
  GiGalaxy,
} from 'react-icons/gi';
import harryCardBg from '../../assets/backgrounds/harry-potter/harry-logout-bg.png';
import rickCardBg from '../../assets/backgrounds/rick-morty/image.png';
import pokemonCardBg from '../../assets/backgrounds/pokemon/pokemon_trainer_classic_dark.png';
import starWarsBg from '../../assets/backgrounds/star-wars/star_wars_space_wallpaper.png';
import {
  FaTrophy,
  FaFileExport,
  FaInfoCircle,
  FaGamepad,
  FaRocket,
  FaCode,
  FaRoute,
  FaEnvelope,
} from 'react-icons/fa';

const GAMES = [
  {
    id: 'harry-potter',
    name: 'Memória dos Bruxos',
    api: 'Harry Potter API',
    description: 'Encontre pares de personagens em um jogo da memória.',
    route: '/app/harry-potter',
    icon: GiMagicSwirl,
    color: '#f59e0b',
    bgImage: harryCardBg,
    status: 'playable',
  },
  {
    id: 'pokemon',
    name: 'PokeSombra',
    api: 'PokeAPI',
    description: 'Cacada visual por silhuetas usando dados reais da PokeAPI.',
    route: '/app/pokemon',
    icon: GiSwordsPower,
    color: '#ef4444',
    bgImage: pokemonCardBg,
    status: 'playable',
  },
  {
    id: 'rick-morty',
    name: 'Show do Multiverso',
    api: 'Rick and Morty API',
    description: 'Quiz interdimensional com cards de personagens, episódios e localizações da API.',
    route: '/app/rick-morty',
    icon: GiPortal,
    color: '#22c55e',
    bgImage: rickCardBg,
    status: 'playable',
  },
  {
    id: 'star-wars',
    name: 'Fuga do Hiperespaço',
    api: 'SWAPI',
    description: 'Monte sua missão e escape do campo de asteroides.',
    route: '/app/star-wars',
    icon: GiSpaceship,
    color: '#3b82f6',
    bgImage: starWarsBg,
  },
  {
    id: 'ice-fire',
    name: 'Guerra dos Reinos',
    api: 'An API of Ice and Fire',
    description: 'Dispute batalhas entre casas e reinos.',
    route: '/app/ice-fire',
    icon: GiCastle,
    color: '#8b5cf6',
  },
  {
    id: 'multiverse-hunt',
    name: 'Caçada Multiverso',
    api: 'Todas as APIs',
    description: 'Encontre personagens misturados de vários universos.',
    route: '/app/multiverse-hunt',
    icon: GiGalaxy,
    color: '#ec4899',
  },
];

const QUICK_LINKS = [
  {
    id: 'ranking',
    name: 'Ranking Local',
    description: 'Melhores pontuações salvas localmente.',
    route: '/app/ranking',
    icon: FaTrophy,
    color: '#f59e0b',
  },
  {
    id: 'exportar',
    name: 'Exportar Resultados',
    description: 'Envie resultados por e-mail via EmailJS.',
    route: '/app/exportar',
    icon: FaFileExport,
    color: '#06b6d4',
  },
  {
    id: 'sobre',
    name: 'Sobre o Projeto',
    description: 'Informações do grupo e formulário de contato.',
    route: '/app/sobre',
    icon: FaInfoCircle,
    color: '#a855f7',
  },
];

const TECH_BADGES = [
  { label: 'React', icon: FaCode },
  { label: 'Rotas Privadas', icon: FaRoute },
  { label: '5 APIs Públicas', icon: FaRocket },
  { label: 'EmailJS', icon: FaEnvelope },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="gv-dashboard">
      {/* Header */}
      <header className="gv-dashboard-header">
        <FaGamepad className="gv-dashboard-header-icon" />
        <h1 className="gv-dashboard-title">GeekVerse G8</h1>
        <p className="gv-dashboard-subtitle">
          Arcade geek com jogos baseados em APIs públicas
        </p>
        <div className="gv-tech-badges">
          {TECH_BADGES.map((badge) => (
            <span key={badge.label} className="gv-tech-badge">
              <badge.icon />
              {badge.label}
            </span>
          ))}
        </div>
      </header>

      {/* Game Cards Grid */}
      <section className="gv-section">
        <h2 className="gv-section-title">
          <FaGamepad /> Jogos Disponíveis
        </h2>
        <div className="gv-games-grid">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="gv-game-card"
              onClick={() => navigate(game.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(game.route)}
              style={
                game.bgImage
                  ? {
                    backgroundImage: game.id === 'star-wars' 
                      ? `url(${game.bgImage})` 
                      : `linear-gradient(rgba(10, 6, 25, 0), rgba(10, 6, 25, 0.15)), url(${game.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                  : undefined
              }
            >

              <div className="gv-game-card-body">
                <h3 className="gv-game-card-title">{game.name}</h3>
                <span className="gv-game-card-api">{game.api}</span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="gv-section">
        <h2 className="gv-section-title">
          <FaRocket /> Acesso Rápido
        </h2>
        <div className="gv-quick-links">
          {QUICK_LINKS.map((link) => (
            <div
              key={link.id}
              className="gv-quick-link-card"
              onClick={() => navigate(link.route)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(link.route)}
            >
              <link.icon
                className="gv-quick-link-icon"
                style={{ color: link.color }}
              />
              <div>
                <h4 className="gv-quick-link-title">{link.name}</h4>
                <p className="gv-quick-link-desc">{link.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
