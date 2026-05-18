import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const TRIAD = [
  {
    k: 'mirror',
    title: 'Зеркало',
    sub: 'Где я сейчас',
    icon: 'LineChart',
    gradient: 'from-emerald-500 to-teal-500',
    to: '/portfolio',
    desc: 'Портфолио развития: сферы, достижения, следующий шаг.',
  },
  {
    k: 'compass',
    title: 'Компас',
    sub: 'Куда и зачем',
    icon: 'Compass',
    gradient: 'from-purple-600 to-pink-600',
    to: '/life-road',
    desc: 'Мастерская: длинные цели, методики, сезоны, смыслы.',
  },
  {
    k: 'engine',
    title: 'Двигатель',
    sub: 'Что делаю сейчас',
    icon: 'Zap',
    gradient: 'from-blue-500 to-cyan-500',
    to: '/planning-hub',
    desc: 'Планирование: задачи, привычки, календарь, ритуалы.',
  },
];

export default function WorkshopTriad() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {TRIAD.map((item) => (
        <button
          key={item.k}
          onClick={() => navigate(item.to)}
          className="text-left bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center mb-2`}>
            <Icon name={item.icon} size={18} />
          </div>
          <div className="text-sm font-bold text-gray-900">{item.title}</div>
          <div className="text-[11px] text-gray-500 mb-1.5">{item.sub}</div>
          <p className="text-xs text-gray-600">{item.desc}</p>
        </button>
      ))}
    </div>
  );
}
