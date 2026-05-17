import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const formats = [
  {
    icon: 'Rocket' as const,
    title: 'Пилот / совместный запуск',
    color: 'from-emerald-500 to-teal-600',
    points: [
      'Быстрая проверка ценности',
      'Размещение под двумя брендами',
      'Стартовые сценарии: меры поддержки, ЖКХ → банковский продукт',
      'Горизонт: 3–6 месяцев',
    ],
  },
  {
    icon: 'Handshake' as const,
    title: 'Глубокое стратегическое партнёрство',
    color: 'from-indigo-500 to-purple-600',
    points: [
      'Эксклюзивный трек',
      'Глубокая интеграция в розничный контур',
      'Совместная настройка сценариев и дистрибуции',
      'Расширение под брендом банка',
    ],
  },
  {
    icon: 'Building2' as const,
    title: 'Стратегическая интеграция в контур банка',
    color: 'from-amber-500 to-orange-600',
    points: [
      'Платформа становится частью банковской розницы',
      'Ускоренный выход в семейный сегмент без сборки с нуля',
      'Глубокая интеграция платформы в контур банка',
    ],
  },
];

export default function Slide11Formats() {
  return (
    <SlideFrame
      id="slide-11"
      eyebrow="Варианты взаимодействия"
      title="Варианты стратегического формата взаимодействия"
      subtitle="От лёгкого входа до глубокой интеграции — в зависимости от уровня интереса банка"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {formats.map((f, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
          >
            <div className={`bg-gradient-to-r ${f.color} px-5 py-5 sm:py-6`}>
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                <Icon name={f.icon} size={20} className="text-white" />
              </div>
              <div className="text-xs uppercase tracking-wider text-white/80 font-semibold mb-1">
                Формат {i + 1}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {f.title}
              </h3>
            </div>
            <div className="p-5 flex-1">
              <ul className="space-y-2.5">
                {f.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Icon
                      name="Check"
                      size={16}
                      className="text-emerald-600 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500 italic">
        Мы открыты к разной глубине стратегического формата — в зависимости от
        того, какой уровень интереса банк увидит.
      </p>
    </SlideFrame>
  );
}
