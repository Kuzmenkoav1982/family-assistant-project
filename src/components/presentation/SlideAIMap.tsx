import Icon from '@/components/ui/icon';

const aiFunctions = [
  { icon: 'Apple', color: '#f97316', bg: '#ffedd5', label: 'ИИ-Диета', hub: 'Питание', desc: 'Персональный рацион по здоровью семьи', angle: 0 },
  { icon: 'GraduationCap', color: '#3b82f6', bg: '#dbeafe', label: 'AI-план развития', hub: 'Развитие', desc: 'Индивидуальный план по возрасту ребёнка', angle: 33 },
  { icon: 'Brain', color: '#8b5cf6', bg: '#ede9fe', label: 'AI-психолог', hub: 'Развитие', desc: 'Поддержка и рекомендации для семьи', angle: 66 },
  { icon: 'HeartHandshake', color: '#d946ef', bg: '#fae8ff', label: 'Зеркало родителя', hub: 'Семейный код', desc: 'Тест PARI + ИИ-разбор результатов', angle: 99 },
  { icon: 'MessageCircle', color: '#7c3aed', bg: '#f3e8ff', label: 'Конфликт-AI', hub: 'Развитие', desc: 'Разрешение конфликтов внутри семьи', angle: 132 },
  { icon: 'ChefHat', color: '#ef4444', bg: '#fee2e2', label: 'AI-рецепты', hub: 'Питание', desc: 'Блюда из того, что есть в холодильнике', angle: 165 },
  { icon: 'MapPin', color: '#06b6d4', bg: '#cffafe', label: 'AI-маршруты', hub: 'Путешествия', desc: 'Идеальный маршрут под запросы семьи', angle: 198 },
  { icon: 'PartyPopper', color: '#ec4899', bg: '#fce7f3', label: 'AI-праздники', hub: 'Путешествия', desc: 'Идеи для праздников и событий', angle: 231 },
  { icon: 'PawPrint', color: '#84cc16', bg: '#ecfccb', label: 'AI-ветеринар', hub: 'Питомцы', desc: 'Диагностика симптомов питомца', angle: 264 },
  { icon: 'Stars', color: '#f59e0b', bg: '#fef3c7', label: 'Астрология', hub: 'Семейный код', desc: 'Совместимость и прогнозы для семьи', angle: 297 },
  { icon: 'Mic', color: '#10b981', bg: '#d1fae5', label: 'Голосовой AI', hub: 'Интеграции', desc: 'Яндекс Алиса — управление голосом', angle: 330 },
];

const R = 160;

function polarToXY(angleDeg: number, r: number, cx = 200, cy = 200) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function SlideAIMap() {
  return (
    <section data-pdf-slide className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl shadow-xl p-6 sm:p-10 mb-8 text-white">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-pink-500">
          <Icon name="Bot" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">AI-карта «Домовой»</h2>
          <p className="text-sm text-purple-300 mt-0.5">11 AI-функций в единой экосистеме семьи</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* SVG Map */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto">
            <defs>
              <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <circle cx="200" cy="200" r="180" fill="url(#centerGlow)" />

            {/* Lines from center to bubbles */}
            {aiFunctions.map((fn, i) => {
              const pos = polarToXY(fn.angle, R);
              return (
                <line
                  key={i}
                  x1="200" y1="200"
                  x2={pos.x} y2={pos.y}
                  stroke="#a855f730"
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
              );
            })}

            {/* Bubbles */}
            {aiFunctions.map((fn, i) => {
              const pos = polarToXY(fn.angle, R);
              return (
                <g key={i}>
                  <circle cx={pos.x} cy={pos.y} r="28" fill={fn.bg} opacity="0.95" />
                  <circle cx={pos.x} cy={pos.y} r="28" fill="none" stroke={fn.color} strokeWidth="1.5" opacity="0.6" />
                  <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill={fn.color}>
                    {fn.label.split(' ')[0]}
                  </text>
                  <text x={pos.x} y={pos.y + 7} textAnchor="middle" fontSize="9" fontWeight="700" fill={fn.color}>
                    {fn.label.split(' ').slice(1).join(' ')}
                  </text>
                </g>
              );
            })}

            {/* Center: Домовой */}
            <circle cx="200" cy="200" r="52" fill="#1e1b4b" filter="url(#glow)" />
            <circle cx="200" cy="200" r="52" fill="none" stroke="#a855f7" strokeWidth="2" />
            <image
              href="https://cdn.poehali.dev/files/a8b6c71e-061d-499f-a68c-84d9ba93a2c8.png"
              x="148" y="148" width="104" height="104"
              clipPath="circle(52px at 52px 52px)"
              style={{ borderRadius: '50%' }}
            />
          </svg>
        </div>

        {/* List */}
        <div className="w-full space-y-2">
          {aiFunctions.map((fn, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl px-4 py-3 transition-colors border border-white/10">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: fn.bg }}>
                <Icon name={fn.icon} size={16} style={{ color: fn.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-white">{fn.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: fn.bg, color: fn.color }}>
                    {fn.hub}
                  </span>
                </div>
                <p className="text-xs text-purple-300 mt-0.5">{fn.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-purple-500/30 text-center">
        <p className="text-sm font-semibold text-purple-200">
          «Домовой» знает всю историю семьи — и даёт советы в нужный момент, не когда попросят
        </p>
      </div>
    </section>
  );
}