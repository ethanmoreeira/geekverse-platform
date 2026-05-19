import React from 'react';
import { PropagateLoader } from 'react-spinners';
import bgImage from '../../assets/backgrounds/harry-potter/image.png';
import '../../styles/games.css';

const ThemedGameLoader = () => {
  return (
    <div className="gv-themed-loader-wrapper">
      <div
        className="gv-themed-loader-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      <div className="gv-themed-loader-overlay"></div>

      <div className="gv-themed-loader-content">
        <div className="gv-themed-loader-badge">✦ Memória dos Bruxos ✦</div>
        <h2 className="gv-themed-loader-title">Preparando o Tabuleiro Mágico</h2>
        <p className="gv-themed-loader-subtitle">Convocando os personagens de Hogwarts...</p>
        <PropagateLoader color="#eab308" size={20} className="gv-themed-loader-spinner" />
      </div>
    </div>
  );
};

export default ThemedGameLoader;
