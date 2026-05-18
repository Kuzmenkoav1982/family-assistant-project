import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

export interface SubSection {
  id: string;
  title: string;
  description: string;
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

export interface SubGroup {
  id: string;
  title: string;
  subtitle: string;
  sections: SubSection[];
}
