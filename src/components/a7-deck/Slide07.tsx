import Icon from '@/components/ui/icon';

const directions = [
  {
    num: '1',
    icon: 'Target',
    color: '#8b5cf6',
    bg: '#ede9fe',
    title: 'Семейные финансовые цели',
    desc: 'Образование, жильё, лечение, накопления — платформа помогает сформировать цель и подобрать регулируемый продукт',
  },
  {
    num: '2',
    icon: 'Globe',
    color: '#3b82f6',
    bg: '#dbeafe',
    title: 'Международные семейные платежи',
    desc: 'Обучение и лечение за рубежом, помощь родственникам — платёж как часть подготовленного семейного процесса',
  },
  {
    num: '3',
    icon: 'Building2',
    color: '#f97316',
    bg: '#ffedd5',
    title: 'Цифровой канал для «А7 Финансы»',
    desc: 'Предквалификация, запись, сопровождение до и после визита в офис сети',
  },
  {
    num: '4',
    icon: 'Network',
    color: '#10b981',
    bg: '#d1fae5',
    title: 'А7 как инфраструктурный партнёр',
    desc: 'Финансовое ядро семейного хаба — платежи, накопления, инвестиции, металлы, страхование',
  },
];

export default function Slide07() {
  return (
    <section
      id="slide-7"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-500 shrink-0">
          <Icon name="Map" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Четыре направления партнёрства</h2>
          <p className="text-sm text-gray-500 mt-0.5">Не один продукт, а карта равнозначных направлений — детали на следующих слайдах</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {directions.map((d) => (
          <div key={d.num} className="rounded-2xl p-5 border" style={{ backgroundColor: d.bg, borderColor: d.color + '55' }}>
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-black" style={{ backgroundColor: d.color }}>
                {d.num}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon name={d.icon} size={16} style={{ color: d.color }} />
                  <h3 className="font-bold text-gray-800 text-sm">{d.title}</h3>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          Направления не конкурируют друг с другом — вместе они образуют полную картину того, как А7 может
          присутствовать в жизни семьи: от разового платежа до постоянного финансового ядра платформы.
        </p>
      </div>
    </section>
  );
}
