import Icon from '@/components/ui/icon';

/**
 * SlideFounderExecution — founder & execution model.
 *
 * НЕ делаем фейковую команду из 5 человек.
 * НЕ пишем «я один с ИИ всё делаю» в лоб.
 *
 * Подаём как founder-led AI-native execution model:
 *   - честно про текущее состояние
 *   - объясняем, почему это даёт высокую скорость
 *   - показываем, какие ключевые наймы закрываем после раунда
 *
 * Это закрывает «founder risk» как осознанную модель, а не как слабость.
 */

const founderResponsibilities = [
  {
    icon: 'Compass',
    title: 'Продукт и стратегия',
    desc: 'Видение платформы, продуктовые приоритеты, связка с Стратегией семейной политики РФ',
  },
  {
    icon: 'Boxes',
    title: 'Архитектура и AI-исполнение',
    desc: 'Архитектура Family OS, AI-слой «Домовой», внутренний DevAgent Studio',
  },
  {
    icon: 'Handshake',
    title: 'Партнёрства и каналы',
    desc: 'Банк-партнёр, MAX, регионы, B2G-каналы, GTM-стратегия',
  },
];

const executionAdvantages = [
  {
    icon: 'Zap',
    title: 'Высокая скорость поставки',
    desc: 'Короткий цикл «гипотеза → код → релиз». 146+ модулей собраны до публичного запуска.',
    metric: 'ежедневные релизы',
  },
  {
    icon: 'Wallet',
    title: 'Capital-efficient model',
    desc: 'AI-native разработка снижает CAC поставки фич. Низкий burn до product-market fit.',
    metric: 'низкий burn',
  },
  {
    icon: 'TestTube',
    title: 'Быстрая проверка гипотез',
    desc: 'Минимум согласований, прямой контакт с пользователями, быстрая итерация',
    metric: 'короткие циклы',
  },
  {
    icon: 'Shield',
    title: 'Низкий bus-factor по архитектуре',
    desc: 'DevAgent индексирует всю кодовую базу и снимает риск «знание в одной голове»',
    metric: 'DevAgent live',
  },
];

const postRoundHires = [
  {
    role: 'Platform / Backend Lead',
    purpose: 'Масштабирование архитектуры под 1М+ семей, B2G-интеграции',
    priority: 1,
  },
  {
    role: 'Growth / Distribution Lead',
    purpose: 'Каналы привлечения семей, банк-партнёрство, B2B2C',
    priority: 1,
  },
  {
    role: 'Product Design / UX',
    purpose: 'Дизайн-система, межпоколенческий UX, mobile-приложения',
    priority: 2,
  },
  {
    role: 'B2G / Регионы',
    purpose: 'Региональные пилоты, госпрограммы, реестр ПО',
    priority: 2,
  },
];

export function SlideFounderExecution() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-indigo-100"
    >
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
          <Icon name="UserCog" size={26} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Icon name="Sparkles" size={11} />
            Founder & execution model
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
            Почему мы способны это исполнить
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Founder-led AI-native execution — высокая скорость, низкий burn, дисциплинированная
            поставка
          </p>
        </div>
      </div>

      {/* Основатель */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200 mb-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Основатель
            </p>
            <p className="text-lg font-bold text-gray-900">Кузьменко Алексей</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Ведёт продукт, архитектуру и AI-исполнение платформы
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          {founderResponsibilities.map((r) => (
            <div key={r.title} className="bg-white rounded-xl p-3 border border-indigo-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name={r.icon} size={14} className="text-indigo-600" />
                <p className="text-xs font-bold text-gray-900">{r.title}</p>
              </div>
              <p className="text-[11px] text-gray-600 leading-snug">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Execution model — преимущества */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Rocket" size={14} className="text-purple-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Что даёт founder-led AI-native модель
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {executionAdvantages.map((a) => (
            <div
              key={a.title}
              className="flex gap-3 p-3 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name={a.icon} size={18} className="text-purple-700" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{a.title}</p>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {a.metric}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Какие наймы закроем после раунда */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Users" size={16} className="text-amber-700" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Ключевые наймы после раунда
            </p>
            <p className="text-[11px] text-amber-700">
              Постепенный переход от founder-led к founder + core team
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {postRoundHires.map((h) => (
            <div
              key={h.role}
              className="bg-white rounded-xl p-3 border border-amber-100 flex items-start gap-2"
            >
              <span
                className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                  h.priority === 1
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                P{h.priority}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{h.role}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{h.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest framing */}
      <div className="mt-4 flex items-start gap-2 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
        <Icon name="Info" size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Сегодня платформа строится в founder-led AI-native модели — это даёт высокую скорость
          поставки и низкий burn до product-market fit. После раунда модель эволюционирует в
          «founder + core team» с приоритетом на platform, growth и B2G-каналы.
        </p>
      </div>
    </section>
  );
}

export default SlideFounderExecution;