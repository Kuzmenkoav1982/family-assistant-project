import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { 
  DEMO_HEALTH_PROFILES,
  DEMO_HEALTH_RECORDS_NEW,
  DEMO_VACCINATIONS,
  DEMO_MEDICATIONS_NEW,
  DEMO_VITAL_RECORDS,
  DEMO_DOCTORS,
  DEMO_INSURANCE_POLICIES,
  DEMO_TELEMEDICINE_SESSIONS
} from '@/data/demoHealthNew';
import {
  useHealthProfiles,
  useHealthRecords,
  useVaccinations,
  useMedications,
  useVitalRecords,
  useDoctors,
  useInsurance,
  useTelemedicine,
} from '@/hooks/useHealthAPI';
import type { HealthProfile } from '@/types/health';
import { AddHealthRecordDialog } from '@/components/health/AddHealthRecordDialog';
import { AddMedicationAdvancedDialog } from '@/components/health/AddMedicationAdvancedDialog';
import { AddInsuranceDialog } from '@/components/health/AddInsuranceDialog';
import { AddDoctorDialog } from '@/components/health/AddDoctorDialog';
import { AddVaccinationDialog } from '@/components/health/AddVaccinationDialog';
import { AddVitalRecordDialog } from '@/components/health/AddVitalRecordDialog';
import { AddTelemedicineDialog } from '@/components/health/AddTelemedicineDialog';
import { EditProfileDialog } from '@/components/health/EditProfileDialog';
import { EditDoctorDialog } from '@/components/health/EditDoctorDialog';
import { EditVaccinationDialog } from '@/components/health/EditVaccinationDialog';
import { EditInsuranceDialog } from '@/components/health/EditInsuranceDialog';
import { EditVitalRecordDialog } from '@/components/health/EditVitalRecordDialog';
import { EditMedicationDialog } from '@/components/health/EditMedicationDialog';
import { EditHealthRecordDialog } from '@/components/health/EditHealthRecordDialog';
import { MedicationCard } from '@/components/health/MedicationCard';
import { AIAnalysisCard } from '@/components/health/AIAnalysisCard';
import { HealthDashboard } from '@/components/health/HealthDashboard';
import { HealthInstructions } from '@/components/health/HealthInstructions';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

