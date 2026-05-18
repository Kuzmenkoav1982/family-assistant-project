import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';
import MemberChip from './MemberChip';
import { getBd } from './constants';

interface Props {
  members: FamilyMember[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function MemberSelector({ members, selectedId, onSelect }: Props) {
  const membersWithBirth = members.filter(m => getBd(m));

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
          <Icon name="Users" size={16} className="text-indigo-600" />
          Выберите члена семьи
        </p>
        {members.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Icon name="UserPlus" size={32} className="mx-auto mb-2" />
            <p className="text-sm">Добавьте членов семьи в разделе «Семья»</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {members.map(m => (
                <MemberChip
                  key={m.id}
                  member={m}
                  isSelected={selectedId === m.id}
                  onClick={() => onSelect(selectedId === m.id ? null : m.id)}
                />
              ))}
            </div>
            {membersWithBirth.length < members.length && (
              <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                <Icon name="Info" size={12} />
                У некоторых членов не указана дата рождения. Заполните в профиле для полного анализа.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
