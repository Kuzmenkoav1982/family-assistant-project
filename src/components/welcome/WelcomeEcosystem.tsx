import { useState } from 'react';
import Icon from '@/components/ui/icon';

const hubs = [
  { name: 'Семья', icon: 'Users', color: '#E91E8C', angle: 15 },
  { name: 'Здоровье', icon: 'Heart', color: '#E53935', angle: 45 },
  { name: 'Питание', icon: 'Apple', color: '#FF7043', angle: 75 },
  { name: 'Ценности', icon: 'Star', color: '#FFA726', angle: 105 },
  { name: 'Планирование', icon: 'Calendar', color: '#42A5F5', angle: 135 },
  { name: 'Финансы', icon: 'Wallet', color: '#26A69A', angle: 165 },
  { name: 'Быт', icon: 'Home', color: '#FFC107', angle: 195 },
  { name: 'Путешествия', icon: 'Compass', color: '#26C6DA', angle: 225 },
  { name: 'Развитие', icon: 'Brain', color: '#7E57C2', angle: 255 },
  { name: 'Семейный код', icon: 'Key', color: '#AB47BC', angle: 285 },
  { name: 'Питомцы', icon: 'PawPrint', color: '#66BB6A', angle: 315 },
  { name: 'Госуслуги', icon: 'Building', color: '#29B6F6', angle: 345 },
];

function polarToXY(angleDeg: number, r: number, cx: number, cy: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export default function WelcomeEcosystem() {
  const [active, setActive] = useState<number | null>(null);

  const cx = 160;
  const cy = 160;
  const outerR = 130;
  const innerR = 70;
  const segCount = hubs.length;
  const segAngle = 360 / segCount;
  const gap = 3;

  function describeArc(startAngle: number, endAngle: number, r1: number, r2: number) {
    const toRad = (a: number) => ((a - 90) * Math.PI) / 180;
    const s1 = { x: cx + r2 * Math.cos(toRad(startAngle + gap / 2)), y: cy + r2 * Math.sin(toRad(startAngle + gap / 2)) };
    const e1 = { x: cx + r2 * Math.cos(toRad(endAngle - gap / 2)), y: cy + r2 * Math.sin(toRad(endAngle - gap / 2)) };
    const s2 = { x: cx + r1 * Math.cos(toRad(endAngle - gap / 2)), y: cy + r1 * Math.sin(toRad(endAngle - gap / 2)) };
    const e2 = { x: cx + r1 * Math.cos(toRad(startAngle + gap / 2)), y: cy + r1 * Math.sin(toRad(startAngle + gap / 2)) };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${s1.x} ${s1.y} A ${r2} ${r2} 0 ${largeArc} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${r1} ${r1} 0 ${largeArc} 0 ${e2.x} ${e2.y} Z`;
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon name="Globe" size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Карта экосистемы</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-0.5">12 хабов в единой платформе «Наша Семья»</p>
          </div>
        </div>

        {/* Wheel */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-[360px]">
            <svg viewBox="0 0 320 320" className="w-full drop-shadow-md">
              {/* Segments */}
              {hubs.map((hub, i) => {
                const startAngle = i * segAngle;
                const endAngle = startAngle + segAngle;
                const mid = startAngle + segAngle / 2;
                const labelPos = polarToXY(mid, (outerR + innerR) / 2 - 2, cx, cy);
                const isActive = active === i;

                return (
                  <g
                    key={i}
                    onClick={() => setActive(isActive ? null : i)}
                    className="cursor-pointer"
                    style={{ transition: 'transform 0.2s', transform: isActive ? `scale(1.04)` : 'scale(1)', transformOrigin: `${cx}px ${cy}px` }}
                  >
                    <path
                      d={describeArc(startAngle, endAngle, innerR, outerR)}
                      fill={hub.color}
                      opacity={active !== null && !isActive ? 0.55 : 1}
                      stroke="white"
                      strokeWidth="2"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="8.5"
                      fontWeight="600"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                      transform={`rotate(${mid}, ${labelPos.x}, ${labelPos.y})`}
                    >
                      {hub.name}
                    </text>
                  </g>
                );
              })}

              {/* Center */}
              <circle cx={cx} cy={cy} r={innerR - 2} fill="white" />
              <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1a1a2e">
                Наша
              </text>
              <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#1a1a2e">
                Семья
              </text>
              <text x={cx} y={cy + 24} textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fill="#9ca3af">
                Цифровая экосистема
              </text>
            </svg>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mb-6">Нажмите на хаб, чтобы узнать подробнее</p>

        {/* Hub grid */}
        <div className="grid grid-cols-2 gap-3">
          {hubs.map((hub, i) => (
            <button
              key={i}
              onClick={() => setActive(active === i ? null : i)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                active === i
                  ? 'border-transparent shadow-lg scale-[1.02]'
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}
              style={active === i ? { background: `${hub.color}15`, borderColor: hub.color } : {}}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${hub.color}20` }}
              >
                <Icon name={hub.icon} size={18} style={{ color: hub.color }} />
              </div>
              <span className="font-semibold text-gray-800 text-sm">{hub.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
