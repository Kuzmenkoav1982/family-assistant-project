import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { AstrologyService } from '@/components/astrology/AstrologyService';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAstrologyDialog, setShowAstrologyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { assistantType, assistantName, selectedRole } = useAIAssistant();
  const { hasAIAccess, loading: subscriptionLoading } = useSubscription();

  // Перетаскивание виджета (десктоп - для окна чата)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('widgetPosition');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 420, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Перетаскивание круглой кнопки (мобильные)
  const [buttonPosition, setButtonPosition] = useState(() => {
    const saved = localStorage.getItem('buttonPosition');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 180 };
  });
  const [isButtonDragging, setIsButtonDragging] = useState(false);
  const [buttonDragStart, setButtonDragStart] = useState({ x: 0, y: 0 });

  // Скрываем виджет на странице /welcome
  const isWelcomePage = location.pathname === '/welcome';

  // Скрываем виджет автоматически при переходе
  useEffect(() => {
    let isMounted = true;
    if (!isWelcomePage && isMounted) {
      setIsOpen(false);
    }
    return () => {
      isMounted = false;
    };
  }, [location.pathname, isWelcomePage]);

  // Состояние для роли Кузи
  const [kuzyaRole, setKuzyaRole] = useState(() => localStorage.getItem('kuzyaRole') || 'family-assistant');

  // Обновление роли
  const handleRoleChange = (newRole: string) => {
    setKuzyaRole(newRole);
    localStorage.setItem('kuzyaRole', newRole);
    const displayName = assistantName || (assistantType === 'domovoy' ? 'Домового' : 'ассистента');
    toast({
      title: `Роль ${displayName} изменена`,
      description: getRoleInfo(newRole).name,
    });
  };

  // Сброс позиции виджета
  const handleResetPosition = () => {
    if (window.innerWidth < 768) {
      // На мобильных сбрасываем позицию круглой кнопки
      const defaultButtonPosition = { x: window.innerWidth - 80, y: window.innerHeight - 180 };
      setButtonPosition(defaultButtonPosition);
      localStorage.setItem('buttonPosition', JSON.stringify(defaultButtonPosition));
      toast({
        title: '📍 Позиция сброшена',
        description: 'Кнопка вернулась на место по умолчанию'
      });
      return;
    }
    // На десктопе сбрасываем позицию окна чата
    const defaultPosition = { x: window.innerWidth - 420, y: 100 };
    setPosition(defaultPosition);
    localStorage.setItem('widgetPosition', JSON.stringify(defaultPosition));
    toast({
      title: '📍 Позиция сброшена',
      description: 'Виджет вернулся на место по умолчанию'
    });
  };

  // Информация о ролях с изображениями
  const getRoleInfo = (role: string) => {
    const roles: Record<string, { name: string; icon: string; description: string; image: string }> = {
      'family-assistant': { name: 'Семейный помощник', icon: '🏡', description: 'Универсальный помощник', image: 'https://cdn.poehali.dev/files/Семейный помощник.png' },
      'cook': { name: 'Повар', icon: '🍳', description: 'Рецепты и кулинария', image: 'https://cdn.poehali.dev/files/Повар.png' },
      'organizer': { name: 'Организатор', icon: '📋', description: 'Планирование задач', image: 'https://cdn.poehali.dev/files/Организатор.png' },
      'child-educator': { name: 'Воспитатель', icon: '👶', description: 'Советы по детям', image: 'https://cdn.poehali.dev/files/Воспитатель.png' },
      'financial-advisor': { name: 'Финансовый советник', icon: '💰', description: 'Бюджет и экономия', image: 'https://cdn.poehali.dev/files/Финансовый советник.png' },
      'psychologist': { name: 'Психолог', icon: '🧠', description: 'Отношения в семье', image: 'https://cdn.poehali.dev/files/Психолог.png' },
      'fitness-trainer': { name: 'Фитнес-тренер', icon: '💪', description: 'Здоровье и спорт', image: 'https://cdn.poehali.dev/files/Фитнес-тренер.png' },
      'nutritionist': { name: 'Диетолог', icon: '🍎', description: 'Здоровое питание', image: 'https://cdn.poehali.dev/files/Диетолог.png' },
      'travel-planner': { name: 'Тревел-планер', icon: '✈️', description: 'Организация поездок', image: 'https://cdn.poehali.dev/files/Тревел-планер.png' },
      'astrologer': { name: 'Астролог', icon: '🌙', description: 'Гороскопы и прогнозы', image: 'https://cdn.poehali.dev/files/Астролог.png' },
    };
    return roles[role] || roles['family-assistant'];
  };

  // Получаем системный промпт в зависимости от роли
  const getSystemPrompt = () => {
    const role = kuzyaRole;
    const isDomovoy = assistantType === 'domovoy';
    const name = assistantName || (isDomovoy ? 'Домовой' : 'Ассистент');
    
    const basePrompt = isDomovoy
      ? `Ты добрый домовой, хранитель очага, по имени "${name}". Отвечай на русском языке тёплым семейным языком, с заботой и мудростью предков. Используй эмодзи 🏠🧙‍♂️ для наглядности.`
      : `Ты AI-ассистент по имени "${name}". Отвечай на русском языке профессионально, точно и по делу. Используй эмодзи 🤖⚡ для наглядности.`;
    
    const rolePrompts: Record<string, string> = {
      'family-assistant': `${basePrompt} Ты семейный помощник. Помогаешь с домашними делами, рецептами, планированием, воспитанием детей, организацией быта и другими семейными вопросами.`,
      'cook': `${basePrompt} Ты опытный повар и кулинарный эксперт. Специализируешься на рецептах, кулинарных советах, планировании меню и технологиях приготовления блюд.`,
      'organizer': `${basePrompt} Ты эксперт по организации и планированию. Помогаешь структурировать задачи, составлять расписания, оптимизировать домашний быт и управлять временем.`,
      'child-educator': `${basePrompt} Ты специалист по воспитанию и развитию детей. Даёшь советы по педагогике, детской психологии, образованию и развивающим занятиям.`,
      'financial-advisor': `${basePrompt} Ты семейный финансовый советник. Помогаешь с планированием бюджета, экономией, инвестициями и разумным управлением семейными финансами.`,
      'psychologist': `${basePrompt} Ты семейный психолог. Помогаешь с отношениями в семье, разрешением конфликтов, эмоциональным благополучием и психологической поддержкой.`,
      'fitness-trainer': `${basePrompt} Ты фитнес-тренер и специалист по здоровому образу жизни. Даёшь советы по физическим упражнениям, здоровью, питанию и поддержанию формы всей семьи.`,
      'nutritionist': `${basePrompt} Ты специалист по здоровому питанию и диетологии. Помогаешь составлять здоровые планы питания, учитывать калорийность, сбалансированность рациона для всей семьи.`,
      'travel-planner': `${basePrompt} Ты организатор путешествий. Помогаешь планировать поездки, выбирать направления, составлять маршруты и давать туристические советы для семейного отдыха.`,
      'astrologer': `${basePrompt} Ты астролог и специалист по восточной астрологии. Составляешь гороскопы, даёшь прогнозы на день/неделю/месяц, анализируешь совместимость знаков зодиака, учитываешь влияние планет на семейную жизнь и отношения. Используй данные о датах рождения членов семьи для персонализированных прогнозов.`
    };

    return rolePrompts[role] || rolePrompts['family-assistant'];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Показываем приветствие через 3 секунды после загрузки (только не на /welcome и только один раз)
    if (isWelcomePage) return;
    
    const hasSeenWelcome = localStorage.getItem('hasSeenDomovoyWelcome') === 'true';
    if (hasSeenWelcome) return;
    
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0 && isMounted) {
        setShowWelcome(true);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isWelcomePage, isOpen, messages.length]);

  const quickActions = [
    { icon: '🍳', text: 'Что приготовить?', query: 'Подскажи простые идеи для семейного ужина на сегодня' },
    { icon: '🎨', text: 'Чем заняться?', query: 'Предложи идеи для семейного досуга на выходные' },
    { icon: '📝', text: 'Организация дел', query: 'Как лучше организовать домашние дела и задачи?' },
    { icon: '👶', text: 'Воспитание детей', query: 'Дай советы по воспитанию детей школьного возраста' },
    { icon: '💰', text: 'Семейный бюджет', query: 'Как эффективно планировать семейный бюджет?' },
    { icon: '🏠', text: 'Уборка дома', query: 'Составь план эффективной уборки дома' },
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    // Проверка подписки перед отправкой
    if (!subscriptionLoading && !hasAIAccess) {
      toast({
        title: '🔒 Требуется подписка',
        description: 'AI-помощник доступен с подпиской "AI-Помощник" или "Полный пакет"',
      });
      setTimeout(() => navigate('/pricing'), 2000);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const apiUrl = func2url['ai-assistant'];
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: messageText
            }
          ],
          systemPrompt: getSystemPrompt(),
          familyId: userData.family_id,
          userId: userData.id
        })
      });

      if (response.status === 403) {
        const error = await response.json();
        if (error.error === 'subscription_required') {
          toast({
            title: '🔒 Требуется подписка',
            description: 'Подписка неактивна. Подключите AI-помощника',
          });
          setTimeout(() => navigate('/pricing'), 2000);
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || 'Извините, не смог обработать ваш запрос.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение. Попробуйте позже.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setIsOpen(true);
    setShowWelcome(false);
    sendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Обработчики перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 100;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('widgetPosition', JSON.stringify(position));
    }
  };

  // Обработчики перетаскивания круглой кнопки
  const [hasMoved, setHasMoved] = useState(false);

  const handleButtonTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsButtonDragging(true);
    setHasMoved(false);
    setButtonDragStart({
      x: touch.clientX - buttonPosition.x,
      y: touch.clientY - buttonPosition.y
    });
    // Блокируем выделение текста во всём body
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handleButtonTouchMove = (e: React.TouchEvent) => {
    if (!isButtonDragging) return;
    e.preventDefault();
    setHasMoved(true);

    const touch = e.touches[0];
    const newX = touch.clientX - buttonDragStart.x;
    const newY = touch.clientY - buttonDragStart.y;

    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 160; // 80px кнопка + 80px меню снизу

    setButtonPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleButtonTouchEnd = () => {
    if (isButtonDragging) {
      setIsButtonDragging(false);
      localStorage.setItem('buttonPosition', JSON.stringify(buttonPosition));
      // Возвращаем возможность выделения текста
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
  };

  // Эффект для перетаскивания
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position, dragStart]);

  // Не показываем ничего на странице /welcome
  if (isWelcomePage) return null;

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-4 border-orange-300">
            <button
              onClick={() => {
                setShowWelcome(false);
                localStorage.setItem('hasSeenDomovoyWelcome', 'true');
              }}
              className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              {assistantType === 'domovoy' ? (
                <div 
                  className="relative bg-white rounded-full overflow-hidden border-4 border-orange-400 flex-shrink-0"
                  style={{
                    width: '64px',
                    height: '80px',
                    borderRadius: '32px'
                  }}
                >
                  <img 
                    src={getRoleInfo(kuzyaRole).image}
                    alt={getRoleInfo(kuzyaRole).name}
                    className="w-full h-full pointer-events-none object-cover"
                    style={{ objectPosition: 'center' }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl border-4 border-blue-400 flex-shrink-0">
                  🤖
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-800 mb-1">
                  Привет! Я {assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'Ассистент')}! {assistantType === 'domovoy' ? '🏡' : '🤖'}
                </h3>
                <p className="text-sm text-gray-600">
                  {assistantType === 'domovoy' 
                    ? 'Ваш умный семейный помощник! Помогу с рецептами, планами, советами и организацией быта.'
                    : 'Ваш умный семейный помощник! Помогу с рецептами, планами, советами и организацией быта.'}
                </p>
                <Button
                  onClick={() => {
                    setIsOpen(true);
                    setShowWelcome(false);
                    localStorage.setItem('hasSeenDomovoyWelcome', 'true');
                  }}
                  className="mt-3 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                  size="sm"
                >
                  Начать общение ✨
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {isOpen && (
        <div 
          style={window.innerWidth >= 768 ? { left: `${position.x}px`, top: `${position.y}px` } : {}}
          className={`fixed z-50 bg-white shadow-2xl border-2 border-orange-300 flex flex-col ${
            isMinimized 
              ? 'w-80 h-16 bottom-6 right-6 rounded-2xl' 
              : 'w-full h-full md:w-96 md:h-[600px] md:rounded-2xl ' +
                'top-0 left-0 md:top-auto md:left-auto md:max-h-[calc(100vh-100px)]'
          }`}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 md:rounded-t-2xl md:cursor-grab md:active:cursor-grabbing select-none"
            onMouseDown={(e) => {
              if (window.innerWidth >= 768) {
                handleMouseDown(e);
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {assistantType === 'domovoy' ? (
                  <div 
                    className="relative bg-white rounded-full overflow-hidden border-2 border-white/50"
                    style={{
                      width: '56px',
                      height: '70px',
                      borderRadius: '28px'
                    }}
                  >
                    <img 
                      src={getRoleInfo(kuzyaRole).image}
                      alt={getRoleInfo(kuzyaRole).name}
                      className="w-full h-full pointer-events-none object-cover"
                      style={{ objectPosition: 'center' }}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl border-2 border-white/50">
                    🤖
                  </div>
                )}
                <div>
                  <h3 className="font-bold">
                    {assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'Ассистент')} — AI Помощник
                  </h3>
                  <p className="text-xs opacity-90">Всегда на связи</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hover:bg-white/20 p-1 rounded"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Индикатор роли с дропдауном */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getRoleInfo(kuzyaRole).icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{getRoleInfo(kuzyaRole).name}</div>
                      <div className="text-xs opacity-80">{getRoleInfo(kuzyaRole).description}</div>
                    </div>
                  </div>
                  <Icon name="ChevronDown" size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="start">
                <DropdownMenuLabel>
                  {assistantType === 'domovoy' ? 'Роль Домового в семье' : 'Выберите роль ассистента'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRoleChange('family-assistant')}>
                  <span className="mr-2">🏡</span>
                  <div>
                    <div className="font-medium">Семейный помощник</div>
                    <div className="text-xs text-gray-500">Универсальный помощник</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('cook')}>
                  <span className="mr-2">🍳</span>
                  <div>
                    <div className="font-medium">Повар</div>
                    <div className="text-xs text-gray-500">Рецепты и кулинария</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('organizer')}>
                  <span className="mr-2">📋</span>
                  <div>
                    <div className="font-medium">Организатор</div>
                    <div className="text-xs text-gray-500">Планирование задач</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('child-educator')}>
                  <span className="mr-2">👶</span>
                  <div>
                    <div className="font-medium">Воспитатель</div>
                    <div className="text-xs text-gray-500">Советы по детям</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('financial-advisor')}>
                  <span className="mr-2">💰</span>
                  <div>
                    <div className="font-medium">Финансовый советник</div>
                    <div className="text-xs text-gray-500">Бюджет и экономия</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('psychologist')}>
                  <span className="mr-2">🧠</span>
                  <div>
                    <div className="font-medium">Психолог</div>
                    <div className="text-xs text-gray-500">Отношения в семье</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('fitness-trainer')}>
                  <span className="mr-2">💪</span>
                  <div>
                    <div className="font-medium">Фитнес-тренер</div>
                    <div className="text-xs text-gray-500">Здоровье и спорт</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('travel-planner')}>
                  <span className="mr-2">✈️</span>
                  <div>
                    <div className="font-medium">Тревел-планер</div>
                    <div className="text-xs text-gray-500">Организация поездок</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleChange('astrologer')}>
                  <span className="mr-2">🔮</span>
                  <div>
                    <div className="font-medium">Астролог</div>
                    <div className="text-xs text-gray-500">Консультации по астрологии</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Дополнительные кнопки */}
            <div className="mt-3 space-y-2">
              <button
                onClick={() => window.location.href = 'https://family-assistant-project--preview.poehali.dev/domovoy'}
                className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-lg">📖</span>
                <div>
                  <div className="text-sm font-semibold">Узнать больше о Домовом</div>
                  <div className="text-xs opacity-80">Подробная информация</div>
                </div>
              </button>
              
              <button
                onClick={() => setShowAstrologyDialog(true)}
                className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-lg">🌙</span>
                <div>
                  <div className="text-sm font-semibold">Астрологические прогнозы Домового</div>
                  <div className="text-xs opacity-80">Гороскопы и прогнозы</div>
                </div>
              </button>
              
              <button
                onClick={handleResetPosition}
                className="w-full bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 flex items-center gap-2 transition-colors text-left"
              >
                <span className="text-lg">📍</span>
                <div>
                  <div className="text-sm font-semibold">Сбросить позицию</div>
                  <div className="text-xs opacity-80">Вернуть в угол экрана</div>
                </div>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50/30 to-white">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    {assistantType === 'domovoy' ? (
                      <img 
                        src={kuzyaRole === 'cook' 
                          ? "https://cdn.poehali.dev/files/Повар.png"
                          : "https://cdn.poehali.dev/files/Кузя.png"
                        }
                        alt={kuzyaRole === 'cook' ? 'Домовой-Повар' : 'Домовой'}
                        className={`w-20 h-20 rounded-full border-4 border-orange-400 mx-auto mb-4 pointer-events-none ${
                          kuzyaRole === 'cook' ? 'object-contain bg-amber-100' : 'object-cover'
                        }`}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl border-4 border-blue-400 mx-auto mb-4">
                        🤖
                      </div>
                    )}
                    <h3 className="font-bold text-gray-800 mb-2">
                      Привет! Я {assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'Ассистент')}! {assistantType === 'domovoy' ? '🏡' : '🤖'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Выберите тему или задайте свой вопрос:</p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.query)}
                          className="bg-white hover:bg-orange-50 p-3 rounded-lg text-left border-2 border-orange-200 hover:border-orange-400 transition-all"
                        >
                          <div className="text-2xl mb-1">{action.icon}</div>
                          <div className="text-xs font-medium text-gray-700">{action.text}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {message.role === 'user' ? (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">Я</span>
                            </div>
                          ) : assistantType === 'domovoy' ? (
                            <img 
                              src={kuzyaRole === 'cook' 
                                ? "https://cdn.poehali.dev/files/Повар.png"
                                : "https://cdn.poehali.dev/files/Кузя.png"
                              }
                              alt={kuzyaRole === 'cook' ? 'Домовой-Повар' : 'Домовой'}
                              className={`w-8 h-8 rounded-full border-2 border-orange-400 pointer-events-none ${
                                kuzyaRole === 'cook' ? 'object-contain bg-amber-100' : 'object-cover'
                              }`}
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg border-2 border-blue-400">
                              🤖
                            </div>
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[75%] ${
                            message.role === 'user' ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                              message.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white text-gray-800 border-2 border-orange-200'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        {assistantType === 'domovoy' ? (
                          <img 
                            src={kuzyaRole === 'cook' 
                              ? "https://cdn.poehali.dev/files/Повар.png"
                              : "https://cdn.poehali.dev/files/Кузя.png"
                            }
                            alt={kuzyaRole === 'cook' ? 'Домовой-Повар' : 'Домовой'}
                            className={`w-8 h-8 rounded-full border-2 border-orange-400 pointer-events-none ${
                              kuzyaRole === 'cook' ? 'object-contain bg-amber-100' : 'object-cover'
                            }`}
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-lg border-2 border-blue-400">
                            🤖
                          </div>
                        )}
                        <div className="bg-white border-2 border-orange-200 rounded-2xl px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 bg-white border-t-2 border-orange-200 md:rounded-b-2xl flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение..."
                    className="flex-1 min-h-[44px] max-h-[80px] resize-none text-sm border-2 border-orange-200 focus:border-orange-400 text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 self-end"
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && !showWelcome && (
        <button
          onClick={(e) => {
            if (!hasMoved) {
              setIsOpen(true);
            }
          }}
          onTouchStart={handleButtonTouchStart}
          onTouchMove={handleButtonTouchMove}
          onTouchEnd={handleButtonTouchEnd}
          style={{ 
            left: `${buttonPosition.x}px`, 
            top: `${buttonPosition.y}px`,
            width: assistantType === 'domovoy' ? '80px' : '64px',
            height: assistantType === 'domovoy' ? '100px' : '64px',
            borderRadius: assistantType === 'domovoy' ? '50%' : '50%'
          }}
          className={`fixed z-50 shadow-2xl border-4 flex items-center justify-center transition-none overflow-hidden ${
            assistantType === 'domovoy' 
              ? 'bg-white hover:bg-amber-50 border-orange-400' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-400 text-3xl rounded-full'
          } ${isButtonDragging ? 'scale-110' : 'hover:scale-105 animate-bounce-subtle'}`}
        >
          {assistantType === 'domovoy' ? (
            <img 
              src={getRoleInfo(kuzyaRole).image}
              alt={getRoleInfo(kuzyaRole).name}
              className="w-full h-full pointer-events-none object-cover"
              style={{ objectPosition: 'center' }}
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            '🤖'
          )}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Astrology Dialog */}
      <Dialog open={showAstrologyDialog} onOpenChange={setShowAstrologyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              Астрологические прогнозы Домового
            </DialogTitle>
          </DialogHeader>
          <AstrologyService />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistantWidget;