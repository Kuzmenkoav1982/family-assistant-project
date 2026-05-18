import { useState, useMemo, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from '@/lib/helmet';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { generateReconciliationScenarios } from '@/lib/reconciliation';
import MemberPicker from '@/components/family-code/rituals/MemberPicker';
import ProfileSummary from '@/components/family-code/rituals/ProfileSummary';
import AIRequestCard from '@/components/family-code/rituals/AIRequestCard';
import AIAnalysisCard from '@/components/family-code/rituals/AIAnalysisCard';
import ScenarioCard from '@/components/family-code/rituals/ScenarioCard';
import { useRitualsAI } from '@/components/family-code/rituals/useRitualsAI';

export default function FamilyMatrixRituals() {
  const { members, loading } = useFamilyMembersContext();
  const [m1Id, setM1Id] = useState<string | null>(null);
  const [m2Id, setM2Id] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'ai'>('scenarios');

  const m1 = members.find(m => m.id === m1Id);
  const m2 = members.find(m => m.id === m2Id);

  const scenarios = useMemo(() => {
    if (!m1 || !m2) return [];
    return generateReconciliationScenarios(m1, m2);
  }, [m1, m2]);

  const switchToAi = useCallback(() => setActiveTab('ai'), []);
  const { situation, setSituation, aiAnalysis, aiLoading, handleAIAnalysis } = useRitualsAI({
    m1,
    m2,
    onSuccess: switchToAi,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Ритуалы примирения | Семейный код</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4 lg:p-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-5">
          <SectionHero
            title="Ритуалы примирения"
            subtitle="Персональные сценарии после ссор на основе ваших данных"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b20738ad-2590-49b8-aedf-a34483b659c2.jpg"
            backPath="/family-matrix"
          />

          <MemberPicker
            members={members}
            m1Id={m1Id}
            m2Id={m2Id}
            setM1Id={setM1Id}
            setM2Id={setM2Id}
          />

          {m1 && m2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ProfileSummary member={m1} />
              <ProfileSummary member={m2} />
            </div>
          )}

          {m1 && m2 && (
            <AIRequestCard
              situation={situation}
              setSituation={setSituation}
              aiLoading={aiLoading}
              onAnalyze={handleAIAnalysis}
            />
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
