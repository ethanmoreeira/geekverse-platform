// RickMortyLoader.jsx
// Tela de carregamento temática do Show do Multiverso.
// Segue o padrão visual cinematográfico do ThemedGameLoader (Harry Potter),
// com identidade própria em verde portal (#22c55e).
// Suporta variant="enter" (padrão) e variant="exit" (despedida).

import { PropagateLoader } from 'react-spinners';
import { FaStar } from 'react-icons/fa';
import bgImage from '../../assets/backgrounds/rick-morty/image.png';

const RickMortyLoader = ({
  variant = 'enter',
  title,
  subtitle,
  badgeText,
}) => {
  const isExit = variant === 'exit';

  const displayBadge = badgeText || 'Show do Multiverso';
  const displayTitle = title || (isExit
    ? 'Fechando o Portal'
    : 'Abrindo o Portal');
  const displaySubtitle = subtitle || (isExit
    ? null
    : 'Sincronizando personagens e dimensões...');

  return (
    <div className={`smv-themed-loader-wrapper ${isExit ? 'smv-loader-exit' : ''}`}>
      {/* Imagem de fundo em tela cheia */}
      <div
        className="smv-themed-loader-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Overlay levíssimo — apenas para melhorar leitura */}
      <div className="smv-themed-loader-overlay" />

      {/* Conteúdo centralizado — sem card pesado */}
      <div className="smv-themed-loader-content">
        {!isExit && (
          <div className="smv-brand-kicker">
            <FaStar aria-hidden="true" className="smv-icon smv-icon-badge" style={{marginRight: 6}} />
            {displayBadge}
            <FaStar aria-hidden="true" className="smv-icon smv-icon-badge" style={{marginLeft: 6}} />
          </div>
        )}
        <h2 className={`smv-brand-title smv-loader-brand-title ${isExit ? 'smv-loader-exit-title' : ''}`}>
          {displayTitle}
        </h2>
        {displaySubtitle && (
          <p className="smv-brand-subtitle">{displaySubtitle}</p>
        )}
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
