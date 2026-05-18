import { Card, CardContent } from '@/components/ui/card';
import MemberAvatar from '@/components/ui/member-avatar';
import type { FamilyMember } from '@/types/family.types';

interface Props {
  members: FamilyMember[];
  m1Id: string | null;
  m2Id: string | null;
  setM1Id: (v: string | null) => void;
  setM2Id: (v: string | null) => void;
}

export default function MemberPicker({ members, m1Id, m2Id, setM1Id, setM2Id }: Props) {
  const cols = [
    { label: 'Кто извиняется', id: m1Id, set: setM1Id, other: m2Id },
    { label: 'Перед кем', id: m2Id, set: setM2Id, other: m1Id },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Выберите двух участников конфликта</p>
        <div className="grid grid-cols-2 gap-4">
          {cols.map(col => (
            <div key={col.label}>
              <p className="text-xs text-gray-500 mb-2">{col.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {members.map(m => (
                  <button
                    key={m.id}
                    disabled={m.id === col.other}
                    onClick={() => col.set(col.id === m.id ? null : m.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      col.id === m.id
                        ? 'border-purple-500 bg-purple-50 font-medium'
                        : m.id === col.other
                        ? 'opacity-30 cursor-not-allowed border-gray-200'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <MemberAvatar member={m} size="xs" /> {m.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
