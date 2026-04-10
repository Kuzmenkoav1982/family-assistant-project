import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { analyzeName, getTopNames, type NameAnalysis } from '@/lib/name-calculator';
import MemberAvatar from '@/components/ui/member-avatar';
import type { FamilyMember } from '@/types/family.types';

function getBd(m: FamilyMember): string | null { return m.birth_date || m.birthDate || null; }
function scoreColor(s: number): string { return s >= 80 ? 'text-emerald-600' : s >= 60 ? 'text-blue-600' : s >= 40 ? 'text-amber-600' : 'text-red-500'; }
function scoreBg(s: number): string { return s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-blue-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500'; }

function NameRow({ analysis, p1Name, p2Name }: { analysis: NameAnalysis; p1Name: string; p2Name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => setOpen(!open)}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${analysis.destinyInfo.color} flex items-center justify-center shadow`}>
            <span className="text-white font-bold">{analysis.destinyNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{analysis.name}</p>
            <p className="text-[10px] text-gray-500">{analysis.destinyInfo.title} • {analysis.destinyInfo.shortMeaning}</p>
          </div>
          <span className={`text-lg font-bold ${scoreColor(analysis.familyHarmony)}`}>{analysis.familyHarmony}%</span>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} className="text-gray-400" />
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t space-y-2 animate-in fade-in duration-200">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Судьба</p><p className="font-bold text-purple-700">{analysis.destinyNumber}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Душа</p><p className="font-bold text-rose-600">{analysis.soulNumber}</p></div>
              <div className="bg-gray-50 rounded-lg p-2"><p className="text-xs text-gray-500">Личность</p><p className="font-bold text-blue-600">{analysis.personalityNumber}</p></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Совместимость с {p1Name}</span>
                <span className={`font-bold ${scoreColor(analysis.compatWithParent1)}`}>{analysis.compatWithParent1}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(analysis.compatWithParent1)}`} style={{ width: `${analysis.compatWithParent1}%` }} /></div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Совместимость с {p2Name}</span>
                <span className={`font-bold ${scoreColor(analysis.compatWithParent2)}`}>{analysis.compatWithParent2}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(analysis.compatWithParent2)}`} style={{ width: `${analysis.compatWithParent2}%` }} /></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FamilyMatrixName() {
  const { members, loading } = useFamilyMembersContext();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [customName, setCustomName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  const adults = members.filter(m => {
    const role = m.role.toLowerCase();
    return ['владелец', 'жена', 'муж', 'супруг', 'супруга', 'мама', 'папа', 'партнёр'].some(r => role.includes(r));
  }).filter(m => getBd(m));

  const p1 = adults[0];
  const p2 = adults[1];
  const hasPair = p1 && p2;

  const topNames = useMemo(() => {
    if (!hasPair) return [];
    return getTopNames(gender, p1.name, getBd(p1)!, p2.name, getBd(p2)!, expectedDate || undefined, 10);
  }, [hasPair, gender, p1, p2, expectedDate]);

  const customResult = useMemo(() => {
    if (!hasPair || !customName.trim()) return null;
    return analyzeName(customName.trim(), p1.name, getBd(p1)!, p2.name, getBd(p2)!, expectedDate || undefined);
  }, [hasPair, customName, p1, p2, expectedDate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Icon name="Loader2" size={32} className="animate-spin text-purple-500" /></div>;

  return (
    <>
      <Helmet><title>Имя для малыша | Нумерология</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero title="Имя для малыша" subtitle="Нумерологическая совместимость имени с родителями" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b25dcedf-1426-49a5-bab9-8060c6d36ffc.jpg" backPath="/family-matrix" />

          {!hasPair ? (
            <Card className="border-amber-200 bg-amber-50"><CardContent className="p-6 text-center">
              <Icon name="Users" size={40} className="mx-auto mb-3 text-amber-400" />
              <h3 className="font-bold text-amber-800 mb-1">Нужна пара родителей</h3>
              <p className="text-sm text-amber-700">Для расчёта нужно минимум 2 взрослых члена семьи с датой рождения и ролью «муж/жена/владелец».</p>
            </CardContent></Card>
          ) : (
            <>
              <Card><CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">Родители:</p>
                  <Badge variant="outline" className="flex items-center gap-1.5"><MemberAvatar member={p1} size="xs" /> {p1.name}</Badge>
                  <span className="text-gray-400">&</span>
                  <Badge variant="outline" className="flex items-center gap-1.5"><MemberAvatar member={p2} size="xs" /> {p2.name}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant={gender === 'male' ? 'default' : 'outline'} onClick={() => setGender('male')}>👦 Мальчик</Button>
                  <Button size="sm" variant={gender === 'female' ? 'default' : 'outline'} onClick={() => setGender('female')}>👧 Девочка</Button>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Предполагаемая дата рождения (опционально)</label>
                  <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Проверить своё имя</label>
                  <input type="text" placeholder="Введите имя..." value={customName} onChange={e => setCustomName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              </CardContent></Card>

              {customResult && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Ваш вариант:</h3>
                  <NameRow analysis={customResult} p1Name={p1.name} p2Name={p2.name} />
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Icon name="Trophy" size={20} className="text-emerald-600" />
                  Топ-10 {gender === 'male' ? 'мужских' : 'женских'} имён по совместимости
                </h3>
                <div className="space-y-2">
                  {topNames.map((n, i) => (
                    <div key={n.name} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
                      <div className="flex-1"><NameRow analysis={n} p1Name={p1.name} p2Name={p2.name} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}