import { useState } from 'react';
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

const CX = 280;
const CY = 280;
const R = 215;
const BUBBLE_R = 42;

function polarToXY(angleDeg: number, r: number, cx = CX, cy = CY) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function WelcomeDomovoyAI() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl shadow-xl p-6 sm:p-10 text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0">
              <Icon name="Bot" size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">AI-карта «Домовой»</h2>
              <p className="text-sm text-purple-300 mt-0.5">11 AI-функций в единой экосистеме семьи</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* SVG Map */}
            <div className="w-full lg:w-[560px] flex-shrink-0">
              <svg viewBox="0 0 560 560" className="w-full max-w-[560px] mx-auto">
                <defs>
                  <radialGradient id="centerGlowWelcome" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                  </radialGradient>
                  <filter id="glowWelcome">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <clipPath id="domovoyClipWelcome">
                    <circle cx={CX} cy={CY} r="62" />
                  </clipPath>
                </defs>

                <circle cx={CX} cy={CY} r="240" fill="url(#centerGlowWelcome)" />

                {aiFunctions.map((fn, i) => {
                  const pos = polarToXY(fn.angle, R);
                  return (
                    <line
                      key={`line-${i}`}
                      x1={CX} y1={CY}
                      x2={pos.x} y2={pos.y}
                      stroke="#a855f740"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />
                  );
                })}

                {aiFunctions.map((fn, i) => {
                  const pos = polarToXY(fn.angle, R);
                  const words = fn.label.split(' ');
                  const line1 = words[0];
                  const line2 = words.slice(1).join(' ');
                  const isActive = active === i;
                  return (
                    <g
                      key={`bub-${i}`}
                      onClick={() => setActive(isActive ? null : i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={BUBBLE_R}
                        fill={fn.bg}
                        opacity="0.98"
                      />
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={BUBBLE_R}
                        fill="none"
                        stroke={fn.color}
                        strokeWidth={isActive ? 3.5 : 1.8}
                        opacity={isActive ? 1 : 0.7}
                      />
                      {line2 ? (
                        <>
                          <text x={pos.x} y={pos.y - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={fn.color}>
                            {line1}
                          </text>
                          <text x={pos.x} y={pos.y + 10} textAnchor="middle" fontSize="11" fontWeight="700" fill={fn.color}>
                            {line2}
                          </text>
                        </>
                      ) : (
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={fn.color}>
                          {line1}
                        </text>
                      )}
                    </g>
                  );
                })}

                <circle cx={CX} cy={CY} r="62" fill="#1e1b4b" filter="url(#glowWelcome)" />
                <image
                  href="https://cdn.poehali.dev/files/a8b6c71e-061d-499f-a68c-84d9ba93a2c8.png"
                  x={CX - 62} y={CY - 62} width="124" height="124"
                  clipPath="url(#domovoyClipWelcome)"
                  preserveAspectRatio="xMidYMid slice"
                />
                <circle cx={CX} cy={CY} r="62" fill="none" stroke="#a855f7" strokeWidth="2.5" />
              </svg>
            </div>

            {/* List */}
            <div className="w-full space-y-2">
              {aiFunctions.map((fn, i) => {
                const isActive = active === i;
                return (
                  <div key={i}>
                    <button
                      onClick={() => setActive(isActive ? null : i)}
                      className={`w-full flex items-start gap-3 rounded-xl px-4 py-3 transition-colors border text-left ${
                        isActive
                          ? 'bg-white/15 border-white/30'
                          : 'bg-white/5 hover:bg-white/10 border-white/10'
                      }`}
                    >
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
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={`text-purple-300 flex-shrink-0 mt-1 transition-transform ${isActive ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isActive && (
                      <div
                        className="mt-2 rounded-xl p-4 border-2"
                        style={{ backgroundColor: fn.bg, borderColor: fn.color }}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Icon name="Sparkles" size={16} style={{ color: fn.color }} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-800 leading-relaxed font-medium">{fn.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-700 mt-3">
                          <Icon name="Layers" size={12} />
                          <span>Хаб:</span>
                          <span className="font-bold" style={{ color: fn.color }}>{fn.hub}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 bg-white/10 rounded-2xl p-4 border border-purple-500/30 text-center">
            <p className="text-sm font-semibold text-purple-200">
              «Домовой» знает всю историю семьи — и даёт советы в нужный момент, не когда попросят
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
