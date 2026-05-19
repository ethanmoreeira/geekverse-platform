// StarWarsChallenge.jsx
// Página: Desafio das Galáxias | Rota: /app/star-wars | API: SWAPI
// Mecânica futura: Comparação de dados entre personagens, planetas e naves.

import GamePlaceholder from '../../../components/ui/GamePlaceholder';
import { GiSpaceship } from 'react-icons/gi';

const StarWarsChallenge = () => {
  return (
    <GamePlaceholder
      title="Desafio das Galáxias"
      api="SWAPI"
      mechanics="Jogo de comparação de dados com personagens, planetas ou naves de Star Wars. O sistema mostra duas cartas e faz uma pergunta (ex: 'Quem é mais alto?', 'Qual planeta tem maior população?', 'Qual nave suporta mais passageiros?'). A mecânica compara atributos numéricos vindos da API."
      icon={GiSpaceship}
      color="#3b82f6"
    />
  );
};

export default StarWarsChallenge;
