export default function MiniStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    slate: 'from-slate-50 to-slate-100 text-slate-900',
    green: 'from-green-50 to-emerald-100 text-green-900',
    blue: 'from-blue-50 to-indigo-100 text-blue-900',
    purple: 'from-purple-50 to-pink-100 text-purple-900',
    orange: 'from-orange-50 to-amber-100 text-orange-900',
  };
  return (
    <div className={`p-3 bg-gradient-to-br rounded-lg ${colors[color] || colors.slate}`}>
      <p className="text-[10px] md:text-xs font-medium opacity-70">{label}</p>
      <p className="text-lg md:text-xl font-bold mt-1 truncate">{value}</p>
    </div>
  );
}
