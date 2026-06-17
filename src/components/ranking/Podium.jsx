
// Componente visual do pódio (1º, 2º, 3º lugar).
// Ordem visual: 2º | 1º | 3º

const Podium = ({ topThree, formatMetric }) => {
  const slots = [
    { place: 2, data: topThree[1] || null, cls: 'rk-podium-2nd' },
    { place: 1, data: topThree[0] || null, cls: 'rk-podium-1st' },
    { place: 3, data: topThree[2] || null, cls: 'rk-podium-3rd' },
  ];

  return (
    <div className="rk-podium">
      {slots.map((slot) => (
        <div key={slot.place} className={`rk-podium-slot ${slot.cls}`}>
          {slot.data ? (
            <>
              <span className="rk-podium-name" title={slot.data.playerName}>
                {slot.data.playerName}
              </span>
              <span className="rk-podium-metric">
                {formatMetric ? formatMetric(slot.data) : slot.data.mainMetric}
              </span>
            </>
          ) : (
            <span className="rk-podium-empty">—</span>
          )}
          <div className="rk-podium-pedestal">
            <span className="rk-podium-position">{slot.place}º</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Podium;
