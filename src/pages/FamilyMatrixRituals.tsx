import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { generateReconciliationScenarios } from '@/lib/reconciliation';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { calculateNumerologyProfile } from '@/lib/numerology';
import MemberAvatar from '@/components/ui/member-avatar';
import { useToast } from '@/components/ui/use-toast';
import type { FamilyMember } from '@/types/family.types';
import type { ReconciliationScenario } from '@/lib/reconciliation';
import func2url from '@/config/func2url';

function getBd(m: FamilyMember): string | null { return m.birth_date || m.birthDate || null; }

const DIFF_COLORS = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };
const DIFF_LABELS = { easy: 'Просто', medium: 'Средне', hard: 'Сложно' };

interface AIAnalysis {
  member1Perspective: string;
  member2Perspective: string;
  rootCause: string;
  steps: string[];
  advice: string;
  bestTime: string;
}

function buildNumerologyData(m: FamilyMember) {
  const bd = getBd(m);
  if (!bd) return null;
  const astro = calculateAstrologyProfile(bd);
  const num = calculateNumerologyProfile(m.name, bd);
  if (!astro || !num) return null;
  return {
    lifePath: num.lifePath.value,
    zodiacSign: astro.zodiacSignLabel,
    element: getElementLabel(astro.zodiacElement),
    chineseAnimal: astro.chineseAnimalLabel,
    personality: num.lifePath.shortMeaning,
  };
}

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

function PerceptionBlock({ name, emoji, perspective }: { name: string; emoji: string; perspective: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <h4 className="font-bold text-sm text-gray-900">Как видит {name}</h4>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{perspective}</p>
    </div>
  );
}

