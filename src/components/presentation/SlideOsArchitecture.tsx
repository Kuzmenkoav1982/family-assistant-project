import Icon from '@/components/ui/icon';

/**
 * Слайд: «Архитектура Семейной ОС».
 * Показывает 5 жизненных циклов и систему модальностей,
 * которые делают продукт «единым организмом», а не набором страниц.
 */

const CYCLES = [
  { id: '1', label: 'Сбор',           question: 'Что у нас есть?',      icon: 'Database',       color: 'from-slate-400 to-slate-600' },
  { id: '2', label: 'Панорама',       question: 'Какая картина?',       icon: 'LayoutDashboard', color: 'from-emerald-400 to-teal-500' },
  { id: '3', label: 'Осмысление',     question: 'Что для нас важно?',   icon: 'Brain',          color: 'from-amber-400 to-orange-500' },
  { id: '4', label: 'Договорённости', question: 'О чём договорились?',  icon: 'Handshake',      color: 'from-fuchsia-400 to-purple-500' },
  { id: '5', label: 'Исполнение',     question: 'Как сделаем?',         icon: 'CheckSquare',    color: 'from-blue-400 to-violet-500' },
];

const MODALITIES = [
  { label: 'Право',       icon: 'Scale',        bg: 'bg-slate-100',  text: 'text-slate-700',   desc: 'Семейный кодекс РФ' },
  { label: 'Госданные',   icon: 'Landmark',     bg: 'bg-blue-50',    text: 'text-blue-700',    desc: 'Меры поддержки, льготы' },
  { label: 'ИИ',          icon: 'Sparkles',     bg: 'bg-violet-50',  text: 'text-violet-700',  desc: 'Домовой и роли-консультанты' },
  { label: 'Осмысление',  icon: 'BrainCircuit', bg: 'bg-amber-50',   text: 'text-amber-700',   desc: 'Зеркало родителя, развитие' },
  { label: 'Контент',     icon: 'BookOpen',     bg: 'bg-orange-50',  text: 'text-orange-700',  desc: 'Статьи, традиции, мудрость' },
  { label: 'Сервис',      icon: 'Cog',          bg: 'bg-emerald-50', text: 'text-emerald-700', desc: 'Покупки, задачи, бюджет' },
  { label: 'Семья',       icon: 'Users',        bg: 'bg-pink-50',    text: 'text-pink-700',    desc: 'Профили, чат, голосования' },
];

export const SlideOsArchitecture = () => {
  return (
    <section data-pdf-slide className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 border border-purple-100/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Icon name="Cpu" size={12} />
          Архитектура «Семейной ОС»
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          5 циклов жизни семьи · 7 модальностей данных
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Не набор страниц, а единая операционная система: данные → картина → смысл → договорённости → действия → новые данные
        </p>
      </div>

      {/* 5 циклов */}
      <div className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
          5 жизненных циклов семьи
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CYCLES.map((c, idx) => (
            <div key={c.id} className="rounded-xl border bg-white p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <Icon name={c.icon} fallback="Circle" size={15} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-300">{idx + 1}</span>
              </div>
              <div className="text-[13px] font-bold text-gray-900 leading-tight">{c.label}</div>
              <div className="text-[11px] text-gray-500 mt-1 leading-tight">{c.question}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 px-1">
          <Icon name="RefreshCcw" size={11} />
          Цикл замкнут: исполнение даёт новые факты для следующего сбора
        </div>
      </div>

      {/* Модальности */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
          7 модальностей — единый язык данных в продукте
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {MODALITIES.map(m => (
            <div key={m.label} className={`rounded-xl ${m.bg} p-2.5 ring-1 ring-inset ring-black/5`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon name={m.icon} fallback="Tag" size={11} className={m.text} />
                <span className={`text-[11px] font-bold ${m.text}`}>{m.label}</span>
              </div>
              <div className="text-[10px] text-gray-600 leading-tight">{m.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-gray-50 border p-3 text-[12px] text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Зачем это инвестору:</strong> пользователь за 1 секунду понимает,
          с чем он имеет дело — с государственным сервисом, с ИИ-советом или с семейной договорённостью.
          Это снижает когнитивную нагрузку и закрывает вопрос доверия — критично для широкой аудитории.
        </div>
      </div>
    </section>
  );
};

export default SlideOsArchitecture;
