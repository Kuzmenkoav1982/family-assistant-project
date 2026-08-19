import Icon from '@/components/ui/icon';

const scenarios = [
  {
    letter: 'А',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    bg: '#ede9fe',
    title: 'Образование и лечение',
    steps: ['Цель', 'Сумма', 'Срок', 'Документы', 'Инвойс', 'Консультация', 'Платёж через А7', 'Подтверждение и архив'],
  },
  {
    letter: 'Б',
    icon: 'PiggyBank',
    color: '#f97316',
    bg: '#ffedd5',
    title: 'Накопление на крупную цель',
    steps: ['Создание цели', 'Семейный план', 'Регулярные взносы', 'Калькулятор', 'Переход в регулируемый контур', 'Мониторинг цели'],
  },
  {
    letter: 'В',
    icon: 'Building2',
    color: '#10b981',
    bg: '#d1fae5',
    title: 'Консультация в «А7 Финансы»',
    steps: ['Определение потребности', 'Подбор ближайшего офиса', 'Запись', 'Список документов', 'Напоминание', 'Обратная связь после визита'],
  },
];

export default function Slide14() {
  return (
    <section
      id="slide-14"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
          <Icon name="Rocket" size={24} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            Пилот · 12–18 месяцев
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">«А7 Семейные цели»</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((s) => (
          <div key={s.letter} className="rounded-2xl p-4 border" style={{ backgroundColor: s.bg, borderColor: s.color + '55' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-black" style={{ backgroundColor: s.color }}>
                {s.letter}
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name={s.icon} size={16} style={{ color: s.color }} />
                <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
              </div>
            </div>
            <div className="space-y-1.5">
              {s.steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2 bg-white/70 rounded-lg px-2.5 py-1.5">
                  <span className="text-[9px] font-bold text-gray-400 w-3 shrink-0">{i + 1}</span>
                  <p className="text-[11px] text-gray-700 font-medium leading-tight">{step}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
