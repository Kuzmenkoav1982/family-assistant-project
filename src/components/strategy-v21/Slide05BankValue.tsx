import Icon from '@/components/ui/icon';
import SlideFrame from './SlideFrame';

const benefits = [
  {
    icon: 'Target' as const,
    title: 'Более точный момент предложения',
    text: 'Вход в сценарий, когда у семьи уже созрела потребность',
  },
  {
    icon: 'Layers' as const,
    title: 'Релевантные предложения в контексте',
    text: 'Вместо слепого размещения — предложение по ходу семейной жизни',
  },
  {
    icon: 'Heart' as const,
    title: 'Новый слой удержания семьи',
    text: 'Удержание не только за счёт отдельного клиента, а через домохозяйство',
  },
  {
    icon: 'Handshake' as const,
    title: 'Возможность входа под двумя брендами',
    text: 'Совместный запуск без тяжёлой перестройки',
  },
  {
    icon: 'TrendingUp' as const,
    title: 'Рост частоты касаний и качества допродаж',
    text: 'Контекст создаёт повод вернуться к клиенту в подходящий момент',
  },
];

const example = [
  { label: 'ЖКХ', icon: 'Home' as const },
  { label: 'Семейный расход', icon: 'Receipt' as const },
  { label: 'Признак нагрузки', icon: 'Activity' as const },
  { label: 'Релевантное предложение банка', icon: 'CreditCard' as const },
];

export default function Slide05BankValue() {
  return (
    <SlideFrame
      id="slide-5"
      eyebrow="Ценность для банка"
      title="Для банка это новый контекстный канал дистрибуции и удержания семьи"
      subtitle="Не баннер и не абстрактное размещение, а вход в момент, когда семейный сценарий уже созрел"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 hover:shadow-md transition"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Icon name={b.icon} size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{b.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{b.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200 rounded-2xl p-5 sm:p-7">
        <div className="text-xs uppercase tracking-wider text-amber-700 font-semibold mb-3">
          Пример сценария
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {example.map((step, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white rounded-xl px-3 py-2 sm:px-4 sm:py-3 border border-amber-200 shadow-sm flex items-center gap-2">
                <Icon name={step.icon} size={16} className="text-amber-700" />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  {step.label}
                </span>
              </div>
              {i < example.length - 1 && (
                <Icon name="ChevronRight" size={18} className="text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
