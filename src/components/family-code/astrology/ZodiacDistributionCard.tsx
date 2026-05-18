import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getElementLabel } from '@/lib/astrology';
import type { AstrologyProfile, Element } from '@/types/family-code.types';
import type { FamilyMember } from '@/types/family.types';
import { ELEMENT_EMOJI } from './constants';

interface Row {
  member: FamilyMember;
  profile: AstrologyProfile;
}

export default function ZodiacDistributionCard({ membersData }: { membersData: Row[] }) {
  const elementCounts = useMemo(() => {
    const counts: Record<string, { count: number; label: string; members: string[] }> = {};
    const elements: Element[] = ['fire', 'earth', 'air', 'water'];
    elements.forEach(el => {
      counts[el] = { count: 0, label: getElementLabel(el), members: [] };
    });
    membersData.forEach(({ member, profile }) => {
      const el = profile.zodiacElement;
      if (counts[el]) {
        counts[el].count++;
        counts[el].members.push(member.name);
      }
    });
    return counts;
  }, [membersData]);

  const total = membersData.length;
  if (total === 0) return null;

  const elementOrder: Element[] = ['fire', 'earth', 'air', 'water'];
  const segmentColors: Record<string, string> = {
    fire: '#ef4444',
    earth: '#f59e0b',
    air: '#38bdf8',
    water: '#6366f1',
  };

  let cumulative = 0;
  const segments = elementOrder
    .filter(el => elementCounts[el].count > 0)
    .map(el => {
      const pct = (elementCounts[el].count / total) * 100;
      const offset = cumulative;
      cumulative += pct;
      return { el, pct, offset, color: segmentColors[el] };
    });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Icon name="PieChart" size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Распределение стихий</h3>
            <p className="text-xs text-gray-500">Баланс элементов в семье</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {segments.map(seg => (
                <circle
                  key={seg.el}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="4"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={`${-seg.offset}`}
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{total}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {elementOrder.map(el => {
              const data = elementCounts[el];
              if (data.count === 0) return null;
              const pct = Math.round((data.count / total) * 100);
              return (
                <div key={el}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      {ELEMENT_EMOJI[el]} {data.label}
                    </span>
                    <span className="text-[10px] text-gray-500">{data.count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: segmentColors[el] }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{data.members.join(', ')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
