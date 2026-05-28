// Dashboard.jsx
// Painel principal do GeekVerse G8.
// Exibe cards dos 4 jogos oficiais.
// Estilo arcade geek com grid responsivo.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GiMagicSwirl,
  GiSwordsPower,
  GiPortal,
  GiSpaceship,
  GiJoystick,
} from 'react-icons/gi';
import harryCardBg from '../../assets/backgrounds/harry-potter/harry-logout-bg.png';
import rickCardBg from '../../assets/backgrounds/rick-morty/image.png';
import pokemonCardBg from '../../assets/backgrounds/pokemon/pokemon_trainer_classic_dark.png';
import starWarsBg from '../../assets/backgrounds/star-wars/star_wars_space_wallpaper.png';
import dashboardBg from '../../assets/backgrounds/dashboard/geekverse_g8_dashboard_background.png';
import g8LogoV10 from '../../assets/backgrounds/dashboard/g8_logo_v10.png';
import geekverseLogoFinal from '../../assets/backgrounds/dashboard/geekverse_logo_cropped.png';
import {
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
    color: '#a855f7', // Roxo
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
    color: '#ef4444', // Vermelho
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
    color: '#22c55e', // Verde
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
    color: '#3b82f6', // Azul
    bgImage: starWarsBg,
  },
];



const TECH_BADGES = [
  { label: 'React', icon: FaCode },
  { label: 'Rotas Privadas', icon: FaRoute },
  { label: '4 APIs Públicas', icon: FaRocket },
  { label: 'EmailJS', icon: FaEnvelope },
];

import { playFugaMusic } from '../../services/audioService';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleGameClick = (game) => {
    if (game.id === 'star-wars') {
      playFugaMusic();
    }
    navigate(game.route);
  };

  return (
    <div className="gv-dashboard">
      {/* Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${dashboardBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1,
      }} />

      {/* Header */}
      <header className="gv-dashboard-header" style={{ marginTop: '-80px' }}>
        <img src={g8LogoV10} alt="GeekVerse G8 Logo" className="gv-dashboard-header-logo" style={{ height: '100px', marginTop: '55px', marginBottom: '-85px' }} />
        <img src={geekverseLogoFinal} alt="GeekVerse Title" style={{ height: '180px', objectFit: 'contain', marginBottom: '0px', mixBlendMode: 'screen' }} />
        <p className="gv-dashboard-subtitle" style={{ marginTop: '-60px', color: '#d8b4fe' }}>
          Quatro universos. Quatro desafios. Um ranking lendário.
        </p>

      </header>

      {/* Game Cards Grid */}
      <section className="gv-section">

        <div className="gv-games-grid">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className="gv-game-card"
              onClick={() => handleGameClick(game)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleGameClick(game)}
              style={
                game.bgImage
                  ? {
                    backgroundImage: `url(${game.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }
                  : undefined
              }
            >

              <div className="gv-game-card-body">
                <h3 className="gv-game-card-title" style={{ background: 'none', WebkitTextFillColor: 'initial', color: '#ffffff' }}>
                  {game.name}
                </h3>
                <span className="gv-game-card-api" style={{ color: game.color }}>
                  {game.api}
                </span>
              </div>

            </div>
          ))}
        </div>
      </section>


    </div>
  );
};

export default Dashboard;
