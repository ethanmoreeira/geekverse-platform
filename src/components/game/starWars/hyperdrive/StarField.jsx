import { useMemo } from 'react';

const StarField = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      height: 8 + Math.random() * 25,
      duration: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.35,
    }));
  }, []);

  return (
    <div className="sw-arena-starfield">
      {stars.map(s => (
        <div
          key={s.id}
          className="sw-star-streak"
          style={{
            left: `${s.left}%`,
            height: `${s.height}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default StarField;
