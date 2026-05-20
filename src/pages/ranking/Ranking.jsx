// Ranking.jsx
// Página de ranking local do GeekVerse G8.
// Ranking separado por jogo + aba geral.
// Dados armazenados em localStorage (sem backend/banco de dados).
// Não há ranking global entre computadores.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTrophy,
  FaArrowLeft,
  FaListUl,
  FaDatabase,
  FaClock,
  FaStar,
} from 'react-icons/fa';
import {
  GiMagicSwirl,
  GiSwordsPower,
  GiPortal,
  GiSpaceship,
  GiCastle,
  GiGalaxy,
} from 'react-icons/gi';

const TABS = [
  { id: 'all', label: 'Todos', icon: FaListUl },
  { id: 'harry-potter', label: 'Memória dos Bruxos', icon: GiMagicSwirl, color: '#f59e0b' },
  { id: 'pokemon', label: 'Duelo Pokémon', icon: GiSwordsPower, color: '#ef4444' },
  { id: 'rick-morty', label: 'Show do Multiverso', icon: GiPortal, color: '#22c55e' },
  { id: 'star-wars', label: 'Desafio das Galáxias', icon: GiSpaceship, color: '#3b82f6' },
  { id: 'ice-fire', label: 'Guerra dos Reinos', icon: GiCastle, color: '#8b5cf6' },
  { id: 'multiverse-hunt', label: 'Caçada Multiverso', icon: GiGalaxy, color: '#ec4899' },
];

const Ranking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const activeInfo = TABS.find((t) => t.id === activeTab);

  return (
    <div className="gv-page-container">
      {/* Header */}
      <div className="gv-page-header">
        <div
          className="gv-placeholder-icon-wrapper"
          style={{ background: '#f59e0b20', color: '#f59e0b' }}
        >
          <FaTrophy />
        </div>
        <h1 className="gv-page-title">Ranking Local</h1>
        <p className="gv-page-subtitle">
          Melhores pontuações salvas localmente no navegador via localStorage.
          Cada jogo possui seu ranking independente.
        </p>
        <div className="gv-info-chips">
          <span className="gv-info-chip">
            <FaDatabase /> localStorage
          </span>
          <span className="gv-info-chip">
            <FaStar /> Separado por jogo
          </span>
          <span className="gv-info-chip">
            <FaClock /> Ordenado por pontuação
          </span>
        </div>
      </div>

      {/* Tabs de jogos */}
      <div className="gv-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`gv-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={activeTab === tab.id && tab.color ? { borderColor: tab.color, color: tab.color } : {}}
          >
            <tab.icon />
            <span className="gv-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="gv-ranking-content">
        <div className="gv-empty-ranking">
          <FaTrophy className="gv-empty-icon" />
          <h3>
            {activeTab === 'all'
              ? 'Nenhum resultado registrado ainda'
              : `Nenhum resultado em ${activeInfo?.label}`}
          </h3>
          <p>
            Jogue os jogos do GeekVerse para que suas pontuações apareçam no ranking.
            Cada partida finalizada salva automaticamente o resultado.
          </p>
          <span className="gv-status-badge gv-status-dev">
            🚧 Ranking será populado conforme você joga
          </span>
        </div>
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

export default Ranking;
