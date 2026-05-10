import Icon from '@/components/ui/icon';

const bankPoints = [
  {
    hub: 'Финансы → Бюджет / Счета',
    hubIcon: 'Wallet',
    hubColor: '#10b981',
    hubBg: '#d1fae5',
    product: 'Открытие счёта, дебетовые карты, переводы',
    productIcon: 'CreditCard',
    category: 'Транзакции',
  },
  {
    hub: 'Финансы → Кредиты',
    hubIcon: 'TrendingDown',
    hubColor: '#ef4444',
    hubBg: '#fee2e2',
    product: 'Потребительские кредиты, рефинансирование',
    productIcon: 'Landmark',
    category: 'Кредиты',
  },
  {
    hub: 'Финансы → Финцели',
    hubIcon: 'Target',
    hubColor: '#f59e0b',
    hubBg: '#fef3c7',
    product: 'Накопительные счета, вклады',
    productIcon: 'PiggyBank',
    category: 'Сбережения',
  },
  {
    hub: 'Финансы → Антимошенник',
    hubIcon: 'ShieldAlert',
    hubColor: '#8b5cf6',
    hubBg: '#ede9fe',
    product: 'Страхование карт, киберзащита',
    productIcon: 'ShieldCheck',
    category: 'Страхование',
  },
  {
    hub: 'Финансы → Кошелёк',
    hubIcon: 'Smartphone',
    hubColor: '#06b6d4',
    hubBg: '#cffafe',
    product: 'СБП-платежи, семейная карта',
    productIcon: 'Nfc',
    category: 'Платежи',
  },
  {
    hub: 'Питомцы → Расходы',
    hubIcon: 'PawPrint',
    hubColor: '#84cc16',
    hubBg: '#ecfccb',
    product: 'Страхование питомцев',
    productIcon: 'Heart',
    category: 'Страхование',
  },
  {
    hub: 'Здоровье',
    hubIcon: 'HeartPulse',
    hubColor: '#e11d48',
    hubBg: '#ffe4e6',
    product: 'ДМС, телемедицина, страхование жизни',
    productIcon: 'Stethoscope',
    category: 'Страхование',
  },
  {
    hub: 'Путешествия',
    hubIcon: 'MapPin',
    hubColor: '#3b82f6',
    hubBg: '#dbeafe',
    product: 'Туристическое страхование, travel-карта',
    productIcon: 'Plane',
    category: 'Travel',
  },
  {
    hub: 'Дом и быт → Транспорт (гараж)',
    hubIcon: 'Car',
    hubColor: '#64748b',
    hubBg: '#f1f5f9',
    product: 'ОСАГО / КАСКО, автокредит',
    productIcon: 'FileText',
    category: 'Авто',
  },
  {
    hub: 'Госуслуги → Господдержка',
    hubIcon: 'Building',
    hubColor: '#0d9488',
    hubBg: '#ccfbf1',
    product: 'Маткапитал, льготная ипотека',
    productIcon: 'Home',
    category: 'Господдержка',
  },
  {
    hub: 'Развитие → Финграмотность',
    hubIcon: 'GraduationCap',
    hubColor: '#7c3aed',
    hubBg: '#ede9fe',
    product: 'Детские карты, накопления на образование',
    productIcon: 'BookOpen',
    category: 'Дети',
  },
  {
    hub: 'Дом и быт → Покупки',
    hubIcon: 'ShoppingCart',
    hubColor: '#f97316',
    hubBg: '#ffedd5',
    product: 'Кэшбэк-программы, рассрочка',
    productIcon: 'Percent',
    category: 'Лояльность',
  },
];

const categoryColors: Record<string, string> = {
  'Транзакции': 'bg-emerald-100 text-emerald-700',
  'Кредиты': 'bg-red-100 text-red-700',
  'Сбережения': 'bg-amber-100 text-amber-700',
  'Страхование': 'bg-purple-100 text-purple-700',
  'Платежи': 'bg-cyan-100 text-cyan-700',
  'Travel': 'bg-blue-100 text-blue-700',
  'Авто': 'bg-slate-100 text-slate-700',
  'Господдержка': 'bg-teal-100 text-teal-700',
  'Дети': 'bg-violet-100 text-violet-700',
  'Лояльность': 'bg-orange-100 text-orange-700',
};

export function SlideBankShowcase() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-600">
          <Icon name="Landmark" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Витрина банка</h2>
          <p className="text-sm text-gray-500 mt-0.5">12 точек входа для банковских продуктов прямо внутри платформы</p>
        </div>
      </div>

      <div className="mt-2 mb-5 bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-bold">Концепция:</span> Пользователь управляет семейными финансами, здоровьем, авто — и видит релевантный банковский продукт именно в нужный момент. Не реклама, а контекстное предложение.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bankPoints.map((point, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50/50">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: point.hubBg }}>
                <Icon name={point.hubIcon} size={18} style={{ color: point.hubColor }} />
              </div>
              <Icon name="ArrowDown" size={12} className="text-gray-300" />
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-blue-500">
                <Icon name={point.productIcon} size={16} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-gray-700">{point.hub}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${categoryColors[point.category] || 'bg-gray-100 text-gray-600'}`}>
                  {point.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{point.product}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 text-center">
          <p className="text-2xl font-bold text-emerald-600">12</p>
          <p className="text-xs text-gray-500">точек входа для банка</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 text-center">
          <p className="text-2xl font-bold text-blue-600">50 млн</p>
          <p className="text-xs text-gray-500">потенциальных клиентов</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100 text-center">
          <p className="text-2xl font-bold text-purple-600">0 ₽</p>
          <p className="text-xs text-gray-500">на привлечение — уже лояльная аудитория</p>
        </div>
      </div>

      <div className="mt-4 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-5 text-white text-center">
        <p className="font-bold text-base mb-1">Для банка-партнёра: встроенный канал продаж без CAC</p>
        <p className="text-sm text-white/80">
          Аудитория уже доверяет платформе и делится финансовыми данными — конверсия в банковские продукты в 3–5× выше стандартных каналов
        </p>
      </div>
    </section>
  );
}