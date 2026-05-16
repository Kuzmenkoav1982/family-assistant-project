import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import SectionHero from '@/components/ui/section-hero';
import { HealthInstructions } from '@/components/health/HealthInstructions';
import useHealthNew from '@/hooks/useHealthNew';
import ProfileSelector from '@/components/health-new/ProfileSelector';
import HealthTabs from '@/components/health-new/HealthTabs';

function HealthNew() {
  const h = useHealthNew();
  const [searchParams, setSearchParams] = useSearchParams();
  const memberFromUrl = searchParams.get('member');
  const tabFromUrl = searchParams.get('tab');
  const actionFromUrl = searchParams.get('action');

  // D.1: deep-link из портфолио — ?member=<familyMemberId> выбирает профиль.
  useEffect(() => {
    if (!memberFromUrl || h.profiles.length === 0) return;
    const target = h.profiles.find((p) => p.userId === memberFromUrl);
    if (target && h.selectedProfile?.id !== target.id) {
      h.setSelectedProfile(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberFromUrl, h.profiles.length]);

  // После того как action выполнен внутри HealthTabs — он сам зачистит ?action.
  // Здесь же чистим ?member после применения, чтобы URL стал стабильным.
  useEffect(() => {
    if (memberFromUrl && h.selectedProfile?.userId === memberFromUrl) {
      const next = new URLSearchParams(searchParams);
      next.delete('member');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h.selectedProfile?.userId, memberFromUrl]);

  if (h.profilesLoading && !h.isDemoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Здоровье семьи"
            subtitle="Медкарты, прививки, лекарства и врачи"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3582e086-831d-4801-9879-c46e56603a26.jpg"
            backPath="/health-hub"
          />
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Загружаем данные о здоровье...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Здоровье семьи"
          subtitle="Медкарты, прививки, лекарства и врачи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3582e086-831d-4801-9879-c46e56603a26.jpg"
          backPath="/health-hub"
        />

        <HealthInstructions />

        <ProfileSelector
          profiles={h.profiles}
          selectedProfile={h.selectedProfile}
          onSelect={h.setSelectedProfile}
          getMemberPhoto={h.getMemberPhoto}
        />

        {h.selectedProfile && (
          <HealthTabs
            selectedProfile={h.selectedProfile}
            records={h.records}
            vaccinations={h.vaccinations}
            medications={h.medications}
            vitals={h.vitals}
            doctors={h.doctors}
            insurance={h.insurance}
            sessions={h.sessions}
            apiProfiles={h.apiProfiles}
            editingMedication={h.editingMedication}
            setEditingMedication={h.setEditingMedication}
            editingRecord={h.editingRecord}
            setEditingRecord={h.setEditingRecord}
            refetchProfiles={h.refetchProfiles}
            refetchRecords={h.refetchRecords}
            refetchVaccinations={h.refetchVaccinations}
            refetchMedications={h.refetchMedications}
            refetchVitals={h.refetchVitals}
            refetchDoctors={h.refetchDoctors}
            refetchInsurance={h.refetchInsurance}
            refetchTelemedicine={h.refetchTelemedicine}
            setSelectedProfile={h.setSelectedProfile}
            onDeleteMedication={h.handleDeleteMedication}
            onDeleteRecord={h.handleDeleteRecord}
            initialTab={tabFromUrl}
            initialAction={actionFromUrl}
          />
        )}
      </div>
    </div>
  );
}

export default HealthNew;