import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { initialTasks, initialFamilyMembers, initialCalendarEvents, initialFamilyGoals } from '@/data/mockData';
import { 
  recipes, 
  shoppingList, 
  nutritionEntries, 
  votingPolls, 
  trips, 
  leisureActivities, 
  developmentTests,
  calendarEventsExtended,
  familyGoalsExtended
} from '@/data/extendedMockData';

export default function DataShowcase() {
  const dataStats = [
    {
      title: 'Члены семьи',
      count: initialFamilyMembers.length,
      icon: 'Users',
      color: 'blue',
      description: 'Профили с фото, возрастом, достижениями',
      path: '/family/profiles'
    },
    {
      title: 'Задачи',
      count: initialTasks.length,
      icon: 'CheckSquare',
      color: 'orange',
      description: 'С категориями, баллами, повторениями',
      path: '/family/tasks'
    },
    {
      title: 'Рецепты',
      count: recipes.length,
      icon: 'ChefHat',
      color: 'amber',
      description: 'С ингредиентами, инструкциями, фото',
      path: '/family/recipes'
    },
    {
      title: 'Список покупок',
      count: shoppingList.length,
      icon: 'ShoppingCart',
      color: 'green',
      description: 'По категориям с приоритетами',
      path: '/family/shopping'
    },
    {
      title: 'Записи питания',
      count: nutritionEntries.length,
      icon: 'Salad',
      color: 'teal',
      description: 'Калории, белки, жиры, углеводы',
      path: '/family/nutrition'
    },
    {
      title: 'Голосования',
      count: votingPolls.length,
      icon: 'Vote',
      color: 'pink',
      description: 'Активные и завершенные опросы',
      path: '/family/voting'
    },
    {
      title: 'Путешествия',
      count: trips.length,
      icon: 'Plane',
      color: 'indigo',
      description: 'Запланированные и завершенные поездки',
      path: '/family/trips'
    },
    {
      title: 'Досуг',
      count: leisureActivities.length,
      icon: 'PartyPopper',
      color: 'rose',
      description: 'Мероприятия, рестораны, развлечения',
      path: '/family/leisure'
    },
    {
      title: 'Тесты развития',
      count: developmentTests.length,
      icon: 'Target',
      color: 'violet',
      description: 'Психология, отношения, навыки',
      path: '/family/development'
    },
    {
      title: 'События календаря',
      count: calendarEventsExtended.length,
      icon: 'Calendar',
      color: 'purple',
      description: 'С напоминаниями и повторениями',
      path: '/family/calendar'
    },
    {
      title: 'Семейные цели',
      count: familyGoalsExtended.length,
      icon: 'Trophy',
      color: 'yellow',
      description: 'С прогрессом и дедлайнами',
      path: '/'
    },
    {
      title: 'Аналитика',
      count: 1,
      icon: 'BarChart3',
      color: 'cyan',
      description: 'Статистика активности семьи',
      path: '/family/analytics'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
      violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center animate-bounce-in">
              <Icon name="Sparkles" className="w-9 h-9 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Приложение заполнено данными! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Все модули теперь содержат реалистичные данные семьи Петровых
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/family/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Icon name="Home" className="w-5 h-5 mr-2" />
                Семейный дашборд
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline">
                <Icon name="ArrowLeft" className="w-5 h-5 mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-8 border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Info" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Семья Петровых - демо-данные</h3>
              <p className="text-gray-700 mb-3">
                В приложение добавлены реалистичные данные семьи из 6 человек: родители (Александр и Елена), 
                дети (Максим 11 лет и София 8 лет), бабушка (Анна) и дедушка (Виктор).
              </p>
              <p className="text-gray-700">
                Все модули заполнены готовыми данными: задачи, рецепты, покупки, путешествия, голосования, 
                события календаря, цели, записи питания, досуг и тесты развития.
              </p>
            </div>
          </div>
        </Card>

        {/* Data Overview */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Что было добавлено</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataStats.map((stat) => {
            const colors = getColorClasses(stat.color);
            return (
              <Link key={stat.title} to={stat.path}>
                <Card className={`p-6 border-2 ${colors.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon name={stat.icon as any} className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <Badge className={`${colors.bg} ${colors.text} border-0 text-lg font-bold`}>
                      {stat.count}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {stat.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stat.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-orange-600">
                    <span>Открыть</span>
                    <Icon name="ArrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Family Members Preview */}
        <Card className="p-8 mt-12 border-2 border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Семья Петровых</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {initialFamilyMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-4 border-gray-100">
                  <img 
                    src={member.photoUrl} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                <Badge className="bg-purple-100 text-purple-700 border-0 text-xs">
                  Level {member.level}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
