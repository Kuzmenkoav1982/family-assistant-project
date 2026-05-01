import { useEffect, useState } from 'react';

interface Props {
  trigger: number;
  color?: string;
}

const COLORS = ['#fb923c', '#ec4899', '#a855f7', '#22d3ee', '#10b981', '#fbbf24'];

export default function Confetti({ trigger, color }: Props) {
  const [pieces, setPieces] = useState<
    Array<{ id: number; left: number; color: string; delay: number; rotate: number }>
  >([]);

  useEffect(() => {
    if (!trigger) return;
    const items = Array.from({ length: 30 }).map((_, i) => ({
      id: trigger * 100 + i,
      left: Math.random() * 100,
      color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.3,
      rotate: Math.random() * 360,
    }));
    setPieces(items);
    const t = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(t);
  }, [trigger, color]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 w-2 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animation: `confettiFall 2.2s cubic-bezier(0.25, 1, 0.5, 1) ${p.delay}s forwards`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
