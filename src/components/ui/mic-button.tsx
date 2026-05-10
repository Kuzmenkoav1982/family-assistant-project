import Icon from '@/components/ui/icon';

/**
 * Кнопка-микрофон для голосового ввода.
 * Использует useSpeechRecognition. Показывает 3 состояния:
 *  - неактивно: серая иконка микрофона
 *  - идёт запись: красная с пульсацией
 *  - не поддерживается: скрыта
 */

interface MicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  title?: string;
  className?: string;
}

export const MicButton = ({
  isListening,
  isSupported,
  onStart,
  onStop,
  disabled,
  size = 'md',
  title,
  className = '',
}: MicButtonProps) => {
  if (!isSupported) return null;

  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 14 : 18;

  const handleClick = () => {
    if (isListening) onStop();
    else onStart();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={title || (isListening ? 'Остановить запись' : 'Голосовой ввод')}
      className={`relative ${sizeClass} flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {isListening && (
        <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-40" />
      )}
      <Icon
        name={isListening ? 'MicOff' : 'Mic'}
        size={iconSize}
        className="relative"
      />
    </button>
  );
};

export default MicButton;
