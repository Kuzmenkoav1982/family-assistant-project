import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantChatProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isMinimized: boolean;
  position: { x: number; y: number };
  kuzyaRole: string;
  onClose: () => void;
  onMinimize: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onRoleChange: (role: string) => void;
  onResetPosition: () => void;
  onClearHistory: () => void;
  onOpenAstrology: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  getRoleInfo: (role: string) => { name: string; icon: string; description: string };
}

export const AIAssistantChat = ({
  messages,
  input,
  isLoading,
  isMinimized,
  position,
  kuzyaRole,
  onClose,
  onMinimize,
  onInputChange,
  onSend,
  onRoleChange,
  onResetPosition,
  onClearHistory,
  onOpenAstrology,
  onMouseDown,
  getRoleInfo
}: AIAssistantChatProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { assistantType, assistantName } = useAIAssistant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const displayName = assistantName || (assistantType === 'domovoy' ? 'Домовой' : 'AI Ассистент');
  const currentRole = getRoleInfo(kuzyaRole);

  return (
    <div
      className="fixed bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        height: isMinimized ? '60px' : '600px',
        maxHeight: isMinimized ? '60px' : '80vh',
        zIndex: 9999,
      }}
    >
      <div
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between cursor-move select-none"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentRole.icon}</span>
          <div>
            <h3 className="font-bold text-lg">{displayName}</h3>
            <p className="text-xs opacity-90">{currentRole.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Icon name="Settings" size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Роль помощника</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['family-assistant', 'cook', 'organizer', 'child-educator', 'financial-advisor', 'psychologist', 'fitness-trainer', 'nutritionist', 'travel-planner', 'astrologer'].map((role) => {
                const roleInfo = getRoleInfo(role);
                return (
                  <DropdownMenuItem
                    key={role}
                    onClick={() => onRoleChange(role)}
                    className={kuzyaRole === role ? 'bg-purple-50' : ''}
                  >
                    <span className="mr-2">{roleInfo.icon}</span>
                    <div>
                      <div className="font-medium">{roleInfo.name}</div>
                      <div className="text-xs text-muted-foreground">{roleInfo.description}</div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenAstrology}>
                <Icon name="Star" size={16} className="mr-2" />
                Астрология
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClearHistory}>
                <Icon name="Trash2" size={16} className="mr-2" />
                Очистить историю
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onResetPosition}>
                <Icon name="MapPin" size={16} className="mr-2" />
                Сбросить позицию
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMinimize}
            className="text-white hover:bg-white/20"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50/30 to-white">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">👋 Привет! Я {displayName}</p>
                <p className="text-sm">Задай мне любой вопрос о семье и доме</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={onSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-[60px] w-[60px] flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
