import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { calculateCoupleCompatibility } from '@/lib/compatibility';
import CompatibilityGauge from '@/components/family-code/CompatibilityGauge';
import CompatibilityBreakdown from '@/components/family-code/CompatibilityBreakdown';
import type { FamilyMember } from '@/types/family.types';

function getMemberBirthDate(m: FamilyMember): string | null {
  return m.birth_date || m.birthDate || null;
}

function MemberButton({ member, isSelected, onClick, disabled }: {
  member: FamilyMember;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  const hasBirth = !!getMemberBirthDate(member);
  return (
    <button
      onClick={onClick}
      disabled={disabled || !hasBirth}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : hasBirth && !disabled
            ? 'border-gray-200 bg-white hover:border-purple-300'
            : 'border-dashed border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
      }`}
    >
      <span className="text-lg">{member.avatar_type === 'emoji' || !member.photo_url ? member.avatar : '👤'}</span>
      <div className="text-left">
        <p className={`text-xs font-medium ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>{member.name}</p>
        <p className="text-[10px] text-gray-400">{hasBirth ? member.role : 'Нет даты рождения'}</p>
      </div>
    </button>
  );
}

export default function FamilyMatrixCouple() {
  const { members, loading } = useFamilyMembersContext();
  const [member1Id, setMember1Id] = useState<string | null>(null);
  const [member2Id, setMember2Id] = useState<string | null>(null);

  const membersWithBirth = members.filter(m => getMemberBirthDate(m));

  const member1 = members.find(m => m.id === member1Id) || null;
  const member2 = members.find(m => m.id === member2Id) || null;

  const result = useMemo(() => {
    if (!member1 || !member2) return null;
    return calculateCoupleCompatibility(member1, member2);
  }, [member1, member2]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        <Icon name="Loader2" size={32} className="text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Код пары — Совместимость | Нумерология</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero
            title="Код пары"
            subtitle="Совместимость по нумерологии, астрологии, арканам и психологии"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/91271438-b023-4903-aaf0-b0cd976f2865.jpg"
            backPath="/family-matrix"
          />

          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Icon name="User" size={14} className="text-rose-500" />
                    Первый партнёр
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {members.map(m => (
                      <MemberButton
                        key={m.id}
                        member={m}
                        isSelected={member1Id === m.id}
                        disabled={member2Id === m.id}
                        onClick={() => setMember1Id(member1Id === m.id ? null : m.id)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    <Icon name="User" size={14} className="text-purple-500" />
                    Второй партнёр
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {members.map(m => (
                      <MemberButton
                        key={m.id}
                        member={m}
                        isSelected={member2Id === m.id}
                        disabled={member1Id === m.id}
                        onClick={() => setMember2Id(member2Id === m.id ? null : m.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {membersWithBirth.length < 2 && (
                <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  Для анализа совместимости нужно минимум 2 члена семьи с датой рождения
                </p>
              )}
            </CardContent>
          </Card>

          {!member1Id || !member2Id ? (
            <div className="text-center py-10 text-gray-400">
              <Icon name="Heart" size={48} className="mx-auto mb-3 text-pink-200" />
              <p className="text-sm">Выберите двух членов семьи для анализа совместимости</p>
            </div>
          ) : !result ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <Icon name="Calendar" size={32} className="mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-amber-800">Укажите дату рождения обоих членов семьи</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
                <CardContent className="p-6">
                  <CompatibilityGauge
                    score={result.score}
                    name1={result.member1Name}
                    name2={result.member2Name}
                  />
                </CardContent>
              </Card>

              <CompatibilityBreakdown result={result} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}