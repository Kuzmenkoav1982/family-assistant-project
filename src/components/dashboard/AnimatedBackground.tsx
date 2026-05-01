import { useMemo } from 'react';

const PARTICLES = ['✨', '💫', '⭐', '🌟', '💛', '💜'];

export default function AnimatedBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      char: PARTICLES[i % PARTICLES.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 10 + Math.random() * 14,
      duration: 12 + Math.random() * 18,
      delay: Math.random() * 8,
      drift: 30 + Math.random() * 40,
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#fff7ed_0%,_#fef3c7_25%,_#fce7f3_55%,_#ede9fe_100%)]" />

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/30 blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-300/30 blur-3xl animate-pulse-soft-delayed" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-300/25 blur-3xl animate-pulse-soft" />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-orange-200/40 animate-spin-slow" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-pink-200/30 animate-spin-slow-reverse" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full border border-purple-200/20" />

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            opacity: 0.5,
            animation: `floatParticle ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        >
          {p.char}
        </span>
      ))}

      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.6; }
          50% {
            transform: translate(var(--drift), calc(-1 * var(--drift))) rotate(180deg);
            opacity: 0.7;
          }
          90% { opacity: 0.5; }
        }
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes spinSlow {
          from { transform: translate(-50%, 0) rotate(0deg); }
          to { transform: translate(-50%, 0) rotate(360deg); }
        }
        @keyframes spinSlowReverse {
          from { transform: translate(-50%, 0) rotate(360deg); }
          to { transform: translate(-50%, 0) rotate(0deg); }
        }
        .animate-pulse-soft {
          animation: pulseSoft 6s ease-in-out infinite;
        }
        .animate-pulse-soft-delayed {
          animation: pulseSoft 8s ease-in-out 2s infinite;
        }
        .animate-spin-slow {
          animation: spinSlow 120s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spinSlowReverse 180s linear infinite;
        }
      `}</style>
    </div>
  );
}
