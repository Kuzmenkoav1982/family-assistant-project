export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#fff7ed_0%,_#fef3c7_25%,_#fce7f3_55%,_#ede9fe_100%)]" />

      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/30 blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-300/30 blur-3xl animate-pulse-soft-delayed" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-300/25 blur-3xl animate-pulse-soft" />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border border-orange-200/30" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full border border-pink-200/20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[1100px] rounded-full border border-purple-200/15" />

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-soft {
          animation: pulseSoft 6s ease-in-out infinite;
        }
        .animate-pulse-soft-delayed {
          animation: pulseSoft 8s ease-in-out 2s infinite;
        }
      `}</style>
    </div>
  );
}
