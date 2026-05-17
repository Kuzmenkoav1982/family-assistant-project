import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const clusters = [
  {
    icon: 'Compass' as const,
    title: 'Поддержка и маршруты',
    color: 'from-indigo-500 to-blue-500',
    hubs: ['Меры поддержки', 'Жизненные маршруты', 'Документы и сроки'],
  },
  {
    icon: 'Calendar' as const,
    title: 'Организация семьи',
    color: 'from-purple-500 to-pink-500',
    hubs: ['Семейные задачи', 'Расходы', 'События'],
  },
  {
    icon: 'Sparkles' as const,
    title: 'Развитие и цели',
    color: 'from-amber-500 to-orange-500',
    hubs: ['Дети и развитие', 'Семейные цели', 'Планирование'],
  },
  {
    icon: 'BookHeart' as const,
    title: 'Память и история',
    color: 'from-rose-500 to-red-500',
    hubs: ['Семейная хроника', 'Важные события', 'Традиции'],
  },
];

export default function Slide06Platform() {
  return (
    <SlideFrame
      id="slide-6"
      eyebrow="Что такое Наша Семья"
      title="Наша Семья объединяет ключевые семейные сценарии в одну платформу"
      subtitle="Это не каталог разделов, а единая среда, где семейный контекст связывается в действия и маршруты"
    >
      <div className="flex items-center gap-3 mb-6 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 inline-flex">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
          12
        </div>
        <span className="text-sm sm:text-base font-medium text-slate-800">
          продуктовых хабов в едином контуре
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((c, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition"
          >
            <div className={`bg-gradient-to-r ${c.color} px-5 py-4 flex items-center gap-3`}>
              <Icon name={c.icon} size={22} className="text-white" />
              <h3 className="text-base sm:text-lg font-bold text-white">{c.title}</h3>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-2">
                {c.hubs.map((h, j) => (
                  <span
                    key={j}
                    className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
