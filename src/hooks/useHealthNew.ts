import { useState, useEffect, useMemo } from 'react';
import {
  DEMO_HEALTH_PROFILES, DEMO_HEALTH_RECORDS_NEW, DEMO_VACCINATIONS,
  DEMO_MEDICATIONS_NEW, DEMO_VITAL_RECORDS, DEMO_DOCTORS,
  DEMO_INSURANCE_POLICIES, DEMO_TELEMEDICINE_SESSIONS
} from '@/data/demoHealthNew';
import {
  useHealthProfiles, useHealthRecords, useVaccinations,
  useMedications, useVitalRecords, useDoctors, useInsurance, useTelemedicine,
} from '@/hooks/useHealthAPI';
import type { HealthProfile } from '@/types/health';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

const MEMBER_PHOTO_MAP: Record<string, string> = {
  'Анастасия': 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
  'Алексей': 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
  'Матвей': 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
  'Даша': 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
  'Илья': 'https://cdn.poehali.dev/files/c58eac3b-e952-42aa-abe0-9b1141530809.png'
};

export default function useHealthNew() {
  const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
  const authToken = localStorage.getItem('authToken');
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const { toast } = useToast();

  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(() => {
    try {
      const cached = sessionStorage.getItem('selectedHealthProfile');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  const { profiles: apiProfiles, loading: profilesLoading, refetch: refetchProfiles } = useHealthProfiles();
  const { records: apiRecords, refetch: refetchRecords } = useHealthRecords(selectedProfile?.id);
  const { vaccinations: apiVaccinations, refetch: refetchVaccinations } = useVaccinations(selectedProfile?.id);
  const { medications: apiMedications, refetch: refetchMedications } = useMedications(selectedProfile?.id);
  const { vitals: apiVitals, refetch: refetchVitals } = useVitalRecords(selectedProfile?.id);
  const { doctors: apiDoctors, refetch: refetchDoctors } = useDoctors();
  const { insurance: apiInsurance, refetch: refetchInsurance } = useInsurance(selectedProfile?.id);
  const { sessions: apiSessions, refetch: refetchTelemedicine } = useTelemedicine(selectedProfile?.id);

  const profiles = useMemo(() => {
    const rawProfiles = isDemoMode && !authToken ? DEMO_HEALTH_PROFILES : apiProfiles;
    return rawProfiles.filter(p => p.userName && p.userName !== 'Член семьи' && p.userAge > 0);
  }, [isDemoMode, authToken, apiProfiles]);

  const records = useMemo(() =>
    isDemoMode && !authToken ? DEMO_HEALTH_RECORDS_NEW.filter(r => r.profileId === selectedProfile?.id) : apiRecords,
    [isDemoMode, authToken, selectedProfile?.id, apiRecords]
  );

  const vaccinations = useMemo(() =>
    isDemoMode && !authToken ? DEMO_VACCINATIONS.filter(v => v.profileId === selectedProfile?.id) : apiVaccinations,
    [isDemoMode, authToken, selectedProfile?.id, apiVaccinations]
  );

  const medications = useMemo(() =>
    isDemoMode && !authToken ? DEMO_MEDICATIONS_NEW.filter(m => m.profileId === selectedProfile?.id) : apiMedications,
    [isDemoMode, authToken, selectedProfile?.id, apiMedications]
  );

  const vitals = useMemo(() =>
    isDemoMode && !authToken ? DEMO_VITAL_RECORDS.filter(v => v.profileId === selectedProfile?.id) : apiVitals,
    [isDemoMode, authToken, selectedProfile?.id, apiVitals]
  );

  const doctors = useMemo(() =>
    isDemoMode && !authToken ? DEMO_DOCTORS : apiDoctors,
    [isDemoMode, authToken, apiDoctors]
  );

  const insurance = useMemo(() =>
    isDemoMode && !authToken ? DEMO_INSURANCE_POLICIES.filter(i => i.profileId === selectedProfile?.id) : apiInsurance,
    [isDemoMode, authToken, selectedProfile?.id, apiInsurance]
  );

  const sessions = useMemo(() =>
    isDemoMode && !authToken ? DEMO_TELEMEDICINE_SESSIONS.filter(s => s.profileId === selectedProfile?.id) : apiSessions,
    [isDemoMode, authToken, selectedProfile?.id, apiSessions]
  );

  useEffect(() => {
    if (profiles.length > 0 && selectedProfile === null) {
      setSelectedProfile(profiles[0]);
      sessionStorage.setItem('selectedHealthProfile', JSON.stringify(profiles[0]));
    }
  }, [profiles]);

  useEffect(() => {
    if (selectedProfile) {
      sessionStorage.setItem('selectedHealthProfile', JSON.stringify(selectedProfile));
    }
  }, [selectedProfile]);

  const getMemberPhoto = (profile: HealthProfile) => {
    if (profile.photoUrl) return profile.photoUrl;
    return MEMBER_PHOTO_MAP[profile.userName] || null;
  };

  const handleDeleteMedication = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-medications'], {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': selectedProfile!.id,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        toast({ title: 'Лекарство удалено', description: 'Лекарство успешно удалено из списка' });
        refetchMedications();
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить лекарство', variant: 'destructive' });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-records'], {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': selectedProfile!.id,
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        toast({ title: 'Запись удалена' });
        refetchRecords();
      } else {
        throw new Error('Ошибка при удалении');
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить запись', variant: 'destructive' });
    }
  };

  return {
    isDemoMode, profilesLoading,
    profiles, selectedProfile, setSelectedProfile,
    records, vaccinations, medications, vitals, doctors, insurance, sessions,
    apiProfiles,
    refetchProfiles, refetchRecords, refetchVaccinations,
    refetchMedications, refetchVitals, refetchDoctors,
    refetchInsurance, refetchTelemedicine,
    editingMedication, setEditingMedication,
    editingRecord, setEditingRecord,
    getMemberPhoto,
    handleDeleteMedication, handleDeleteRecord,
    toast,
  };
}
