import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

const segments = [
  { id: 1, label: 'Семья', color: '#ec4899', lightColor: '#fce7f3', icon: 'Users', items: ['Профили семьи', 'Семейное древо', 'Дорога жизни', 'Альбом поколений', 'Дети', 'Семейный маячок', 'Чат семьи'] },
  { id: 2, label: 'Здоровье', color: '#ef4444', lightColor: '#fee2e2', icon: 'Heart', items: ['Здоровье семьи'] },
  { id: 3, label: 'Питание', color: '#f97316', lightColor: '#ffedd5', icon: 'Apple', items: ['ИИ-Диета', 'Готовые режимы', 'Рецепт из продуктов', 'Счётчик БЖУ', 'Меню на неделю', 'Рецепты'] },
  { id: 4, label: 'Ценности', color: '#f59e0b', lightColor: '#fef3c7', icon: 'Sparkles', items: ['Вера', 'Традиции', 'Мудрость народа', 'Правила дома'] },
  { id: 5, label: 'Планирование', color: '#3b82f6', lightColor: '#dbeafe', icon: 'Calendar', items: ['Цели', 'Задачи', 'Календарь', 'План покупок', 'Аналитика'] },
  { id: 6, label: 'Финансы', color: '#10b981', lightColor: '#d1fae5', icon: 'Wallet', items: ['Финансовый пульс', 'Бюджет', 'Кредиты и долги', 'Цели', 'Антимошенник', 'Кошелёк сервиса'] },
  { id: 7, label: 'Дом и быт', color: '#f59e0b', lightColor: '#fef3c7', icon: 'Home', items: ['Покупки', 'Голосования', 'Транспорт', 'Дом'] },
  { id: 8, label: 'Путешествия', color: '#06b6d4', lightColor: '#cffafe', icon: 'Plane', items: ['Путешествия', 'Досуг', 'Праздники'] },
  { id: 9, label: 'Развитие', color: '#6366f1', lightColor: '#e0e7ff', icon: 'GraduationCap', items: ['Портфолио развития', 'Мастерская жизни', 'Психолог ИИ', 'ИИ-план развития'] },
  { id: 10, label: 'Семейный код', color: '#a855f7', lightColor: '#f3e8ff', icon: 'KeyRound', items: ['Личный код', 'Код пары', 'Код семьи', 'Имя для малыша', 'Астрология', 'Зеркало родителя'] },
  { id: 11, label: 'Питомцы', color: '#84cc16', lightColor: '#ecfccb', icon: 'PawPrint', items: ['ИИ-ветеринар', 'Вакцинация', 'Лекарства', 'Питание', 'Груминг', 'Расходы'] },
  { id: 12, label: 'Госуслуги', color: '#0d9488', lightColor: '#ccfbf1', icon: 'Landmark', items: ['Навигатор мер поддержки', 'Семейный кодекс РФ', 'Господдержка', 'Семейная политика', 'Новости'] },
];

