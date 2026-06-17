
// Exibe a colocação do jogador logado quando ele está fora do Top 10.

const UserPositionCard = ({ position, result, formatMetric }) => {
  if (!position || !result) return null;

  return (
    <div className="rk-user-pos">
      <span className="rk-user-pos-label">Sua colocação</span>
      <span className="rk-user-pos-pos">{position}º</span>
      <span className="rk-user-pos-name">{result.playerName}</span>
      <span className="rk-user-pos-metric">
        {formatMetric ? formatMetric(result) : result.mainMetric}
      </span>
    </div>
  );
};

export default UserPositionCard;
