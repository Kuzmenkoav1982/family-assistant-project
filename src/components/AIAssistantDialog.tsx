import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useAIAssistant, defaultRoles } from '@/contexts/AIAssistantContext';
import type { AIAssistantRole } from '@/contexts/AIAssistantContext';

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIAssistantDialog({ open, onOpenChange }: AIAssistantDialogProps) {
  const navigate = useNavigate();
  const { assistantType, assistantName, selectedRole, setSelectedRole } = useAIAssistant();
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const isDomovoy = assistantType === 'domovoy';

  // Приветствия в зависимости от типа ассистента
  const greetings = {
    domovoy: [
      "Здравствуй, хозяин! Чем помочь семье? 🏠",
      "Домовой на страже! Что тревожит? 🧙‍♂️",
      "Порядок в доме - порядок в делах! 📋"
    ],
    neutral: [
      "Здравствуйте! Чем могу помочь? 🤖",
      "Готов к работе! ⚡",
      "Слушаю вас 📊"
    ]
  };

  const currentGreetings = isDomovoy ? greetings.domovoy : greetings.neutral;
  const greeting = currentGreetings[Math.floor(Math.random() * currentGreetings.length)];

  const roleEmoji = selectedRole?.emoji || (isDomovoy ? '🏠' : '🤖');
  const roleName = selectedRole?.name || (isDomovoy ? 'Домовой' : assistantName || 'Ассистент');

  const getTips = () => {
    if (!selectedRole) {
      return isDomovoy ? [
        'Выберите роль для Домового, чтобы он мог помогать эффективнее',
        'Посетите страницу Домового, чтобы узнать о нём больше',
        'Угостите Домового, чтобы повысить его уровень мудрости'
      ] : [
        'Выберите роль для ассистента в настройках',
        'Настройте уведомления в разделе Настройки',
        'Используйте быстрые действия на главной странице'
      ];
    }

    // Советы по ролям
    const roleTips: Record<string, string[]> = {
      family: [
        'Используйте календарь для планирования семейных событий',
        'Создавайте семейные традиции и цели',
        'Регулярно проводите семейные советы'
      ],
      cook: [
        'Планируйте меню на неделю в разделе "Меню"',
        'Добавляйте любимые рецепты в коллекцию',
        'Учитывайте пищевые предпочтения всех членов семьи'
      ],
      organizer: [
        'Используйте списки задач для эффективного планирования',
        'Назначайте исполнителей для каждой задачи',
        'Отслеживайте прогресс выполнения задач'
      ],
      educator: [
        'Создавайте планы развития для детей',
        'Отслеживайте успехи в учёбе',
        'Используйте систему баллов для мотивации'
      ],
      finance: [
        'Ведите учёт доходов и расходов',
        'Устанавливайте финансовые цели',
        'Планируйте крупные покупки заранее'
      ],
      psychologist: [
        'Регулярно проходите тесты в разделе "Развитие"',
        'Обсуждайте результаты всей семьёй',
        'Используйте дневник для отслеживания эмоций'
      ],
      fitness: [
        'Составьте план тренировок для семьи',
        'Отслеживайте физическую активность',
        'Установите цели по здоровью и фитнесу'
      ],
      nutritionist: [
        'Следите за балансом питания',
        'Планируйте здоровые перекусы',
        'Учитывайте калорийность блюд'
      ],
      travel: [
        'Создавайте списки желаемых путешествий',
        'Планируйте маршруты заранее',
        'Ведите бюджет поездок'
      ],
      astrologer: [
        'Проверяйте совместимость членов семьи',
        'Планируйте важные дела по лунному календарю',
        'Читайте семейные гороскопы'
      ]
    };

    return roleTips[selectedRole.id] || roleTips.family;
  };

  const tips = getTips();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{roleEmoji}</span>
            <div>
              <div>{roleName}</div>
              {selectedRole && (
                <div className="text-sm font-normal text-gray-600">
                  {selectedRole.description}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Greeting */}
          <div className={`p-4 rounded-lg border-2 ${
            isDomovoy
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300'
          }`}>
            <p className="text-lg font-medium">{greeting}</p>
          </div>

          {/* Current Role */}
          {selectedRole && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedRole.emoji}</span>
                <div>
                  <p className="font-semibold">{selectedRole.name}</p>
                  <p className="text-sm text-gray-600">{selectedRole.description}</p>
                </div>
              </div>
              <Button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                variant="outline"
                size="sm"
              >
                <Icon name="RefreshCw" size={16} className="mr-1" />
                Сменить
              </Button>
            </div>
          )}

          {/* Role Selector */}
          {(showRoleSelector || !selectedRole) && (
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Icon name="Briefcase" size={18} />
                Выберите роль {isDomovoy ? 'Домового' : 'ассистента'}:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultRoles.map((role: AIAssistantRole) => (
                  <Button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setShowRoleSelector(false);
                    }}
                    variant={selectedRole?.id === role.id ? 'default' : 'outline'}
                    className="h-auto py-3 px-3 flex flex-col items-center gap-1"
                    size="sm"
                  >
                    <span className="text-xl">{role.emoji}</span>
                    <span className="text-xs font-semibold text-center leading-tight">
                      {role.name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Lightbulb" size={18} />
              💡 Полезные советы:
            </h4>
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Icon name="Check" className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Icon name="Zap" size={18} />
              ⚡ Быстрые действия:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => {
                  navigate('/tasks');
                  onOpenChange(false);
                }}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <Icon name="CheckSquare" size={20} />
                <span className="text-xs">Задачи</span>
              </Button>
              <Button
                onClick={() => {
                  navigate('/calendar');
                  onOpenChange(false);
                }}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <Icon name="Calendar" size={20} />
                <span className="text-xs">Календарь</span>
              </Button>
              <Button
                onClick={() => {
                  navigate('/shopping');
                  onOpenChange(false);
                }}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <Icon name="ShoppingCart" size={20} />
                <span className="text-xs">Покупки</span>
              </Button>
              <Button
                onClick={() => {
                  navigate('/finance');
                  onOpenChange(false);
                }}
                variant="outline"
                className="h-auto py-3 flex flex-col items-center gap-1"
              >
                <Icon name="Wallet" size={20} />
                <span className="text-xs">Финансы</span>
              </Button>
            </div>
          </div>

          {/* Domovoy Special Section */}
          {isDomovoy && (
            <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                🏠 Узнайте больше о Домовом
              </h4>
              <p className="text-sm text-gray-700 mb-3">
                История, традиции и способы задобрить хранителя очага
              </p>
              <Button
                onClick={() => {
                  navigate('/domovoy');
                  onOpenChange(false);
                }}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Icon name="BookOpen" className="mr-2" />
                Страница Домового
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            className="flex-1"
          >
            <Icon name="Settings" className="mr-2" size={18} />
            Настройки
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
