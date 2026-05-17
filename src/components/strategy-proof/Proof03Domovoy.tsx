import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const scenarios = [
  { icon: 'MapPin' as const, text: 'Навигация по мерам поддержки и льготам' },
  { icon: 'GitBranch' as const, text: 'Жизненная ситуация → маршрут действий' },
  { icon: 'CalendarCheck' as const, text: 'Семейный план, цели и напоминания' },
  { icon: 'FolderClock' as const, text: 'Документы, сроки и задачи семьи' },
  { icon: 'Handshake' as const, text: 'Переход к релевантным партнёрским сервисам, включая банковские' },
];

export default function Proof03Domovoy() {
  return (
    <ProofSlideFrame
      id="proof-3"
      code="Д3"
      title="Домовой — оркестратор семейного контекста"
      subtitle="Слой навигации и действий на базе искусственного интеллекта. Связывает события, документы, задачи и партнёрские сервисы."
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2 bg-slate-900 text-white rounded-xl p-5 sm:p-6 flex flex-col justify-center">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-3">
            <Icon name="Bot" size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Не чат ради чата
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Доводит семью до следующего действия — рекомендации, переход в
            маршрут, релевантное предложение.
          </p>
        </div>

        <div className="md:col-span-3 grid grid-cols-1 gap-2.5">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
                <Icon name={s.icon} size={16} />
              </div>
              <span className="text-sm text-slate-800">{s.text}</span>
              <span className="ml-auto text-xs text-slate-400 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ProofSlideFrame>
  );
}
