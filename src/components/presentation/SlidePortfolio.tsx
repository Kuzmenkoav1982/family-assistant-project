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
    title: 'Портфолио развития',
    desc: 'Живая карта по 8 сферам с понятным уровнем полноты данных. Даёт целостную картину роста, а не разрозненные оценки.',
    icon: 'Radar',
  },
  {
    title: 'Прозрачные источники',
    desc: '40+ типов сигналов: семейные наблюдения, достижения, события, данные профиля и других разделов. По каждому выводу видно, на чём он основан.',
    icon: 'Route',
  },
  {
    title: 'Следующий лучший шаг',
    desc: 'Раздел не только показывает состояние, но и ведёт в действие: что дополнить, что обсудить, куда перейти и какой навык развивать дальше.',
    icon: 'Compass',
  },
  {
    title: 'Доверие и этика',
    desc: 'Это карта, а не диагноз. Если данных мало — система не делает вид, что знает больше. ИИ-советы всегда отделены от правил и наблюдений.',
    icon: 'ShieldCheck',
  },
];

const signalSources = [
  { name: 'Древо', icon: 'TreePine' },
  { name: 'Дорога жизни', icon: 'Route' },
  { name: 'Цели', icon: 'Target' },
  { name: 'Достижения', icon: 'Trophy' },
  { name: 'Наблюдения', icon: 'Eye' },
  { name: 'Профиль', icon: 'User' },
];

const investorBullets = [
  'Объединяет данные из разных разделов в одну понятную картину',
  'Создаёт регулярный повод возвращаться в продукт',
  'Повышает вовлечённость между разделами платформы',
  'Формирует сильную ценность для детей и взрослых внутри одной семьи',
];

export function SlidePortfolio() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
      {/* HERO */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 md:p-12 text-white">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Icon name="Sprout" size={32} className="text-white" fallback="TreeDeciduous" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-1">
              Флагманский хаб
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Развитие — семейный хаб роста
            </h2>
            <p className="text-base md:text-lg text-white/90 mt-2">
              Единый хаб, который собирает сигналы со всей платформы и превращает их в понятную
              карту развития для каждого члена семьи — ребёнка и взрослого. Не диагноз и не
              ярлык — инструмент понимания, роста и следующего шага.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-6">
        {/* 8 СФЕР */}
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

        {/* МИНИ-СХЕМА «ОТКУДА ПРИХОДЯТ СИГНАЛЫ» */}
        <div className="rounded-2xl border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-3">
            Как это работает
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Источники */}
            <div className="flex flex-wrap items-center gap-1.5 md:flex-1">
              {signalSources.map((src) => (
                <div
                  key={src.name}
                  className="flex items-center gap-1.5 rounded-full bg-white border border-emerald-200 px-2.5 py-1 text-xs text-gray-700 shadow-sm"
                >
                  <Icon name={src.icon} size={12} className="text-emerald-600" />
                  {src.name}
                </div>
              ))}
            </div>
            {/* Стрелка */}
            <div className="flex items-center justify-center text-emerald-500">
              <Icon name="ArrowRight" size={20} className="hidden md:block" />
              <Icon name="ArrowDown" size={20} className="md:hidden" />
            </div>
            {/* Хаб */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 px-4 py-2 text-white shadow-md md:flex-shrink-0">
              <Icon name="Sprout" size={16} />
              <span className="text-sm font-semibold">Хаб «Развитие»</span>
            </div>
            {/* Стрелка */}
            <div className="flex items-center justify-center text-emerald-500">
              <Icon name="ArrowRight" size={20} className="hidden md:block" />
              <Icon name="ArrowDown" size={20} className="md:hidden" />
            </div>
            {/* Результат */}
            <div className="flex flex-col gap-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs text-gray-700 md:flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Icon name="Map" size={12} className="text-emerald-600" />
                <span>Карта роста</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="Lightbulb" size={12} className="text-emerald-600" />
                <span>Рекомендации</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="MoveRight" size={12} className="text-emerald-600" />
                <span>Переходы в действия</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 КАРТОЧКИ */}
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

        {/* 4 ЦИФРЫ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { value: '8', label: 'сфер развития' },
            { value: '40+', label: 'типов сигналов' },
            { value: '3', label: 'типа рекомендаций', hint: 'ИИ / правило / наблюдение' },
            { value: '4', label: 'принципа доверия' },
          ].map((m) => (
            <div
              key={m.label}
              className="text-center p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl border border-emerald-300"
            >
              <div className="text-2xl md:text-3xl font-black text-emerald-700">{m.value}</div>
              <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 leading-tight">
                {m.label}
              </div>
              {m.hint && (
                <div className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 leading-tight">
                  {m.hint}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ИНВЕСТОРСКИЙ БЛОК */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-900 rounded-2xl p-5 md:p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShieldCheck" size={18} className="text-emerald-300" />
            <p className="font-bold text-sm md:text-base">Почему это важно инвестору</p>
          </div>
          <p className="text-sm text-emerald-100 leading-relaxed mb-3">
            «Развитие» — это не отдельный экран, а value hub, который связывает всю платформу в
            единый сценарий использования. Чем больше семья пользуется продуктом, тем полезнее и
            точнее становится карта роста.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {investorBullets.map((t) => (
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
