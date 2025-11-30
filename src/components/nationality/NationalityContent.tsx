import { NationalityHistory } from './NationalityHistory';
import { NationalityTraditions } from './NationalityTraditions';
import { NationalityCulture } from './NationalityCulture';
import type { NationalityData } from '@/data/nationalitiesData';

interface NationalityContentProps {
  nationality: NationalityData;
}

export function NationalityContent({ nationality }: NationalityContentProps) {
  return (
    <div className="space-y-8">
      <NationalityHistory history={nationality.history} />
      <NationalityTraditions 
        traditions={nationality.traditions}
        rituals={nationality.rituals}
      />
      <NationalityCulture culture={nationality.culture} />
    </div>
  );
}
