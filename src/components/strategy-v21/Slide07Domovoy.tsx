import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const scenarios = [
  {
    icon: 'MapPin' as const,
    title: 'Навигация по мерам поддержки и льготам',
  },
  {
    icon: 'GitBranch' as const,
    title: 'Жизненная ситуация → маршрут действий',
  },
  {
    icon: 'CalendarCheck' as const,
    title: 'Семейный план, цели и напоминания',
  },
  {
    icon: 'FolderClock' as const,
    title: 'Документы, сроки и задачи семьи',
  },
  {
    icon: 'Handshake' as const,
    title: 'Переход к релевантным партнёрским сервисам, включая банковские',
  },
];

export default function Slide07Domovoy() {
  return (
    <SlideFrame
      id="slide-7"
      eyebrow="Домовой"
      title="Домовой превращает семейный контекст в действия, рекомендации и маршруты"
      subtitle="Не чат ради чата — а слой навигации и действий поверх семейных сценариев на базе искусственного интеллекта"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-3">
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-center">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-4">
            <Icon name="Bot" size={28} className="text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-3">Оркестратор семейного контекста</h3>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Связывает хабы, события, задачи, документы, меры поддержки и
            партнёрские сервисы. Доводит семью до следующего действия.
          </p>
        </div>

        <div className="md:col-span-3 grid grid-cols-1 gap-3">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 sm:py-4 flex items-center gap-4 hover:border-indigo-300 transition"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <Icon name={s.icon} size={18} />
              </div>
              <div className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                {s.title}
              </div>
              <div className="ml-auto text-xs text-slate-400 font-medium">
                {String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-semibold text-amber-900">Важно для банка:</span>{' '}
          банковский сценарий встраивается в уже созревший маршрут, а не
          навязывается извне.
        </p>
      </div>
    </SlideFrame>
  );
}
