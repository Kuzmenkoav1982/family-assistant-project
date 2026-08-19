import Icon from '@/components/ui/icon';

const stats = [
  { icon: 'Users', value: '~15 тыс.', label: 'клиентов группы' },
  { icon: 'Repeat', value: '~2 тыс.', label: 'операций в день' },
  { icon: 'Landmark', value: '~10 трлн ₽', label: 'проведено за 2025 год' },
  { icon: 'PieChart', value: '~19%', label: 'доля во внешнеторговых операциях РФ-бизнеса' },
];

const products = [
  { icon: 'Globe', title: 'Международные расчёты для бизнеса', tag: 'B2B' },
  { icon: 'Send', title: 'Переводы для физических лиц', tag: 'B2C' },
  { icon: 'RefreshCw', title: 'Валютные операции', tag: 'B2B/B2C' },
  { icon: 'FileText', title: 'Рублёвые и валютные векселя', tag: 'Инвестиции' },
  { icon: 'CreditCard', title: 'Банковские продукты ПСБ', tag: 'Партнёрство' },
  { icon: 'ShieldCheck', title: 'Страхование и кредитование через партнёров', tag: 'Партнёрство' },
  { icon: 'Building2', title: 'Физическая сеть «А7 Финансы»', tag: 'Офлайн' },
  { icon: 'Smartphone', title: 'Собственный цифровой кабинет', tag: 'Digital' },
  { icon: 'TrendingUp', title: 'Инвестиционная инфраструктура (лицензии «Арс Инвест»)', tag: 'Новое' },
];

export default function Slide02() {
  return (
    <section
      id="slide-2"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-600 shrink-0">
          <Icon name="Building" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">А7 сегодня — не финтех-стартап, а инфраструктурный игрок</h2>
          <p className="text-sm text-gray-500 mt-0.5">Основана в октябре 2024 года · официальные данные компании</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-slate-50 to-orange-50 rounded-2xl p-4 border border-slate-200 text-center">
            <Icon name={s.icon} size={18} className="text-orange-600 mx-auto mb-1.5" />
            <p className="text-xl sm:text-2xl font-black text-slate-800">{s.value}</p>
            <p className="text-[11px] text-gray-600 leading-tight mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
          <Icon name="LayoutGrid" size={14} />
          А7 строит финансовую экосистему, а не один продукт
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {products.map((p) => (
            <div key={p.title} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
              <Icon name={p.icon} size={16} className="text-slate-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-snug">{p.title}</p>
                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wide text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-full">{p.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>Ключевой сигнал:</strong> покупка ООО «Арс Инвест» (брокерская, дилерская и депозитарная лицензии)
          говорит о намерении А7 развивать не только платежи, но и полноценное инвестиционное направление.
          Гендиректор публично заявлял о цели — до 1 тыс. финансовых супермаркетов по России и выход в 20+ стран за два года.
        </p>
      </div>
    </section>
  );
}
