import type { CardStatus } from '@/components/hub/StatusBadge';
import type { Modality } from '@/components/hub/ModalityBadge';

export interface SubSection {
  id: string;
  title: string;
  description: string;
  context?: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
  modality: Modality;
  status: CardStatus;
  statusLabel?: string;
  isNew?: boolean;
  cta?: string;
}
