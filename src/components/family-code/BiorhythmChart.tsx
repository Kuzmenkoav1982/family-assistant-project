import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';
import { calculateBiorhythmRange, calculatePowerDays } from '@/lib/biorhythms';

interface BiorhythmChartProps {
  members: FamilyMember[];
}

function getMemberBirthDate(m: FamilyMember): string | null {
  return m.birth_date || m.birthDate || null;
}

const COLORS = {
  physical: { line: '#ef4444', bg: 'bg-red-100', text: 'text-red-700', label: 'Физический' },
  emotional: { line: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700', label: 'Эмоциональный' },
  intellectual: { line: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700', label: 'Интеллектуальный' },
};

function MiniGraph({ data, height = 60, width = '100%' }: { data: number[]; height?: number; width?: string }) {
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = ((1 - v) / 2) * height;
    return `${x},${y}`;
  }).join(' ');

  const zeroY = height / 2;

  return (
    <svg viewBox={`0 0 100 ${height}`} width={width} height={height} className="overflow-visible" preserveAspectRatio="none">
      <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2,2" />
      <polyline
        points={points}
        fill="none"
        stroke={COLORS.physical.line}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

export default function BiorhythmChart({ members }: BiorhythmChartProps) {
  const membersWithBirth = members.filter(m => getMemberBirthDate(m));
  const [selectedId, setSelectedId] = useState<string | null>(membersWithBirth[0]?.id || null);

  const selectedMember = membersWithBirth.find(m => m.id === selectedId);
  const birthDate = selectedMember ? getMemberBirthDate(selectedMember) : null;

  const today = new Date().toISOString().split('T')[0];

  const bioData = useMemo(() => {
    if (!birthDate) return null;
    return calculateBiorhythmRange(birthDate, today, 30);
  }, [birthDate, today]);

  const powerDays = useMemo(() => {
    if (!birthDate) return [];
    return calculatePowerDays(birthDate, today, 5);
  }, [birthDate, today]);

  const todayBio = bioData?.[0];

  if (membersWithBirth.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center text-gray-400">
          <Icon name="Activity" size={32} className="mx-auto mb-2" />
          <p className="text-sm">Нужна дата рождения для расчёта биоритмов</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-rose-100 p-2 rounded-lg">
            <Icon name="Activity" size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Биоритмы</h3>
            <p className="text-xs text-gray-500">Физический, эмоциональный, интеллектуальный циклы</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {membersWithBirth.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                selectedId === m.id
                  ? 'border-purple-500 bg-purple-50 text-purple-800 font-medium'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
              }`}
            >
              {m.avatar_type === 'emoji' ? m.avatar : '👤'} {m.name}
            </button>
          ))}
        </div>

        {todayBio && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { key: 'physical' as const, value: todayBio.physical, critical: todayBio.isPhysicalCritical },
              { key: 'emotional' as const, value: todayBio.emotional, critical: todayBio.isEmotionalCritical },
              { key: 'intellectual' as const, value: todayBio.intellectual, critical: todayBio.isIntellectualCritical },
            ].map(item => {
              const pct = Math.round((item.value + 1) * 50);
              const color = COLORS[item.key];
              return (
                <div key={item.key} className={`${color.bg} rounded-xl p-3 text-center relative`}>
                  {item.critical && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  <p className="text-[10px] text-gray-500 mb-1">{color.label}</p>
                  <p className={`text-xl font-bold ${color.text}`}>{pct}%</p>
                  <p className="text-[10px] text-gray-400">сегодня</p>
                </div>
              );
            })}
          </div>
        )}

        {bioData && (
          <div className="space-y-2 mb-4">
            <p className="text-[10px] text-gray-400 text-center">Прогноз на 30 дней</p>
            {(['physical', 'emotional', 'intellectual'] as const).map(key => {
              const values = bioData.map(d => d[key]);
              const color = COLORS[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className={`text-[10px] w-24 ${color.text} font-medium`}>{color.label}</span>
                  <div className="flex-1">
                    <MiniGraph data={values} height={24} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {powerDays.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Icon name="Zap" size={14} className="text-amber-500" />
              Дни силы (ближайшие)
            </p>
            <div className="space-y-1.5">
              {powerDays.map(day => (
                <div key={day.date} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0">
                    {new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-amber-800 truncate">{day.reason}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700">{day.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
