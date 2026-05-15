import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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

interface HealthTabsProps {
  selectedProfile: HealthProfile;
  records: any[];
  vaccinations: any[];
  medications: any[];
  vitals: any[];
  doctors: any[];
  insurance: any[];
  sessions: any[];
  apiProfiles: HealthProfile[];
  editingMedication: any;
  setEditingMedication: (v: any) => void;
  editingRecord: any;
  setEditingRecord: (v: any) => void;
  refetchProfiles: () => void;
  refetchRecords: () => void;
  refetchVaccinations: () => void;
  refetchMedications: () => void;
  refetchVitals: () => void;
  refetchDoctors: () => void;
  refetchInsurance: () => void;
  refetchTelemedicine: () => void;
  setSelectedProfile: (p: HealthProfile) => void;
  onDeleteMedication: (id: string) => void;
  onDeleteRecord: (id: string) => void;
  /** D.1: вкладка, выбранная через ?tab=... из портфолио. */
  initialTab?: string | null;
  /** D.1: действие, переданное через ?action=... — открыть конкретный диалог. */
  initialAction?: string | null;
}

const ACTION_TO_TAB: Record<string, string> = {
  'add-vaccination': 'vaccinations',
  'add-doctor-visit': 'history',
  'add-mood-entry': 'history',
  'add-vital': 'vitals',
  'add-record': 'history',
};

