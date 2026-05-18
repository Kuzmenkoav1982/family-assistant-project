import HubCardV2 from '@/components/hub/HubCardV2';
import type { HubSubSection } from './hubSections';

interface Props {
  sections: HubSubSection[];
  onSelect: (path: string) => void;
}

export default function HubSectionsGrid({ sections, onSelect }: Props) {
  return (
    <div>
      <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
        Сервисы
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    </div>
  );
}
