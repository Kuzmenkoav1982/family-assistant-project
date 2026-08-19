import Icon from '@/components/ui/icon';

const funnel = [
  { icon: 'Eye', text: 'Число семей, увидевших сценарий' },
  { icon: 'Play', text: 'Начало создания цели' },
  { icon: 'CheckCircle2', text: 'Завершение цели' },
  { icon: 'ShieldCheck', text: 'Согласие на передачу данных' },
  { icon: 'UserCheck', text: 'Квалифицированные обращения' },
  { icon: 'FileCheck', text: 'Оформленные операции' },
];

const economics = [
  { icon: 'Receipt', text: 'Средний чек' },
  { icon: 'Coins', text: 'Стоимость квалифицированного обращения' },
  { icon: 'Percent', text: 'Конверсия в операцию' },
  { icon: 'Repeat', text: 'Повторное использование' },
  { icon: 'Smile', text: 'NPS' },
  { icon: 'AlertCircle', text: 'Доля незавершённых заявок' },
  { icon: 'TrendingUp', text: 'Объём операций через А7' },
];

export default function Slide15() {
  return (
    <section
      id="slide-15"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shrink-0">
          <Icon name="BarChart3" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">KPI пилота</h2>
          <p className="text-sm text-gray-500 mt-0.5">Измеримые обязательства, а не обещание миллионов пользователей</p>
        </div>
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 rounded-r-2xl p-4 mb-5">
        <p className="text-sm text-red-900">
          Мы сознательно не обещаем выдуманный масштаб аудитории — пилот измеряется воронкой конверсии и unit-экономикой.
        </p>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Воронка пилота</p>
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {funnel.map((f, i) => (
            <div key={f.text} className="flex-1 flex sm:flex-col items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
              <Icon name={f.icon} size={16} className="text-blue-600 shrink-0" />
              <p className="text-[11px] text-blue-900 font-medium leading-tight">{f.text}</p>
              {i < funnel.length - 1 && (
                <Icon name="ChevronRight" size={12} className="hidden sm:block text-blue-300 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Экономические метрики</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {economics.map((e) => (
            <div key={e.text} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Icon name={e.icon} size={14} className="text-slate-600 shrink-0" />
              <p className="text-[11px] text-gray-700 font-medium leading-tight">{e.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
