// GamePlaceholder.jsx
// Componente placeholder reutilizável para páginas de jogos em desenvolvimento.
// Exibe título, API, mecânica futura, aviso e botão voltar.

import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCode, FaCogs } from 'react-icons/fa';

const GamePlaceholder = ({ title, api, mechanics, icon: Icon, color }) => {
  const navigate = useNavigate();

  return (
    <div className="gv-game-placeholder">
      <div className="gv-placeholder-card">
        <div
          className="gv-placeholder-icon-wrapper"
          style={{ background: `${color}20`, color: color }}
        >
          {Icon && <Icon />}
        </div>

        <h1 className="gv-placeholder-title">{title}</h1>

        <span className="gv-placeholder-api">
          <FaCode /> {api}
        </span>

        <div className="gv-placeholder-mechanics">
          <h3><FaCogs /> Mecânica Planejada</h3>
          <p>{mechanics}</p>
        </div>

        <div className="gv-placeholder-status">
          <span className="gv-status-badge gv-status-dev">
            🚧 Em desenvolvimento
          </span>
        </div>

        <div className="gv-placeholder-json">
          <h4>JSON Formatado (futuro)</h4>
          <pre className="gv-json-preview">
{JSON.stringify({
  status: 'em_desenvolvimento',
  jogo: title,
  api: api,
  dados: 'As chamadas de API serão implementadas nas próximas etapas.',
}, null, 2)}
          </pre>
        </div>

        <button
          className="gv-btn-back"
          onClick={() => navigate('/app')}
        >
          <FaArrowLeft /> Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default GamePlaceholder;
