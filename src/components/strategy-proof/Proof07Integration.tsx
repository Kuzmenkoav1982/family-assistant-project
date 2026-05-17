import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const stages = [
  {
    level: 'Уровень 1',
    title: 'Пилот / совместный запуск',
    icon: 'Rocket' as const,
    points: [
      'Размещение под двумя брендами',
      'Минимальный организационный порог',
      'Стартовые сценарии: меры поддержки, ЖКХ → банковский продукт',
      'Горизонт: 3–6 месяцев',
    ],
  },
  {
    level: 'Уровень 2',
    title: 'Глубокое стратегическое партнёрство',
    icon: 'Handshake' as const,
    points: [
      'Эксклюзивный трек',
      'Согласованные точки входа',
      'Расширение сценариев под задачи розницы',
      'Более тесная связка маршрутов и предложений',
    ],
  },
  {
    level: 'Уровень 3',
    title: 'Стратегическая интеграция в контур банка',
    icon: 'Building2' as const,
    points: [
      'Платформа становится частью банковской розницы',
      'Развитие под логикой и приоритетами банка',
      'Контроль над семейным клиентским слоем',
      'Ускоренный выход без сборки с нуля',
    ],
  },
];

export default function Proof07Integration() {
  return (
    <ProofSlideFrame
      id="proof-7"
      code="Д7"
      title="Поэтапное встраивание в контур банка"
      subtitle="Платформа может входить в банк поэтапно — от лёгкого запуска до глубокой интеграции, в зависимости от уровня интереса"
      footnote="Глубина интеграции ↑   /   организационная сложность ↑"
    >
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-4 md:items-start"
          >
            <div className="md:w-1/3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Icon name={s.icon} size={18} />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {s.level}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                  {s.title}
                </h3>
              </div>
            </div>
            <ul className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {s.points.map((p, j) => (
                <li
                  key={j}
                  className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 leading-snug"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ProofSlideFrame>
  );
}
