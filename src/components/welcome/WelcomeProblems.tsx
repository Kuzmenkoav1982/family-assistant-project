import Icon from '@/components/ui/icon';

const problems = [
  {
    before: 'Записки на холодильнике',
    after: 'Единый список задач с уведомлениями',
    icon: 'ClipboardList',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  {
    before: '«Кто забирает из школы?»',
    after: 'Семейный календарь с напоминаниями',
    icon: 'Calendar',
    color: 'text-purple-500',
    bg: 'bg-purple-100',
  },
  {
    before: '«Что сегодня на ужин?»',
    after: 'Меню на неделю + рецепт из продуктов дома',
    icon: 'ChefHat',
    color: 'text-green-500',
    bg: 'bg-green-100',
  },
  {
    before: '«Где ребёнок?»',
    after: 'GPS-маячок семьи в реальном времени',
    icon: 'MapPin',
    color: 'text-red-500',
    bg: 'bg-red-100',
  },
  {
    before: 'Забытые прививки и лекарства',
    after: 'Медкарты семьи с напоминаниями',
    icon: 'Heart',
    color: 'text-pink-500',
    bg: 'bg-pink-100',
  },
];

export default function WelcomeProblems() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Знакомые проблемы?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Мы создали решение для каждой из них
          </p>
        </div>

        <div className="space-y-4">
          {problems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={item.icon} size={22} className={item.color} />
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm line-through">{item.before}</p>
                </div>
                <div className="hidden sm:block">
                  <Icon name="ArrowRight" size={20} className="text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
