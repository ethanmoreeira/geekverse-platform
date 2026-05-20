// RickMortyLoader.jsx
// Tela de carregamento temática do Show do Multiverso.
// Segue o padrão visual cinematográfico do ThemedGameLoader (Harry Potter),
// com identidade própria em verde portal (#22c55e).

import { PropagateLoader } from 'react-spinners';
import bgImage from '../../assets/backgrounds/rick-morty/image.png';

const RickMortyLoader = () => {
  return (
    <div className="smv-themed-loader-wrapper">
      {/* Imagem de fundo em tela cheia */}
      <div
        className="smv-themed-loader-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Overlay levíssimo — apenas para melhorar leitura */}
      <div className="smv-themed-loader-overlay" />

      {/* Conteúdo centralizado — sem card pesado */}
      <div className="smv-themed-loader-content">
        <div className="smv-themed-loader-badge">✦ Show do Multiverso ✦</div>
        <h2 className="smv-themed-loader-title">Preparando o Quiz Interdimensional</h2>
        <p className="smv-themed-loader-subtitle">Abrindo portal para a Citadel...</p>
        <PropagateLoader
          color="#22c55e"
          size={20}
          className="smv-themed-loader-spinner"
        />
      </div>
    </div>
  );
};

export default RickMortyLoader;
