import Icon from '@/components/ui/icon';

const promoFeatures = [
  {
    icon: 'Brain',
    title: 'AI-ассистент Домовой',
    description: '9 ролей: повар, психолог, финансист, педагог — ваш персональный помощник',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50'
  },
  {
    icon: 'Users',
    title: 'Вся семья в одном месте',
    description: 'Профили, задачи, баллы и достижения для каждого члена семьи',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50'
  },
  {
    icon: 'ShieldCheck',
    title: 'Защита данных',
    description: 'Шифрование военного уровня, соответствие 152-ФЗ',
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50'
  },
  {
    icon: 'Heart',
    title: 'Семейные ценности',
    description: 'Традиции, мечты, копилки, голосования — всё, что сближает',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50'
  },
  {
    icon: 'Calendar',
    title: 'Планирование',
    description: 'Календарь, меню на неделю, списки покупок, путешествия',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50'
  },
  {
    icon: 'TrendingUp',
    title: 'Развитие детей',
    description: 'ИИ-оценка, планы развития, геймификация для детей 0-12 лет',
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-red-50'
  }
];

const stats = [
  { value: '20+', label: 'разделов' },
  { value: '9', label: 'ролей AI' },
  { value: '152-ФЗ', label: 'защита данных' },
  { value: '0 ₽', label: 'старт бесплатно' }
];

export default function WelcomePromo() {
  return (
    <div className="mb-16">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <Icon name="Sparkles" size={18} className="text-yellow-300" />
              <span className="text-sm font-semibold">Единственная платформа для всей семьи</span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Почему 
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> «Наша Семья» </span>
              — это то, что вам нужно?
            </h3>
            <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              Мы объединили всё для управления семьёй в одном приложении: от задач и финансов до 
              AI-ассистента и развития детей. Больше не нужно 10 разных приложений — здесь есть всё.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {promoFeatures.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] border border-white/10"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon name={feature.icon} size={24} className="text-white" />
                </div>
                <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                <p className="text-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl py-4 px-3">
                <div className="text-2xl lg:text-3xl font-bold text-yellow-300">{stat.value}</div>
                <div className="text-xs text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
