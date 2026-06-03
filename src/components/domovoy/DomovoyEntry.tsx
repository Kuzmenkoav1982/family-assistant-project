import React, { useState } from 'react';
import Icon from '@/components/ui/icon';

interface IncompleteFlow {
  scenarioId: string;
  stepIndex: number;
  title: string;
  emoji: string;
}

interface DomovoyEntryProps {
  assistantName?: string;
  onScenario: (scenarioId: string) => void;
  onFreeQuery: (query: string) => void;
  onOpenMap: () => void;
  incompleteFlows?: IncompleteFlow[];
}

interface ScenarioCard {
  emoji: string;
  label: string;
  description: string;
  scenarioId?: string;
  action?: () => void;
  variant?: 'default' | 'indigo' | 'muted';
}

const DomovoyEntry: React.FC<DomovoyEntryProps> = ({
  assistantName = 'Домовой',
  onScenario,
  onFreeQuery,
  onOpenMap,
  incompleteFlows = [],
}) => {
  const [freeInput, setFreeInput] = useState('');
  const [showIncomplete, setShowIncomplete] = useState(false);

  const handleSendFree = () => {
    const trimmed = freeInput.trim();
    if (trimmed) {
      onFreeQuery(trimmed);
      setFreeInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendFree();
    }
  };

  const cards: ScenarioCard[] = [
    {
      emoji: '🏠',
      label: 'Настроить семью',
      description: 'Профиль, участники, роли',
      scenarioId: 'setup-family',
      variant: 'default',
    },
    {
      emoji: '👶',
      label: 'Добавить ребёнка',
      description: 'Профиль и кабинет',
      scenarioId: 'add-child',
      variant: 'default',
    },
    {
      emoji: '🌱',
      label: 'Развитие ребёнка',
      description: 'Занятия, рост, достижения',
      scenarioId: 'setup-children-module',
      variant: 'default',
    },
    {
      emoji: '💳',
      label: 'Детские финансы',
      description: 'Копилка, цели, расходы',
      scenarioId: 'child-finance',
      variant: 'default',
    },
    {
      emoji: '📷',
      label: 'Семейная память',
      description: 'Истории, фото, традиции',
      scenarioId: 'family-memory',
      variant: 'default',
    },
    {
      emoji: '🔔',
      label: 'Напоминания',
      description: 'Настроить уведомления',
      scenarioId: 'setup-reminders',
      variant: 'default',
    },
    {
      emoji: '📚',
      label: 'Библиотека',
      description: 'Чтение и обучение',
      scenarioId: 'family-library',
      variant: 'default',
    },
    {
      emoji: '▶️',
      label: 'Продолжить начатое',
      description: incompleteFlows.length > 0
        ? `${incompleteFlows.length} незавершённых`
        : 'Вернуться к процессу',
      action: () => {
        if (incompleteFlows.length > 0) {
          setShowIncomplete(true);
        } else {
          onScenario('resume-flow');
        }
      },
      variant: 'default',
    },
    {
      emoji: '🗺️',
      label: 'Карта платформы',
      description: 'Все разделы и связи',
      action: () => onOpenMap(),
      variant: 'indigo',
    },
    {
      emoji: '❓',
      label: 'Не знаю с чего начать',
      description: 'Помогу разобраться',
      scenarioId: 'first-start',
      variant: 'muted',
    },
  ];

  const handleCardClick = (card: ScenarioCard) => {
    if (card.action) {
      card.action();
    } else if (card.scenarioId) {
      onScenario(card.scenarioId);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col min-h-0">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Заголовок */}
        <div className="text-center pt-2 pb-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🏡</span>
          </div>
          <h1
            className="text-xl font-semibold text-slate-800 leading-snug"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Здравствуйте! Я {assistantName}.
          </h1>
          <p className="text-slate-500 text-sm mt-1">Чем помочь сегодня?</p>
        </div>

        {/* Баннер незавершённых */}
        {incompleteFlows.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Icon name="Clock" size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm text-amber-800 font-medium truncate">
                Продолжить начатое — {incompleteFlows.length} незавершённых
              </span>
            </div>
            <button
              onClick={() => setShowIncomplete(!showIncomplete)}
              className="text-xs text-amber-700 font-semibold whitespace-nowrap hover:text-amber-900 transition-colors"
            >
              {showIncomplete ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        )}

        {/* Список незавершённых */}
        {showIncomplete && incompleteFlows.length > 0 && (
          <div className="flex flex-col gap-2">
            {incompleteFlows.map((flow) => (
              <button
                key={flow.scenarioId}
                onClick={() => onScenario(flow.scenarioId)}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 text-left hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <span className="text-xl">{flow.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{flow.title}</div>
                  <div className="text-xs text-slate-400">Шаг {flow.stepIndex + 1}</div>
                </div>
                <Icon name="ArrowRight" size={14} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Сетка сценарных карточек */}
        <div className="grid grid-cols-2 gap-3">
          {cards.map((card, idx) => {
            const isIndigo = card.variant === 'indigo';
            const isMuted = card.variant === 'muted';

            return (
              <button
                key={idx}
                onClick={() => handleCardClick(card)}
                className={[
                  'flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left transition-all duration-150',
                  'hover:shadow-md hover:-translate-y-[1px] active:scale-[0.98]',
                  isIndigo
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : isMuted
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    : 'bg-white text-slate-800 border border-slate-200 hover:border-indigo-200',
                ].join(' ')}
              >
                <span className="text-xl leading-none">{card.emoji}</span>
                <span
                  className={[
                    'text-sm font-semibold leading-tight',
                    isIndigo ? 'text-white' : isMuted ? 'text-slate-700' : 'text-slate-800',
                  ].join(' ')}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {card.label}
                </span>
                <span
                  className={[
                    'text-xs leading-snug',
                    isIndigo ? 'text-indigo-200' : 'text-slate-400',
                  ].join(' ')}
                >
                  {card.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Разделитель */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">или</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Свободный ввод */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <textarea
            value={freeInput}
            onChange={(e) => setFreeInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Спросите что угодно — помогу найти нужный раздел или объяснить..."
            rows={3}
            className="w-full px-4 pt-3 pb-2 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none bg-transparent"
          />
          <div className="flex justify-end px-3 pb-3">
            <button
              onClick={handleSendFree}
              disabled={!freeInput.trim()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-medium rounded-xl px-4 py-2 transition-colors"
            >
              <Icon name="Send" size={13} />
              Отправить
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 pb-2">
          Домовой знает платформу и поможет найти путь
        </p>
      </div>
    </div>
  );
};

export default DomovoyEntry;