import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
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
  const [isManualMode, setIsManualMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAstrologyDialog, setShowAstrologyDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const { assistantType, assistantName, selectedRole } = useAIAssistant();

  // Скрываем виджет на странице /welcome
  const isWelcomePage = location.pathname === '/welcome';

  // Скрываем виджет автоматически при переходе, если включен ручной режим
  useEffect(() => {
    if (!isManualMode && !isWelcomePage) {
      setIsOpen(false);
    }
  }, [location.pathname, isManualMode, isWelcomePage]);

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

  // Информация о ролях
  const getRoleInfo = (role: string) => {
    const roles: Record<string, { name: string; icon: string; description: string }> = {
      'family-assistant': { name: 'Семейный помощник', icon: '🏡', description: 'Универсальный помощник' },
      'cook': { name: 'Повар', icon: '🍳', description: 'Рецепты и кулинария' },
      'organizer': { name: 'Организатор', icon: '📋', description: 'Планирование задач' },
      'child-educator': { name: 'Воспитатель', icon: '👶', description: 'Советы по детям' },
      'financial-advisor': { name: 'Финансовый советник', icon: '💰', description: 'Бюджет и экономия' },
      'psychologist': { name: 'Психолог', icon: '🧠', description: 'Отношения в семье' },
      'fitness-trainer': { name: 'Фитнес-тренер', icon: '💪', description: 'Здоровье и спорт' },
      'nutritionist': { name: 'Диетолог', icon: '🍎', description: 'Здоровое питание' },
      'travel-planner': { name: 'Тревел-планер', icon: '✈️', description: 'Организация поездок' },
      'astrologer': { name: 'Астролог', icon: '🌙', description: 'Гороскопы и прогнозы' },
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
    // Показываем приветствие через 3 секунды после загрузки (только не на /welcome)
    if (isWelcomePage) return;
    
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowWelcome(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
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
          systemPrompt: getSystemPrompt()
        })
      });

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

  // Не показываем ничего на странице /welcome
  if (isWelcomePage) return null;

  return (
    <>
      {/* Welcome Popup */}
      {showWelcome && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-4 border-orange-300">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              {assistantType === 'domovoy' ? (
                <img 
                  src="https://cdn.poehali.dev/files/Кузя.png"
                  alt="Домовой"
                  className="w-16 h-16 rounded-full object-cover border-4 border-orange-400 flex-shrink-0"
                />
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
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border-2 border-orange-300 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16 bottom-6 right-6' : 'w-[95vw] md:w-96 h-[70vh] md:h-[600px] bottom-20 md:bottom-6 right-[2.5vw] md:right-6 max-h-[calc(100vh-180px)]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {assistantType === 'domovoy' ? (
                  <img 
                    src="https://cdn.poehali.dev/files/Кузя.png"
                    alt="Домовой"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                  />
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
                  onClick={() => setIsManualMode(!isManualMode)}
                  className={`hover:bg-white/20 p-1 rounded ${isManualMode ? 'bg-white/30' : ''}`}
                  title={isManualMode ? 'Ручной режим: виджет всегда виден' : 'Авто-режим: виджет скрывается'}
                >
                  {isManualMode ? <Icon name="Lock" className="w-4 h-4" /> : <Icon name="Unlock" className="w-4 h-4" />}
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
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50/30 to-white" style={{ maxHeight: 'calc(100% - 200px)' }}>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    {assistantType === 'domovoy' ? (
                      <img 
                        src="https://cdn.poehali.dev/files/Кузя.png"
                        alt="Домовой"
                        className="w-20 h-20 rounded-full object-cover border-4 border-orange-400 mx-auto mb-4"
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
                              src="https://cdn.poehali.dev/files/Кузя.png"
                              alt="Домовой"
                              className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
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
                            src="https://cdn.poehali.dev/files/Кузя.png"
                            alt="Домовой"
                            className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
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
              <div className="p-3 bg-white border-t-2 border-orange-200 rounded-b-2xl flex-shrink-0">
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
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl border-4 flex items-center justify-center transition-all hover:scale-110 animate-bounce-subtle overflow-hidden ${
            assistantType === 'domovoy' 
              ? 'bg-white hover:bg-amber-50 border-orange-400' 
              : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-blue-400 text-3xl'
          }`}
        >
          {assistantType === 'domovoy' ? (
            <img 
              src="https://cdn.poehali.dev/files/Кузя.png"
              alt="Домовой"
              className="w-full h-full object-cover"
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