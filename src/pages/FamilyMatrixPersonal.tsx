import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { calculateNumerologyProfile } from '@/lib/numerology';
import { calculatePythagorasSquare } from '@/lib/pythagoras-square';
import { calculateAstrologyProfile } from '@/lib/astrology';
import { calculateDestinyMatrix } from '@/lib/tarot-arcana';
import NumerologyCard from '@/components/family-code/NumerologyCard';
import PythagorasGrid from '@/components/family-code/PythagorasGrid';
import PythagorasLines from '@/components/family-code/PythagorasLines';
import PersonalSummary from '@/components/family-code/PersonalSummary';
import AstrologyCard from '@/components/family-code/AstrologyCard';
import TarotMatrix from '@/components/family-code/TarotMatrix';
import MemberAvatar from '@/components/ui/member-avatar';
import type { FamilyMember } from '@/types/family.types';

function getMemberBirthDate(member: FamilyMember): string | null {
  return member.birth_date || member.birthDate || null;
}

function MemberSelector({
  members,
  selected,
  onSelect,
}: {
  members: FamilyMember[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {members.map((m) => {
        const hasBirthDate = !!getMemberBirthDate(m);
        const isSelected = selected === m.id;
        return (
          <button
            key={m.id}
            onClick={() => hasBirthDate && onSelect(m.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-purple-500 bg-purple-50 shadow-md'
                : hasBirthDate
                  ? 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  : 'border-dashed border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
            }`}
          >
            <MemberAvatar member={m} size="sm" />
            <div className="text-left">
              <p className={`text-xs font-medium ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                {m.name}
              </p>
              <p className="text-[10px] text-gray-400">
                {hasBirthDate ? m.role : 'Нет даты рождения'}
              </p>
            </div>
            {!hasBirthDate && (
              <Icon name="AlertCircle" size={14} className="text-amber-400 ml-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function FamilyMatrixPersonal() {
  const navigate = useNavigate();
  const { members, loading } = useFamilyMembersContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const membersWithBirth = members.filter(m => getMemberBirthDate(m));

  const selectedMember = members.find(m => m.id === selectedId) || null;
  const birthDate = selectedMember ? getMemberBirthDate(selectedMember) : null;

  const analysis = useMemo(() => {
    if (!selectedMember || !birthDate) return null;
    try {
      const numerology = calculateNumerologyProfile(selectedMember.name, birthDate);
      const pythagoras = calculatePythagorasSquare(birthDate);
      const astrology = calculateAstrologyProfile(birthDate);
      const destinyMatrix = calculateDestinyMatrix(birthDate);
      return { numerology, pythagoras, astrology, destinyMatrix };
    } catch {
      return null;
    }
  }, [selectedMember, birthDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
        <div className="text-center">
          <Icon name="Loader2" size={32} className="mx-auto mb-3 text-purple-500 animate-spin" />
          <p className="text-sm text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Личный код{selectedMember ? ` — ${selectedMember.name}` : ''} | Семейный код</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-3 sm:p-4 lg:p-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <SectionHero
            title="Личный код"
            subtitle="Нумерологический расклад по дате рождения и имени"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/460c88cf-fc6e-4eff-99f8-9b5d71e7b34d.jpg"
            backPath="/family-matrix"
          />

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                <Icon name="Users" size={16} className="text-purple-600" />
                Выберите члена семьи
              </p>
              {members.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Icon name="UserPlus" size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Добавьте членов семьи в разделе «Семья»</p>
                </div>
              ) : (
                <>
                  <MemberSelector members={members} selected={selectedId} onSelect={setSelectedId} />
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

          {!selectedId && membersWithBirth.length > 0 && (
            <div className="text-center py-8 text-gray-400">
              <Icon name="Sparkles" size={48} className="mx-auto mb-3 text-purple-300" />
              <p className="text-sm">Выберите человека для расчёта Личного кода</p>
            </div>
          )}

          {selectedMember && !birthDate && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <Icon name="Calendar" size={32} className="mx-auto mb-2 text-amber-500" />
                <p className="text-sm text-amber-800 font-medium mb-1">Дата рождения не указана</p>
                <p className="text-xs text-amber-700 mb-3">
                  Для расчёта нумерологии нужна дата рождения. Укажите её в профиле члена семьи.
                </p>
                <Button size="sm" variant="outline" onClick={() => navigate('/')}>
                  Перейти к профилю
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedMember && analysis && (
            <div className="space-y-5">
              <PersonalSummary
                memberName={selectedMember.name}
                numerology={analysis.numerology}
                pythagoras={analysis.pythagoras}
                astrology={analysis.astrology}
                destinyMatrix={analysis.destinyMatrix}
              />

              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="Calculator" size={20} className="text-purple-600" />
                  Нумерологические числа
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumerologyCard label="Число Жизненного Пути" icon="Route" number={analysis.numerology.lifePath} />
                  <NumerologyCard label="Число Судьбы" icon="Compass" number={analysis.numerology.destiny} />
                  <NumerologyCard label="Число Души" icon="Heart" number={analysis.numerology.soul} />
                  <NumerologyCard label="Число Личности" icon="User" number={analysis.numerology.personality} />
                  <NumerologyCard label="Число Дня Рождения" icon="Calendar" number={analysis.numerology.birthDay} />
                  <NumerologyCard label="Число Экспрессии" icon="Zap" number={analysis.numerology.expression} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PythagorasGrid square={analysis.pythagoras} />
                <PythagorasLines
                  rows={analysis.pythagoras.rows}
                  columns={analysis.pythagoras.columns}
                  diagonals={analysis.pythagoras.diagonals}
                />
              </div>

              {analysis.astrology && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon name="Star" size={20} className="text-indigo-600" />
                    Астрология
                  </h3>
                  <AstrologyCard profile={analysis.astrology} />
                </div>
              )}

              {analysis.destinyMatrix && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Icon name="Wand2" size={20} className="text-amber-600" />
                    Матрица Судьбы — Арканы Таро
                  </h3>
                  <TarotMatrix matrix={analysis.destinyMatrix} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}