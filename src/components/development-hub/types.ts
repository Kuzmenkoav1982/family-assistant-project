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
  isNew?: boolean;
  cta?: string;
}

export type LayerId = 'panorama' | 'practice' | 'dialog' | 'reflection';

export interface DevLayer {
  id: LayerId;
  title: string;
  fullTitle: string;
  subtitle: string;
  description: string;
  icon: string;
  accent: 'emerald' | 'blue' | 'violet' | 'amber';
  badge: string;
  sections: SubSection[];
}
