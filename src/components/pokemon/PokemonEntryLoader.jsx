import React from 'react';
import { ClipLoader } from 'react-spinners';
import '../../styles/pokeSombra.css';

const PokemonEntryLoader = () => {
  return (
    <div className="pks-entry-loader">
      <div className="pks-entry-loader-overlay">
        <div className="pks-entry-loader-content">
          <p className="pks-entry-loader-kicker">POKÉSOMBRA</p>
          <h1 className="pks-entry-loader-title">Entrando na Arena das Sombras</h1>
          <div className="pks-entry-loader-spinner">
            <ClipLoader color="#ff5e5e" size={45} speedMultiplier={0.8} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonEntryLoader;
