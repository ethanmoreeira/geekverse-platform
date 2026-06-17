
// Tela de saida tematica do PokeSombra.

import { ClipLoader } from 'react-spinners';
import exitBg from '../../../assets/backgrounds/pokemon/pokemon_trainer_pikachu_final.png';

const PokemonExitLoader = () => {
  return (
    <div className="pks-exit-loader">
      <div
        className="pks-exit-loader-bg"
        style={{ backgroundImage: `url(${exitBg})` }}
      />
      <div className="pks-exit-loader-overlay">
        <div className="pks-exit-loader-content">
          <span className="pks-exit-loader-kicker">POKESOMBRA</span>
          <h2 className="pks-exit-loader-title">
            Saindo da Arena das Sombras
          </h2>
          <div className="pks-exit-loader-spinner">
            <ClipLoader color="#ff5e5e" size={36} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonExitLoader;
