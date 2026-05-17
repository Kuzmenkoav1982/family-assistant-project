import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const channels = [
  { icon: 'FileText' as const, label: 'Документы' },
  { icon: 'HandCoins' as const, label: 'Выплаты и льготы' },
  { icon: 'Wallet' as const, label: 'Семейные расходы' },
  { icon: 'ListChecks' as const, label: 'Задачи и сроки' },
  { icon: 'GraduationCap' as const, label: 'Развитие детей' },
  { icon: 'Home' as const, label: 'Бытовые сценарии' },
];

const consequences = [
  'Ручные сценарии и потерянное время',
  'Упущенные меры поддержки и сроки',
  'Партнёр не видит момент, когда предложение уместно',
  'Слепое размещение вместо контекста',
];

export default function Slide03Problem() {
  return (
    <SlideFrame
      id="slide-3"
      eyebrow="Проблема"
      title="Сегодня семья живёт в разрозненном цифровом контуре"
      subtitle="Это не только социальная проблема — это проблема клиентского контура и дистрибуции"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
            Разрозненные сервисы и каналы
          </div>
          <div className="grid grid-cols-2 gap-3">
            {channels.map((ch, i) => (
              <div
                key={i}
                className="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-100"
              >
                <Icon name={ch.icon} size={18} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{ch.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold text-rose-700 mb-3 uppercase tracking-wider">
            Последствия
          </div>
          <ul className="space-y-3">
            {consequences.map((text, i) => (
              <li
                key={i}
                className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 flex items-start gap-3"
              >
                <Icon name="AlertCircle" size={18} className="text-rose-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-800 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}
