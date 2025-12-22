import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface QuickAction {
  icon: string;
  text: string;
  query: string;
}

interface AIAssistantWelcomeProps {
  show: boolean;
  onClose: () => void;
  onQuickAction: (query: string) => void;
}

const quickActions: QuickAction[] = [
  { icon: '🍳', text: 'Что приготовить?', query: 'Подскажи простые идеи для семейного ужина на сегодня' },
  { icon: '🎨', text: 'Чем заняться?', query: 'Предложи идеи для семейного досуга на выходные' },
  { icon: '📝', text: 'Организация дел', query: 'Как лучше организовать домашние дела и задачи?' },
  { icon: '👶', text: 'Воспитание детей', query: 'Дай советы по воспитанию детей' },
];

export const AIAssistantWelcome = ({ show, onClose, onQuickAction }: AIAssistantWelcomeProps) => {
  const { assistantType, assistantName } = useAIAssistant();

  if (!show) return null;

  const displayName = assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'AI Ассистент');

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[90vw] max-w-[380px] bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden z-[9997] animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:bg-white/20 h-8 w-8"
        >
          <X size={18} />
        </Button>
        <div className="pr-8">
          <h3 className="font-bold text-lg mb-1">👋 Привет! Я {displayName}</h3>
          <p className="text-sm text-white/90">Ваш семейный помощник по дому</p>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">Выберите тему или задайте свой вопрос:</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                onQuickAction(action.query);
                onClose();
              }}
              className="p-3 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{action.icon}</div>
              <div className="text-xs font-medium text-gray-700">{action.text}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-500 mt-4">
          Нажмите на круглую кнопку чтобы начать общение
        </p>
      </div>
    </div>
  );
};
