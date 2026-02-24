import Icon from '@/components/ui/icon';

const MAMA_URL = 'https://cdn.poehali.dev/files/e7230598-9d77-4116-be67-0ef731d8c863.jpg';
const PAPA_URL = 'https://cdn.poehali.dev/files/8f60262a-1ae2-4766-9842-50aa2637721d.jpg';
const KIDS_URL = 'https://cdn.poehali.dev/files/7b37fcba-0c22-4efa-a374-703dcf5af0a5.jpg';

const roles = [
  {
    title: 'Для мам',
    subtitle: 'Питание, здоровье, покупки',
    image: MAMA_URL,
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    features: [
      { icon: 'UtensilsCrossed', text: 'Меню на неделю и рецепты' },
      { icon: 'Heart', text: 'Здоровье и прививки детей' },
      { icon: 'ShoppingCart', text: 'Списки покупок для всей семьи' },
      { icon: 'Brain', text: 'AI-диета по вашим данным' },
    ],
  },
  {
    title: 'Для пап',
    subtitle: 'Задачи, финансы, контроль',
    image: PAPA_URL,
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    features: [
      { icon: 'CheckSquare', text: 'Задачи и контроль выполнения' },
      { icon: 'MapPin', text: 'Семейный маячок GPS' },
      { icon: 'Wallet', text: 'Бюджет и финансы семьи' },
      { icon: 'BarChart', text: 'Аналитика семейной активности' },
    ],
  },
  {
    title: 'Для детей',
    subtitle: 'Развитие, достижения, игры',
    image: KIDS_URL,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    features: [
      { icon: 'Trophy', text: 'Достижения и уровни' },
      { icon: 'TrendingUp', text: 'План развития навыков' },
      { icon: 'Star', text: 'Семейные ценности и традиции' },
      { icon: 'Gamepad2', text: 'Геймификация задач' },
    ],
  },
];

export default function WelcomeForWhom() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Для каждого члена семьи
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            У каждого своя роль, свои задачи и свои инструменты. 
            Платформа адаптируется под потребности всех.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {roles.map((role, idx) => (
            <div
              key={idx}
              className={`relative ${role.bg} rounded-3xl p-6 sm:p-8 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={role.image}
                  alt={role.title}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4 ring-white"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.subtitle}</p>
                </div>
              </div>

              <div className="space-y-3">
                {role.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon name={feat.icon} size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{feat.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}