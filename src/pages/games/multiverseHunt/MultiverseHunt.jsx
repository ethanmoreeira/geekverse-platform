// MultiverseHunt.jsx
// Página: Caçada Multiverso | Rota: /app/multiverse-hunt | API: Todas as APIs
// Mecânica futura: Jogo final misturando personagens de vários universos.

import GamePlaceholder from '../../../components/ui/GamePlaceholder';
import { GiGalaxy } from 'react-icons/gi';

const MultiverseHunt = () => {
  return (
    <GamePlaceholder
      title="Caçada Multiverso"
      api="Todas as APIs"
      mechanics="Jogo final misturando cartas/personagens de todas as APIs. O sistema sorteia uma carta-alvo e o jogador precisa encontrar esse personagem no meio de uma grade com personagens de vários universos. Cards 2D com imagem (quando disponível), inicial, ícone e universo de origem."
      icon={GiGalaxy}
      color="#ec4899"
    />
  );
};

export default MultiverseHunt;
