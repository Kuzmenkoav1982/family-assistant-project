import Icon from '@/components/ui/icon';
import { MODALITY_META, type Modality } from '@/data/projectV2/asIsReality';

interface ModalityBadgeProps {
  modality: Modality;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showLabel?: boolean;
  title?: string;
}

/**
 * Бейдж модальности раздела (Право / Госданные / ИИ / Осмысление / Контент / Утилитарная).
 * Помогает удерживать единый язык доверия в продукте.
 */
export default function ModalityBadge({
  modality,
  size = 'sm',
  showIcon = true,
  showLabel = true,
  title,
}: ModalityBadgeProps) {
  const meta = MODALITY_META[modality];
  const padding = size === 'sm' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';
  const text = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const iconSize = size === 'sm' ? 9 : 10;

  return (
    <span
      className={`inline-flex items-center gap-1 ${text} ${padding} rounded-full border font-semibold whitespace-nowrap ${meta.cls}`}
      title={title ?? meta.description}
    >
      {showIcon && <Icon name={meta.icon} size={iconSize} />}
      {showLabel && meta.label}
    </span>
  );
}
