// Sobre.jsx
// Página Sobre do GeekVerse G8.
// Contém: informações do grupo, tema, APIs usadas e formulário de contato.
// O formulário de contato será funcional via EmailJS no futuro.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaInfoCircle,
  FaArrowLeft,
  FaUsers,
  FaGamepad,
  FaCode,
  FaEnvelope,
  FaPaperPlane,
  FaGlobe,
} from 'react-icons/fa';

const APIS_USED = [
  { name: 'Harry Potter API', url: 'https://hp-api.onrender.com/', game: 'Memória dos Bruxos' },
  { name: 'PokéAPI', url: 'https://pokeapi.co/', game: 'Duelo Pokémon' },
  { name: 'Rick and Morty API', url: 'https://rickandmortyapi.com/', game: 'Caçada Dimensional' },
  { name: 'SWAPI', url: 'https://swapi.dev/', game: 'Desafio das Galáxias' },
  { name: 'An API of Ice and Fire', url: 'https://anapioficeandfire.com/', game: 'Guerra dos Reinos' },
];

const TECHS = [
  'React 19', 'Vite', 'React Router DOM', 'React Bootstrap',
  'Axios', 'react-icons', 'react-spinners', '@emailjs/browser',
];

const Sobre = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implementação futura com EmailJS
    console.log('[Sobre] Formulário de contato — EmailJS não configurado', formData);
    alert('EmailJS ainda não configurado. O envio será implementado nas próximas etapas.');
  };

  return (
    <div className="gv-page-container">
      {/* Header */}
      <div className="gv-page-header">
        <div
          className="gv-placeholder-icon-wrapper"
          style={{ background: '#a855f720', color: '#a855f7' }}
        >
          <FaInfoCircle />
        </div>
        <h1 className="gv-page-title">Sobre o Projeto</h1>
        <p className="gv-page-subtitle">
          GeekVerse G8 — Trabalho Final de Integração
        </p>
      </div>

      {/* Informações do grupo */}
      <section className="gv-about-section">
        <h2 className="gv-about-section-title">
          <FaUsers /> O Grupo
        </h2>
        <div className="gv-about-card">
          <p><strong>Grupo:</strong> G8</p>
          <p><strong>Disciplina:</strong> Desenvolvimento Web Front-End</p>
          <p><strong>Projeto:</strong> Trabalho Final de Integração</p>
          <p><strong>Tema:</strong> Arcade geek em React usando múltiplas APIs públicas</p>
        </div>
      </section>

      {/* Tema e Mecânica */}
      <section className="gv-about-section">
        <h2 className="gv-about-section-title">
          <FaGamepad /> O Tema
        </h2>
        <div className="gv-about-card">
          <p>
            O GeekVerse G8 é uma SPA (Single Page Application) estilo arcade geek,
            composta por 6 jogos interativos que consomem 5 APIs públicas diferentes.
            Cada jogo possui mecânica única, dificuldades configuráveis e modos
            single player e multiplayer local.
          </p>
        </div>
      </section>

      {/* APIs usadas */}
      <section className="gv-about-section">
        <h2 className="gv-about-section-title">
          <FaGlobe /> APIs Utilizadas
        </h2>
        <div className="gv-about-apis-grid">
          {APIS_USED.map((api) => (
            <div key={api.name} className="gv-about-api-card">
              <h4>{api.name}</h4>
              <p className="gv-about-api-game">Jogo: {api.game}</p>
              <a href={api.url} target="_blank" rel="noopener noreferrer" className="gv-about-api-link">
                {api.url}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Tecnologias */}
      <section className="gv-about-section">
        <h2 className="gv-about-section-title">
          <FaCode /> Tecnologias
        </h2>
        <div className="gv-about-techs">
          {TECHS.map((tech) => (
            <span key={tech} className="gv-tech-badge">{tech}</span>
          ))}
        </div>
      </section>

      {/* Formulário de contato */}
      <section className="gv-about-section">
        <h2 className="gv-about-section-title">
          <FaEnvelope /> Contato
        </h2>
        <div className="gv-about-card">
          <p className="gv-about-contact-info">
            Envie uma mensagem para o grupo via EmailJS.
            O envio será funcional quando as chaves do EmailJS forem configuradas.
          </p>
          <form className="gv-contact-form" onSubmit={handleSubmit}>
            <div className="gv-form-row">
              <div className="gv-form-group">
                <label htmlFor="contact-name">Nome</label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="gv-form-group">
                <label htmlFor="contact-email">E-mail</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="gv-form-group">
              <label htmlFor="contact-subject">Assunto</label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder="Assunto da mensagem"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div className="gv-form-group">
              <label htmlFor="contact-message">Mensagem</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Escreva sua mensagem..."
                rows={4}
                value={formData.message}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="gv-btn-submit">
              <FaPaperPlane /> Enviar Mensagem
            </button>
            <span className="gv-status-badge gv-status-dev" style={{ marginTop: '12px' }}>
              🚧 EmailJS será configurado nas próximas etapas
            </span>
          </form>
        </div>
      </section>

      {/* Botão voltar */}
      <div className="gv-page-actions">
        <button className="gv-btn-back" onClick={() => navigate('/app')}>
          <FaArrowLeft /> Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
};

export default Sobre;
