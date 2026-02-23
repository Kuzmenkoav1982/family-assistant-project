import Icon from '@/components/ui/icon';

const benefits = [
  {
    icon: 'CheckSquare',
    title: 'Задачи и покупки',
    description: 'Распределяйте дела между членами семьи. Списки покупок обновляются у всех.',
  },
  {
    icon: 'Calendar',
    title: 'Семейный календарь',
    description: 'Дни рождения, врачи, школа — все события в одном месте с напоминаниями.',
  },
  {
    icon: 'Heart',
    title: 'Здоровье и питание',
    description: 'Меню на неделю, лекарства, прививки — следите за здоровьем всей семьи.',
  },
  {
    icon: 'Brain',
    title: 'AI-помощник',
    description: 'Спросите что угодно — от рецепта ужина до совета по воспитанию.',
  },
];

export default function WelcomePromo() {
  return (
    <div className="mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {benefits.map((item, index) => (
          <div
            key={index}
            className="flex gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name={item.icon} size={22} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}