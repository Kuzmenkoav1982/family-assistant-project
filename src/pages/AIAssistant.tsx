import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я Кузя — ваш семейный AI-ассистент и ИИ-диетолог 🚀🍎\n\nМогу помочь с:\n• Подсчётом калорий и анализом БЖУ\n• Рецептами и советами по готовке\n• Планированием дел и событий\n• Рекомендациями по здоровому питанию\n• И многим другим!\n\nЧем могу помочь?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Получаем данные пользователя
  const familyId = localStorage.getItem('familyId') || null;
  const userData = localStorage.getItem('userData');
  const userId = userData ? JSON.parse(userData).id : undefined;

  // Проверка лимитов подписки
  const { limits, incrementUsage, isPremium, aiRequestsAllowed } = useSubscriptionLimits(familyId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Проверка лимитов перед отправкой
    if (!aiRequestsAllowed) {
      toast({
        title: '⚠️ Лимит AI-запросов исчерпан',
        description: isPremium 
          ? 'Произошла ошибка. Обратитесь в поддержку.'
          : `Вы использовали ${limits?.limits?.ai_requests?.used || 0} из ${limits?.limits?.ai_requests?.limit || 5} бесплатных запросов сегодня. Обновитесь до Premium для безлимитного доступа!`,
        variant: 'destructive',
        action: !isPremium ? (
          <Button 
            size="sm" 
            onClick={() => navigate('/pricing')}
            className="bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            Перейти на Premium
          </Button>
        ) : undefined
      });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Инкрементируем счётчик AI-запросов
      await incrementUsage('ai_requests');

      const apiUrl = func2url['ai-assistant'];
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: userMessage.content
          }],
          familyId,
          userId,
          systemPrompt: `Ты Кузя — умный семейный помощник-космонавт и ИИ-диетолог 🚀🍎 
          
Твои способности:
1. Помогаешь с домашними делами, рецептами, планированием, воспитанием детей
2. ИИ-ДИЕТОЛОГ: Ведёшь учёт калорий для семьи, рассчитываешь калорийность продуктов и готовых блюд
3. Анализируешь рецепты: говоришь сколько калорий в порции борща, салата, любого блюда
4. Предлагаешь здоровые альтернативы и персональные диеты
5. Считаешь БЖУ (белки, жиры, углеводы), витамины, минералы
6. Даёшь рекомендации по улучшению рациона

Когда пользователь спрашивает о калориях, питании, диете:
- Используй свою базу знаний о калорийности продуктов
- Рассчитывай примерные значения для блюд (например: борщ 300г ≈ 120 ккал)
- Давай советы по здоровому питанию
- Предупреждай о несбалансированном рационе

Отвечай на русском языке, дружелюбно и по делу. Помни контекст прошлых разговоров.`
        })
      });

      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.error === 'auth_required') {
          toast({
            title: '🔐 Необходима регистрация',
            description: 'Зарегистрируйтесь, чтобы использовать AI-помощника',
          });
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        if (errorData.error === 'daily_limit_reached') {
          toast({
            title: '⚠️ Лимит исчерпан',
            description: errorData.message || 'Обновитесь до Premium для безлимитного доступа',
          });
          setTimeout(() => navigate('/pricing'), 2000);
          return;
        }
        toast({
          title: '🔒 Требуется подписка',
          description: 'Подключите Premium для доступа к AI',
        });
        setTimeout(() => navigate('/pricing'), 2000);
        return;
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <img 
            src="https://cdn.poehali.dev/files/59a0a56b-d866-412a-8641-5e1d81b652e3.png" 
            alt="Кузя"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-orange-300 shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Кузя 🚀🍎</h1>
          <p className="text-gray-600">Ваш семейный AI-помощник и ИИ-диетолог</p>

          {/* Индикатор лимитов */}
          {!isPremium && limits && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-sm">
              <Icon name="Zap" size={16} className="text-orange-500" />
              <span className="text-gray-700">
                Осталось запросов сегодня: <strong>{(limits.limits.ai_requests.limit || 5) - limits.limits.ai_requests.used}</strong> из {limits.limits.ai_requests.limit}
              </span>
              <Button 
                size="sm" 
                variant="link" 
                onClick={() => navigate('/pricing')}
                className="text-purple-600 hover:text-purple-700 p-0 h-auto"
              >
                Безлимит →
              </Button>
            </div>
          )}
          {isPremium && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full text-sm">
              <Icon name="Crown" size={16} className="text-yellow-500" />
              <span className="text-gray-700 font-medium">
                Premium: безлимитные AI-запросы
              </span>
            </div>
          )}
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-500 rounded-full p-2 shadow-md">
                <Icon name="Info" className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-green-900 text-lg">
                      🤖 Как работать с AI Ассистентом Кузей
                    </h3>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                      Инструкция
                    </span>
                  </div>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-6 w-6 text-green-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-green-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🤖 Что умеет Кузя?</p>
                        <p className="text-sm">
                          Кузя — ваш умный семейный помощник-космонавт и ИИ-диетолог 🚀🍎 Он помогает с рецептами, 
                          подсчётом калорий, планированием дел, советами по воспитанию детей, домашним хозяйством 
                          и любыми другими семейными вопросами. Кузя понимает контекст и запоминает предыдущие сообщения.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Основные возможности</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li><strong>🍎 ИИ-диетолог:</strong> Подсчёт калорий, анализ БЖУ, рекомендации по питанию</li>
                          <li><strong>Рецепты и кулинария:</strong> Идеи блюд, советы по готовке, замена ингредиентов</li>
                          <li><strong>Планирование:</strong> Помощь в организации дел, расписаний и событий</li>
                          <li><strong>Воспитание детей:</strong> Советы по развитию, обучению, решению конфликтов</li>
                          <li><strong>Домашнее хозяйство:</strong> Уборка, организация, уход за вещами</li>
                          <li><strong>Семейный досуг:</strong> Идеи для совместного времяпрепровождения</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">🎯 Как задавать вопросы</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Будьте конкретны: "Что приготовить из курицы на ужин?" лучше чем "Что приготовить?"</li>
                          <li>Указывайте детали: возраст детей, количество порций, ограничения по времени</li>
                          <li>Можно задавать уточняющие вопросы — Кузя помнит контекст беседы</li>
                          <li>Используйте быстрые вопросы внизу для начала диалога</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">💡 Советы для лучших результатов</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Начинайте новую тему с чистого листа, обновив страницу</li>
                          <li>Если ответ не подходит, переформулируйте вопрос по-другому</li>
                          <li>Можно попросить Кузю дать несколько вариантов ответа</li>
                          <li>Используйте Shift+Enter для переноса строки в сообщении</li>
                          <li>Кузя может помочь с планированием на основе данных из других разделов</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-green-200">
                        <Button
                          variant="link"
                          onClick={() => navigate('/instructions')}
                          className="text-green-600 hover:underline p-0 h-auto text-sm"
                        >
                          📖 <strong>Подробнее:</strong> Полная инструкция
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-280px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                {message.role === 'user' ? (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-blue-500">
                    <Icon name="User" className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <img 
                    src="https://cdn.poehali.dev/files/59a0a56b-d866-412a-8641-5e1d81b652e3.png" 
                    alt="Кузя"
                    className="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-orange-300"
                  />
                )}

                {/* Message */}
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <img 
                  src="https://cdn.poehali.dev/files/59a0a56b-d866-412a-8641-5e1d81b652e3.png" 
                  alt="Кузя"
                  className="flex-shrink-0 w-10 h-10 rounded-full object-cover border-2 border-orange-300"
                />
                <div className="flex-1">
                  <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-gray-50 p-4">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите ваш вопрос..."
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {[
            '🍎 Сколько калорий в яичнице?',
            '🥗 Что приготовить на ужин на 400 ккал?',
            '📊 Посчитай калории в моём завтраке',
            '💪 Как набрать дневную норму белка?',
            'Идеи для семейного досуга',
            'Советы по воспитанию детей'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 hover:bg-gray-100 hover:shadow-md transition-all"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;