export default function HealthTabs({
  selectedProfile, records, vaccinations, medications, vitals, doctors, insurance, sessions,
  apiProfiles, editingMedication, setEditingMedication, editingRecord, setEditingRecord,
  refetchProfiles, refetchRecords, refetchVaccinations, refetchMedications,
  refetchVitals, refetchDoctors, refetchInsurance, refetchTelemedicine,
  setSelectedProfile, onDeleteMedication, onDeleteRecord,
  initialTab, initialAction,
}: HealthTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const inferredTab = initialTab || (initialAction ? ACTION_TO_TAB[initialAction] : null);
  const [tabValue, setTabValue] = useState<string>(inferredTab || 'overview');
  const [openVaccination, setOpenVaccination] = useState(false);
  const [openRecord, setOpenRecord] = useState(false);
  const [openVital, setOpenVital] = useState(false);
  const [recordDefaultType, setRecordDefaultType] = useState<string | undefined>(undefined);

  // D.1: переключаем вкладку при изменении initial-параметров из URL.
  useEffect(() => {
    if (inferredTab) setTabValue(inferredTab);
  }, [inferredTab]);

  // D.1: открываем нужный диалог по action и зачищаем URL.
  useEffect(() => {
    if (!initialAction) return;
    if (initialAction === 'add-vaccination') setOpenVaccination(true);
    else if (initialAction === 'add-vital') setOpenVital(true);
    else if (initialAction === 'add-doctor-visit') {
      setRecordDefaultType('visit');
      setOpenRecord(true);
    } else if (initialAction === 'add-mood-entry') {
      // Отдельной формы дневника настроения пока нет — открываем общую запись здоровья.
      setRecordDefaultType('visit');
      setOpenRecord(true);
    } else if (initialAction === 'add-record') {
      setOpenRecord(true);
    }
    // Снимаем action из URL чтобы повторно не срабатывало при F5 / возврате.
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    next.delete('tab');
    next.delete('from');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-start gap-2 text-base sm:text-lg">
              <Icon name="User" className="flex-shrink-0 mt-0.5" />
              <span className="break-words leading-tight">Здоровье: {selectedProfile.userName}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {selectedProfile.privacy === 'private' && '\u{1F512} Приватность: Только я'}
              {selectedProfile.privacy === 'parents' && '\u{1F468}\u200D\u{1F469}\u200D\u{1F467} Приватность: Родители'}
            </p>
          </div>
          <div>
            <AddHealthRecordDialog profileId={selectedProfile.id} onSuccess={() => refetchRecords()} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1.5 bg-transparent p-0 justify-start mb-4">
            <TabsTrigger value="dashboard" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">{'\u{1F4CA}'} Дашборд</TabsTrigger>
            <TabsTrigger value="overview" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Обзор</TabsTrigger>
            <TabsTrigger value="history" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">История</TabsTrigger>
            <TabsTrigger value="vaccinations" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Прививки</TabsTrigger>
            <TabsTrigger value="medications" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Лекарства</TabsTrigger>
            <TabsTrigger value="vitals" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Показатели</TabsTrigger>
            <TabsTrigger value="doctors" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Врачи</TabsTrigger>
            <TabsTrigger value="insurance" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Страховки</TabsTrigger>
            <TabsTrigger value="telemedicine" className="whitespace-nowrap data-[state=active]:bg-violet-600 data-[state=active]:text-white bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs font-semibold border-2 border-transparent">Телемедицина</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 pb-32">
            <HealthDashboard
              profile={selectedProfile} vitals={vitals} medications={medications}
              records={records} vaccinations={vaccinations}
              onRefresh={() => { refetchVitals(); refetchMedications(); refetchRecords(); refetchVaccinations(); }}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4 pb-32">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Общая информация</CardTitle>
                    <EditProfileDialog profile={selectedProfile} onSuccess={() => {
                      refetchProfiles();
                      setTimeout(() => {
                        const updated = apiProfiles.find(p => p.id === selectedProfile.id);
                        if (updated) setSelectedProfile(updated);
                      }, 500);
                    }} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Группа крови:</span><span className="font-medium">{selectedProfile.bloodType} {selectedProfile.rhFactor && `Rh${selectedProfile.rhFactor}`}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Аллергии:</span><span className="font-medium">{selectedProfile.allergies.length > 0 ? selectedProfile.allergies.join(', ') : 'Нет'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Хронические:</span><span className="font-medium">{selectedProfile.chronicDiseases.length > 0 ? selectedProfile.chronicDiseases.join(', ') : 'Нет'}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Экстренные контакты</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {selectedProfile.emergencyContacts.map((contact) => (
                    <div key={contact.id} className="flex justify-between items-center">
                      <div><p className="font-medium">{contact.name}</p><p className="text-sm text-muted-foreground">{contact.relation}</p></div>
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-lg">Последняя активность</CardTitle></CardHeader>
              <CardContent>
                {records.slice(0, 3).map((record: any) => (
                  <div key={record.id} className="py-3 border-b last:border-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{record.title || record.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">{record.doctorName}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{new Date(record.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <AIAnalysisCard profile={selectedProfile} records={records} medications={medications} vitals={vitals} vaccinations={vaccinations} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 pb-32">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Медицинские записи</h3>
              <AddHealthRecordDialog
                profileId={selectedProfile.id}
                onSuccess={refetchRecords}
                open={openRecord || undefined}
                onOpenChange={(v) => { setOpenRecord(v); if (!v) setRecordDefaultType(undefined); }}
                defaultType={recordDefaultType}
              />
            </div>
            <div className="space-y-4">
              {records.map((record: any) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{record.title || record.diagnosis}</CardTitle>
                        <p className="text-sm text-muted-foreground">{record.doctorName} {record.clinic && `\u2022 ${record.clinic}`}</p>
                      </div>
                      <div className="flex gap-1">
                        <EditHealthRecordDialog record={record} onSuccess={refetchRecords} />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => onDeleteRecord(record.id)}>
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Дата:</span><span>{new Date(record.date).toLocaleDateString('ru-RU')}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Тип:</span><span>{record.recordType}</span></div>
                    {record.diagnosis && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Диагноз:</span><span>{record.diagnosis}</span></div>}
                    {record.prescription && <div className="mt-2 p-2 bg-muted rounded text-sm"><strong>Назначения:</strong> {record.prescription}</div>}
                    {record.notes && <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vaccinations" className="space-y-4 pb-32">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">График прививок</h3>
              <AddVaccinationDialog
                profileId={selectedProfile.id}
                onSuccess={refetchVaccinations}
                open={openVaccination || undefined}
                onOpenChange={setOpenVaccination}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {vaccinations.map((vacc: any) => (
                <Card key={vacc.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2"><Icon name="Syringe" size={18} className="text-blue-600" />{vacc.name}</CardTitle>
                      <EditVaccinationDialog vaccination={vacc} onSuccess={refetchVaccinations} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Дата:</span><span>{new Date(vacc.date).toLocaleDateString('ru-RU')}</span></div>
                    {vacc.nextDate && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Следующая:</span><span className="font-medium text-orange-600">{new Date(vacc.nextDate).toLocaleDateString('ru-RU')}</span></div>}
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Клиника:</span><span>{vacc.clinic}</span></div>
                    {vacc.doctor && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Врач:</span><span>{vacc.doctor}</span></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4 pb-32">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Лекарства и напоминания</h3>
              <AddMedicationAdvancedDialog profileId={selectedProfile.id} onSuccess={refetchMedications} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {medications.map((med: any) => (
                <MedicationCard key={med.id} medication={med} onUpdate={refetchMedications}
                  onEdit={(medication) => setEditingMedication(medication)}
                  onDelete={(id) => onDeleteMedication(id)} />
              ))}
            </div>
            {editingMedication && (
              <EditMedicationDialog medication={editingMedication} profileId={selectedProfile.id}
                open={!!editingMedication} onOpenChange={(open) => !open && setEditingMedication(null)}
                onSuccess={refetchMedications} />
            )}
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4 pb-32">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Дневник самочувствия</h3>
              <AddVitalRecordDialog
                profileId={selectedProfile.id}
                onSuccess={refetchVitals}
                open={openVital || undefined}
                onOpenChange={setOpenVital}
              />
            </div>
            <p className="text-sm text-muted-foreground">Отслеживайте вес, рост, давление, пульс и другие показатели здоровья. Графики помогут увидеть динамику изменений.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {['weight', 'pressure', 'pulse'].map(type => (
                <Card key={type}>
                  <CardHeader><CardTitle className="text-base">{type === 'weight' ? 'Вес' : type === 'pressure' ? 'Давление' : 'Пульс'}</CardTitle></CardHeader>
                  <CardContent>
                    {vitals.filter((v: any) => v.type === type).slice(0, 3).map((vital: any) => (
                      <div key={vital.id} className="flex justify-between items-center text-sm py-1">
                        <div className="flex-1 flex justify-between">
                          <span className="text-muted-foreground">{new Date(vital.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                          <span className="font-medium">{vital.value} {vital.unit}</span>
                        </div>
                        <EditVitalRecordDialog vital={vital} onSuccess={refetchVitals} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
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
                      <EditDoctorDialog doctor={doctor} onSuccess={refetchDoctors} />
                      {doctor.rating && <div className="flex items-center gap-1 text-sm"><Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />{doctor.rating}</div>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm">{doctor.clinic}</p>
                    <a href={`tel:${doctor.phone}`} className="text-sm text-primary hover:underline flex items-center gap-1"><Icon name="Phone" size={14} />{doctor.phone}</a>
                    {doctor.email && <a href={`mailto:${doctor.email}`} className="text-sm text-primary hover:underline flex items-center gap-1"><Icon name="Mail" size={14} />{doctor.email}</a>}
                    {doctor.address && <p className="text-sm text-muted-foreground flex items-center gap-1"><Icon name="MapPin" size={14} />{doctor.address}</p>}
                    {doctor.notes && <p className="text-sm mt-2 p-2 bg-muted rounded">{doctor.notes}</p>}
                    {doctor.lastVisit && <p className="text-xs text-muted-foreground mt-2">Последний визит: {new Date(doctor.lastVisit).toLocaleDateString('ru-RU')}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="space-y-4 pb-32">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Страховые полисы</h3>
              <AddInsuranceDialog profileId={selectedProfile.id} onSuccess={refetchInsurance} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {insurance.map((policy: any) => (
                <Card key={policy.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Icon name="Shield" size={18} className="text-blue-600" />
                            {policy.type === 'oms' && 'ОМС'}{policy.type === 'dms' && 'ДМС'}{policy.type === 'travel' && 'Страхование путешествий'}{policy.type === 'life' && 'Страхование жизни'}
                          </CardTitle>
                          <span className={`text-xs px-2 py-1 rounded ${
                            policy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                            policy.status === 'expiring' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}>
                            {policy.status === 'active' && 'Активен'}{policy.status === 'expiring' && 'Истекает'}{policy.status === 'expired' && 'Истек'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{policy.provider}</p>
                      </div>
                      <EditInsuranceDialog insurance={policy} onSuccess={refetchInsurance} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Номер полиса:</span><span className="font-mono">{policy.policyNumber}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Действует:</span><span>{new Date(policy.startDate).toLocaleDateString('ru-RU')} - {new Date(policy.endDate).toLocaleDateString('ru-RU')}</span></div>
                    {policy.premium && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Стоимость:</span><span className="font-medium">{policy.premium.toLocaleString('ru-RU')} \u20BD/год</span></div>}
                    {policy.coverage.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Покрытие:</p>
                        <ul className="text-xs space-y-1">
                          {policy.coverage.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-1"><Icon name="Check" size={12} className="text-green-600 mt-0.5" />{item}</li>
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
              <AddTelemedicineDialog profileId={selectedProfile.id} onSuccess={refetchTelemedicine} />
            </div>
            <p className="text-sm text-muted-foreground">Онлайн-консультации с врачами через видеозвонок. Удобно, быстро, безопасно.</p>
            <div className="space-y-4">
              {sessions.map((session: any) => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2"><Icon name="Video" size={18} className="text-purple-600" />{session.doctorName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{session.specialization}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                        session.status === 'in_progress' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                        session.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {session.status === 'scheduled' && 'Запланировано'}{session.status === 'in_progress' && 'В процессе'}{session.status === 'completed' && 'Завершено'}{session.status === 'cancelled' && 'Отменено'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Дата и время:</span><span className="font-medium">{new Date(session.scheduledAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Длительность:</span><span>{session.duration} минут</span></div>
                    {session.notes && <p className="text-sm mt-2">{session.notes}</p>}
                    {session.prescription && <div className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded"><p className="text-xs font-medium mb-1">Назначения:</p><p className="text-sm">{session.prescription}</p></div>}
                    {session.status === 'scheduled' && <Button className="w-full mt-3" variant="outline"><Icon name="Video" size={16} />Присоединиться к консультации</Button>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}