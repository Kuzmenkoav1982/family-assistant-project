import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { initialTasks, initialFamilyMembers } from '@/data/mockData';
import { shoppingList, recipes, trips } from '@/data/extendedMockData';

export function FamilyDashboardWidget() {
  const activeTasks = initialTasks.filter(t => !t.completed).length;
  const activeShoppingItems = shoppingList.filter(i => !i.bought).length;
  const upcomingTrips = trips.filter(t => t.status === 'planning' || t.status === 'booked').length;
  
  const quickLinks = [
    {
      title: 'Задачи',
      count: activeTasks,
      icon: 'CheckSquare',
      color: 'orange',
      path: '/family/tasks'
    },
    {
      title: 'Покупки',
      count: activeShoppingItems,
      icon: 'ShoppingCart',
      color: 'green',
      path: '/family/shopping'
    },
    {
      title: 'Рецепты',
      count: recipes.length,
      icon: 'ChefHat',
      color: 'amber',
      path: '/family/recipes'
    },
    {
      title: 'Путешествия',
      count: upcomingTrips,
      icon: 'Plane',
      color: 'indigo',
      path: '/family/trips'
    }
  ];

  return (
    <Card className="p-6 border-2 border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Icon name="Home" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Семейный центр</h3>
            <p className="text-sm text-gray-600">Быстрый доступ к разделам</p>
          </div>
        </div>
        <Link to="/family/dashboard">
          <Button size="sm" variant="outline">
            <span>Открыть</span>
            <Icon name="ArrowRight" className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group">
              <div className={`w-8 h-8 bg-${link.color}-100 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon name={link.icon as any} className={`w-4 h-4 text-${link.color}-600`} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{link.title}</p>
              <p className="text-xs text-gray-600">{link.count} активных</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Icon name="Users" className="w-4 h-4" />
            <span>{initialFamilyMembers.length} членов семьи</span>
          </div>
          <Link to="/family/profiles" className="text-orange-600 hover:text-orange-700 font-medium">
            Профили →
          </Link>
        </div>
      </div>
    </Card>
  );
}
