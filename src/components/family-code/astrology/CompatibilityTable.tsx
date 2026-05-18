import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getZodiacCompatibility, getChineseCompatibility } from '@/lib/astrology';
import type { AstrologyProfile } from '@/types/family-code.types';
import type { FamilyMember } from '@/types/family.types';

interface Row {
  member: FamilyMember;
  profile: AstrologyProfile;
}

export default function CompatibilityTable({ membersData }: { membersData: Row[] }) {
  if (membersData.length < 2) return null;

  return (
    <Card className="overflow-hidden border-2 border-purple-200">
      <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Icon name="Users" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Совместимость знаков</h3>
            <p className="text-xs text-gray-500">Зодиакальная совместимость всех пар</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-gray-500 font-medium"></th>
                {membersData.map(({ member, profile }) => (
                  <th key={member.id} className="p-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-base">{profile.zodiacEmoji}</span>
                      <span className="text-[10px] text-gray-600 truncate max-w-[60px]">{member.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membersData.map(({ member: rowM, profile: rowP }, ri) => (
                <tr key={rowM.id}>
                  <td className="p-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{rowP.zodiacEmoji}</span>
                      <span className="text-[10px] text-gray-700 truncate max-w-[60px]">{rowM.name}</span>
                    </div>
                  </td>
                  {membersData.map(({ member: colM, profile: colP }, ci) => {
                    if (ri === ci) {
                      return (
                        <td key={colM.id} className="p-2 text-center">
                          <span className="text-gray-300">---</span>
                        </td>
                      );
                    }
                    const zodiacCompat = getZodiacCompatibility(rowP.zodiacSign, colP.zodiacSign);
                    const chineseCompat = getChineseCompatibility(rowP.chineseAnimal, colP.chineseAnimal);
                    const avg = Math.round((zodiacCompat + chineseCompat) / 2);
                    const colorClass = avg >= 75
                      ? 'bg-emerald-100 text-emerald-700'
                      : avg >= 55
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700';
                    return (
                      <td key={colM.id} className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded-lg font-bold text-xs ${colorClass}`}>
                          {avg}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 justify-center mt-3 pt-3 border-t">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
            <span className="text-[10px] text-gray-500">75%+</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
            <span className="text-[10px] text-gray-500">55-74%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" />
            <span className="text-[10px] text-gray-500">&lt;55%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
