import Icon from '@/components/ui/icon';

const spheres = [
  { name: 'Интеллект', icon: 'Brain', color: 'from-blue-500 to-indigo-500' },
  { name: 'Эмоции', icon: 'Heart', color: 'from-pink-500 to-rose-500' },
  { name: 'Тело', icon: 'Activity', color: 'from-emerald-500 to-teal-500' },
  { name: 'Творчество', icon: 'Palette', color: 'from-purple-500 to-fuchsia-500' },
  { name: 'Общение', icon: 'Users', color: 'from-amber-500 to-orange-500' },
  { name: 'Финансы', icon: 'PiggyBank', color: 'from-yellow-500 to-amber-500' },
  { name: 'Ценности', icon: 'Sparkles', color: 'from-violet-500 to-purple-500' },
  { name: 'Навыки жизни', icon: 'Wrench', color: 'from-slate-500 to-gray-600' },
];

const layers = [
  {
    title: 'Радар развития',
    desc: 'Карта по 8 сферам с показателем полноты данных. Цвет точки честно говорит: «полная картина», «предварительно» или «данных мало»',
    icon: 'Radar',
  },
  {
    title: 'Маршрутизатор источников',
    desc: '40+ типов источников с deep-link «Открыть раздел». Маркировка категорий: оценка родителя, семейные данные, автоматические, достижения',
    icon: 'Route',
  },
  {
    title: 'Совет ИИ + правила',
    desc: 'Подсказки родителю с фиолетовым бейджем «ИИ» отдельно от детерминистских правил. Popover «Почему советуем?» по каждой подсказке',
    icon: 'Lightbulb',
  },
  {
    title: 'Этика «карта, а не диагноз»',
    desc: 'Trust-блок «Это не диагноз и не ярлык», страница «О методике», 5 точек контекстной помощи «Как читать?»',
    icon: 'ShieldCheck',
  },
];

const trustPoints = [
  'Прозрачные источники: видно, на чём основана каждая оценка',
  'Сравнение только с собой во времени, не с другими',
  'Если данных по сфере мало — балл не показывается',
  'Все рекомендации помечены: совет ИИ, правило, наблюдение',
];

export function SlidePortfolio() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Icon name="Sprout" size={32} className="text-white" fallback="TreeDeciduous" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-1">
              Флагманская фича · 2026
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Портфолио развития
            </h2>
            <p className="text-base md:text-lg text-white/90 mt-2">
              Живая карта по 8 сферам для каждого члена семьи — и ребёнка, и взрослого. Не диагноз, не ярлык — карта роста.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
            8 сфер развития
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {spheres.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2 p-2 md:p-3 bg-emerald-50 rounded-xl border border-emerald-200"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-sm`}
                >
                  <Icon name={s.icon} size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800 truncate">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
            4 слоя продукта
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {layers.map((layer) => (
              <div
                key={layer.title}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon name={layer.icon} size={18} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                    {layer.title}
                  </h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{layer.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { value: '8', label: 'сфер развития' },
            { value: '40+', label: 'типов источников' },
            { value: '15', label: 'компонентов раздела' },
            { value: '4', label: 'события аналитики пилота' },
          ].map((m) => (
            <div
              key={m.label}
              className="text-center p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl border border-emerald-300"
            >
              <div className="text-2xl md:text-3xl font-black text-emerald-700">{m.value}</div>
              <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 leading-tight">
                {m.label}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-2xl p-5 md:p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShieldCheck" size={18} className="text-emerald-300" />
            <p className="font-bold text-sm md:text-base">Почему это важно для инвестора</p>
          </div>
          <p className="text-sm text-emerald-100 leading-relaxed mb-3">
            Спокойствие за развитие близких — главная ценность, за которую платят. Раздел работает
            и для детей, и для взрослых. Ни один конкурент в РФ не строит карту развития по данным
            семьи с прозрачностью источников и этикой «карта, а не диагноз». Это удержание + LTV +
            основа для образовательного B2B.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {trustPoints.map((t) => (
              <div key={t} className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <span className="text-xs md:text-sm text-emerald-50">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SlidePortfolio;