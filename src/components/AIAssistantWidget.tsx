import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();

  // Скрываем виджет на странице /welcome
  const isWelcomePage = location.pathname === '/welcome';

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
  }, [isWelcomePage]);

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
          systemPrompt: 'Ты умный домовой по имени "Кузя" — семейный помощник. Помогаешь с домашними делами, рецептами, планированием, воспитанием детей, организацией быта и другими семейными вопросами. Отвечай на русском языке, дружелюбно, с юмором домового, кратко и по делу. Используй эмодзи для наглядности. Если не знаешь ответа - так и скажи, но предложи альтернативу.'
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
        <div className="fixed bottom-24 right-6 z-50 animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-4 border-orange-300">
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute -top-2 -right-2 bg-gray-200 rounded-full p-1 hover:bg-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <img 
                src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                alt="Кузя"
                className="w-16 h-16 rounded-full object-cover object-top border-4 border-orange-400 flex-shrink-0 animate-bounce"
              />
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Привет! Я Кузя! 🏡</h3>
                <p className="text-sm text-gray-600">
                  Ваш умный семейный помощник! Помогу с рецептами, планами, советами и организацией быта.
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
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-orange-300 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                alt="Кузя"
                className="w-12 h-12 rounded-full object-cover object-top border-2 border-white/50"
              />
              <div>
                <h3 className="font-bold">Кузя — AI Помощник</h3>
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

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-orange-50/30 to-white">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <img 
                      src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                      alt="Кузя"
                      className="w-20 h-20 rounded-full object-cover object-top border-4 border-orange-400 mx-auto mb-4"
                    />
                    <h3 className="font-bold text-gray-800 mb-2">Привет! Я Кузя! 🏡</h3>
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
                          ) : (
                            <img 
                              src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                              alt="Кузя"
                              className="w-8 h-8 rounded-full object-cover object-top border-2 border-orange-400"
                            />
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
                        <img 
                          src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                          alt="Кузя"
                          className="w-8 h-8 rounded-full object-cover object-top border-2 border-orange-400"
                        />
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
              <div className="p-3 bg-white border-t-2 border-orange-200 rounded-b-2xl">
                <div className="flex gap-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Напишите сообщение..."
                    className="flex-1 min-h-[44px] max-h-[80px] resize-none text-sm border-2 border-orange-200 focus:border-orange-400"
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
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-white hover:bg-orange-50 rounded-full shadow-2xl border-4 border-orange-400 flex items-center justify-center transition-all hover:scale-110 animate-bounce-subtle overflow-hidden"
        >
          <img 
            src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
            alt="Кузя"
            className="w-full h-full object-cover object-top"
          />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}
    </>
  );
};

export default AIAssistantWidget;
