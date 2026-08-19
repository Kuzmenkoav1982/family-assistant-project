import Icon from '@/components/ui/icon';

const has = [
  { icon: 'Globe', text: 'Международная платёжная инфраструктура' },
  { icon: 'Landmark', text: 'ПСБ как банковский партнёр и участник экосистемы' },
  { icon: 'Wallet', text: 'Капитал' },
  { icon: 'Building2', text: 'Физические офисы «А7 Финансы»' },
  { icon: 'Package', text: 'Финансовые продукты' },
  { icon: 'TrendingUp', text: 'Высокая скорость роста' },
  { icon: 'FileCheck', text: 'Лицензированная инвестиционная инфраструктура' },
];

const problems = [
  { icon: 'Building2', title: 'Офис решает транзакцию', desc: 'но не формирует ежедневную цифровую привычку' },
  { icon: 'Megaphone', title: 'Реклама даёт лид', desc: 'но не создаёт долгосрочного контекста' },
  { icon: 'Smartphone', title: 'Банковское приложение', desc: 'обслуживает деньги, но не всю жизнь семьи' },
];

export default function Slide03() {
  return (
    <section
      id="slide-3"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 shrink-0">
          <Icon name="AlertTriangle" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">В чём настоящая стратегическая проблема А7</h2>
          <p className="text-sm text-gray-500 mt-0.5">У А7 есть почти всё — кроме постоянного контакта с человеком между операциями</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3">У А7 уже есть</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {has.map((h) => (
            <div key={h.text} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <Icon name={h.icon} size={14} className="text-emerald-700 shrink-0" />
              <p className="text-[11px] font-medium text-emerald-900 leading-tight">{h.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 mb-6 text-center">
        <p className="text-white font-bold text-base sm:text-lg leading-relaxed">
          Но у А7 нет собственного пространства, в котором человек регулярно живёт между финансовыми операциями
        </p>
        <p className="text-slate-300 text-xs sm:text-sm mt-2">
          Перевод, вексель, зарубежное лечение — не ежедневные и не еженедельные действия
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {problems.map((p) => (
          <div key={p.title} className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-2 shadow-sm">
              <Icon name={p.icon} size={18} className="text-red-600" />
            </div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{p.title}</p>
            <p className="text-xs text-gray-600 mt-1.5 leading-snug">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-orange-50 border-l-4 border-orange-500 rounded-r-2xl p-4">
        <p className="text-sm text-orange-900 font-medium">
          Вопрос для А7: как сохранить постоянный контакт с человеком, если основные продукты используются редко?
          Именно здесь появляется «Наша семья».
        </p>
      </div>
    </section>
  );
}
