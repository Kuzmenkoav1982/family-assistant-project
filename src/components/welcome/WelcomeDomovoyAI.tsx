import { useState } from 'react';
import Icon from '@/components/ui/icon';

const DOMOVOY_CENTER = 'https://cdn.poehali.dev/files/4934b182-04ec-456b-814c-77b2704e0d2e.png';

const aiFunctions = [
  { name: 'ИИ-Диета', hub: 'Питание', hubColor: '#FF7043', icon: 'Apple', color: '#FFF3E0', textColor: '#FF7043', angle: 10 },
  { name: 'AI-план развития', hub: 'Развитие', hubColor: '#7E57C2', icon: 'GraduationCap', color: '#EDE7F6', textColor: '#7E57C2', angle: 50 },
  { name: 'AI-психолог', hub: 'Развитие', hubColor: '#7E57C2', icon: 'Brain', color: '#EDE7F6', textColor: '#7E57C2', angle: 100 },
  { name: 'Зеркало родителя', hub: 'Семейный код', hubColor: '#AB47BC', icon: 'Heart', color: '#F3E5F5', textColor: '#AB47BC', angle: 150 },
  { name: 'Конфликт-AI', hub: 'Развитие', hubColor: '#7E57C2', icon: 'MessageCircle', color: '#EDE7F6', textColor: '#7E57C2', angle: 195 },
  { name: 'AI-рецепты', hub: 'Питание', hubColor: '#FF7043', icon: 'ChefHat', color: '#FFF3E0', textColor: '#FF7043', angle: 240 },
  { name: 'AI-маршруты', hub: 'Путешествия', hubColor: '#26C6DA', icon: 'Compass', color: '#E0F7FA', textColor: '#26C6DA', angle: 285 },
  { name: 'AI-праздники', hub: 'Семья', hubColor: '#E91E8C', icon: 'Gift', color: '#FCE4EC', textColor: '#E91E8C', angle: 325 },
  { name: 'AI-ветеринар', hub: 'Питомцы', hubColor: '#66BB6A', icon: 'PawPrint', color: '#E8F5E9', textColor: '#66BB6A', angle: 220 },
  { name: 'Астрология', hub: 'Семейный код', hubColor: '#AB47BC', icon: 'Star', color: '#F3E5F5', textColor: '#AB47BC', angle: 175 },
  { name: 'Голосовой AI', hub: 'Семья', hubColor: '#E91E8C', icon: 'Mic', color: '#FCE4EC', textColor: '#E91E8C', angle: 340 },
];

const descriptions: Record<string, string> = {
  'ИИ-Диета': 'Персональный рацион по здоровью семьи',
  'AI-план развития': 'Индивидуальный план по возрасту ребёнка',
  'AI-психолог': 'Поддержка и рекомендации для семьи',
  'Зеркало родителя': 'Тест PARI + ИИ-разбор результатов',
  'Конфликт-AI': 'Помощь в разрешении семейных конфликтов',
  'AI-рецепты': 'Рецепты с учётом вкусов и аллергий',
  'AI-маршруты': 'Маршруты путешествий для всей семьи',
  'AI-праздники': 'Сценарии и идеи для семейных праздников',
  'AI-ветеринар': 'Советы по уходу за питомцами',
  'Астрология': 'Семейный гороскоп и совместимость',
  'Голосовой AI': 'Управление голосом через Яндекс Алису',
};

function polarToXY(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

export default function WelcomeDomovoyAI() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1a0a2e] via-[#2d1058] to-[#1a0a2e]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon name="Bot" size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI-карта «Домовой»</h2>
            <p className="text-purple-300 text-sm sm:text-base mt-0.5">11 AI-функций в единой экосистеме семьи</p>
          </div>
        </div>

        {/* Orbit diagram */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-[340px] aspect-square">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              {/* Orbit rings */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              {/* Connection lines */}
              {aiFunctions.map((fn, i) => {
                const pos = polarToXY(fn.angle, 38);
                return (
                  <line
                    key={i}
                    x1="50" y1="50"
                    x2={pos.x} y2={pos.y}
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="0.4"
                  />
                );
              })}
            </svg>

            {/* Center image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-[28%] h-[28%] rounded-full overflow-hidden border-2 border-white/30 shadow-[0_0_30px_rgba(139,92,246,0.5)] cursor-pointer"
                onClick={() => setActive(null)}
              >
                <img src={DOMOVOY_CENTER} alt="Домовой" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Orbit nodes */}
            {aiFunctions.map((fn, i) => {
              const pos = polarToXY(fn.angle, 38);
              const isActive = active === i;
              return (
                <button
                  key={i}
                  onClick={() => setActive(isActive ? null : i)}
                  className="absolute flex items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${isActive ? 'scale(1.15)' : 'scale(1)'}`,
                    width: '18%',
                    height: '18%',
                    background: fn.color,
                    border: isActive ? `2px solid ${fn.textColor}` : '2px solid transparent',
                    boxShadow: isActive ? `0 0 12px ${fn.textColor}60` : undefined,
                  }}
                  title={fn.name}
                >
                  <span
                    className="text-[8px] font-bold leading-tight text-center px-0.5"
                    style={{ color: fn.textColor }}
                  >
                    {fn.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-3">
          {aiFunctions.map((fn, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all text-left ${
                active === i
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/8 bg-white/5 hover:bg-white/8'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: fn.color }}
              >
                <Icon name={fn.icon} size={20} style={{ color: fn.textColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-white text-sm">{fn.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${fn.textColor}25`, color: fn.textColor }}
                  >
                    {fn.hub}
                  </span>
                </div>
                <p className="text-purple-300 text-xs mt-0.5 leading-snug">{descriptions[fn.name]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
