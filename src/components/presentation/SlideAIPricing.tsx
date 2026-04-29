import Icon from '@/components/ui/icon';

const categories = [
  {
    title: 'Питание и здоровье',
    icon: 'Apple',
    color: '#f97316',
    bg: '#ffedd5',
    border: '#fdba74',
    services: [
      { name: 'ИИ-диета (персональный рацион)', price: 17, unit: 'за запрос', popular: true },
      { name: 'AI-анализ фото блюда', price: 7, unit: 'за запрос' },
      { name: 'Рецепт из продуктов в холодильнике', price: 5, unit: 'за запрос' },
      { name: 'Рецепт (короткий)', price: 2, unit: 'за запрос' },
      { name: 'AI-ветеринар (симптомы питомца)', price: 12, unit: 'за запрос' },
    ],
  },
  {
    title: 'Развитие и образование',
    icon: 'GraduationCap',
    color: '#3b82f6',
    bg: '#dbeafe',
    border: '#93c5fd',
    services: [
      { name: 'AI-план развития ребёнка', price: 25, unit: 'за план', popular: true },
      { name: 'AI-психолог (сессия)', price: 30, unit: 'за сессию' },
      { name: 'Зеркало родителя — ИИ-разбор PARI', price: 22, unit: 'за разбор' },
      { name: 'Конфликт-AI (разбор ситуации)', price: 20, unit: 'за запрос' },
      { name: 'Рекомендации досуга для детей', price: 4, unit: 'за запрос' },
      { name: 'AI-план для бабушки/дедушки', price: 10, unit: 'за план' },
    ],
  },
  {
    title: 'Путешествия и досуг',
    icon: 'MapPin',
    color: '#06b6d4',
    bg: '#cffafe',
    border: '#67e8f9',
    services: [
      { name: 'AI-маршрут путешествия', price: 35, unit: 'за маршрут', popular: true },
      { name: 'AI-идеи для праздника', price: 15, unit: 'за идею' },
      { name: 'AI-открытка (текст + дизайн)', price: 7, unit: 'за открытку' },
      { name: 'Пакинг-лист AI', price: 5, unit: 'за список' },
    ],
  },
  {
    title: 'Финансы и документы',
    icon: 'Wallet',
    color: '#8b5cf6',
    bg: '#ede9fe',
    border: '#c4b5fd',
    services: [
      { name: 'AI-анализ бюджета семьи', price: 20, unit: 'за отчёт', popular: true },
      { name: 'AI-подбор банковского продукта', price: 10, unit: 'за запрос' },
      { name: 'AI-помощник по налоговым вычетам', price: 25, unit: 'за консультацию' },
      { name: 'AI-астрология (совместимость)', price: 8, unit: 'за запрос' },
    ],
  },
];

const walletPackages = [
  { amount: 100, bonus: 0, badge: '', color: '#64748b' },
  { amount: 300, bonus: 10, badge: '+10 ₽', color: '#3b82f6' },
  { amount: 500, bonus: 25, badge: '+25 ₽', color: '#8b5cf6' },
  { amount: 1000, bonus: 70, badge: '+70 ₽ 🔥', color: '#f97316' },
  { amount: 3000, bonus: 300, badge: '+300 ₽ ⭐', color: '#10b981' },
];

export function SlideAIPricing() {
  return (
    <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-orange-500">
          <Icon name="Sparkles" size={26} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Тарификация AI-сервисов</h2>
          <p className="text-sm text-gray-500 mt-0.5">Pay-per-use через семейный кошелёк — платишь только за то, что использовал</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 border border-purple-100 mb-6">
        <div className="flex flex-wrap items-center gap-3 text-sm justify-center">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
            <Icon name="Wallet" size={16} className="text-purple-500" />
            <span className="font-medium text-gray-700">Пополнить кошелёк</span>
          </div>
          <Icon name="ArrowRight" size={14} className="text-gray-400" />
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
            <Icon name="Sparkles" size={16} className="text-orange-500" />
            <span className="font-medium text-gray-700">Использовать AI</span>
          </div>
          <Icon name="ArrowRight" size={14} className="text-gray-400" />
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm">
            <Icon name="Zap" size={16} className="text-emerald-500" />
            <span className="font-medium text-gray-700">Списание автоматически</span>
          </div>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {categories.map((cat, i) => (
          <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: cat.border }}>
            <div className="flex items-center gap-2 px-4 py-3" style={{ backgroundColor: cat.bg }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                <Icon name={cat.icon} size={14} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">{cat.title}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {cat.services.map((svc, j) => (
                <div key={j} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {svc.popular && (
                      <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: cat.color }}>
                        хит
                      </span>
                    )}
                    <span className="text-xs text-gray-700 leading-tight">{svc.name}</span>
                  </div>
                  <div className="flex-shrink-0 ml-3 text-right">
                    <span className="font-bold text-sm" style={{ color: cat.color }}>{svc.price} ₽</span>
                    <span className="text-[10px] text-gray-400 ml-1">{svc.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Wallet packages */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Icon name="Wallet" size={16} className="text-purple-500" />
            Пакеты пополнения кошелька (бонус за объём)
          </h3>
        </div>
        <div className="grid grid-cols-5 divide-x divide-gray-100">
          {walletPackages.map((pkg, i) => (
            <div key={i} className="p-3 text-center">
              <p className="text-sm font-bold text-gray-800">{pkg.amount} ₽</p>
              {pkg.bonus > 0 ? (
                <p className="text-xs font-semibold mt-1" style={{ color: pkg.color }}>{pkg.badge}</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">базовый</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Economics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'ARPU (кошелёк)', value: '~200 ₽/мес', icon: 'Receipt', color: '#8b5cf6' },
          { label: 'Запросов в месяц', value: '12–25', icon: 'Zap', color: '#f97316' },
          { label: 'Маржа на AI', value: '60–70%', icon: 'TrendingUp', color: '#10b981' },
          { label: 'Порог входа', value: 'от 50 ₽', icon: 'DoorOpen', color: '#3b82f6' },
        ].map((m, i) => (
          <div key={i} className="rounded-2xl p-3 text-center border border-gray-100 bg-gray-50">
            <Icon name={m.icon} size={18} className="mx-auto mb-1" style={{ color: m.color }} />
            <p className="text-base font-bold" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}