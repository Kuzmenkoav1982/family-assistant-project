import HubCardV2 from '@/components/hub/HubCardV2';
import type { SubGroup } from './types';

interface Props {
  groups: SubGroup[];
  onSelect: (path: string) => void;
}

export default function HouseholdGroupedGrid({ groups, onSelect }: Props) {
  return (
    <>
      {groups.map(group => (
        <div key={group.id}>
          <div className="px-2 mb-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {group.title}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{group.subtitle}</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.sections.map(s => (
              <HubCardV2
                key={s.id}
                icon={s.icon}
                iconColor={s.iconColor}
                iconBg={s.iconBg}
                title={s.title}
                description={s.description}
                modality={s.modality}
                status={s.status}
                statusLabel={s.statusLabel}
                isNew={s.isNew}
                cta={s.cta}
                onClick={() => onSelect(s.path)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
