import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { calculateChildCode } from '@/lib/child-code';
import type { FamilyMember } from '@/types/family.types';

function getBd(m: FamilyMember): string | null { return m.birth_date || m.birthDate || null; }

export default function FamilyMatrixChild() {
  const { members, loading } = useFamilyMembersContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const children = members.filter(m => ['сын', 'дочь', 'ребёнок', 'ребенок'].some(r => m.role.toLowerCase().includes(r)) || m.account_type === 'child_profile');
  const allWithBirth = members.filter(m => getBd(m));
  const selected = allWithBirth.find(m => m.id === selectedId);
  const bd = selected ? getBd(selected) : null;

  const result = useMemo(() => {
    if (!selected || !bd) return null;
    return calculateChildCode(selected.name, bd);
  }, [selected, bd]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Icon name="Loader2" size={32} className="animate-spin text-purple-500" /></div>;

  return (
    <>
      <Helmet><title>Детский код | Нумерология</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero title="Детский код" subtitle="Таланты, склонности и рекомендации для родителей" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/fab06202-41cb-4c97-bb9b-1d03d9e95e8f.jpg" backPath="/family-matrix" />

          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Выберите ребёнка (или любого члена семьи)</p>
              <div className="flex flex-wrap gap-2">
                {(children.length > 0 ? children : allWithBirth).map(m => (
                  <button key={m.id} onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${selectedId === m.id ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200 hover:border-sky-300'}`}>
                    <span className="text-lg">{m.avatar_type === 'emoji' ? m.avatar : '👤'}</span>
                    <span className="text-xs font-medium">{m.name}</span>
                  </button>
                ))}
              </div>
              {children.length === 0 && <p className="text-[11px] text-amber-600 mt-2"><Icon name="Info" size={12} className="inline mr-1" />Детей в семье не найдено — можно выбрать любого члена</p>}
            </CardContent>
          </Card>

          {!result ? (
            <div className="text-center py-10 text-gray-400"><Icon name="Baby" size={48} className="mx-auto mb-3 text-sky-200" /><p className="text-sm">Выберите ребёнка для анализа</p></div>
          ) : (
            <div className="space-y-5">
              <Card className="border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{result.name} — врождённые таланты</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.talents.map(t => (
                      <div key={t.area} className="bg-white rounded-xl p-3 border border-sky-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{t.icon}</span>
                          <div className="flex-1"><p className="text-sm font-bold text-gray-900">{t.area}</p></div>
                          <span className="text-xs font-bold text-sky-600">{t.score}%</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{t.description}</p>
                        <div className="flex flex-wrap gap-1">{t.activities.map(a => <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card><CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><Icon name="BookOpen" size={16} className="text-blue-600" /><h4 className="text-sm font-bold">Стиль обучения</h4></div>
                  <p className="text-xs text-gray-600 leading-relaxed">{result.learningStyle}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><Icon name="Users" size={16} className="text-emerald-600" /><h4 className="text-sm font-bold">Социальный тип</h4></div>
                  <p className="text-xs text-gray-600 leading-relaxed">{result.socialType}</p>
                </CardContent></Card>
                <Card><CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2"><Icon name="Zap" size={16} className="text-amber-600" /><h4 className="text-sm font-bold">Мотивация</h4></div>
                  <p className="text-xs text-gray-600 leading-relaxed">{result.motivationType}</p>
                </CardContent></Card>
              </div>

              <Card className="border-emerald-200 bg-emerald-50/50"><CardContent className="p-4">
                <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><Icon name="Lightbulb" size={16} className="text-emerald-600" /> Советы родителям</h4>
                <div className="space-y-1.5">{result.parentTips.map((t, i) => <div key={i} className="flex items-start gap-2"><Icon name="Check" size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" /><p className="text-xs text-emerald-800">{t}</p></div>)}</div>
              </CardContent></Card>

              {result.warningSign.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50"><CardContent className="p-4">
                  <h4 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1.5"><Icon name="AlertTriangle" size={16} className="text-amber-600" /> На что обратить внимание</h4>
                  <div className="space-y-1.5">{result.warningSign.map((w, i) => <div key={i} className="flex items-start gap-2"><Icon name="AlertCircle" size={12} className="text-amber-500 mt-0.5 flex-shrink-0" /><p className="text-xs text-amber-800">{w}</p></div>)}</div>
                </CardContent></Card>
              )}

              <Card><CardContent className="p-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5"><Icon name="Star" size={16} className="text-sky-600" /> Рекомендуемые занятия</h4>
                <div className="flex flex-wrap gap-1.5">{result.idealActivities.map(a => <Badge key={a} className="bg-sky-100 text-sky-700 border-sky-200 text-xs">{a}</Badge>)}</div>
              </CardContent></Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}