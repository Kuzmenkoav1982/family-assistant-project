import Icon from '@/components/ui/icon';

interface CycleCard {
  id: string;
  order: number;
  title: string;
  question: string;
  description: string;
  icon: string;
  color: string;        // tailwind from-… to-…
  borderColor: string;  // tailwind border-…
  bgColor: string;      // tailwind bg-…/…
  textColor: string;    // tailwind text-…
}

// 5 циклов жизни семьи — концептуальный каркас «Семейной ОС».
// Это горизонтальный разрез поверх всех хабов: один продукт работает
// в пяти фазах жизни семьи последовательно и циклично.
const CYCLES: CycleCard[] = [
  {
    id: 'collect',
    order: 1,
    title: 'Сбор',
    question: 'Что у нас есть?',
    description: 'Семья накапливает факты о себе: состав, здоровье, питание, деньги, имущество, государственные права.',
    icon: 'Database',
    color: 'from-slate-400 to-slate-600',
    borderColor: 'border-slate-200',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
  },
  {
    id: 'panorama',
    order: 2,
    title: 'Панорама',
    question: 'Какая у нас картина?',
    description: 'Из сырых данных рождаются обзоры, дашборды, прогнозы и портфолио. Семья видит себя целиком.',
    icon: 'LayoutDashboard',
    color: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
  {
    id: 'reflect',
    order: 3,
    title: 'Осмысление',
    question: 'Что для нас важно?',
    description: 'ИИ-психолог, мастерская жизни, зеркало родителя — пространство тихого размышления и инсайтов.',
    icon: 'Lightbulb',
    color: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
  },
  {
    id: 'agree',
    order: 4,
    title: 'Договорённости',
    question: 'О чём мы договорились?',
    description: 'Семейный код: личные, парные, семейные, детские принципы. Правила дома и ритуалы — как закреплённые решения.',
    icon: 'ScrollText',
    color: 'from-fuchsia-400 to-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    id: 'execute',
    order: 5,
    title: 'Исполнение',
    question: 'Как мы это сделаем?',
    description: 'Цели, задачи, календарь, покупки, поездки. Решения превращаются в шаги — и возвращаются обратно в Сбор.',
    icon: 'Target',
    color: 'from-blue-400 to-violet-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
];

export default function WelcomeFamilyOS() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-slate-50 via-white to-violet-50/40">
      <div className="max-w-6xl mx-auto px-4">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="Layers" size={16} />
            Концепция «Семейной ОС»
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
            5 циклов жизни семьи
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Один продукт работает в пяти фазах. От накопления фактов — к общей картине, осмыслению, договорённостям и ежедневному исполнению. Цикл замыкается, и всё начинается заново — на новом уровне.
          </p>
        </div>

        {/* Карточки циклов — горизонтальный поток */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
          {CYCLES.map((cycle, idx) => (
            <div key={cycle.id} className="relative">
              <div className={`rounded-2xl border-2 ${cycle.borderColor} ${cycle.bgColor} p-4 h-full flex flex-col`}>
                {/* Номер + иконка */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cycle.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon name={cycle.icon} size={20} />
                  </div>
                  <span className={`text-[10px] font-bold ${cycle.textColor} uppercase tracking-wider`}>
                    Фаза {cycle.order}
                  </span>
                </div>

                {/* Заголовок */}
                <h3 className={`text-lg font-bold ${cycle.textColor} leading-tight mb-1`}>
                  {cycle.title}
                </h3>

                {/* Вопрос */}
                <p className="text-sm text-gray-800 italic font-medium mb-2 leading-snug">
                  «{cycle.question}»
                </p>

                {/* Описание */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cycle.description}
                </p>
              </div>

              {/* Стрелка между фазами (только на десктопе) */}
              {idx < CYCLES.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm">
                  <Icon name="ChevronRight" size={11} className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Петля обратной связи */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shrink-0">
            <Icon name="RefreshCcw" size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 mb-0.5">Петля обратной связи</p>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Результаты «Исполнения» (выполненные задачи, потраченные деньги, состоявшиеся поездки) возвращаются в «Сбор» как новые факты. Семья видит обновлённую картину — цикл запускается заново на новом уровне.
            </p>
          </div>
        </div>

        {/* Подитог: дифференциатор */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Compass" size={15} className="text-violet-600" />
              <h4 className="text-sm font-bold text-slate-800">Не «ещё один органайзер»</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Большинство приложений живут в одной фазе (задачи или бюджет). У нас — все пять фаз одной семьи.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Heart" size={15} className="text-pink-600" />
              <h4 className="text-sm font-bold text-slate-800">Смысловой слой</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Семейный код, Мастерская жизни, Зеркало родителя — наш редкий дифференциатор. Это пространство договорённостей и осмысления, которое живёт прямо в продукте.
            </p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Sparkles" size={15} className="text-amber-600" />
              <h4 className="text-sm font-bold text-slate-800">Один ритм для всех</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Семья как единый клиент: общая картина, общие договорённости, общее исполнение. Без хаоса разных приложений.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}