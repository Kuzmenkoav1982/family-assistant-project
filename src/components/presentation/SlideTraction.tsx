import Icon from '@/components/ui/icon';

/**
 * SlideTraction — proof of execution.
 *
 * Сейчас платформа находится на стадии closed beta перед публичным запуском.
 * Поэтому слайд показывает не пользовательские метрики (DAU/MAU),
 * а доказательство способности доставлять продукт: что уже shipped,
 * какие слои платформы работают, что готово к публичному запуску.
 *
 * Это намного честнее, чем выдуманные KPI, и снимает первый инвесторский
 * вопрос: «А есть ли вообще признаки жизни?»
 */

type Status = 'shipped' | 'beta' | 'next';

const STATUS_META: Record<Status, { label: string; chip: string; chipText: string; dot: string }> = {
  shipped: {
    label: 'Уже работает',
    chip: 'bg-emerald-100 border-emerald-300',
    chipText: 'text-emerald-800',
    dot: '#10b981',
  },
  beta: {
    label: 'Closed beta',
    chip: 'bg-amber-100 border-amber-300',
    chipText: 'text-amber-800',
    dot: '#f59e0b',
  },
  next: {
    label: 'Следующий шаг',
    chip: 'bg-blue-100 border-blue-300',
    chipText: 'text-blue-800',
    dot: '#3b82f6',
  },
};

// Что уже отгружено и работает в production
const shippedLayers = [
  {
    icon: 'LayoutGrid',
    title: '12 хабов · 74 раздела',
    desc: 'Полная карта жизни семьи в одном приложении — от Древа и Альбома поколений до Финансов и Поддержки',
    status: 'shipped' as Status,
  },
  {
    icon: 'Bot',
    title: 'AI-слой: «Домовой» + 11 AI-функций',
    desc: '«Домовой» как верхний интерфейс платформы, 11 предметных AI-сценариев на орбите вокруг него',
    status: 'shipped' as Status,
  },
  {
    icon: 'TreePine',
    title: 'Permissioned family graph',
    desc: 'Семейное древо, профили, роли, права доступа — связующая ткань между всеми хабами',
    status: 'shipped' as Status,
  },
  {
    icon: 'BookHeart',
    title: '«Альбом поколений»',
    desc: 'Семейный архив значимых моментов с межпоколенческой связностью',
    status: 'shipped' as Status,
  },
  {
    icon: 'Compass',
    title: '«Портфолио развития» по 8 сферам',
    desc: '40+ источников сигналов, флагманский хаб развития семьи',
    status: 'shipped' as Status,
  },
  {
    icon: 'Workflow',
    title: 'Cross-hub family loops',
    desc: 'Межмодульные петли: Покупки → Финансы, Дом → Бюджет, Календарь → Уведомления',
    status: 'shipped' as Status,
  },
];

// Текущее состояние перед запуском
const currentState = [
  { value: '146+', label: 'UI/бизнес-модулей платформы', icon: 'Layers' },
  { value: '90+', label: 'API-эндпоинтов backend', icon: 'Plug' },
  { value: '150+', label: 'таблиц данных в production', icon: 'Database' },
  { value: '30+', label: 'ключевых сущностей домена', icon: 'Sparkles' },
];

// Что доказывает способность исполнять
const executionProofs = [
  {
    icon: 'Zap',
    title: 'Высокая скорость поставки',
    desc: 'Платформа собрана и развивается в founder-led AI-native модели — короткие циклы итераций, ежедневные релизы',
  },
  {
    icon: 'ShieldCheck',
    title: 'Готовность к B2G-каналам',
    desc: 'Российская инфраструктура, 152-ФЗ, подготовка к включению в реестр ПО, архитектура под СМЭВ/ЕСИА',
  },
  {
    icon: 'Layers3',
    title: 'Накопительный family graph',
    desc: 'Каждый новый модуль обогащает граф семьи и усиливает остальные хабы — продукт растёт нелинейно',
  },
];

// Следующие proof points до публичного запуска
const nextProofs = [
  'Публичный запуск (Q3 2026) — первая когорта 10 000 семей',
  'Регистрация в реестре российского ПО',
  'Первое банковское партнёрство и витрина продуктов',
  'Story mode и расширение «Альбома поколений»',
];

export function SlideTraction() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8 border border-emerald-100"
    >
      {/* Заголовок */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
          <Icon name="Activity" size={26} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Icon name="CheckCircle2" size={11} />
            Proof of execution
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
            Что уже работает — и почему мы способны это масштабировать
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Closed beta · публичный запуск Q3 2026
          </p>
        </div>
      </div>

      {/* Что уже отгружено */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${STATUS_META.shipped.chip} ${STATUS_META.shipped.chipText} text-[11px] font-bold uppercase tracking-wider`}>
            <Icon name="CheckCircle2" size={11} />
            {STATUS_META.shipped.label}
          </div>
          <span className="text-xs text-gray-500">в production на nasha-semiya.ru</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shippedLayers.map((item) => (
            <div
              key={item.title}
              className="flex gap-3 p-3 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name={item.icon} size={18} className="text-emerald-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">{item.title}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Платформа в цифрах */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="BarChart3" size={14} className="text-slate-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Платформа в цифрах сегодня
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentState.map((m) => (
            <div
              key={m.label}
              className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200 text-center"
            >
              <Icon name={m.icon} size={16} className="text-slate-500 mx-auto mb-1" />
              <p className="text-2xl font-black text-slate-800">{m.value}</p>
              <p className="text-[10px] text-gray-600 leading-tight mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Что доказывает способность исполнять */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Rocket" size={14} className="text-indigo-600" />
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Почему мы способны это дотащить
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {executionProofs.map((p) => (
            <div
              key={p.title}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200"
            >
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-2 shadow-sm">
                <Icon name={p.icon} size={18} className="text-indigo-700" />
              </div>
              <p className="text-sm font-bold text-gray-900 leading-tight">{p.title}</p>
              <p className="text-xs text-gray-600 mt-1.5 leading-snug">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Следующие proof points */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${STATUS_META.next.chip} ${STATUS_META.next.chipText} text-[11px] font-bold uppercase tracking-wider`}>
            <Icon name="Zap" size={11} />
            {STATUS_META.next.label}
          </div>
          <span className="text-xs text-gray-600">ближайшие 6 месяцев</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2">
          {nextProofs.map((t) => (
            <div key={t} className="flex items-start gap-1.5">
              <Icon name="ArrowRight" size={12} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-gray-700 leading-relaxed">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Honest disclaimer */}
      <div className="mt-4 flex items-start gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
        <Icon name="Info" size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Сейчас платформа в closed beta перед публичным запуском, поэтому показываем proof of
          execution, а не пользовательские KPI. Метрики DAU/WAU/retention будут опубликованы после
          Q3 2026.
        </p>
      </div>
    </section>
  );
}

export default SlideTraction;
