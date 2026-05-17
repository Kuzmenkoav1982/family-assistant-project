import Icon from '@/components/ui/icon';

/**
 * SlideMarketGTM — рынок и точка входа.
 *
 * Не делаем псевдонаучный TAM/SAM/SOM с раздутыми цифрами.
 * Делаем честную картинку: рынок семей в РФ, wedge-аудитория,
 * каналы привлечения, направления расширения.
 */

const marketLayers = [
  {
    label: 'Семей в РФ',
    value: '~42 млн',
    sub: 'Росстат, домохозяйств с детьми и без',
    color: 'from-slate-100 to-slate-200',
    text: 'text-slate-800',
    icon: 'Users',
  },
  {
    label: 'Цифрово активные семьи',
    value: '~15 млн',
    sub: 'Регулярные пользователи онлайн-сервисов',
    color: 'from-blue-100 to-indigo-100',
    text: 'text-indigo-800',
    icon: 'Smartphone',
  },
  {
    label: 'Первая wedge-аудитория',
    value: '~3 млн',
    sub: 'Родители 25–45 с детьми, активный family digital',
    color: 'from-emerald-100 to-teal-100',
    text: 'text-emerald-800',
    icon: 'Target',
  },
];

const channels = [
  {
    icon: 'Users',
    title: 'Direct B2C',
    desc: 'Прямое привлечение через web, мобильные приложения, ASO/SEO',
    weight: 'основа',
  },
  {
    icon: 'Landmark',
    title: 'Банк-партнёр',
    desc: 'Витрина семейных продуктов внутри банковского приложения. Win-win комиссия',
    weight: 'GTM-ускоритель',
  },
  {
    icon: 'Building2',
    title: 'B2B2C через работодателей',
    desc: 'Семейные benefits в HR-пакете крупных компаний',
    weight: 'enterprise-канал',
  },
  {
    icon: 'MapPin',
    title: 'Регионы и B2G',
    desc: 'Региональные пилоты, семейные центры, программы поддержки',
    weight: 'долгосрочный',
  },
  {
    icon: 'MessageSquare',
    title: 'MAX-бот и мессенджеры',
    desc: 'Канал и чат-бот в MAX, лёгкая точка входа без установки',
    weight: 'low-friction',
  },
];

const expansionDirections = [
  'Поддержка многодетных и приёмных семей',
  'Образование и развитие детей',
  'Семейный finance / страхование',
  'Межпоколенческий архив и наследие',
  'Туризм и семейный досуг',
  'Здоровье и медкарты семьи',
];

export function SlideMarketGTM() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-blue-100"
    >
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
          <Icon name="Globe2" size={26} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Icon name="Target" size={11} />
            Market & GTM
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
            Рынок, точка входа и каналы привлечения
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Заходим через цифрово активные семьи с детьми, расширяемся по горизонтали и вертикали
          </p>
        </div>
      </div>

      {/* Воронка рынка */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Layers" size={14} className="text-slate-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Воронка рынка
          </p>
        </div>

        <div className="space-y-2">
          {marketLayers.map((l, i) => (
            <div
              key={l.label}
              className={`bg-gradient-to-r ${l.color} rounded-2xl p-4 border border-slate-200/50`}
              style={{ marginLeft: `${i * 4}%`, marginRight: `${i * 4}%` }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon name={l.icon} size={18} className={l.text} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${l.text}`}>{l.label}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{l.sub}</p>
                  </div>
                </div>
                <p className={`text-2xl sm:text-3xl font-black ${l.text} flex-shrink-0`}>
                  {l.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed text-center">
          Оценки опираются на открытые данные Росстата и индустриальную аналитику. Уточняются под
          конкретные продуктовые когорты.
        </p>
      </div>

      {/* Каналы привлечения */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Network" size={14} className="text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            GTM-каналы
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {channels.map((c) => (
            <div
              key={c.title}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-3 border border-indigo-100"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon name={c.icon} size={16} className="text-indigo-700" />
                </div>
                <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  {c.weight}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{c.title}</p>
              <p className="text-[11px] text-gray-600 mt-1 leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Направления расширения */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Expand" size={14} className="text-amber-700" />
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Направления расширения после wedge
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {expansionDirections.map((d) => (
            <div
              key={d}
              className="flex items-start gap-1.5 bg-white rounded-lg p-2 border border-amber-100"
            >
              <Icon name="ArrowUpRight" size={11} className="text-amber-700 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-gray-700 leading-snug">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SlideMarketGTM;
