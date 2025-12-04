import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я Кузя — ваш семейный AI-ассистент 🚀 Могу помочь с советами по дому, рецептами, планированием и многим другим. Чем могу помочь?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Получаем данные пользователя
  const familyId = localStorage.getItem('currentFamilyId') || undefined;
  const userData = localStorage.getItem('userData');
  const userId = userData ? JSON.parse(userData).id : undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
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
          systemPrompt: 'Ты Кузя — умный семейный помощник-космонавт 🚀 Помогаешь с домашними делами, рецептами, планированием, воспитанием детей и другими семейными вопросами. Отвечай на русском языке, дружелюбно и по делу. Помни контекст прошлых разговоров. Если не знаешь ответа - так и скажи.'
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Icon name="Bot" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Ассистент</h1>
          <p className="text-gray-600">Ваш умный помощник по семейным делам</p>
        </div>

        {/* Инструкция */}
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-green-900 text-lg">
                    Как эффективно использовать AI Ассистента
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-green-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 space-y-3">
                  <AlertDescription className="text-green-800">
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium mb-2">🤖 Что умеет Кузя?</p>
                        <p className="text-sm">
                          Кузя — ваш умный семейный помощник-космонавт. Он помогает с рецептами, планированием дел, 
                          советами по воспитанию детей, домашним хозяйством и любыми другими семейными вопросами. 
                          Кузя понимает контекст и запоминает предыдущие сообщения в рамках беседы.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">✨ Основные возможности</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
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
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                  }`}
                >
                  {message.role === 'user' ? (
                    <Icon name="User" className="w-5 h-5 text-white" />
                  ) : (
                    <Icon name="Bot" className="w-5 h-5 text-white" />
                  )}
                </div>

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
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Icon name="Bot" className="w-5 h-5 text-white" />
                </div>
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
            'Что приготовить на ужин?',
            'Идеи для семейного досуга',
            'Как организовать домашние дела?',
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