import SlideFrame from './SlideFrame';

const routes = [
  { city: 'Ярославль', icon: '🏛️', tag: 'Золотое кольцо', desc: 'Семейные прогулки по кремлю, Стрелка, набережная' },
  { city: 'Ростов Великий', icon: '⛪', tag: '1 час от Яра', desc: 'Кремль, озеро Неро, монастырь — идеален для семьи' },
  { city: 'Углич', icon: '🕌', tag: 'История', desc: 'Кремль, музей «Русская водка», прогулка по Волге' },
  { city: 'Переславль-Залесский', icon: '🌊', tag: 'Природа', desc: 'Плещеево озеро, Синий камень, рыбалка и пикник' },
  { city: 'Рыбинск', icon: '🚢', tag: 'Волга', desc: 'Набережная, музей Мологи, речная прогулка' },
  { city: 'Мышкин', icon: '🐭', tag: 'Сказочный', desc: 'Уникальный мышиный городок, ремёсла, живая история' },
];

export default function Slide16() {
  return (
    <SlideFrame
      id="slide-16"
      eyebrow="16. Региональная уникальность"
      title={<>Маркетинговая связка: <span className="text-indigo-600">7Я</span> + <span className="text-amber-600">«Я»</span> Ярославской области</>}
      subtitle="То, чего нет ни у одного банкового продукта в регионе"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white">
            <div className="text-5xl font-black mb-2 tracking-tight">7Я + Я</div>
            <p className="text-indigo-200 text-sm mb-4">Логотип «7Я» и официальный символ Ярославской области — буква «Я» — гармонично сочетаются в едином маркетинговом коде</p>
            <div className="flex flex-wrap gap-2">
              {['Я расту', 'Я коплю', 'Я помню', 'Я в безопасности', 'Семья 7Я'].map(tag => (
                <span key={tag} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span>🌟</span> Что уникально для жителей Ярославской области
            </div>
            <ul className="space-y-2">
              {[
                'Семейная память, привязанная к местам области',
                'Финансовые цели → поездка в Мышкин, Ростов, Углич',
                'Семейное древо с корнями в ярославских сёлах',
                'Летний марафон «8 недель с семьёй по области»',
                'Достижения: «Побывали в 5 городах Золотого кольца»',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-0.5 shrink-0 text-amber-500">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Семейные маршруты — MVP 1-й волны</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {routes.map(r => (
              <div key={r.city} className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-1.5 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{r.icon}</span>
                  <span className="font-semibold text-sm text-slate-800">{r.city}</span>
                  <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{r.tag}</span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-1">
            <p className="text-sm text-emerald-800 font-medium">
              💡 Пилот «Детская карта → копим на поездку → едем → сохраняем воспоминание»
              — замкнутый сценарий, которого нет ни у одного банка России
            </p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
