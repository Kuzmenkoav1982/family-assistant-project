import Icon from '@/components/ui/icon';

const sections = [
  {
    icon: 'Users',
    title: 'Семья',
    description: 'Профили, роли, права доступа и семейный маячок GPS',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Профили семьи', 'Дети', 'Геолокация'],
    image: 'https://cdn.poehali.dev/files/056ccaf0-4db3-4b8a-92f2-3ca96db01abd.PNG',
  },
  {
    icon: 'CalendarDays',
    title: 'Планирование',
    description: 'Цели, задачи, календарь, план покупок и аналитика',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Цели семьи', 'Задачи', 'Календарь', 'Аналитика'],
    image: 'https://cdn.poehali.dev/files/4d83a88b-6923-4f77-9af8-f8c0e6ff839d.PNG',
  },
  {
    icon: 'UtensilsCrossed',
    title: 'Питание',
    description: 'AI-диета, рецепты, счётчик БЖУ, меню на неделю',
    gradient: 'from-green-500 to-emerald-500',
    features: ['AI-диета', 'Рецепт из продуктов', 'Меню на неделю', 'БЖУ'],
    image: 'https://cdn.poehali.dev/files/c2e14ec5-33dc-4611-8a3e-330eeed3498f.PNG',
  },
  {
    icon: 'Heart',
    title: 'Здоровье',
    description: 'Медкарты, анализы, прививки, лекарства и телемедицина',
    gradient: 'from-red-500 to-pink-500',
    features: ['Медкарты', 'Прививки', 'Лекарства', 'Врачи'],
    image: 'https://cdn.poehali.dev/files/37319c7a-3f55-41c6-9cb3-12910fd5f825.PNG',
  },
  {
    icon: 'ShoppingCart',
    title: 'Быт и хозяйство',
    description: 'Список покупок для всей семьи и семейные голосования',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Покупки', 'Голосования', 'Домашние дела'],
    image: 'https://cdn.poehali.dev/files/b07f0178-71a6-4095-869c-efee79846150.PNG',
  },
  {
    icon: 'Plane',
    title: 'Путешествия и досуг',
    description: 'Поездки, бюджет, маршруты, праздники и развлечения',
    gradient: 'from-sky-500 to-blue-500',
    features: ['Путешествия', 'Досуг', 'Праздники'],
    image: 'https://cdn.poehali.dev/files/4a52a3a5-9f25-424c-a223-b897b767786d.PNG',
  },
  {
    icon: 'HeartHandshake',
    title: 'Ценности и культура',
    description: 'Традиции, вера, правила дома и культурное наследие',
    gradient: 'from-amber-500 to-orange-500',
    features: ['Ценности', 'Традиции', 'Правила дома'],
    image: 'https://cdn.poehali.dev/files/d2a7a21c-f2c9-4de8-9f0f-8a9fb3f61fed.PNG',
  },
  {
    icon: 'TrendingUp',
    title: 'Развитие',
    description: 'Планы развития, навыки и достижения каждого члена семьи',
    gradient: 'from-teal-500 to-green-500',
    features: ['Планы развития', 'Навыки', 'Достижения'],
    image: 'https://cdn.poehali.dev/files/f9e8a722-7282-434d-ac33-a6e8716e844b.PNG',
  },
  {
    icon: 'Landmark',
    title: 'Семья и государство',
    description: 'Госпрограммы, маткапитал, пособия, семейный кодекс',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Господдержка', 'Сем. кодекс', 'Новости'],
    image: 'https://cdn.poehali.dev/files/5d0b83b2-b7e8-4e80-b350-395fa981bc11.PNG',
  },
  {
    icon: 'Bot',
    title: 'AI-помощники',
    description: 'Домовой — умный ассистент + управление через Яндекс Алису',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Домовой AI', 'Яндекс Алиса', 'Голос'],
    image: 'https://cdn.poehali.dev/files/437f51fb-d436-4fec-ba39-34c62f8f8cbc.PNG',
  },
];

export default function WelcomePromo() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="LayoutGrid" size={16} />
            10 разделов в одном приложении
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Всё, что нужно семье
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Каждый раздел продуман до мелочей и создан на основе реальных потребностей семей
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-36 overflow-hidden relative">
                <img
                  src={section.image}
                  alt={section.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon name={section.icon} size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">{section.title}</h3>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-3">{section.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {section.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
