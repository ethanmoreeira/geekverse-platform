// IceFireWar.jsx
// Página: Guerra dos Reinos | Rota: /app/ice-fire | API: An API of Ice and Fire
// Mecânica futura: Batalha entre casas/reinos com atributos calculados.

import GamePlaceholder from '../../../components/ui/GamePlaceholder';
import { GiCastle } from 'react-icons/gi';

const IceFireWar = () => {
  return (
    <GamePlaceholder
      title="Guerra dos Reinos"
      api="An API of Ice and Fire"
      mechanics="Jogo de batalha entre casas. A API busca casas/personagens/reinos. Cada casa vira uma carta de reino com atributos como nome, região, lema, títulos, membros e alianças. O sistema compara forças calculadas. Modos: Single Player (jogador vs sistema) e Multiplayer Local (jogador 1 vs jogador 2)."
      icon={GiCastle}
      color="#8b5cf6"
    />
  );
};

export default IceFireWar;
