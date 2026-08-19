import Icon from '@/components/ui/icon';

const goals = ['Образование ребёнка', 'Жильё', 'Автомобиль', 'Путешествие', 'Лечение', 'Финансовая подушка', 'Помощь родителям', 'Накопления детям', 'Переезд', 'Зарубежная покупка'];

const steps = [
  { icon: 'Calculator', text: 'Определить сумму и срок' },
  { icon: 'Users', text: 'Распределить вклад членов семьи' },
  { icon: 'ListChecks', text: 'Составить план' },
  { icon: 'Puzzle', text: 'Выбрать финансовый инструмент' },
  { icon: 'Link', text: 'Подключить продукт А7, ПСБ или партнёра' },
  { icon: 'TrendingUp', text: 'Отслеживать достижение цели' },
];

const interests = ['Продажа инвестиционных и банковских продуктов в контексте потребности', 'Более высокая конверсия, чем у рекламы', 'Долгосрочное удержание клиента', 'Сегментация по целям и горизонту', 'Кросс-продажа продуктов'];

export default function Slide08() {
  return (
    <section
      id="slide-8"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-violet-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-600 text-white font-black text-sm shrink-0">1</div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shrink-0">
          <Icon name="Target" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Семейные финансовые цели</h2>
          <p className="text-sm text-gray-500 mt-0.5">Самое сильное направление для старта разговора</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Семья создаёт цели</p>
        <div className="flex flex-wrap gap-2">
          {goals.map((g) => (
            <span key={g} className="text-xs font-medium px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800">{g}</span>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Платформа помогает</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {steps.map((s) => (
            <div key={s.text} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <Icon name={s.icon} size={15} className="text-violet-600 shrink-0" />
              <p className="text-xs text-gray-700 font-medium">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">Интерес А7</p>
          <ul className="space-y-1">
            {interests.map((i) => (
              <li key={i} className="text-xs text-emerald-900 flex items-start gap-1.5">
                <Icon name="ArrowRight" size={12} className="mt-0.5 shrink-0" />
                {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 border-l-4 border-amber-500">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
            <Icon name="AlertTriangle" size={13} /> Важная оговорка
          </p>
          <p className="text-xs text-amber-900 leading-relaxed">
            Вексель не является вкладом и не застрахован АСВ, имеет собственный кредитный риск и ограничения
            досрочного предъявления. «Наша семья» выявляет цель, а подбор и оформление регулируемых продуктов
            происходит в лицензированном контуре А7, ПСБ или партнёра — после предупреждений и проверок.
          </p>
        </div>
      </div>
    </section>
  );
}
