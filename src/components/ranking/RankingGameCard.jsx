// RankingGameCard.jsx
// Card de jogo na página principal do ranking (/app/ranking).
// Mostra o universo com design limpo, moderno e imersivo.

import { useNavigate } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

// Importação das imagens de fundo dos respectivos universos
import harryBg from '../../assets/backgrounds/harry-potter/harry-logout-bg.png';
import pokemonBg from '../../assets/backgrounds/pokemon/pokemon_trainer_classic_dark.png';
import rickBg from '../../assets/backgrounds/rick-morty/image.png';
import starWarsBg from '../../assets/backgrounds/star-wars/star_wars_space_wallpaper.png';

const BACKGROUNDS = {
  'harry-memory': harryBg,
  'pokesombra': pokemonBg,
  'show-multiverso': rickBg,
  'fuga-hiperespaco': starWarsBg,
};

const THEME_COLORS = {
  'harry-memory': '#a855f7',
  'pokesombra': '#ef4444',
  'show-multiverso': '#22c55e',
  'fuga-hiperespaco': '#38bdf8',
};

const TITLES = {
  'harry-memory': 'Memória dos Bruxos',
  'pokesombra': 'PokeSombra',
  'show-multiverso': 'Show do Multiverso',
  'fuga-hiperespaco': 'Fuga do Hiperespaço',
};

const CRITERIA = {
  'harry-memory': 'Menor tempo vence. Empate por tentativas.',
  'pokesombra': 'Menor tempo final vence. Empate por erros.',
  'show-multiverso': 'Maior pontuação vence. Empate por dicas e erros.',
  'fuga-hiperespaco': 'Maior pontuação vence. Empate por colisões.',
};

const RankingGameCard = ({ game }) => {
  const navigate = useNavigate();

  const title = TITLES[game.id] || game.name;
  const criterion = CRITERIA[game.id] || game.criterion;
  const bgImage = BACKGROUNDS[game.id] || '';
  const themeColor = THEME_COLORS[game.id] || game.color;

  const handleClick = () => {
    navigate(`/app/ranking/${game.id}`);
  };

  return (
    <div
      className="rk-game-card"
      style={{
        '--card-accent': themeColor,
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Escolher universo ${title}`}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="rk-game-card-top">
        <div>
          <div className="rk-game-name">{title}</div>
          <div className="rk-game-api">{game.api}</div>
        </div>
      </div>


      <button
        className="rk-btn-view"
        onClick={(e) => { e.stopPropagation(); handleClick(); }}
        aria-label={`Ver ranking de ${title}`}
      >
        Ver ranking <FaChevronRight />
      </button>
    </div>
  );
};

export default RankingGameCard;
