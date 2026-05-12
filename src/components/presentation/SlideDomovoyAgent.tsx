import Icon from '@/components/ui/icon';

/**
 * Слайд: «Домовой — AI-агент с памятью семьи».
 * Подача: технический слой и продуктовая монетизация в двух колонках,
 * без англицизмов и без обещаний полного автономного режима.
 */

const HOW_IT_WORKS = [
  {
    icon: 'Activity',
    text: 'живой контекст семьи собирается из ключевых модулей платформы',
  },
  {
    icon: 'Brain',
    text: 'сохраняется долговременная память',
  },
  {
    icon: 'UsersRound',
    text: 'роли и сценарии меняются под этап жизни семьи',
  },
  {
    icon: 'Compass',
    text: 'агент работает как единая точка входа в семейную ОС',
  },
];

const HOW_IT_MONETIZES = [
  {
    icon: 'TrendingUp',
    text: 'уровни взаимодействия и вовлечения',
  },
  {
    icon: 'Sparkles',
    text: 'платные усиления и дополнительные сценарии',
  },
  {
    icon: 'Heart',
    text: 'рост retention за счёт персональной памяти',
  },
  {
    icon: 'Wallet',
    text: 'дополнительная выручка поверх подписки',
  },
];

export const SlideDomovoyAgent = () => {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 border border-purple-100/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Icon name="Bot" size={12} />
          Домовой — AI-агент с памятью семьи
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Не чат-бот, а постоянный цифровой помощник внутри семейной системы
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Слой постоянных отношений с пользователем. Чем дольше семья живёт в системе, тем выше ценность продукта.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Левая колонка: как устроен */}
        <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-violet-200 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="Cpu" size={16} className="text-violet-700" />
            </div>
            <h3 className="text-[14px] font-bold text-violet-700 leading-tight">Как устроен</h3>
          </div>
          <div className="space-y-2">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-lg bg-white/70 border border-violet-100 p-2.5">
                <div className="w-7 h-7 rounded-md bg-white border border-violet-200 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} fallback="Circle" size={13} className="text-violet-700" />
                </div>
                <div className="text-[12px] text-gray-800 leading-snug pt-0.5">{item.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая колонка: как монетизируется */}
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name="Coins" size={16} className="text-emerald-700" />
            </div>
            <h3 className="text-[14px] font-bold text-emerald-700 leading-tight">Как монетизируется</h3>
          </div>
          <div className="space-y-2">
            {HOW_IT_MONETIZES.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 rounded-lg bg-white/70 border border-emerald-100 p-2.5">
                <div className="w-7 h-7 rounded-md bg-white border border-emerald-200 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} fallback="Circle" size={13} className="text-emerald-700" />
                </div>
                <div className="text-[12px] text-gray-800 leading-snug pt-0.5">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Инвесторский смысл */}
      <div className="mt-4 rounded-xl bg-gray-50 border p-3 text-[12px] text-gray-600 leading-relaxed">
        <strong className="text-gray-900">Почему это важно:</strong> высокая частота возвратов · уникальная
        продуктовая механика для российского рынка · рост LTV за счёт персонализированного взаимодействия.
      </div>
    </section>
  );
};

export default SlideDomovoyAgent;
