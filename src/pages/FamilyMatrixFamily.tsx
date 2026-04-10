import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { calculateNumerologyProfile } from '@/lib/numerology';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { getFamilyEnergy } from '@/lib/biorhythms';
import FamilyRelationMatrix from '@/components/family-code/FamilyRelationMatrix';
import BiorhythmChart from '@/components/family-code/BiorhythmChart';
import type { FamilyMember } from '@/types/family.types';

function getBd(m: FamilyMember): string | null {
  return m.birth_date || m.birthDate || null;
}

function getEnergyColor(e: number): string {
  if (e >= 70) return 'text-emerald-600';
  if (e >= 50) return 'text-blue-600';
  if (e >= 30) return 'text-amber-600';
  return 'text-red-500';
}

function getEnergyLabel(e: number): string {
  if (e >= 75) return 'Отличная энергетика';
  if (e >= 60) return 'Хорошая энергетика';
  if (e >= 45) return 'Средняя энергетика';
  return 'Низкая энергетика';
}

export default function FamilyMatrixFamily() {
  const { members, loading } = useFamilyMembersContext();

  const membersWithBirth = members.filter(m => getBd(m));
  const today = new Date().toISOString().split('T')[0];

  const familyEnergy = useMemo(() => {
    const dates = membersWithBirth.map(m => getBd(m)!);
    return getFamilyEnergy(dates, today);
  }, [membersWithBirth, today]);

  const memberCards = useMemo(() => {
    return membersWithBirth.map(m => {
      const bd = getBd(m)!;
      const num = calculateNumerologyProfile(m.name, bd);
      const astro = calculateAstrologyProfile(bd);
      return { member: m, num, astro };
    });
  }, [membersWithBirth]);

  const totalNumerology = useMemo(() => {
    if (memberCards.length === 0) return 0;
    const sum = memberCards.reduce((s, c) => s + c.num.lifePath.value, 0);
    let result = sum;
    while (result > 9 && result !== 11 && result !== 22 && result !== 33) {
      result = String(result).split('').reduce((s, d) => s + parseInt(d, 10), 0);
    }
    return result;
  }, [memberCards]);

  const elementStats = useMemo(() => {
    const counts: Record<string, number> = {};
    memberCards.forEach(c => {
      if (c.astro) {
        const el = getElementLabel(c.astro.zodiacElement);
        counts[el] = (counts[el] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [memberCards]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <Icon name="Loader2" size={32} className="text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Код семьи — Общая энергетика и взаимоотношения | Код Семьи</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero
            title="Код семьи"
            subtitle="Энергетика семьи, взаимоотношения и биоритмы"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/193201a8-24e3-4c7a-ba2d-09da9c5381f1.jpg"
            backPath="/family-matrix"
          />

          {membersWithBirth.length < 2 ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6 text-center">
                <Icon name="Users" size={40} className="mx-auto mb-3 text-amber-400" />
                <h3 className="font-bold text-amber-800 mb-1">Нужно больше данных</h3>
                <p className="text-sm text-amber-700">
                  Добавьте минимум 2 члена семьи с датой рождения для анализа семейной энергетики.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <Icon name="Flame" size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Энергетика семьи сегодня</h3>
                        <p className="text-xs text-gray-500">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getEnergyColor(familyEnergy)}`}>{familyEnergy}%</p>
                      <p className="text-[10px] text-gray-500">{getEnergyLabel(familyEnergy)}</p>
                    </div>
                  </div>

                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                      style={{ width: `${familyEnergy}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                      <p className="text-2xl font-bold text-purple-700">{totalNumerology}</p>
                      <p className="text-[10px] text-gray-500">Число семьи</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                      <p className="text-2xl font-bold text-orange-600">{membersWithBirth.length}</p>
                      <p className="text-[10px] text-gray-500">Членов</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                      <p className="text-lg font-bold text-blue-600">
                        {elementStats[0]?.[0] || '—'}
                      </p>
                      <p className="text-[10px] text-gray-500">Доминирующая стихия</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-3 text-center border border-orange-100">
                      <p className="text-lg font-bold text-emerald-600">
                        {Math.round((membersWithBirth.length * (membersWithBirth.length - 1)) / 2)}
                      </p>
                      <p className="text-[10px] text-gray-500">Связей</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-purple-600" />
                  Профили членов семьи
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memberCards.map(({ member, num, astro }) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {member.avatar_type === 'emoji' || !member.photo_url ? member.avatar : '👤'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                          <div className={`bg-gradient-to-br ${num.lifePath.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{num.lifePath.value}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px]">
                            {num.lifePath.title}
                          </Badge>
                          {astro && (
                            <>
                              <Badge variant="outline" className="text-[10px]">
                                {astro.zodiacEmoji} {astro.zodiacSignLabel}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {astro.chineseAnimalEmoji} {astro.chineseAnimalLabel}
                              </Badge>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <FamilyRelationMatrix members={members} />

              <BiorhythmChart members={members} />

              {elementStats.length > 0 && (
                <Card className="border-2 border-purple-200">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Icon name="Droplets" size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Стихии семьи</h3>
                        <p className="text-xs text-gray-500">Распределение элементов по знакам зодиака</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {elementStats.map(([el, count]) => (
                        <div key={el} className="flex items-center gap-3">
                          <span className="text-sm w-20 font-medium text-gray-700">{el}</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                              style={{ width: `${(count / membersWithBirth.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}