
// Lista de posições do 4º ao 10º lugar.
// Destaca o jogador logado com badge "Você".
// padTo: preenche com traços até atingir esse total de linhas.

const RankingList = ({ results, startPosition, formatMetric, currentUserEmail, padTo = 0 }) => {
  const list = [...(results || [])];
  while (list.length < padTo) {
    list.push(null);
  }

  if (list.length === 0) return null;

  return (
    <div className="rk-list">
      {list.map((r, i) => {
        const pos = startPosition + i;

        if (!r) {
          return (
            <div key={`empty-${pos}`} className="rk-list-row" style={{ opacity: 0.55 }}>
              <span className="rk-list-pos">{pos}º</span>
              <span className="rk-list-name" style={{ fontStyle: 'italic', color: 'var(--gv-text-muted)' }}>—</span>
            </div>
          );
        }

        const isYou = currentUserEmail &&
          r.playerEmail?.toLowerCase() === currentUserEmail.toLowerCase();

        return (
          <div
            key={r.id || i}
            className={`rk-list-row ${isYou ? 'rk-is-you' : ''}`}
          >
            <span className="rk-list-pos">{pos}º</span>
            <span className="rk-list-name">
              {r.playerName}
              {isYou && <span className="rk-you-badge">Você</span>}
            </span>
            <span className="rk-list-metric">
              {formatMetric ? formatMetric(r) : r.mainMetric}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RankingList;