function AIAnalysisCard({ analysis, m1Name, m2Name }: { analysis: AIAnalysis; m1Name: string; m2Name: string }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-xl">
          <Icon name="Brain" size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">ИИ-анализ конфликта</h3>
          <p className="text-[11px] text-gray-500">На основе нумерологии и астрологии обоих участников</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PerceptionBlock name={m1Name} emoji="👤" perspective={analysis.member1Perspective} />
        <PerceptionBlock name={m2Name} emoji="👤" perspective={analysis.member2Perspective} />
      </div>

      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="Lightbulb" size={16} className="text-amber-600" />
            <h4 className="font-bold text-sm text-amber-900">Корень конфликта</h4>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">{analysis.rootCause}</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="Route" size={16} className="text-emerald-600" />
            <h4 className="font-bold text-sm text-emerald-900">Путь к примирению</h4>
          </div>
          <ol className="space-y-2">
            {analysis.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="bg-emerald-200 text-emerald-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-xs text-emerald-800 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border border-violet-200 bg-violet-50">
          <CardContent className="p-3 flex items-start gap-2">
            <Icon name="Sparkles" size={14} className="text-violet-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-violet-700 uppercase tracking-wider mb-1">Мудрость</p>
              <p className="text-xs text-violet-800 leading-relaxed">{analysis.advice}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-sky-200 bg-sky-50">
          <CardContent className="p-3 flex items-start gap-2">
            <Icon name="Clock" size={14} className="text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider mb-1">Лучшее время</p>
              <p className="text-xs text-sky-800 leading-relaxed">{analysis.bestTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProfileSummary({ member }: { member: FamilyMember }) {
  const bd = getBd(member);
  if (!bd) return null;
  const astro = calculateAstrologyProfile(bd);
  const num = calculateNumerologyProfile(member.name, bd);
  if (!astro || !num) return null;

  return (
    <div className="bg-white/80 rounded-xl border border-gray-100 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <MemberAvatar member={member} size="sm" />
        <div>
          <p className="text-sm font-bold text-gray-900">{member.name}</p>
          <p className="text-[10px] text-gray-500">{member.role}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge className="bg-purple-100 text-purple-700 text-[10px]">
          {astro.zodiacEmoji} {astro.zodiacSignLabel}
        </Badge>
        <Badge className="bg-indigo-100 text-indigo-700 text-[10px]">
          Число {num.lifePath.value}: {num.lifePath.shortMeaning}
        </Badge>
        <Badge className="bg-teal-100 text-teal-700 text-[10px]">
          {getElementLabel(astro.zodiacElement)}
        </Badge>
        <Badge className="bg-rose-100 text-rose-700 text-[10px]">
          {astro.chineseAnimalEmoji} {astro.chineseAnimalLabel}
        </Badge>
      </div>
      <div className="text-[11px] text-gray-600 leading-relaxed">
        <p><span className="font-medium">Сильные стороны:</span> {num.lifePath.strengths?.slice(0, 3).join(', ')}</p>
        <p><span className="font-medium">Зоны роста:</span> {num.lifePath.weaknesses?.slice(0, 2).join(', ')}</p>
      </div>
    </div>
  );
}

export default function FamilyMatrixRituals() {
  const { members, loading } = useFamilyMembersContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [m1Id, setM1Id] = useState<string | null>(null);
  const [m2Id, setM2Id] = useState<string | null>(null);
  const [situation, setSituation] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'ai'>('scenarios');

  const m1 = members.find(m => m.id === m1Id);
  const m2 = members.find(m => m.id === m2Id);

  const scenarios = useMemo(() => {
    if (!m1 || !m2) return [];
    return generateReconciliationScenarios(m1, m2);
  }, [m1, m2]);

  const handleAIAnalysis = useCallback(async () => {
    if (!m1 || !m2 || !situation.trim()) return;
    const apiUrl = (func2url as Record<string, string>)['conflict-ai'];
    if (!apiUrl) {
      toast({ title: 'Функция недоступна', description: 'Попробуйте позже', variant: 'destructive' });
      return;
    }

    setAiLoading(true);
    setAiAnalysis(null);

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const n1 = buildNumerologyData(m1);
    const n2 = buildNumerologyData(m2);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member1: { name: m1.name, birthDate: getBd(m1) },
          member2: { name: m2.name, birthDate: getBd(m2) },
          situation: situation.trim(),
          familyId: userData.family_id,
          userId: userData.id,
          numerologyData: { member1: n1, member2: n2 },
        }),
      });

      if (res.status === 402) {
        toast({ title: '💰 Недостаточно средств', description: 'Пополните кошелёк для использования ИИ-анализа' });
        setTimeout(() => navigate('/wallet'), 2000);
        return;
      }
      if (res.status === 403) {
        toast({ title: '🔐 Необходима регистрация', description: 'Войдите в аккаунт для использования ИИ' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
        setActiveTab('ai');
      } else if (data.error) {
        toast({ title: 'Ошибка', description: data.message || data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Не удалось связаться с сервером', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  }, [m1, m2, situation, toast, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Icon name="Loader2" size={32} className="animate-spin text-purple-500" /></div>;

  return (
    <>
      <Helmet><title>Ритуалы примирения | Семейный код</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero title="Ритуалы примирения" subtitle="Персональные сценарии после ссор на основе ваших данных" imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b20738ad-2590-49b8-aedf-a34483b659c2.jpg" backPath="/family-matrix" />

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
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${col.id === m.id ? 'border-purple-500 bg-purple-50 font-medium' : m.id === col.other ? 'opacity-30 cursor-not-allowed border-gray-200' : 'border-gray-200 hover:border-purple-300'}`}>
                          <MemberAvatar member={m} size="xs" /> {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {m1 && m2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ProfileSummary member={m1} />
              <ProfileSummary member={m2} />
            </div>
          )}

          {m1 && m2 && (
            <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1.5 rounded-lg">
                    <Icon name="Brain" size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Спросить Домового</h3>
                    <p className="text-[10px] text-gray-500">Опишите ситуацию — ИИ проанализирует с учётом нумерологии обоих (5 ₽)</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Опишите конфликтную ситуацию... Например: «Не можем договориться о том, куда поехать в отпуск» или «Ссоримся из-за распределения домашних обязанностей»"
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  className="text-sm bg-white/80 border-violet-200 focus:border-violet-400 min-h-[80px] resize-none"
                />
                <button
                  onClick={handleAIAnalysis}
                  disabled={!situation.trim() || aiLoading}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {aiLoading ? (
                    <><Icon name="Loader2" size={16} className="animate-spin" /> Анализирую...</>
                  ) : (
                    <><Icon name="Sparkles" size={16} /> Получить ИИ-анализ</>
                  )}
                </button>
              </CardContent>
            </Card>
          )}

          {!m1Id || !m2Id ? (
            <div className="text-center py-10 text-gray-400">
              <Icon name="Flame" size={48} className="mx-auto mb-3 text-teal-200" />
              <p className="text-sm">Выберите двоих для генерации сценариев примирения</p>
            </div>
          ) : (
            <>
              {aiAnalysis && (
                <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => setActiveTab('scenarios')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === 'scenarios' ? 'bg-teal-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Icon name="Flame" size={14} /> Сценарии ({scenarios.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === 'ai' ? 'bg-violet-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Icon name="Brain" size={14} /> ИИ-анализ
                  </button>
                </div>
              )}

              {activeTab === 'scenarios' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Icon name="Heart" size={20} className="text-rose-500" /> Сценарии для {m1?.name} → {m2?.name}
                  </h3>
                  {scenarios.map(s => <ScenarioCard key={s.id} scenario={s} />)}
                </div>
              )}

              {activeTab === 'ai' && aiAnalysis && m1 && m2 && (
                <AIAnalysisCard analysis={aiAnalysis} m1Name={m1.name} m2Name={m2.name} />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}