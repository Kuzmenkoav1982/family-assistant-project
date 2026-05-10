import Icon from '@/components/ui/icon';
import ModalityBadge, { Modality } from './ModalityBadge';
import StatusBadge, { CardStatus } from './StatusBadge';

export interface HubCardV2Props {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  description?: string;
  modality?: Modality;
  status?: CardStatus;
  statusLabel?: string;     // кастомный текст статуса (например, «3 из 5 заполнено»)
  context?: string;         // полезная строка контекста (например, «к оплате 4 850 ₽»)
  cta?: string;             // текст CTA («Открыть», «Настроить»)
  onClick?: () => void;
  isNew?: boolean;
  className?: string;
}

const HubCardV2 = ({
  icon,
  iconColor = 'text-gray-600',
  iconBg = 'bg-gray-100 dark:bg-gray-800',
  title,
  description,
  modality,
  status,
  statusLabel,
  context,
  cta = 'Открыть',
  onClick,
  isNew,
  className = '',
}: HubCardV2Props) => {
  return (
    <button
      onClick={onClick}
      className={`group relative text-left w-full rounded-2xl border bg-white dark:bg-gray-900 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all p-4 flex flex-col ${className}`}
    >
      {isNew && (
        <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
          Новое
        </span>
      )}

      {/* Верх: иконка + модальность */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} fallback="Circle" size={18} className={iconColor} />
        </div>
        {modality && <ModalityBadge modality={modality} />}
      </div>

      {/* Центр: название + описание + контекст */}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-bold text-gray-900 dark:text-white leading-tight mb-1">
          {title}
        </div>
        {description && (
          <div className="text-[12px] text-gray-500 dark:text-gray-400 leading-snug mb-2">
            {description}
          </div>
        )}
        {context && (
          <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium mt-1">
            {context}
          </div>
        )}
      </div>

      {/* Низ: статус + CTA */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        {status ? (
          <StatusBadge status={status} customLabel={statusLabel} />
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
          {cta}
          <Icon name="ArrowRight" size={12} />
        </span>
      </div>
    </button>
  );
};

export default HubCardV2;
