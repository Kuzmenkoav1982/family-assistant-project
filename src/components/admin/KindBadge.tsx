import Icon from '@/components/ui/icon';
import { KIND_META, type EntityKind } from '@/data/projectV2/asIsReality';

interface KindBadgeProps {
  kind: EntityKind;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  showLabel?: boolean;
  title?: string;
}

/**
 * Бейдж канонического типа сущности
 * (хаб / раздел / точка входа / ИИ-блок / шорткат / контент / системная).
 */
export default function KindBadge({
  kind,
  size = 'sm',
  showIcon = true,
  showLabel = true,
  title,
}: KindBadgeProps) {
  const meta = KIND_META[kind];
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
