import Icon from '@/components/ui/icon';

const streams = [
  { icon: 'Percent', color: '#8b5cf6', bg: '#ede9fe', title: 'CPA', desc: 'Вознаграждение за каждый оформленный продукт' },
  { icon: 'Split', color: '#f97316', bg: '#ffedd5', title: 'Revenue share', desc: 'Доля комиссии по операции' },
  { icon: 'UserCheck', color: '#3b82f6', bg: '#dbeafe', title: 'Оплата квалифицированного лида', desc: 'Пользователь подтвердил потребность и согласился передать данные' },
  { icon: 'Server', color: '#10b981', bg: '#d1fae5', title: 'SaaS / white-label', desc: 'Плата за семейный цифровой контур для А7' },
  { icon: 'Handshake', color: '#e11d48', bg: '#ffe4e6', title: 'Совместный доход', desc: 'От новых продуктов, созданных сторонами совместно' },
];

export default function Slide16() {
  return (
    <section
      id="slide-16"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
          <Icon name="CircleDollarSign" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Финансовая модель партнёрства</h2>
          <p className="text-sm text-gray-500 mt-0.5">Не одна комиссия за перевод, а пять источников выручки</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        {streams.map((s) => (
          <div key={s.title} className="rounded-2xl p-4 border" style={{ backgroundColor: s.bg, borderColor: s.color + '55' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: s.color }}>
              <Icon name={s.icon} size={18} className="text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{s.title}</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-snug">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 rounded-r-2xl p-4 mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1 flex items-center gap-1.5">
          <Icon name="XCircle" size={12} /> Неверная формулировка
        </p>
        <p className="text-sm text-red-900">«CAC для А7 равен нулю»</p>
      </div>

      <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-r-2xl p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1.5">
          <Icon name="CheckCircle2" size={12} /> Точная формулировка
        </p>
        <p className="text-sm text-emerald-900 leading-relaxed">
          У А7 всё равно будут интеграционные расходы, маркетинг, комплаенс, сопровождение и вознаграждение платформе.
          Партнёрство может <strong>снизить эффективную стоимость привлечения</strong> и повысить конверсию благодаря
          входу в уже сформированный семейный сценарий.
        </p>
      </div>
    </section>
  );
}
