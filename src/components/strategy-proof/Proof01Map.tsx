import Icon from '@/components/ui/icon';
import ProofSlideFrame from './ProofSlideFrame';

const clusters = [
  {
    icon: 'Compass' as const,
    title: 'Поддержка и маршруты',
    hubs: ['Меры поддержки', 'Жизненные маршруты', 'Документы и сроки'],
  },
  {
    icon: 'Calendar' as const,
    title: 'Организация семьи',
    hubs: ['Семейные задачи', 'Семейные расходы', 'События'],
  },
  {
    icon: 'Sparkles' as const,
    title: 'Развитие и цели',
    hubs: ['Дети и развитие', 'Семейные цели', 'Планирование'],
  },
  {
    icon: 'BookHeart' as const,
    title: 'Память и история',
    hubs: ['Семейная хроника', 'Важные события', 'Традиции'],
  },
];

export default function Proof01Map() {
  return (
    <ProofSlideFrame
      id="proof-1"
      code="Д1"
      title="Карта платформы"
      subtitle="12 продуктовых хабов в 4 кластерах, объединённых семейным контекстом"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((c, i) => (
          <div
            key={i}
            className="border border-slate-200 rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Icon name={c.icon} size={18} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                {c.title}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {c.hubs.map((h, j) => (
                <span
                  key={j}
                  className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-slate-700"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1 font-medium text-indigo-700">
          Семейный ID
        </span>
        <span>— общий ключ для всех кластеров, событий, документов и задач</span>
      </div>
    </ProofSlideFrame>
  );
}
