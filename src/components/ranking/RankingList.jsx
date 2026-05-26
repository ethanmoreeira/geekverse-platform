// RankingList.jsx
// Lista de posições do 4º ao 10º lugar.
// Destaca o jogador logado com badge "Você".

const RankingList = ({ results, startPosition, formatMetric, currentUserEmail }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="rk-list">
      {results.map((r, i) => {
        const pos = startPosition + i;
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
