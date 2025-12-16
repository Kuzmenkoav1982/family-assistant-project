import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export function AliceCommandsTab() {
  const commandGroups = [
    {
      title: 'Задачи',
      icon: 'CheckSquare',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      commands: [
        { text: 'Добавь задачу "купить молоко"', desc: 'Создать новую задачу' },
        { text: 'Покажи мои задачи', desc: 'Список всех задач' },
        { text: 'Отметь задачу "купить молоко" выполненной', desc: 'Завершить задачу' },
        { text: 'Удали задачу "купить молоко"', desc: 'Удалить задачу' },
      ]
    },
    {
      title: 'События',
      icon: 'Calendar',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      commands: [
        { text: 'Добавь событие "День рождения" на 25 декабря', desc: 'Создать событие' },
        { text: 'Что у меня сегодня?', desc: 'События на сегодня' },
        { text: 'Какие события на этой неделе?', desc: 'Расписание недели' },
        { text: 'Напомни мне завтра в 9 утра о встрече', desc: 'Создать напоминание' },
      ]
    },
    {
      title: 'Семья',
      icon: 'Users',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      commands: [
        { text: 'Покажи членов семьи', desc: 'Список участников' },
        { text: 'Кто что делает сегодня?', desc: 'Задачи всей семьи' },
        { text: 'Назначь задачу "вынести мусор" Алексею', desc: 'Делегировать задачу' },
      ]
    },
    {
      title: 'Покупки',
      icon: 'ShoppingCart',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      commands: [
        { text: 'Добавь молоко в список покупок', desc: 'Добавить товар' },
        { text: 'Что в списке покупок?', desc: 'Показать список' },
        { text: 'Убери молоко из списка', desc: 'Удалить товар' },
        { text: 'Очисти список покупок', desc: 'Удалить всё' },
      ]
    },
    {
      title: 'Информация',
      icon: 'Info',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      commands: [
        { text: 'Какие у меня планы?', desc: 'Сводка дел' },
        { text: 'Сколько у меня задач?', desc: 'Статистика' },
        { text: 'Что нового в семье?', desc: 'Последние обновления' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {commandGroups.map((group, idx) => (
        <Card key={idx}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${group.color}`}>
              <Icon name={group.icon as any} size={24} />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.commands.map((cmd, cmdIdx) => (
              <div key={cmdIdx} className={`p-4 ${group.bgColor} rounded-lg border-2 ${group.color.replace('text', 'border')}`}>
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="shrink-0 mt-1">
                    <Icon name="Mic" size={12} className="mr-1" />
                    Алиса
                  </Badge>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">"{cmd.text}"</p>
                    <p className="text-sm text-gray-600 mt-1">{cmd.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
