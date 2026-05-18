import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from '@/lib/helmet';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { calculateAstrologyProfile } from '@/lib/astrology';
import type { AstrologyProfile } from '@/types/family-code.types';
import type { FamilyMember } from '@/types/family.types';
import { getBd } from '@/components/family-code/astrology/constants';
import MemberSelector from '@/components/family-code/astrology/MemberSelector';
import ZodiacSignCard from '@/components/family-code/astrology/ZodiacSignCard';
import ChineseZodiacCard from '@/components/family-code/astrology/ChineseZodiacCard';
import ElementAnalysisCard from '@/components/family-code/astrology/ElementAnalysisCard';
import DailyForecastCard from '@/components/family-code/astrology/DailyForecastCard';
import PlanetaryInfluenceCard from '@/components/family-code/astrology/PlanetaryInfluenceCard';
import CompatibilityTable from '@/components/family-code/astrology/CompatibilityTable';
import ZodiacDistributionCard from '@/components/family-code/astrology/ZodiacDistributionCard';

export default function FamilyMatrixAstrology() {
  const { members, loading } = useFamilyMembersContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const membersWithBirth = members.filter(m => getBd(m));
  const selectedMember = members.find(m => m.id === selectedId) || null;
  const birthDate = selectedMember ? getBd(selectedMember) : null;

  const profile = useMemo(() => {
    if (!birthDate) return null;
    try {
      return calculateAstrologyProfile(birthDate);
    } catch {
      return null;
    }
  }, [birthDate]);

  const allMembersData = useMemo(() => {
    return membersWithBirth
      .map(m => {
        const bd = getBd(m);
        if (!bd) return null;
        try {
          const p = calculateAstrologyProfile(bd);
          if (!p) return null;
          return { member: m, profile: p };
        } catch {
          return null;
        }
      })
      .filter((x): x is { member: FamilyMember; profile: AstrologyProfile } => x !== null);
  }, [membersWithBirth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-3 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Астрология{selectedMember ? ` — ${selectedMember.name}` : ''} | Семейный код</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero
            title="Астрология семьи"
            subtitle="Звёздные карты, стихии и совместимость знаков зодиака"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/da280cc1-1f9a-4521-995f-1fab621c0a1b.jpg"
            backPath="/family-matrix"
          />

          <MemberSelector members={members} selectedId={selectedId} onSelect={setSelectedId} />

          {!selectedId && membersWithBirth.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              <Icon name="Stars" size={48} className="mx-auto mb-3 text-indigo-300" />
              <p className="text-sm">Выберите человека для просмотра астрологического профиля</p>
            </div>
          )}

          {selectedMember && !birthDate && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <Icon name="Calendar" size={32} className="mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-amber-800 font-medium mb-1">Дата рождения не указана</p>
                <p className="text-xs text-amber-700">
                  Для построения астрологического профиля нужна дата рождения.
                </p>
              </CardContent>
            </Card>
          )}

          {selectedMember && profile && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ZodiacSignCard profile={profile} />
                <ChineseZodiacCard profile={profile} />
              </div>

              <ElementAnalysisCard profile={profile} />
              <DailyForecastCard profile={profile} />
              <PlanetaryInfluenceCard profile={profile} />
            </div>
          )}

          {allMembersData.length >= 2 && (
            <div className="space-y-5 pt-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icon name="Network" size={20} className="text-purple-600" />
                Семейная совместимость
              </h3>
              <CompatibilityTable membersData={allMembersData} />
              <ZodiacDistributionCard membersData={allMembersData} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
