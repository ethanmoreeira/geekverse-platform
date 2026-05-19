// PokemonBattle.jsx
// Página: Duelo Pokémon | Rota: /app/pokemon | API: PokéAPI
// Mecânica futura: Duelo de cartas com atributos reais. Single e multiplayer local.

import GamePlaceholder from '../../../components/ui/GamePlaceholder';
import { GiSwordsPower } from 'react-icons/gi';

const PokemonBattle = () => {
  return (
    <GamePlaceholder
      title="Duelo Pokémon"
      api="PokéAPI"
      mechanics="Duelo de cartas Pokémon com atributos reais vindos da API (HP, ataque, defesa, ataque especial, defesa especial, velocidade). Modos: Single Player (jogador vs sistema) e Multiplayer Local (jogador 1 vs jogador 2 no mesmo computador). A pontuação é calculada comparando atributos reais escolhidos."
      icon={GiSwordsPower}
      color="#ef4444"
    />
  );
};

export default PokemonBattle;
