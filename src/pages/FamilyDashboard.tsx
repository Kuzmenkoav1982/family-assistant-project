import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

export default function FamilyDashboard() {
  const sections = [
    {
      title: 'Задачи',
      description: 'Управление задачами семьи',
      icon: 'CheckSquare',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      path: '/family/tasks'
    },
    {
      title: 'Календарь',
      description: 'События и планы',
      icon: 'Calendar',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      path: '/family/calendar'
    },
    {
      title: 'Аналитика',
      description: 'Статистика семьи',
      icon: 'BarChart3',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      path: '/family/analytics'
    },
    {
      title: 'Покупки',
      description: 'Список покупок',
      icon: 'ShoppingCart',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      path: '/family/shopping'
    },
    {
      title: 'Рецепты',
      description: 'Семейная кулинарная книга',
      icon: 'ChefHat',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      path: '/family/recipes'
    },
    {
      title: 'Питание',
      description: 'Контроль калорий',
      icon: 'Salad',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      path: '/family/nutrition'
    },
    {
      title: 'Голосования',
      description: 'Семейные решения',
      icon: 'Vote',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      path: '/family/voting'
    },
    {
      title: 'Путешествия',
      description: 'Планируй поездки',
      icon: 'Plane',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      path: '/family/trips'
    },
    {
      title: 'Досуг',
      description: 'События и активности',
      icon: 'PartyPopper',
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-600',
      path: '/family/leisure'
    },
    {
      title: 'Развитие',
      description: 'Тесты и тренинги',
      icon: 'Target',
      color: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      iconColor: 'text-violet-600',
      path: '/family/development'
    },
    {
      title: 'Профили семьи',
      description: 'Информация о членах семьи',
      icon: 'Users',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      path: '/family/profiles'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Icon name="Home" className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Наша Семья
          </h1>
          <p className="text-lg text-gray-600">
            Управление семьёй онлайн
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Link key={section.path} to={section.path}>
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-2 border-gray-100 hover:border-gray-200">
                <div className={`w-14 h-14 ${section.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon name={section.icon as any} className={`w-7 h-7 ${section.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {section.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
