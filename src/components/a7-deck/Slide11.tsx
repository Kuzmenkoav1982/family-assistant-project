import Icon from '@/components/ui/icon';

const core = [
  { icon: 'Globe', text: 'Международные платежи' },
  { icon: 'Target', text: 'Семейные цели' },
  { icon: 'PiggyBank', text: 'Накопления' },
  { icon: 'TrendingUp', text: 'Инвестиционные предложения' },
  { icon: 'Coins', text: 'Драгоценные металлы' },
  { icon: 'ShieldCheck', text: 'Страхование' },
  { icon: 'CreditCard', text: 'Банковские продукты' },
  { icon: 'GraduationCap', text: 'Финансовая грамотность' },
  { icon: 'Landmark', text: 'Семейное владение и передача активов' },
];

const transparency = ['Кто оказывает услугу', 'Какая организация отвечает за деньги', 'Что является рекламой', 'Какие есть риски', 'Какие данные передаются партнёру', 'На каком основании они обрабатываются'];

export default function Slide11() {
  return (
    <section
      id="slide-11"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-emerald-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-600 text-white font-black text-sm shrink-0">4</div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 shrink-0">
          <Icon name="Network" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">А7 как финансовый инфраструктурный партнёр</h2>
          <p className="text-sm text-gray-500 mt-0.5">Перспектива: финансовое ядро соответствующего раздела платформы</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Финансовое ядро семейного хаба</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {core.map((c) => (
            <div key={c.text} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Icon name={c.icon} size={15} className="text-emerald-700 shrink-0" />
              <p className="text-xs font-medium text-emerald-900 leading-tight">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl p-4 mb-5">
        <p className="text-sm text-amber-900 font-medium">
          Но это должна быть не закрытая витрина А7, а регулируемая архитектура с прозрачным распределением ролей
        </p>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Пользователь должен понимать</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {transparency.map((t) => (
            <div key={t} className="flex items-center gap-2 text-xs text-gray-700">
              <Icon name="CheckCircle2" size={13} className="text-slate-500 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
