import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlayCircle
} from 'react-icons/fa';
import './Sobre.css';
import bgImage from '../../assets/backgrounds/sobre/school_cosmic_purple_sky.png';
import g8LogoNeon from '../../assets/backgrounds/sobre/g8_logo_neon.png';

const GAMES = [
  { name: 'Memória dos Bruxos', desc: 'Jogo da memória com personagens do universo Harry Potter.', api: 'Harry Potter API' },
  { name: 'PokeSombra', desc: 'Desafio de silhuetas usando dados da PokéAPI.', api: 'PokéAPI' },
  { name: 'Show do Multiverso', desc: 'Quiz temático baseado em Rick and Morty.', api: 'Rick and Morty API' },
  { name: 'Fuga do Hiperespaço', desc: 'Jogo espacial com dados da SWAPI.', api: 'SWAPI' }
];

const TECHS = [
  'React', 'Vite', 'React Router DOM', 'APIs REST',
  'Supabase', 'EmailJS', 'localStorage', 'React Icons',
  'React Spinners', 'CSS Responsivo', 'Git/GitLab', 'Vercel'
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
    console.log('[Sobre] Formulário de contato — EmailJS não configurado', formData);
    alert('EmailJS ainda não configurado. O envio será implementado nas próximas etapas.');
  };

  const handleAudit = () => {
    alert('Auditoria visual. auditService ainda não configurado.');
  };

  return (
    <>
      <div
        className="about-background"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />
      <div className="about-page">
        {/* Hero */}
        <div className="about-hero">
          <img
            src={g8LogoNeon}
            alt="GeekVerse G8 Logo"
            className="about-hero-logo"
            style={{ mixBlendMode: 'screen', maxWidth: '150px', height: 'auto', display: 'block', margin: '-60px auto 0 auto' }}
          />
          <p className="about-hero-subtitle" style={{ color: '#d8b4fe', marginTop: '-30px' }}>
            Uma SPA em React com jogos interativos, APIs públicas, ranking global e experiências geek.
          </p>
        </div>

        <div className="about-grid">

          {/* Row 1: Jogos (65%) e Vídeo (35%) */}
          <div className="about-row-65-35">
            {/* Jogos do Projeto */}
            <div className="about-card about-games-list-card">
              <h2 className="about-card-title">Jogos do Projeto</h2>
              <div className="about-games-grid">
                {GAMES.map((game, idx) => (
                  <div key={idx} className="about-game-item">
                    <div className="about-game-header">
                      <strong>{idx + 1}. {game.name}</strong>
                      <span className="about-game-api">API: {game.api}</span>
                    </div>
                    <p>{game.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vídeo Demonstrativo */}
            <div className="about-card about-video-card">
              <h2 className="about-card-title">Vídeo Demonstrativo</h2>
              <p className="about-discreet-text">Espaço reservado para um vídeo curto de apresentação do GeekVerse G8.</p>
              <div className="about-video-placeholder">
                <FaPlayCircle size={28} className="about-video-icon" />
              </div>
            </div>
          </div>

          {/* Row 2: Tecnologias e Auditoria (50/50) */}
          <div className="about-row-50-50">
            {/* Tecnologias Principais */}
            <div className="about-card about-tech-card">
              <h2 className="about-card-title">Tecnologias Principais</h2>
              <div className="about-tech-chips">
                {TECHS.map((tech, idx) => (
                  <span key={idx} className="about-tech-chip">{tech}</span>
                ))}
              </div>
            </div>

            {/* Auditoria de Navegação */}
            <div className="about-card about-audit-card">
              <h2 className="about-card-title">Auditoria de Navegação</h2>
              <p className="about-discreet-text">
                O sistema registra automaticamente os principais acessos e ações realizadas nesta sessão. O relatório poderá ser enviado ao e-mail administrativo do projeto.
              </p>
              <button onClick={handleAudit} className="about-submit-button about-audit-btn">
                Enviar auditoria ao projeto
              </button>
            </div>
          </div>

          {/* Row 3: Contato e Ficha Técnica (60/40) */}
          <div className="about-row-60-40">
            {/* Contato */}
            <div className="about-card about-contact-card">
              <h2 className="about-card-title">Contato</h2>
              <p className="about-contact-support">Use o formulário para enviar dúvidas, sugestões ou observações sobre o projeto GeekVerse G8.</p>
              <form className="about-contact-form" onSubmit={handleSubmit}>
                <div className="about-form-row">
                  <div className="about-form-group">
                    <label>Nome</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="about-form-group">
                    <label>E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="about-form-group">
                  <label>Assunto</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>
                <div className="about-form-group">
                  <label>Mensagem</label>
                  <textarea name="message" rows={2} value={formData.message} onChange={handleChange} required></textarea>
                </div>
                <button type="submit" className="about-submit-button about-contact-submit">
                  Enviar mensagem
                </button>
              </form>
            </div>

            {/* Ficha Técnica */}
            <div className="about-card about-project-info">
              <h2 className="about-card-title">Ficha Técnica do Projeto</h2>
              <div className="about-card-content about-ficha-grid">
                <div className="about-info-grid">
                  <p><strong>Grupo:</strong> G8</p>
                  <p><strong>Disciplina:</strong> Desenvolvimento Web Front-End</p>
                  <p><strong>Projeto:</strong> Trabalho Final de Integração</p>
                  <p><strong>Tema:</strong> Jogos interativos com APIs geek</p>
                </div>

                <div className="about-members-list">
                  <strong>Integrantes em ordem alfabética:</strong>
                  <ul>
                    <li>Gabriel Fagundes Motta</li>
                    <li>Ítalo Dias Moreira Campos</li>
                    <li>Julyanne Lauriano Genevain</li>
                    <li>Rakel Garcia da Silva</li>
                    <li>Raphaell Reiff Galoni</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="about-actions">
          <button className="gv-btn-back" onClick={() => navigate('/app')}>
            <FaArrowLeft /> Voltar ao Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default Sobre;
