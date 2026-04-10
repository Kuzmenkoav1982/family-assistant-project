import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { generateReconciliationScenarios } from '@/lib/reconciliation';
import type { FamilyMember } from '@/types/family.types';
import type { ReconciliationScenario } from '@/lib/reconciliation';

function getBd(m: FamilyMember): string | null { return m.birth_date || m.birthDate || null; }

const DIFF_COLORS = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
const DIFF_LABELS = { easy: 'Просто', medium: 'Средне', hard: 'Сложно' };

function ScenarioCard({ scenario }: { scenario: ReconciliationScenario }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="hover:shadow-md transition-all cursor-pointer border-2 border-transparent hover:border-purple-200" onClick={() => setOpen(!open)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{scenario.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900 text-sm">{scenario.title}</h4>
              <Badge className={`text-[10px] ${DIFF_COLORS[scenario.difficulty]}`}>{DIFF_LABELS[scenario.difficulty]}</Badge>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{scenario.description}</p>
            <p className="text-[10px] text-purple-600 mt-1">{scenario.basedOn}</p>
          </div>
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gray-400 mt-1" />
        </div>
        {open && (
          <div className="mt-3 pt-3 border-t space-y-2 animate-in fade-in duration-200">
            <p className="text-xs font-medium text-gray-700 flex items-center gap-1"><Icon name="ListOrdered" size={12} /> Пошаговый план:</p>
            <ol className="space-y-1.5 pl-4">
              {scenario.steps.map((step, i) => (
                <li key={i} className="text-xs text-gray-600 leading-relaxed list-decimal">{step}</li>
              ))}
            </ol>
            <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg p-2 mt-2">
              <Icon name="Clock" size={12} className="text-purple-600 flex-shrink-0" />
              <p className="text-[11px] text-purple-700">{scenario.timing}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function FamilyMatrixRituals() {
  const { members, loading } = useFamilyMembersContext();
  const [m1Id, setM1Id] = useState<string | null>(null);
  const [m2Id, setM2Id] = useState<string | null>(null);

  const m1 = members.find(m => m.id === m1Id);
  const m2 = members.find(m => m.id === m2Id);

  const scenarios = useMemo(() => {
    if (!m1 || !m2) return [];
    return generateReconciliationScenarios(m1, m2);
  }, [m1, m2]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Icon name="Loader2" size={32} className="animate-spin text-purple-500" /></div>;

  return (
    <>
      <Helmet><title>Ритуалы примирения | Код Семьи</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero title="Ритуалы примирения" subtitle="Персональные сценарии после ссор на основе ваших данных" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b01853ff-894d-4bfc-98e1-e32b7c13a7bc.jpg" backPath="/family-matrix" />
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Выберите двух участников конфликта</p>
              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'Кто извиняется', id: m1Id, set: setM1Id, other: m2Id }, { label: 'Перед кем', id: m2Id, set: setM2Id, other: m1Id }].map(col => (
                  <div key={col.label}>
                    <p className="text-xs text-gray-500 mb-2">{col.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map(m => (
                        <button key={m.id} disabled={m.id === col.other} onClick={() => col.set(col.id === m.id ? null : m.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${col.id === m.id ? 'border-purple-500 bg-purple-50 font-medium' : m.id === col.other ? 'opacity-30 cursor-not-allowed border-gray-200' : 'border-gray-200 hover:border-purple-300'}`}>
                          {m.avatar_type === 'emoji' ? m.avatar : '👤'} {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {!m1Id || !m2Id ? (
            <div className="text-center py-10 text-gray-400"><Icon name="Flame" size={48} className="mx-auto mb-3 text-teal-200" /><p className="text-sm">Выберите двоих для генерации сценариев примирения</p></div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Icon name="Heart" size={20} className="text-rose-500" /> Сценарии для {m1?.name} → {m2?.name}</h3>
              {scenarios.map(s => <ScenarioCard key={s.id} scenario={s} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
