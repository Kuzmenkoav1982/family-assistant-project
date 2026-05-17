interface Layer {
  label: string;
  sub?: string;
}

const layers: Layer[] = [
  { label: 'Человек', sub: 'Отдельный клиент' },
  { label: 'Домохозяйство' },
  { label: 'Семья как единый клиент', sub: 'Семейный ID' },
  { label: 'Сценарии семьи' },
  { label: 'Дистрибуция и удержание' },
];

export default function NestedMatryoshka() {
  const center = 200;
  const maxR = 180;
  const minR = 28;
  const step = (maxR - minR) / (layers.length - 1);

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 400 400"
        className="w-full max-w-[360px] h-auto"
        aria-label="Вложенная матрёшка: от человека к семейному клиентскому слою"
      >
        <defs>
          <radialGradient id="layer-grad-0" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
          </radialGradient>
        </defs>

        {layers.map((_, i) => {
          const r = maxR - step * i;
          const opacity = 0.08 + i * 0.13;
          const stroke = i === 2 ? '#fbbf24' : '#a5b4fc';
          const strokeWidth = i === 2 ? 2.2 : 1;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={r}
              fill={`rgba(165, 180, 252, ${opacity})`}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={i === 2 ? '0' : '0'}
            />
          );
        })}

        <circle cx={center} cy={center} r={maxR + 4} fill="url(#layer-grad-0)" />

        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="11"
          fontWeight="700"
          letterSpacing="0.5"
        >
          Семейный ID
        </text>
      </svg>

      <ol className="mt-5 w-full max-w-sm space-y-1.5">
        {layers.map((l, i) => {
          const isKey = i === 2;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                isKey
                  ? 'bg-amber-300/15 border border-amber-300/40'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isKey
                    ? 'bg-amber-300 text-slate-900'
                    : 'bg-white/10 text-indigo-100'
                }`}
              >
                {i + 1}
              </span>
              <div>
                <div
                  className={`font-semibold leading-tight ${
                    isKey ? 'text-amber-200' : 'text-white'
                  }`}
                >
                  {l.label}
                </div>
                {l.sub && (
                  <div className="text-xs text-indigo-200/80 leading-tight">
                    {l.sub}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-xs sm:text-sm text-indigo-200/90 leading-relaxed italic max-w-sm">
        Семья — не сумма отдельных пользователей, а вложенный контур решений,
        задач, расходов и жизненных маршрутов.
      </p>
    </div>
  );
}
