import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';
import { calculateCoupleCompatibility } from '@/lib/compatibility';

interface FamilyRelationMatrixProps {
  members: FamilyMember[];
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 65) return 'bg-blue-100 text-blue-800';
  if (score >= 50) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 65) return 'bg-blue-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function FamilyRelationMatrix({ members }: FamilyRelationMatrixProps) {
  const membersWithBirth = members.filter(m => m.birth_date || m.birthDate);

  const matrix = useMemo(() => {
    const results: { m1: string; m2: string; n1: string; n2: string; score: number }[] = [];
    for (let i = 0; i < membersWithBirth.length; i++) {
      for (let j = i + 1; j < membersWithBirth.length; j++) {
        const r = calculateCoupleCompatibility(membersWithBirth[i], membersWithBirth[j]);
        if (r) {
          results.push({
            m1: membersWithBirth[i].id,
            m2: membersWithBirth[j].id,
            n1: membersWithBirth[i].name,
            n2: membersWithBirth[j].name,
            score: r.score.overall,
          });
        }
      }
    }
    return results.sort((a, b) => b.score - a.score);
  }, [membersWithBirth]);

  if (membersWithBirth.length < 2) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center text-gray-400">
          <Icon name="Users" size={32} className="mx-auto mb-2" />
          <p className="text-sm">Нужно минимум 2 члена семьи с датой рождения</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Icon name="Network" size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Матрица взаимоотношений</h3>
            <p className="text-xs text-gray-500">Совместимость всех пар в семье</p>
          </div>
        </div>

        <div className="space-y-2">
          {matrix.map((pair) => (
            <div
              key={`${pair.m1}-${pair.m2}`}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {pair.n1} & {pair.n2}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreBg(pair.score)} transition-all duration-500`}
                    style={{ width: `${pair.score}%` }}
                  />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(pair.score)}`}>
                  {pair.score}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {matrix.length > 0 && (
          <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 80+</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 65-79</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 50-64</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &lt;50</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