function Ring() {
  const total = segments.length;
  const cx = 250;
  const cy = 250;
  const outerR = 240;
  const innerR = 140;
  const labelR = 192;

  const paths = segments.map((seg, i) => {
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const gap = 0.02;

    const x1 = cx + outerR * Math.cos(startAngle + gap);
    const y1 = cy + outerR * Math.sin(startAngle + gap);
    const x2 = cx + outerR * Math.cos(endAngle - gap);
    const y2 = cy + outerR * Math.sin(endAngle - gap);
    const x3 = cx + innerR * Math.cos(endAngle - gap);
    const y3 = cy + innerR * Math.sin(endAngle - gap);
    const x4 = cx + innerR * Math.cos(startAngle + gap);
    const y4 = cy + innerR * Math.sin(startAngle + gap);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const midAngle = (startAngle + endAngle) / 2;
    const lx = cx + labelR * Math.cos(midAngle);
    const ly = cy + labelR * Math.sin(midAngle);

    // Поворачиваем текст так, чтобы он шёл вдоль радиуса, и переворачиваем нижние, чтобы читались обычным образом
    let deg = (midAngle * 180) / Math.PI + 90;
    if (deg > 90 && deg < 270) {
      deg += 180;
    }

    return { ...seg, d, lx, ly, deg };
  });

  return (
    <svg viewBox="0 0 500 500" className="w-full max-w-[480px] mx-auto">
      {paths.map((seg) => {
        const isLong = seg.label.length > 11;
        const words = seg.label.split(' ');
        const showTwoLines = isLong && words.length > 1;
        return (
          <g key={seg.id}>
            <path d={seg.d} fill={seg.color} opacity={0.92} />
            {showTwoLines ? (
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="700"
                fill="white"
                transform={`rotate(${seg.deg}, ${seg.lx}, ${seg.ly})`}
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.18)', strokeWidth: 0.6 }}
              >
                <tspan x={seg.lx} y={seg.ly - 6}>{words[0]}</tspan>
                <tspan x={seg.lx} y={seg.ly + 8}>{words.slice(1).join(' ')}</tspan>
              </text>
            ) : (
              <text
                x={seg.lx}
                y={seg.ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fontWeight="700"
                fill="white"
                transform={`rotate(${seg.deg}, ${seg.lx}, ${seg.ly})`}
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.18)', strokeWidth: 0.6 }}
              >
                {seg.label}
              </text>
            )}
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={135} fill="white" filter="url(#shadow)" />
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#00000020" />
        </filter>
      </defs>

      <text x={cx} y={cy - 18} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">Наша</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="22" fontWeight="800" fill="#1e293b">Семья</text>
      <text x={cx} y={cy + 38} textAnchor="middle" fontSize="11" fill="#64748b">Цифровая</text>
      <text x={cx} y={cy + 56} textAnchor="middle" fontSize="11" fill="#64748b">экосистема</text>
    </svg>
  );
}

export function SlideEcosystem() {
  const [active, setActive] = useState<number | null>(null);
  const [printMode, setPrintMode] = useState(false);
  const activeSegment = segments.find((s) => s.id === active);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>;
      setPrintMode(!!ce.detail?.active);
    };
    window.addEventListener('presentation:print-mode', handler);
    return () => window.removeEventListener('presentation:print-mode', handler);
  }, []);

  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
          <Icon name="Orbit" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Карта экосистемы</h2>
          <p className="text-sm text-gray-500 mt-0.5">12 хабов в единой платформе «Наша Семья»</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="w-full lg:w-1/2">
          <Ring />
        </div>

        <div className="w-full lg:w-1/2 space-y-2">
          {!printMode && <p className="text-xs text-gray-400 mb-3">Нажмите на хаб, чтобы увидеть разделы</p>}

          {printMode ? (
            <div className="space-y-2">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  className="rounded-xl border p-3"
                  style={{ backgroundColor: seg.lightColor, borderColor: seg.color }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: seg.color }}>
                      <Icon name={seg.icon} size={12} className="text-white" />
                    </div>
                    <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seg.items.map((item, i) => (
                      <span key={i} className="text-[11px] bg-white px-2 py-0.5 rounded-md border font-medium text-gray-700" style={{ borderColor: seg.color }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {segments.map((seg) => (
                  <button
                    key={seg.id}
                    onClick={() => setActive(active === seg.id ? null : seg.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                      active === seg.id ? 'shadow-md scale-[1.02]' : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: active === seg.id ? seg.lightColor : '#f9fafb',
                      borderColor: active === seg.id ? seg.color : '#e5e7eb',
                    }}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: seg.color }}>
                      <Icon name={seg.icon} size={12} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{seg.label}</span>
                  </button>
                ))}
              </div>

              {activeSegment && (
                <div
                  className="mt-3 rounded-2xl p-4 border"
                  style={{ backgroundColor: activeSegment.lightColor, borderColor: activeSegment.color }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: activeSegment.color }}>
                    {activeSegment.label} — разделы:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSegment.items.map((item, i) => (
                      <span key={i} className="text-xs bg-white px-2.5 py-1 rounded-lg border font-medium text-gray-700" style={{ borderColor: activeSegment.color }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100 text-center">
        <p className="text-sm font-semibold text-purple-800">
          Единственная платформа в России, объединяющая все 12 направлений жизни семьи
        </p>
      </div>
    </section>
  );
}