function HealthNew() {
  const navigate = useNavigate();
  const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
  const authToken = localStorage.getItem('authToken');
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const { toast } = useToast();
  
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(() => {
    try {
      const cached = sessionStorage.getItem('selectedHealthProfile');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  
  console.log('[HealthNew] Component mounted, isDemoMode:', isDemoMode, 'authToken:', !!authToken);
  
  const { profiles: apiProfiles, loading: profilesLoading } = useHealthProfiles();
  const { records: apiRecords, refetch: refetchRecords } = useHealthRecords(selectedProfile?.id);
  const { vaccinations: apiVaccinations, refetch: refetchVaccinations } = useVaccinations(selectedProfile?.id);
  const { medications: apiMedications, refetch: refetchMedications } = useMedications(selectedProfile?.id);
  const { vitals: apiVitals, refetch: refetchVitals } = useVitalRecords(selectedProfile?.id);
  const { doctors: apiDoctors, refetch: refetchDoctors } = useDoctors();
  const { insurance: apiInsurance, refetch: refetchInsurance } = useInsurance(selectedProfile?.id);
  const { sessions: apiSessions, refetch: refetchTelemedicine } = useTelemedicine(selectedProfile?.id);

  const profiles = useMemo(() => 
    isDemoMode && !authToken ? DEMO_HEALTH_PROFILES : apiProfiles,
    [isDemoMode, authToken, apiProfiles]
  );
  
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
    console.log('[HealthNew] useEffect triggered, profiles:', profiles.length, 'selectedProfile:', selectedProfile);
    if (profiles.length > 0 && selectedProfile === null) {
      console.log('[HealthNew] Setting selectedProfile to:', profiles[0]);
      setSelectedProfile(profiles[0]);
      sessionStorage.setItem('selectedHealthProfile', JSON.stringify(profiles[0]));
    }
  }, [profiles]);
  
  useEffect(() => {
    if (selectedProfile) {
      sessionStorage.setItem('selectedHealthProfile', JSON.stringify(selectedProfile));
    }
  }, [selectedProfile]);

  if (profilesLoading && !isDemoMode) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Heart" className="text-rose-500" />
              Здоровье семьи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Загружаем данные о здоровье...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getMemberPhoto = (profile: HealthProfile) => {
    if (profile.photoUrl) {
      return profile.photoUrl;
    }
    const photoMap: Record<string, string> = {
      'Анастасия': 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
      'Алексей': 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
      'Матвей': 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
      'Даша': 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
      'Илья': 'https://cdn.poehali.dev/files/c58eac3b-e952-42aa-abe0-9b1141530809.png'
    };
    return photoMap[profile.userName] || null;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-2 md:mb-4"
      >
        <Icon name="ArrowLeft" size={16} className="mr-2" />
        Назад
      </Button>
      
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Icon name="Heart" className="text-rose-500" size={28} />
          Здоровье семьи
        </h1>
      </div>

      <HealthInstructions />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {profiles.map((profile) => {
          const photo = getMemberPhoto(profile);
          return (
            <Card
              key={profile.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedProfile?.id === profile.id ? 'border-primary border-2' : ''
              }`}
              onClick={() => setSelectedProfile(profile)}
            >
              <CardContent className="pt-4 md:pt-6 text-center">
                {photo ? (
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                    <img 
                      src={photo} 
                      alt={profile.userName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="text-3xl md:text-4xl mb-2">
                    {profile.userAge < 13 ? '👦' : profile.userAge < 18 ? '👧' : profile.userName === 'Анастасия' ? '👩' : '👨'}
                  </div>
                )}
                <h3 className="font-semibold text-sm md:text-base">{profile.userName}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{profile.userAge} лет</p>
                <div className="mt-1 md:mt-2 flex justify-center gap-1">
                  {profile.privacy === 'private' && <Icon name="Lock" size={12} className="text-muted-foreground" />}
                  {profile.privacy === 'parents' && <Icon name="Users" size={12} className="text-muted-foreground" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProfile && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" />
                  Здоровье: {selectedProfile.userName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedProfile.privacy === 'private' && '🔒 Приватность: Только я'}
                  {selectedProfile.privacy === 'parents' && '👨‍👩‍👧 Приватность: Родители'}
                </p>
              </div>
              <AddHealthRecordDialog 
                profileId={selectedProfile.userId} 
                onSuccess={() => window.location.reload()}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <div className="relative w-full">
                <div className="w-full overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                  <TabsList className="inline-flex w-max min-w-full lg:grid lg:w-full lg:grid-cols-9">
                    <TabsTrigger value="dashboard" className="whitespace-nowrap">📊 Дашборд</TabsTrigger>
                    <TabsTrigger value="overview" className="whitespace-nowrap">Обзор</TabsTrigger>
                    <TabsTrigger value="history" className="whitespace-nowrap">История</TabsTrigger>
                    <TabsTrigger value="vaccinations" className="whitespace-nowrap">Прививки</TabsTrigger>
                    <TabsTrigger value="medications" className="whitespace-nowrap">Лекарства</TabsTrigger>
                    <TabsTrigger value="vitals" className="whitespace-nowrap">Показатели</TabsTrigger>
                    <TabsTrigger value="doctors" className="whitespace-nowrap">Врачи</TabsTrigger>
                    <TabsTrigger value="insurance" className="whitespace-nowrap">Страховки</TabsTrigger>
                    <TabsTrigger value="telemedicine" className="whitespace-nowrap">Телемедицина</TabsTrigger>
                  </TabsList>
                </div>
                <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white dark:from-gray-950 to-transparent lg:hidden"></div>
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white dark:from-gray-950 to-transparent lg:hidden"></div>
              </div>

              <TabsContent value="dashboard" className="space-y-4 pb-32">
                <HealthDashboard
                  profile={selectedProfile}
                  vitals={vitals}
                  medications={medications}
                  records={records}
                  vaccinations={vaccinations}
                  onRefresh={() => {
                    refetchVitals();
                    refetchMedications();
                    refetchRecords();
                    refetchVaccinations();
                  }}
                />
              </TabsContent>

              <TabsContent value="overview" className="space-y-4 pb-32">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Общая информация</CardTitle>
                        <EditProfileDialog 
                          profile={selectedProfile} 
                          onSuccess={() => window.location.reload()}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Группа крови:</span>
                        <span className="font-medium">
                          {selectedProfile.bloodType} {selectedProfile.rhFactor && `Rh${selectedProfile.rhFactor}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Аллергии:</span>
                        <span className="font-medium">
                          {selectedProfile.allergies.length > 0 ? selectedProfile.allergies.join(', ') : 'Нет'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Хронические:</span>
                        <span className="font-medium">
                          {selectedProfile.chronicDiseases.length > 0 ? selectedProfile.chronicDiseases.join(', ') : 'Нет'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Экстренные контакты</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedProfile.emergencyContacts.map((contact) => (
                        <div key={contact.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.relation}</p>
                          </div>
                          <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Последняя активность</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {records
                      .slice(0, 3)
                      .map((record: any) => (
                        <div key={record.id} className="py-3 border-b last:border-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{record.title}</h4>
                              <p className="text-sm text-muted-foreground">{record.description}</p>
                              {record.doctor && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  👨‍⚕️ {record.doctor}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(record.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Медицинская история</h3>
                  <AddHealthRecordDialog 
                    profileId={selectedProfile.id} 
                    onSuccess={refetchRecords}
                  />
                </div>
                {records
                  .map((record: any) => (
                    <Card key={record.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {record.type === 'visit' && <Icon name="Stethoscope" size={18} />}
                              {record.type === 'analysis' && <Icon name="FlaskConical" size={18} />}
                              {record.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(record.date).toLocaleDateString('ru-RU', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingRecord(record)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={async () => {
                                if (confirm(`Удалить запись "${record.title}"?`)) {
                                  try {
                                    const authToken = localStorage.getItem('authToken');
                                    const response = await fetch(func2url['health-records'], {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'X-User-Id': selectedProfile.id,
                                        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                                      },
                                      body: JSON.stringify({ id: record.id })
                                    });
                                    if (response.ok) {
                                      toast({
                                        title: 'Запись удалена',
                                        description: 'Медицинская запись успешно удалена'
                                      });
                                      refetchRecords();
                                    } else {
                                      throw new Error('Ошибка при удалении');
                                    }
                                  } catch (error) {
                                    toast({
                                      title: 'Ошибка',
                                      description: 'Не удалось удалить запись',
                                      variant: 'destructive'
                                    });
                                  }
                                }
                              }}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p>{record.description}</p>
                        {record.doctor && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Врач:</span> {record.doctor}
                          </p>
                        )}
                        {record.clinic && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Клиника:</span> {record.clinic}
                          </p>
                        )}
                        {record.diagnosis && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Диагноз:</span> {record.diagnosis}
                          </p>
                        )}
                        {record.recommendations && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Рекомендации:</span> {record.recommendations}
                          </p>
                        )}
                        {record.aiAnalysis && record.aiAnalysis.status === 'completed' && (
                          <div className="mt-3">
                            <AIAnalysisCard 
                              analysis={record.aiAnalysis}
                              sourceFile={record.attachments.find(att => att.fileType === 'image' || att.fileType === 'pdf')}
                            />
                          </div>
                        )}
                        {record.attachments.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {record.attachments.map((att) => (
                              <Button key={att.id} variant="outline" size="sm">
                                <Icon name="Paperclip" size={14} />
                                {att.fileName}
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                {editingRecord && (
                  <EditHealthRecordDialog
                    record={editingRecord}
                    profileId={selectedProfile.id}
                    open={!!editingRecord}
                    onOpenChange={(open) => !open && setEditingRecord(null)}
                    onSuccess={refetchRecords}
                  />
                )}
              </TabsContent>

              <TabsContent value="vaccinations" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">График прививок</h3>
                  <AddVaccinationDialog 
                    profileId={selectedProfile.id} 
                    onSuccess={refetchVaccinations}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {vaccinations
                    .map((vacc: any) => (
                      <Card key={vacc.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Icon name="Syringe" size={18} className="text-blue-600" />
                              {vacc.name}
                            </CardTitle>
                            <EditVaccinationDialog 
                              vaccination={vacc} 
                              onSuccess={refetchVaccinations}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Дата:</span>
                            <span>{new Date(vacc.date).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {vacc.nextDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Следующая:</span>
                              <span className="font-medium text-orange-600">
                                {new Date(vacc.nextDate).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Клиника:</span>
                            <span>{vacc.clinic}</span>
                          </div>
                          {vacc.doctor && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Врач:</span>
                              <span>{vacc.doctor}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="medications" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Лекарства и напоминания</h3>
                  <AddMedicationAdvancedDialog 
                    profileId={selectedProfile.id} 
                    onSuccess={refetchMedications}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {medications.map((med: any) => (
                    <MedicationCard 
                      key={med.id} 
                      medication={med}
                      onUpdate={refetchMedications}
                      onEdit={(medication) => setEditingMedication(medication)}
                      onDelete={async (id) => {
                        try {
                          const authToken = localStorage.getItem('authToken');
                          const response = await fetch(func2url['health-medications'], {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                              'X-User-Id': selectedProfile.id,
                              ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                            },
                            body: JSON.stringify({ id })
                          });
                          if (response.ok) {
                            toast({
                              title: 'Лекарство удалено',
                              description: 'Лекарство успешно удалено из списка'
                            });
                            refetchMedications();
                          } else {
                            throw new Error('Ошибка при удалении');
                          }
                        } catch (error) {
                          toast({
                            title: 'Ошибка',
                            description: 'Не удалось удалить лекарство',
                            variant: 'destructive'
                          });
                        }
                      }}
                    />
                  ))}
                </div>
                {editingMedication && (
                  <EditMedicationDialog
                    medication={editingMedication}
                    profileId={selectedProfile.id}
                    open={!!editingMedication}
                    onOpenChange={(open) => !open && setEditingMedication(null)}
                    onSuccess={refetchMedications}
                  />
                )}
              </TabsContent>

              <TabsContent value="vitals" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Дневник самочувствия</h3>
                  <AddVitalRecordDialog 
                    profileId={selectedProfile.id} 
                    onSuccess={refetchVitals}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Отслеживайте вес, рост, давление, пульс и другие показатели здоровья.
                  Графики помогут увидеть динамику изменений.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Вес</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vitals
                        .filter((v: any) => v.type === 'weight')
                        .slice(0, 3)
                        .map((vital: any) => (
                          <div key={vital.id} className="flex justify-between items-center text-sm py-1">
                            <div className="flex-1 flex justify-between">
                              <span className="text-muted-foreground">
                                {new Date(vital.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className="font-medium">{vital.value} {vital.unit}</span>
                            </div>
                            <EditVitalRecordDialog 
                              vital={vital} 
                              onSuccess={refetchVitals}
                            />
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Давление</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vitals
                        .filter((v: any) => v.type === 'pressure')
                        .slice(0, 3)
                        .map((vital: any) => (
                          <div key={vital.id} className="flex justify-between items-center text-sm py-1">
                            <div className="flex-1 flex justify-between">
                              <span className="text-muted-foreground">
                                {new Date(vital.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className="font-medium">{vital.value} {vital.unit}</span>
                            </div>
                            <EditVitalRecordDialog 
                              vital={vital} 
                              onSuccess={refetchVitals}
                            />
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Пульс</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vitals
                        .filter((v: any) => v.type === 'pulse')
                        .slice(0, 3)
                        .map((vital: any) => (
                          <div key={vital.id} className="flex justify-between items-center text-sm py-1">
                            <div className="flex-1 flex justify-between">
                              <span className="text-muted-foreground">
                                {new Date(vital.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </span>
                              <span className="font-medium">{vital.value} {vital.unit}</span>
                            </div>
                            <EditVitalRecordDialog 
                              vital={vital} 
                              onSuccess={refetchVitals}
                            />
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="doctors" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">База врачей</h3>
                  <AddDoctorDialog onSuccess={refetchDoctors} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map((doctor: any) => (
                    <Card key={doctor.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {doctor.isFavorite && <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />}
                              {doctor.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          </div>
                          <EditDoctorDialog 
                            doctor={doctor} 
                            onSuccess={refetchDoctors}
                          />
                          {doctor.rating && (
                            <div className="flex items-center gap-1 text-sm">
                              <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                              {doctor.rating}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">{doctor.clinic}</p>
                        <a href={`tel:${doctor.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                          <Icon name="Phone" size={14} />
                          {doctor.phone}
                        </a>
                        {doctor.email && (
                          <a href={`mailto:${doctor.email}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Icon name="Mail" size={14} />
                            {doctor.email}
                          </a>
                        )}
                        {doctor.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="MapPin" size={14} />
                            {doctor.address}
                          </p>
                        )}
                        {doctor.notes && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">{doctor.notes}</p>
                        )}
                        {doctor.lastVisit && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Последний визит: {new Date(doctor.lastVisit).toLocaleDateString('ru-RU')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insurance" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Страховые полисы</h3>
                  <AddInsuranceDialog 
                    profileId={selectedProfile.id} 
                    onSuccess={refetchInsurance}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {insurance
                    .map((policy: any) => (
                      <Card key={policy.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Icon name="Shield" size={18} className="text-blue-600" />
                                  {policy.type === 'oms' && 'ОМС'}
                                  {policy.type === 'dms' && 'ДМС'}
                                  {policy.type === 'travel' && 'Страхование путешествий'}
                                  {policy.type === 'life' && 'Страхование жизни'}
                                </CardTitle>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  policy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                  policy.status === 'expiring' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                                }`}>
                                  {policy.status === 'active' && 'Активен'}
                                  {policy.status === 'expiring' && 'Истекает'}
                                  {policy.status === 'expired' && 'Истек'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{policy.provider}</p>
                            </div>
                            <EditInsuranceDialog 
                              insurance={policy} 
                              onSuccess={refetchInsurance}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Номер полиса:</span>
                            <span className="font-mono">{policy.policyNumber}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Действует:</span>
                            <span>
                              {new Date(policy.startDate).toLocaleDateString('ru-RU')} - {new Date(policy.endDate).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                          {policy.premium && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Стоимость:</span>
                              <span className="font-medium">{policy.premium.toLocaleString('ru-RU')} ₽/год</span>
                            </div>
                          )}
                          {policy.coverage.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Покрытие:</p>
                              <ul className="text-xs space-y-1">
                                {policy.coverage.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <Icon name="Check" size={12} className="text-green-600 mt-0.5" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="telemedicine" className="space-y-4 pb-32">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Телемедицина</h3>
                  <AddTelemedicineDialog
                    profileId={selectedProfile.id}
                    onSuccess={refetchTelemedicine}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Онлайн-консультации с врачами через видеозвонок. Удобно, быстро, безопасно.
                </p>
                <div className="space-y-4">
                  {sessions
                    .map((session: any) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Icon name="Video" size={18} className="text-purple-600" />
                                {session.doctorName}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">{session.specialization}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              session.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                              session.status === 'in_progress' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                              session.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' :
                              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            }`}>
                              {session.status === 'scheduled' && 'Запланировано'}
                              {session.status === 'in_progress' && 'В процессе'}
                              {session.status === 'completed' && 'Завершено'}
                              {session.status === 'cancelled' && 'Отменено'}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Дата и время:</span>
                            <span className="font-medium">
                              {new Date(session.scheduledAt).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Длительность:</span>
                            <span>{session.duration} минут</span>
                          </div>
                          {session.notes && (
                            <p className="text-sm mt-2">{session.notes}</p>
                          )}
                          {session.prescription && (
                            <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded">
                              <p className="text-xs font-medium mb-1">Назначения:</p>
                              <p className="text-sm">{session.prescription}</p>
                            </div>
                          )}
                          {session.status === 'scheduled' && (
                            <Button className="w-full mt-3" variant="outline">
                              <Icon name="Video" size={16} />
                              Присоединиться к консультации
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HealthNew;