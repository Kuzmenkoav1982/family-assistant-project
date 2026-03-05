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
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAstrologyDialog, setShowAstrologyDialog] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedDonationAmount, setSelectedDonationAmount] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
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

  // Скрываем виджет на страницах регистрации и присоединения
  const hiddenPages = ['/welcome', '/login', '/register', '/join', '/onboarding'];
  const isWelcomePage = hiddenPages.includes(location.pathname);

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
  const cdnFile = (name: string) => `https://cdn.poehali.dev/files/${encodeURIComponent(name)}`;

  const getRoleInfo = (role: string) => {
    const roles: Record<string, { name: string; icon: string; description: string; image: string }> = {
      'family-assistant': { name: 'Семейный помощник', icon: '🏡', description: 'Универсальный помощник', image: cdnFile('Семейный помощник.png') },
      'cook': { name: 'Повар', icon: '🍳', description: 'Рецепты и кулинария', image: cdnFile('Повар.png') },
      'organizer': { name: 'Организатор', icon: '📋', description: 'Планирование задач', image: cdnFile('Организатор.png') },
      'child-educator': { name: 'Воспитатель', icon: '👶', description: 'Советы по детям', image: cdnFile('Воспитатель.png') },
      'financial-advisor': { name: 'Финансовый советник', icon: '💰', description: 'Бюджет и экономия', image: cdnFile('Финансовый советник.png') },
      'psychologist': { name: 'Психолог', icon: '🧠', description: 'Отношения в семье', image: cdnFile('Психолог.png') },
      'fitness-trainer': { name: 'Фитнес-тренер', icon: '💪', description: 'Здоровье и спорт', image: cdnFile('Фитнес-тренер.png') },
      'nutritionist': { name: 'Диетолог', icon: '🍎', description: 'Здоровое питание', image: cdnFile('Диетолог.png') },
      'travel-planner': { name: 'Тревел-планер', icon: '✈️', description: 'Организация поездок', image: cdnFile('Тревел-планер.png') },
      'astrologer': { name: 'Астролог', icon: '🌙', description: 'Гороскопы и прогнозы', image: cdnFile('Астролог.png') },
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
        description: 'AI-помощник доступен только с подпиской Premium',
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
            description: 'Подписка неактивна. Подключите Premium для доступа к AI',
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
                <div className="relative bg-white overflow-hidden border-4 border-orange-400 flex-shrink-0 rounded-2xl w-16 h-20">
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
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-blue-400 flex-shrink-0">
                  <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover" />
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
          className={`fixed z-40 bg-white shadow-2xl border border-gray-200 flex flex-col ${
            isMinimized 
              ? 'w-80 h-16 bottom-6 right-6 rounded-2xl' 
              : 'w-full h-[calc(100dvh-4rem)] md:w-96 md:h-[600px] md:rounded-2xl ' +
                'top-16 left-0 md:top-auto md:left-auto md:max-h-[calc(100vh-100px)]'
          }`}
        >
          {/* Header */}
          <div 
            className="bg-white border-b border-gray-100 md:rounded-t-2xl md:cursor-grab md:active:cursor-grabbing select-none flex-shrink-0"
            onMouseDown={(e) => {
              if (window.innerWidth >= 768) {
                handleMouseDown(e);
              }
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                {assistantType === 'domovoy' ? (
                  <div className="relative bg-white overflow-hidden border-2 border-orange-300 rounded-xl w-10 h-12 flex-shrink-0">
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
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                    <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">
                    {assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'Ассистент')}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 transition-colors">
                        <span>{getRoleInfo(kuzyaRole).icon}</span>
                        <span className="font-medium">{getRoleInfo(kuzyaRole).name}</span>
                        <Icon name="ChevronDown" size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="start">
                      <DropdownMenuLabel>
                        {assistantType === 'domovoy' ? 'Роль Домового' : 'Роль ассистента'}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {[
                        { role: 'family-assistant', emoji: '🏡', name: 'Семейный помощник', desc: 'Универсальный помощник' },
                        { role: 'cook', emoji: '🍳', name: 'Повар', desc: 'Рецепты и кулинария' },
                        { role: 'organizer', emoji: '📋', name: 'Организатор', desc: 'Планирование задач' },
                        { role: 'child-educator', emoji: '👶', name: 'Воспитатель', desc: 'Советы по детям' },
                        { role: 'financial-advisor', emoji: '💰', name: 'Финансовый советник', desc: 'Бюджет и экономия' },
                        { role: 'psychologist', emoji: '🧠', name: 'Психолог', desc: 'Отношения в семье' },
                        { role: 'fitness-trainer', emoji: '💪', name: 'Фитнес-тренер', desc: 'Здоровье и спорт' },
                        { role: 'travel-planner', emoji: '✈️', name: 'Тревел-планер', desc: 'Организация поездок' },
                        { role: 'astrologer', emoji: '🔮', name: 'Астролог', desc: 'Гороскопы и прогнозы' },
                      ].map((r) => (
                        <DropdownMenuItem key={r.role} onClick={() => handleRoleChange(r.role)}>
                          <span className="mr-2">{r.emoji}</span>
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.desc}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  title="Меню"
                >
                  <Icon name="MoreHorizontal" size={16} className="text-gray-500" />
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-500" /> : <Minimize2 className="w-4 h-4 text-gray-500" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* Сворачиваемое меню */}
            {isMenuExpanded && (
              <div className="px-3 pb-3 border-t border-gray-50">
                <div className="grid grid-cols-2 gap-1.5 pt-2">
                  <button
                    onClick={() => { window.location.href = '/domovoy'; setIsMenuExpanded(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm">📖</span>
                    <span className="text-xs font-medium text-gray-700">О Домовом</span>
                  </button>
                  <button
                    onClick={() => { setShowAstrologyDialog(true); setIsMenuExpanded(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm">🌙</span>
                    <span className="text-xs font-medium text-gray-700">Прогнозы</span>
                  </button>
                  <button
                    onClick={() => { setShowDonationDialog(true); setIsMenuExpanded(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                  >
                    <span className="text-sm">🎁</span>
                    <span className="text-xs font-medium text-orange-700">Угостить</span>
                  </button>
                  <button
                    onClick={() => { handleResetPosition(); setIsMenuExpanded(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-sm">📍</span>
                    <span className="text-xs font-medium text-gray-700">Сброс позиции</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    {assistantType === 'domovoy' ? (
                      <img 
                        src={getRoleInfo(kuzyaRole).image}
                        alt={getRoleInfo(kuzyaRole).name}
                        className="w-20 h-24 rounded-2xl border-4 border-orange-400 mx-auto mb-4 pointer-events-none object-cover"
                        style={{ objectPosition: 'center' }}
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-400 mx-auto mb-4">
                        <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover" />
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
                          className="bg-white hover:bg-gray-50 p-3 rounded-xl text-left border border-gray-200 hover:border-orange-300 transition-all"
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
                              src={getRoleInfo(kuzyaRole).image}
                              alt={getRoleInfo(kuzyaRole).name}
                              className="w-8 h-10 rounded-xl border-2 border-orange-400 pointer-events-none object-cover"
                              style={{ objectPosition: 'center' }}
                              draggable={false}
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400">
                              <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover" />
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
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-50 text-gray-800 border border-gray-200'
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
                            src={getRoleInfo(kuzyaRole).image}
                            alt={getRoleInfo(kuzyaRole).name}
                            className="w-8 h-10 rounded-xl border-2 border-orange-400 pointer-events-none object-cover flex-shrink-0"
                            style={{ objectPosition: 'center' }}
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0">
                            <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-white border-t border-gray-100 md:rounded-b-2xl flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение..."
                    className="flex-1 min-h-[44px] max-h-[80px] resize-none text-sm border border-gray-200 focus:border-orange-400 rounded-xl text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="bg-orange-500 hover:bg-orange-600 self-end rounded-xl"
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
            height: assistantType === 'domovoy' ? '100px' : '64px'
          }}
          className={`fixed z-50 shadow-2xl border-4 flex items-center justify-center transition-none overflow-hidden ${
            assistantType === 'domovoy' 
              ? 'bg-white hover:bg-amber-50 border-orange-400 rounded-2xl' 
              : 'border-blue-400 rounded-full'
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
            <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI" className="w-full h-full object-cover pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()} />
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

      {/* Donation Dialog */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              🎁 Угостить Домового
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Помогите Домовому стать мудрее и давать ещё более точные советы
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Benefits */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="Sparkles" className="text-amber-600" />
                💡 Что даёт прокачка:
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                  <span>Более точные советы по воспитанию детей</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                  <span>Умные подсказки по планированию</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                  <span>Глубокий анализ семейного бюджета</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Check" className="text-green-600 mt-0.5" size={16} />
                  <span>Персональные рекомендации</span>
                </li>
              </ul>
            </div>

            {/* Donation Options */}
            <div>
              <label className="text-base font-semibold mb-3 block">Выберите сумму угощения:</label>
              <div className="space-y-3">
                {[
                  { amount: 100, emoji: '🥛', title: 'Кружка молока', bonus: '+1 уровень мудрости' },
                  { amount: 500, emoji: '🍯', title: 'Горшочек мёда', bonus: '+2 уровня мудрости' },
                  { amount: 1000, emoji: '🎁', title: 'Сундук с угощениями', bonus: '+3 уровня мудрости' }
                ].map((option) => (
                  <button
                    key={option.amount}
                    onClick={async () => {
                      const token = localStorage.getItem('authToken');
                      if (!token) {
                        toast({
                          title: 'Требуется авторизация',
                          description: 'Войдите в аккаунт для угощения Домового',
                          variant: 'destructive'
                        });
                        return;
                      }

                      setPaymentLoading(true);
                      setSelectedDonationAmount(option.amount);
                      
                      try {
                        const response = await fetch('https://functions.poehali.dev/a1b737ac-9612-4a1f-8262-c10e4c498d6d', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': token
                          },
                          body: JSON.stringify({
                            action: 'create_donation',
                            amount: option.amount,
                            return_url: window.location.origin + '/?donation=success'
                          })
                        });

                        const data = await response.json();
                        if (data.success && data.payment_url) {
                          window.location.href = data.payment_url;
                        } else {
                          throw new Error(data.error || 'Ошибка создания платежа');
                        }
                      } catch (error) {
                        setPaymentLoading(false);
                        toast({
                          title: 'Ошибка',
                          description: error instanceof Error ? error.message : 'Не удалось создать платёж',
                          variant: 'destructive'
                        });
                      }
                    }}
                    disabled={paymentLoading}
                    className="w-full p-4 border-2 border-gray-200 hover:border-amber-400 bg-white hover:bg-amber-50 rounded-xl transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{option.emoji}</div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">₽{option.amount}</div>
                        <div className="text-sm text-gray-600">{option.title}</div>
                        <div className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full inline-block mt-1">
                          {option.bonus}
                        </div>
                      </div>
                      {paymentLoading && selectedDonationAmount === option.amount && (
                        <Icon name="Loader2" className="animate-spin text-amber-600" size={24} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-start gap-2">
                <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Безопасная оплата:</strong> После нажатия на сумму вы будете перенаправлены на страницу оплаты ЮКасса. Уровень Домового повысится автоматически после успешной оплаты.
                </span>
              </p>
            </div>

            <div className="text-center text-red-500 flex items-center justify-center gap-2 pt-2">
              <span className="text-2xl">❤️</span>
              <span className="text-sm">Спасибо за поддержку! Домовой не забудет вашу щедрость.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistantWidget;