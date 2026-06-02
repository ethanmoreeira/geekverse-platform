import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuditSessionSummary, resetAuditSessionSummary, logAuditEvent } from '../../services/auditService';
import { sendContactEmail, sendAuditEmail } from '../../services/emailService';
import { hasEmailExportBeenSent, markEmailExportAsSent, AUDIT_SESSION_KEY } from '../../utils/emailExportControl';
import { useAuth } from '../../hooks/useAuth';
import {
  FaArrowLeft
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

const Sobre = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isSending, setIsSending] = useState(false);
  const [contactFeedback, setContactFeedback] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSending) return;

    // Validação básica
    const { name, email, subject, message } = formData;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setContactFeedback({ type: 'error', text: 'Preencha todos os campos antes de enviar.' });
      return;
    }

    setIsSending(true);
    setContactFeedback(null);

    try {
      const result = await sendContactEmail(formData);
      setContactFeedback({ type: 'success', text: result.message });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setContactFeedback({ type: 'error', text: error.message || 'Erro ao enviar mensagem.' });
    } finally {
      setIsSending(false);
    }
  };

  const [auditSummary, setAuditSummary] = useState(null);

  const fetchAuditSummary = () => {
    const summary = getAuditSessionSummary();
    setAuditSummary(summary);
  };

  useEffect(() => {
    fetchAuditSummary();
  }, []);

  const handleClearAuditSession = () => {
    resetAuditSessionSummary();
    fetchAuditSummary();
  };

  const { user } = useAuth();
  const [isSendingAudit, setIsSendingAudit] = useState(false);
  const [auditFeedback, setAuditFeedback] = useState(null);

  const handleAuditEmailSend = async () => {
    if (isSendingAudit) return;

    // Guard: bloquear reenvio da auditoria na mesma sessão
    if (hasEmailExportBeenSent(AUDIT_SESSION_KEY)) {
      setAuditFeedback({ type: 'warn', text: 'A auditoria desta sessão já foi enviada.' });
      setTimeout(() => setAuditFeedback(null), 5000);
      return;
    }

    setIsSendingAudit(true);
    setAuditFeedback(null);

    try {
      // Refresh para pegar dados mais recentes
      const freshSummary = getAuditSessionSummary();

      const auditData = {
        audit_title: 'Auditoria da Sessão GeekVerse G8',
        user_name: user?.nome || user?.name || 'Usuário não informado',
        user_email: user?.email || 'E-mail não informado',
        total_events: freshSummary.totalEvents ?? 0,
        game_enters: freshSummary.gameEnters ?? 0,
        game_starts: freshSummary.gameStarts ?? 0,
        game_finishes: freshSummary.gameFinishes ?? 0,
        result_exports: freshSummary.resultExports ?? 0,
        summary: 'Este relatório apresenta um resumo da sessão atual do usuário na aplicação GeekVerse G8, incluindo acessos aos jogos, partidas iniciadas, partidas finalizadas e exportações realizadas.',
        generated_at: new Date().toLocaleString('pt-BR', {
          dateStyle: 'long',
          timeStyle: 'medium',
        }),
      };

      const result = await sendAuditEmail(auditData);
      // Marcar como enviado APENAS após sucesso
      markEmailExportAsSent(AUDIT_SESSION_KEY);
      setAuditFeedback({ type: 'success', text: result.message });

      // Registrar auditoria (sem quebrar o fluxo principal)
      try {
        await logAuditEvent({
          eventType: 'audit_email_send',
          description: 'Auditoria da sessão enviada por e-mail',
          path: '/app/sobre',
          metadata: {
            totalEvents: freshSummary.totalEvents,
            gameEnters: freshSummary.gameEnters,
            gameStarts: freshSummary.gameStarts,
            gameFinishes: freshSummary.gameFinishes,
            resultExports: freshSummary.resultExports,
          },
        });
      } catch {
        // Falha de auditoria não deve impedir o feedback de sucesso
      }
    } catch (error) {
      setAuditFeedback({
        type: 'error',
        text: error.message || 'Não foi possível enviar a auditoria da sessão. Tente novamente.',
      });
    } finally {
      setIsSendingAudit(false);
      setTimeout(() => setAuditFeedback(null), 6000);
    }
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
            style={{ mixBlendMode: 'screen', maxWidth: '150px', height: 'auto', display: 'block', margin: '-40px auto 0 auto' }}
          />
          <p className="about-hero-subtitle" style={{ color: '#d8b4fe', marginTop: '-30px' }}>
            Uma SPA em React com jogos interativos, APIs públicas, ranking global e experiências geek.
          </p>
        </div>

        <div className="sobre-content">

          {/* Card 1: Jogos do Projeto */}
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

          {/* Card 2: Contato */}
          <div className="about-card about-contact-card">
            <h2 className="about-card-title">Contato</h2>
            <p className="about-contact-support" style={{ fontSize: '13px', color: '#e9d5ff', marginBottom: '8px' }}>
              Envie dúvidas, sugestões ou observações sobre o projeto GeekVerse G8.
            </p>

            {contactFeedback && (
              <div className={`about-contact-feedback about-contact-feedback--${contactFeedback.type}`}>
                {contactFeedback.text}
              </div>
            )}

            <form className="about-contact-form" onSubmit={handleSubmit}>
              <div className="about-form-row">
                <div className="about-form-group">
                  <label>Nome</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSending} />
                </div>
                <div className="about-form-group">
                  <label>E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isSending} />
                </div>
              </div>
              <div className="about-form-group">
                <label>Assunto</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required disabled={isSending} />
              </div>
              <div className="about-form-group">
                <label>Mensagem</label>
                <textarea name="message" rows={2} value={formData.message} onChange={handleChange} required disabled={isSending}></textarea>
              </div>
              <button type="submit" className="about-submit-button about-contact-submit" disabled={isSending}>
                {isSending ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </form>
          </div>

          {/* Card 3: Auditoria da Sessão */}
          <div className="about-card about-audit-card">
            <h2 className="about-card-title" style={{ fontSize: '14px', paddingBottom: '4px' }}>Auditoria da Sessão</h2>
            <p className="about-discreet-text" style={{ marginBottom: '6px', fontSize: '11px' }}>
              Os números abaixo representam contadores locais desta sessão. Os eventos completos também são registrados no Supabase para auditoria do projeto. Nenhum nome ou e-mail é exibido nesta área.
            </p>

            {!auditSummary ? (
              <div style={{ padding: '5px 0', textAlign: 'center', color: '#ff6b6b', fontSize: '12px' }}>Resumo indisponível.</div>
            ) : (
              <div className="about-audit-badges" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <div className="audit-badge">
                  <span className="audit-badge-val" style={{ color: '#d8b4fe' }}>{auditSummary.totalEvents}</span>
                  <span className="audit-badge-label">Eventos</span>
                </div>
                <div className="audit-badge">
                  <span className="audit-badge-val" style={{ color: '#fca5a5' }}>{auditSummary.gameEnters}</span>
                  <span className="audit-badge-label">Jogos acessados</span>
                </div>
                <div className="audit-badge">
                  <span className="audit-badge-val" style={{ color: '#fcd34d' }}>{auditSummary.gameStarts}</span>
                  <span className="audit-badge-label">Jogos iniciados</span>
                </div>
                <div className="audit-badge">
                  <span className="audit-badge-val" style={{ color: '#c4b5fd' }}>{auditSummary.gameFinishes}</span>
                  <span className="audit-badge-label">Jogos finalizados</span>
                </div>
                <div className="audit-badge">
                  <span className="audit-badge-val" style={{ color: '#f9a8d4' }}>{auditSummary.resultExports}</span>
                  <span className="audit-badge-label">Exportações</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={handleClearAuditSession} className="about-submit-button about-audit-btn" style={{ flex: '0 1 auto', margin: 0 }}>
                Limpar local
              </button>
              <button
                onClick={handleAuditEmailSend}
                className="about-submit-button about-audit-send-btn"
                disabled={isSendingAudit}
                style={{ flex: '0 1 auto', margin: 0 }}
              >
                {isSendingAudit ? 'Enviando...' : 'Enviar auditoria'}
              </button>
            </div>
            {auditFeedback && (
              <div className={`about-audit-feedback about-audit-feedback--${auditFeedback.type}`}>
                {auditFeedback.text}
              </div>
            )}
          </div>

          {/* Card 4: Informações do Grupo */}
          <div className="about-card about-project-info">
            <h2 className="about-card-title">Informações do Grupo</h2>
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
    </>
  );
};

export default Sobre;
