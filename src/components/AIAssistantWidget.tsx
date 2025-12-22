import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { AstrologyService } from '@/components/astrology/AstrologyService';
import { AIAssistantButton } from '@/components/AIAssistant/AIAssistantButton';
import { AIAssistantChat } from '@/components/AIAssistant/AIAssistantChat';
import { AIAssistantWelcome } from '@/components/AIAssistant/AIAssistantWelcome';
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
  const { toast } = useToast();
  const location = useLocation();
  const { assistantType, assistantName } = useAIAssistant();

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('widgetPosition');
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 420, y: 100 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isWelcomePage = location.pathname === '/welcome';

  useEffect(() => {
    if (!isWelcomePage) {
      setIsOpen(false);
    }
  }, [location.pathname, isWelcomePage]);

  const [kuzyaRole, setKuzyaRole] = useState(() => localStorage.getItem('kuzyaRole') || 'family-assistant');

  const handleRoleChange = (newRole: string) => {
    setKuzyaRole(newRole);
    localStorage.setItem('kuzyaRole', newRole);
    const displayName = assistantName || (assistantType === 'domovoy' ? 'Домового' : 'ассистента');
    toast({
      title: `Роль ${displayName} изменена`,
      description: getRoleInfo(newRole).name,
    });
  };

  const handleResetPosition = () => {
    if (window.innerWidth < 768) {
      const defaultButtonPosition = { x: window.innerWidth - 80, y: window.innerHeight - 180 };
      localStorage.setItem('buttonPosition', JSON.stringify(defaultButtonPosition));
      toast({
        title: '📍 Позиция сброшена',
        description: 'Кнопка вернулась на место по умолчанию'
      });
      return;
    }
    const defaultPosition = { x: window.innerWidth - 420, y: 100 };
    setPosition(defaultPosition);
    localStorage.setItem('widgetPosition', JSON.stringify(defaultPosition));
    toast({
      title: '📍 Позиция сброшена',
      description: 'Виджет вернулся на место по умолчанию'
    });
  };

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

  useEffect(() => {
    if (isWelcomePage) return;
    
    const timer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setShowWelcome(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isWelcomePage, isOpen, messages.length]);

  const sendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(func2url['ai-chat'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('authToken') || ''
        },
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt: getSystemPrompt()
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Ошибка AI:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить ответ от ассистента',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setIsOpen(true);
    setInput(query);
    setTimeout(() => sendMessage(query), 100);
  };

  const handleClearHistory = () => {
    setMessages([]);
    toast({
      title: '🗑️ История очищена',
      description: 'Все сообщения удалены'
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
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
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - 400));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - 60));
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('widgetPosition', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  if (isWelcomePage) return null;

  return (
    <>
      <AIAssistantButton onClick={() => setIsOpen(true)} />

      <AIAssistantWelcome
        show={showWelcome}
        onClose={() => setShowWelcome(false)}
        onQuickAction={handleQuickAction}
      />

      {isOpen && (
        <AIAssistantChat
          messages={messages}
          input={input}
          isLoading={isLoading}
          isMinimized={isMinimized}
          position={position}
          kuzyaRole={kuzyaRole}
          onClose={() => setIsOpen(false)}
          onMinimize={() => setIsMinimized(!isMinimized)}
          onInputChange={setInput}
          onSend={() => sendMessage()}
          onRoleChange={handleRoleChange}
          onResetPosition={handleResetPosition}
          onClearHistory={handleClearHistory}
          onOpenAstrology={() => setShowAstrologyDialog(true)}
          onMouseDown={handleMouseDown}
          getRoleInfo={getRoleInfo}
        />
      )}

      <Dialog open={showAstrologyDialog} onOpenChange={setShowAstrologyDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>🌙 Астрология и гороскопы</DialogTitle>
          </DialogHeader>
          <AstrologyService />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistantWidget;
