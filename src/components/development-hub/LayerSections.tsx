import HubCardV2 from '@/components/hub/HubCardV2';
import type { SubSection } from './types';

interface Props {
  sections: SubSection[];
  onSelect: (path: string) => void;
}

export default function LayerSections({ sections, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sections.map(s => (
        <HubCardV2
          key={s.id}
          icon={s.icon}
          iconColor={s.iconColor}
          iconBg={s.iconBg}
          title={s.title}
          description={s.description}
          modality={s.modality}
          status={s.status}
          isNew={s.isNew}
          cta={s.cta}
          onClick={() => onSelect(s.path)}
        />
      ))}
    </div>
  );
}
