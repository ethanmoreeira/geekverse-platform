// Ranking.jsx — RankingHome
// Página principal do Ranking: Hall dos Campeões GeekVerse.
// Rota: /app/ranking
// Mostra 4 cards, um para cada jogo oficial.
// Dados reais são salvos pelos jogos via rankingService.saveResult().

import RankingGameCard from '../../components/ranking/RankingGameCard';
import titleImg from '../../assets/backgrounds/ranking/ranking-title-banner.png';
import bgImg from '../../assets/backgrounds/ranking/geekverse_g8_multiverse_dashboard.png';
import { RANKING_GAMES } from '../../services/rankingService';
import '../../styles/ranking.css';

const Ranking = () => {
  const games = Object.values(RANKING_GAMES);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      <div className="rk-page">
        <div className="rk-header">
          <div className="rk-title-wrapper">
            <img src={titleImg} alt="Hall dos Campeões GeekVerse" className="rk-title-img" />
          </div>
          <p className="rk-subtitle" style={{ color: '#d8b4fe', marginTop: '-30px' }}>
            Escolha um universo e veja quem domina cada desafio.
          </p>
        </div>

        <div className="rk-games-grid">
          {games.map((game) => (
            <RankingGameCard
              key={game.id}
              game={game}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Ranking;
