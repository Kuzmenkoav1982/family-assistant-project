import Icon from '@/components/ui/icon';

const layers = [
  {
    title: 'Карточка памяти',
    desc: 'Не файл и не папка, а осмысленная единица: 1–10 фото + люди + событие + дата + история. Это то, что передаётся поколениям.',
    icon: 'BookHeart',
  },
  {
    title: 'Связность с платформой',
    desc: 'Каждая память живёт на пересечении: человек из Древа, событие из Дороги жизни, тематический альбом. Одна карточка — много контекстов.',
    icon: 'Network',
  },
  {
    title: 'Тематические альбомы',
    desc: '«Предки», «Наша семья в 90-е», «Детство Матвея». Альбом — это коллекция, а не контейнер: одна память может быть в нескольких альбомах.',
    icon: 'Layers',
  },
  {
    title: 'Этика отбора',
    desc: 'Лимит 10 фото на карточку — это принцип, а не ограничение. Наследие — это отобранное и подписанное, а не свалка терабайтов фотохлама.',
    icon: 'ShieldCheck',
  },
];

const flowSteps = [
  { name: 'Древо', icon: 'TreePine', label: 'кто' },
  { name: 'Дорога жизни', icon: 'Route', label: 'когда' },
  { name: 'Альбомы', icon: 'BookHeart', label: 'тема' },
];

const investorBullets = [
  'Уникально высокий retention: семейные альбомы хранят десятилетиями',
  'Межпоколенческий use case: ценность растёт с возрастом продукта',
  'Естественная виральность: альбом доступен всей семье — каждый новый член семьи = новый пользователь',
  'Защитимый data moat: чем дольше семья пользуется, тем дороже выйти',
];

export function SlideFamilyMemory() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
      {/* HERO */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 p-8 md:p-12 text-white">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Icon name="BookHeart" size={32} className="text-white" fallback="Heart" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-amber-100 mb-1">
              Альбом поколений
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Семейная память — наследие поколений
            </h2>
            <p className="text-base md:text-lg text-white/90 mt-2">
              Не «ещё один Google Photos для семьи», а осознанный альбом поколений. Решает главную
              боль современности: тысячи фотографий — но никто не знает, кто на них, почему это
              важно и что передавать детям.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-6">
        {/* Главный принцип */}
        <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="Quote" size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-amber-950 leading-relaxed">
                Не хранить все фото семьи. Помогать семье превращать важные моменты в наследие.
              </p>
              <p className="text-xs md:text-sm text-amber-900/70 mt-1.5">
                Раньше бумажные альбомы передавались поколениями: отобранные, подписанные,
                связанные с людьми и событиями. Цифровая эпоха это потеряла. Мы возвращаем.
              </p>
            </div>
          </div>
        </div>

        {/* Как это работает */}
        <div className="rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/40 p-4 md:p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
            Тройная связность
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {flowSteps.map((step, idx) => (
              <div key={step.name} className="flex items-center gap-3 md:flex-col md:items-center">
                <div className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-4 py-3 shadow-sm md:flex-1">
                  <Icon name={step.icon} size={22} className="text-amber-600" />
                  <div className="text-sm font-semibold text-gray-900">{step.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-700">
                    {step.label}
                  </div>
                </div>
                {idx < flowSteps.length - 1 && (
                  <Icon
                    name="Plus"
                    size={16}
                    className="text-amber-400 md:rotate-0 md:-mx-1"
                  />
                )}
              </div>
            ))}
            <Icon
              name="ArrowRight"
              size={20}
              className="hidden text-amber-500 md:block md:mx-2"
            />
            <Icon name="ArrowDown" size={20} className="text-amber-500 md:hidden" />
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 px-4 py-3 text-white shadow-md">
              <Icon name="BookHeart" size={16} />
              <span className="text-sm font-semibold">Память</span>
            </div>
          </div>
        </div>

        {/* 4 слоя */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 mb-3">
            4 продуктовых принципа
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {layers.map((layer) => (
              <div
                key={layer.title}
                className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
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

        {/* 4 цифры */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { value: '10', label: 'фото в карточке', hint: 'принцип отбора' },
            { value: '3', label: 'точки входа', hint: 'память · человек · событие' },
            { value: '∞', label: 'альбомов', hint: 'память может быть в нескольких' },
            { value: '3', label: 'статуса жизни', hint: 'draft · published · archived' },
          ].map((m) => (
            <div
              key={m.label}
              className="text-center p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl border border-amber-300"
            >
              <div className="text-2xl md:text-3xl font-black text-amber-700">{m.value}</div>
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

        {/* Инвестор */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-900 rounded-2xl p-5 md:p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="TrendingUp" size={18} className="text-amber-300" />
            <p className="font-bold text-sm md:text-base">Почему это важно инвестору</p>
          </div>
          <p className="text-sm text-amber-100 leading-relaxed mb-3">
            Семейная память — продукт с самым длинным горизонтом удержания на рынке. Фотоальбомы
            семьи хранят 50–100 лет, передаются детям и внукам. Это создаёт уникальную для
            digital-продуктов комбинацию: высокий retention, межпоколенческая виральность и
            защитимый data moat, который растёт со временем.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {investorBullets.map((t) => (
              <div key={t} className="flex items-start gap-2">
                <Icon name="Check" size={14} className="text-amber-300 mt-0.5 flex-shrink-0" />
                <span className="text-xs md:text-sm text-amber-50">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SlideFamilyMemory;
