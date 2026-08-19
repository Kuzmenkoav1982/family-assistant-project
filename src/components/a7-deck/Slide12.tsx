import Icon from '@/components/ui/icon';

const roles = [
  {
    icon: 'Users',
    color: '#8b5cf6',
    bg: '#ede9fe',
    title: '«Наша семья»',
    role: 'Семейный интерфейс',
    desc: 'Жизненные сценарии, совместное планирование, вовлечение членов семьи',
  },
  {
    icon: 'Globe',
    color: '#f97316',
    bg: '#ffedd5',
    title: 'А7',
    role: 'Финансовая инфраструктура',
    desc: 'Международные расчёты и часть инвестиционных продуктов',
  },
  {
    icon: 'Landmark',
    color: '#10b981',
    bg: '#d1fae5',
    title: 'ПСБ и партнёры',
    role: 'Регулируемые продукты',
    desc: 'Банковские, страховые и иные лицензируемые продукты',
  },
];

export default function Slide12() {
  return (
    <section
      id="slide-12"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-500 shrink-0">
          <Icon name="Workflow" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Архитектура ролей</h2>
          <p className="text-sm text-gray-500 mt-0.5">Кто за что отвечает — прозрачность как принцип, а не опция</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {roles.map((r) => (
          <div key={r.title} className="rounded-2xl p-5 border" style={{ backgroundColor: r.bg, borderColor: r.color + '55' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: r.color }}>
              <Icon name={r.icon} size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">{r.title}</h3>
            <p className="text-xs font-semibold mt-0.5" style={{ color: r.color }}>{r.role}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-800">Семья формулирует задачу</span>
        <Icon name="ArrowRight" size={14} className="text-gray-400" />
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-100 text-orange-800">А7 проводит операцию</span>
        <Icon name="ArrowRight" size={14} className="text-gray-400" />
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">ПСБ/партнёр — регулируемый продукт</span>
        <Icon name="ArrowRight" size={14} className="text-gray-400" />
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-800">Результат — в семейный сценарий</span>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong>Принцип:</strong> «Наша семья» не берёт на себя финансовые операции и не выдаёт продукты —
          она формулирует задачу и передаёт пользователя в лицензированный контур точно в нужный момент,
          с полным раскрытием ролей и рисков.
        </p>
      </div>
    </section>
  );
}
