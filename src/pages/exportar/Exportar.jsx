// Exportar.jsx
// Central de exportação por e-mail do GeekVerse G8.
// Permite selecionar e enviar por e-mail (via EmailJS futuro):
// - Resultados de jogos (um jogo específico ou todos)
// - Ranking local
// - Auditoria de navegação
//
// O envio é MANUAL — o usuário escolhe o que enviar e clica em enviar.
// Não há envio automático a cada navegação.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFileExport,
  FaArrowLeft,
  FaGamepad,
  FaTrophy,
  FaClipboardList,
  FaEnvelope,
  FaInfoCircle,
} from 'react-icons/fa';

const EXPORT_OPTIONS = [
  {
    id: 'results',
    title: 'Resultados de Jogos',
    description: 'Envie os resultados das suas partidas. Você pode selecionar um jogo específico ou enviar todos os resultados.',
    icon: FaGamepad,
    color: '#22c55e',
  },
  {
    id: 'ranking',
    title: 'Ranking Local',
    description: 'Envie o ranking de melhores pontuações. O ranking é separado por jogo e ordenado por pontuação.',
    icon: FaTrophy,
    color: '#f59e0b',
  },
  {
    id: 'audit',
    title: 'Auditoria de Navegação',
    description: 'Envie o relatório de auditoria com todos os eventos registrados: login, logout, acessos a jogos e finalizações de partidas.',
    icon: FaClipboardList,
    color: '#8b5cf6',
  },
];

const Exportar = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div className="gv-page-container">
      {/* Header */}
      <div className="gv-page-header">
        <div
          className="gv-placeholder-icon-wrapper"
          style={{ background: '#06b6d420', color: '#06b6d4' }}
        >
          <FaFileExport />
        </div>
        <h1 className="gv-page-title">Exportar por E-mail</h1>
        <p className="gv-page-subtitle">
          Selecione o tipo de dado que deseja enviar por e-mail.
          O envio será feito via EmailJS (@emailjs/browser).
        </p>
        <div className="gv-info-chips">
          <span className="gv-info-chip">
            <FaEnvelope /> EmailJS
          </span>
          <span className="gv-info-chip">
            <FaInfoCircle /> Envio manual
          </span>
        </div>
      </div>

      {/* Opções de exportação */}
      <div className="gv-export-grid">
        {EXPORT_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`gv-export-option ${selectedOption === option.id ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedOption(option.id)}
          >
            <div
              className="gv-export-option-icon"
              style={{ background: `${option.color}15`, color: option.color }}
            >
              <option.icon />
            </div>
            <h3 className="gv-export-option-title">{option.title}</h3>
            <p className="gv-export-option-desc">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Área de ação */}
      {selectedOption && (
        <div className="gv-export-action-area">
          <div className="gv-export-selected-info">
            <FaInfoCircle />
            <span>
              Tipo selecionado: <strong>{EXPORT_OPTIONS.find((o) => o.id === selectedOption)?.title}</strong>
            </span>
          </div>
          <div className="gv-export-status">
            <span className="gv-status-badge gv-status-dev">
              🚧 EmailJS será configurado nas próximas etapas
            </span>
          </div>
        </div>
      )}

      {/* JSON preview placeholder */}
      <div className="gv-placeholder-json">
        <h4>Prévia dos dados (futuro)</h4>
        <pre className="gv-json-preview">
{JSON.stringify({
  tipo: selectedOption || 'nenhum_selecionado',
  status: 'emailjs_nao_configurado',
  nota: 'Os dados serão montados automaticamente a partir do localStorage quando os jogos estiverem implementados.',
  fluxo: [
    '1. Jogar um ou mais jogos',
    '2. Resultados são salvos automaticamente no localStorage',
    '3. Acessar /app/exportar',
    '4. Selecionar tipo de exportação',
    '5. Enviar por e-mail via EmailJS',
  ],
}, null, 2)}
        </pre>
      </div>

      {/* Botão voltar */}
      <div className="gv-page-actions">
        <button className="gv-btn-back" onClick={() => navigate('/app')}>
          <FaArrowLeft /> Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default Exportar;
