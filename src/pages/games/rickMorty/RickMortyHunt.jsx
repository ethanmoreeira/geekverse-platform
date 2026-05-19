// RickMortyHunt.jsx
// Página: Caçada Dimensional | Rota: /app/rick-morty | API: Rick and Morty API
// Mecânica futura: Encontrar personagem-alvo na grade antes do tempo acabar.

import GamePlaceholder from '../../../components/ui/GamePlaceholder';
import { GiPortal } from 'react-icons/gi';

const RickMortyHunt = () => {
  return (
    <GamePlaceholder
      title="Caçada Dimensional"
      api="Rick and Morty API"
      mechanics="A API busca vários personagens. O sistema mostra uma carta-alvo no topo (ex: 'Encontre Morty Smith'). Abaixo aparece uma grade com vários personagens misturados. O jogador precisa clicar no personagem correto antes do tempo acabar. Tempo menor a cada rodada, errar perde vida, acertar ganha ponto."
      icon={GiPortal}
      color="#22c55e"
    />
  );
};

export default RickMortyHunt;
