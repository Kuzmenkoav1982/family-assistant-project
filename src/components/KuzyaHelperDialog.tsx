import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface KuzyaHelperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type KuzyaRole = 'helper' | 'psychologist' | 'financier' | 'teacher' | 'coach';

const KUZYA_ROLES = {
  helper: {
    name: 'Помощник',
    icon: 'MessageCircle',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Общая помощь и поддержка по сервису',
    greeting: 'Привет! Я помогу разобраться с любыми вопросами по сервису.',
    tips: [
      'Используйте быстрые действия на главной странице',
      'Настройте уведомления в разделе Настройки',
      'Пригласите членов семьи через код приглашения'
    ]
  },
  psychologist: {
    name: 'Семейный психолог',
    icon: 'Brain',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Консультации по семейным отношениям',
    greeting: 'Здравствуйте! Я здесь, чтобы помочь с семейными вопросами и отношениями.',
    tips: [
      'Регулярно проходите тесты в разделе "Развитие"',
      'Обсуждайте результаты тестов всей семьёй',
      'Используйте дневник для отслеживания эмоций'
    ]
  },
  financier: {
    name: 'Финансовый советник',
    icon: 'Wallet',
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Помощь в управлении семейным бюджетом',
    greeting: 'Добрый день! Помогу наладить семейные финансы и достичь целей.',
    tips: [
      'Ведите учёт доходов и расходов в разделе Финансы',
      'Установите финансовые цели и отслеживайте прогресс',
      'Планируйте крупные покупки заранее'
    ]
  },
  teacher: {
    name: 'Семейный педагог',
    icon: 'GraduationCap',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    description: 'Образование и развитие детей',
    greeting: 'Приветствую! Помогу с вопросами образования и развития детей.',
    tips: [
      'Отслеживайте успеваемость в разделе Дети',
      'Создавайте планы развития для каждого ребёнка',
      'Используйте систему поощрений за достижения'
    ]
  },
  coach: {
    name: 'Лайф-коуч',
    icon: 'Target',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: 'Достижение семейных целей',
    greeting: 'Привет! Помогу поставить цели и достичь их вместе с семьёй.',
    tips: [
      'Ставьте конкретные и измеримые цели',
      'Разбивайте большие цели на маленькие шаги',
      'Отмечайте прогресс и празднуйте успехи'
    ]
  }
};

export default function KuzyaHelperDialog({ open, onOpenChange }: KuzyaHelperDialogProps) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<KuzyaRole>('helper');

  const currentRole = KUZYA_ROLES[selectedRole];

  const handleNavigation = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const openTelegramSupport = () => {
    onOpenChange(false);
    window.open('https://t.me/nash_dom_poddershka', '_blank');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <img 
                src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                alt="Кузя"
                className="w-24 h-24 object-cover object-top rounded-full border-4 border-purple-200"
              />
              <div>
                <div className="flex items-center gap-2">
                  {currentRole.name}
                  <Badge className={currentRole.color}>
                    <Icon name={currentRole.icon} size={14} className="mr-1" />
                    {selectedRole}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 font-normal mt-1">{currentRole.description}</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Role Selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Выберите роль помощника</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(KUZYA_ROLES).map(([key, role]) => (
                  <Button
                    key={key}
                    variant={selectedRole === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRole(key as KuzyaRole)}
                    className="h-auto py-3 flex flex-col items-start gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={role.icon} size={16} />
                      <span className="text-xs font-semibold">{role.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Greeting */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <p className="text-gray-700 italic">"{currentRole.greeting}"</p>
            </div>

            {/* Tips */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Полезные советы</p>
              <div className="space-y-2">
                {currentRole.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Действия</p>
              <div className="grid gap-3">
                {selectedRole === 'helper' && (
                  <>
                    <Button
                      onClick={openTelegramSupport}
                      variant="outline"
                      className="h-auto py-3 flex items-start gap-3 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Icon name="MessageCircle" size={20} className="text-blue-600 mt-1" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Техническая поддержка</div>
                        <div className="text-xs text-gray-600">Написать в Telegram</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => handleNavigation('/feedback')}
                      variant="outline"
                      className="h-auto py-3 flex items-start gap-3 hover:border-purple-500 hover:bg-purple-50"
                    >
                      <Icon name="MessageSquare" size={20} className="text-purple-600 mt-1" />
                      <div className="text-left">
                        <div className="font-semibold text-sm">Отзывы</div>
                        <div className="text-xs text-gray-600">Поделитесь впечатлениями</div>
                      </div>
                    </Button>
                  </>
                )}

                {selectedRole === 'psychologist' && (
                  <Button
                    onClick={() => handleNavigation('/development')}
                    variant="outline"
                    className="h-auto py-3 flex items-start gap-3 hover:border-purple-500 hover:bg-purple-50"
                  >
                    <Icon name="Brain" size={20} className="text-purple-600 mt-1" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Раздел "Развитие"</div>
                      <div className="text-xs text-gray-600">Пройти психологические тесты</div>
                    </div>
                  </Button>
                )}

                {selectedRole === 'financier' && (
                  <Button
                    onClick={() => handleNavigation('/finance')}
                    variant="outline"
                    className="h-auto py-3 flex items-start gap-3 hover:border-green-500 hover:bg-green-50"
                  >
                    <Icon name="Wallet" size={20} className="text-green-600 mt-1" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Раздел "Финансы"</div>
                      <div className="text-xs text-gray-600">Управление семейным бюджетом</div>
                    </div>
                  </Button>
                )}

                {selectedRole === 'teacher' && (
                  <Button
                    onClick={() => handleNavigation('/children')}
                    variant="outline"
                    className="h-auto py-3 flex items-start gap-3 hover:border-yellow-500 hover:bg-yellow-50"
                  >
                    <Icon name="GraduationCap" size={20} className="text-yellow-600 mt-1" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Раздел "Дети"</div>
                      <div className="text-xs text-gray-600">Образование и развитие</div>
                    </div>
                  </Button>
                )}

                {selectedRole === 'coach' && (
                  <Button
                    onClick={() => handleNavigation('/')}
                    variant="outline"
                    className="h-auto py-3 flex items-start gap-3 hover:border-orange-500 hover:bg-orange-50"
                  >
                    <Icon name="Target" size={20} className="text-orange-600 mt-1" />
                    <div className="text-left">
                      <div className="font-semibold text-sm">Семейные цели</div>
                      <div className="text-xs text-gray-600">Планирование и достижение целей</div>
                    </div>
                  </Button>
                )}

                <Button
                  onClick={() => handleNavigation('/suggestions')}
                  variant="outline"
                  className="h-auto py-3 flex items-start gap-3 hover:border-blue-500 hover:bg-blue-50"
                >
                  <Icon name="Lightbulb" size={20} className="text-blue-600 mt-1" />
                  <div className="text-left">
                    <div className="font-semibold text-sm">Предложить улучшение</div>
                    <div className="text-xs text-gray-600">Идеи по развитию сервиса</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}