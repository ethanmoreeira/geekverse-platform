
// Card de ranking por dificuldade. Mostra pódio, lista 4º–10º,
// posição do jogador logado, e botões de ação.
// Fonte oficial: Supabase (global). Fallback: localStorage.

import { useState, useEffect } from 'react';
import { FaListOl, FaFileExport } from 'react-icons/fa';
import Podium from './Podium';
import RankingList from './RankingList';
import UserPositionCard from './UserPositionCard';
import {
  getTopTen,
  getUserPosition,
  fetchTopTen,
  fetchRankedResults,
  fetchUserPosition,
  RANKING_GAMES,
  DIFFICULTIES,
} from '../../services/rankingService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useAuth } from '../../hooks/useAuth';
import { sendRankingEmail } from '../../services/emailService';
import { hasEmailExportBeenSent, markEmailExportAsSent, buildRankingKey } from '../../utils/emailExportControl';
import { logAuditEvent } from '../../services/auditService';

const DifficultyRankingCard = ({ gameId, difficulty, difficultyLabel, currentUserEmail }) => {
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);

  const { user } = useAuth();
  const gameConfig = RANKING_GAMES[gameId];
  const formatMetric = gameConfig?.formatMainMetric;

  // Se Supabase configurado: iniciar vazio (traços) e esperar resposta global.
  // Se não configurado: usar localStorage imediatamente.
  const [topTen, setTopTen] = useState(() =>
    isSupabaseConfigured ? [] : getTopTen(gameId, difficulty)
  );
  const [allResults, setAllResults] = useState([]);
  const [userPos, setUserPos] = useState(() =>
    isSupabaseConfigured ? null : getUserPosition(gameId, difficulty, currentUserEmail)
  );

  // Busca dados da fonte oficial ao montar
  useEffect(() => {
    let cancelled = false;

    fetchTopTen(gameId, difficulty).then((data) => {
      if (!cancelled) setTopTen(data);
    });

    fetchUserPosition(gameId, difficulty, currentUserEmail).then((pos) => {
      if (!cancelled) setUserPos(pos);
    });

    return () => { cancelled = true; };
  }, [gameId, difficulty, currentUserEmail]);

  // Busca ranking completo quando "Ver completo" é aberto
  useEffect(() => {
    if (!showFullRanking) {
      setAllResults([]);
      return;
    }

    let cancelled = false;

    fetchRankedResults(gameId, difficulty).then((data) => {
      if (!cancelled) setAllResults(data);
    });

    return () => { cancelled = true; };
  }, [gameId, difficulty, showFullRanking]);

  const topThree = topTen.slice(0, 3);
  const rest = topTen.slice(3);

  // Mostra "Sua colocação" apenas se fora do Top 10
  const showUserPos = userPos && userPos.position > 10;

  // Monta ranking_list como texto a partir dos dados exibidos no card
  const buildRankingListText = (entries) => {
    if (!entries || entries.length === 0) return 'Nenhum resultado registrado.';
    return entries.map((r, i) => {
      const pos = `${i + 1}º`;
      const name = r.playerName || 'Jogador';
      const metric = formatMetric ? formatMetric(r) : (r.mainMetric ?? '');

      // Dados extras conforme o jogo
      const extras = [];
      if (r.timeInSeconds != null && gameId !== 'harry-memory' && gameId !== 'pokesombra') {
        extras.push(`Tempo: ${r.formattedTime || r.timeInSeconds + 's'}`);
      }
      if (r.score != null && gameId !== 'show-multiverso' && gameId !== 'fuga-hiperespaco') {
        extras.push(`Pontuação: ${r.score}`);
      }
      if (r.attempts != null && r.attempts > 0) extras.push(`Tentativas: ${r.attempts}`);
      if (r.errors != null && r.errors > 0) extras.push(`Erros: ${r.errors}`);
      if ((r.hintsUsed ?? r.hints) != null && (r.hintsUsed ?? r.hints) > 0) {
        extras.push(`Dicas: ${r.hintsUsed ?? r.hints}`);
      }
      if (r.collisions != null && r.collisions > 0) extras.push(`Colisões: ${r.collisions}`);
      if (r.crystals != null && r.crystals > 0) extras.push(`Cristais: ${r.crystals}`);

      const extrasStr = extras.length > 0 ? ` (${extras.join(', ')})` : '';
      return `${pos} - ${name} | ${metric}${extrasStr}`;
    }).join('\n');
  };

  const handleExport = async () => {
    if (sending) return;

    const playerEmail = user?.email || currentUserEmail;
    if (!playerEmail) {
      setToast('E-mail do jogador não encontrado. Faça login novamente para enviar o ranking.');
      setTimeout(() => setToast(null), 4000);
      return;
    }

    // Guard: bloquear reenvio do mesmo ranking na sessão
    const rankingKey = buildRankingKey(gameId, difficulty);
    if (hasEmailExportBeenSent(rankingKey)) {
      setToast('Este ranking já foi enviado nesta sessão.');
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setSending(true);
    setToast(null);

    try {
      // Usa os dados visíveis no card (topTen ou allResults conforme o modo)
      const entries = showFullRanking && allResults.length > 0 ? allResults : topTen;
      const diffLabel = DIFFICULTIES.find(d => d.key === difficulty)?.label || difficulty;

      const rankingData = {
        ranking_title: `Ranking ${gameConfig?.name || gameId} — ${diffLabel}`,
        game_name: gameConfig?.name || gameId,
        difficulty: diffLabel,
        player_name: user?.nome || user?.name || 'Jogador GeekVerse',
        player_email: playerEmail,
        ranking_list: buildRankingListText(entries),
        generated_at: new Date().toLocaleString('pt-BR', {
          dateStyle: 'long',
          timeStyle: 'medium',
        }),
      };

      const result = await sendRankingEmail(rankingData);
      // Marcar como enviado APENAS após sucesso
      markEmailExportAsSent(rankingKey);
      setToast(result.message || 'Ranking enviado com sucesso para o e-mail cadastrado.');

      // Registrar auditoria (sem quebrar o fluxo principal)
      try {
        await logAuditEvent({
          eventType: 'ranking_email_send',
          description: `Ranking enviado por e-mail: ${gameConfig?.name || gameId} (${diffLabel})`,
          path: '/app/ranking/' + gameId,
          gameId,
          gameName: gameConfig?.name || gameId,
          metadata: { difficulty, entriesCount: entries.length },
        });
      } catch {
        // Falha de auditoria não deve impedir o feedback de sucesso
      }
    } catch (error) {
      const msg = error?.message || 'Não foi possível enviar o ranking por e-mail. Tente novamente.';
      setToast(msg);
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 5000);
    }
  };

  const diffClass = `rk-diff-${difficulty}`;

  return (
    <div className={`rk-diff-card ${diffClass}`} data-game-id={gameId}>
      <div className="rk-diff-header">
        <span className="rk-diff-label">
          <span className="rk-diff-badge" />
          {difficultyLabel}
        </span>
      </div>

      {showFullRanking ? (
        <div style={{ marginTop: 8 }}>
          <RankingList
            results={allResults}
            startPosition={1}
            formatMetric={formatMetric}
            currentUserEmail={currentUserEmail}
            padTo={10}
          />
        </div>
      ) : (
        <>
          <Podium topThree={topThree} formatMetric={formatMetric} />

          <RankingList
            results={rest}
            startPosition={4}
            formatMetric={formatMetric}
            currentUserEmail={currentUserEmail}
            padTo={7}
          />

          {showUserPos && (
            <UserPositionCard
              position={userPos.position}
              result={userPos.result}
              formatMetric={formatMetric}
            />
          )}
        </>
      )}

      <div className="rk-actions">
        <button
          className="rk-btn-action"
          onClick={() => setShowFullRanking(!showFullRanking)}
          aria-label="Ver ranking completo"
        >
          <FaListOl /> {showFullRanking ? 'Fechar' : 'Ver completo'}
        </button>
        <button
          className="rk-btn-action"
          onClick={handleExport}
          disabled={sending}
          aria-label="Exportar ranking por e-mail"
        >
          <FaFileExport /> {sending ? 'Enviando...' : 'Exportar'}
        </button>
      </div>

      {/* Toast */}
      {toast && <div className="rk-toast">{toast}</div>}
    </div>
  );
};

export default DifficultyRankingCard;
