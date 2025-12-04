import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
import { useUploadMedicalFile, type MedicalDocument } from '@/hooks/useUploadMedicalFile';
import { useMedicationNotifications } from '@/hooks/useMedicationNotifications';
import { usePermissions } from '@/hooks/usePermissions';
import type { FamilyMember } from '@/types/family.types';

interface HealthSectionProps {
  child: FamilyMember;
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDate?: string;
  completed: boolean;
}

interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string;
  howToTake: string;
  doses: { date: string; time: string; taken: boolean }[];
}

interface DoctorVisit {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  nextVisit?: string;
  notes: string;
  attachments?: MedicalDocument[];
}

export function HealthSection({ child }: HealthSectionProps) {
  const { data, loading, addItem, updateItem, deleteItem, fetchChildData } = useChildrenData(child.id);
  const { uploadFile, uploading, progress } = useUploadMedicalFile();
  const { canDo, role } = usePermissions();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  
  const medications = data?.health?.medications || [];
  const { permission, settings, requestPermission, updateSettings } = useMedicationNotifications(medications);
  const [notificationSettingsDialog, setNotificationSettingsDialog] = useState(false);
  
  const canAddDoctor = canDo('health', 'doctor.add');
  const canAddMedicine = canDo('health', 'medicine.add');
  const canMarkMedicine = canDo('health', 'medicine.mark');
  const canDelete = canDo('health', 'delete');
  
  const [newVaccinationDialog, setNewVaccinationDialog] = useState(false);
  const [newVaccinationData, setNewVaccinationData] = useState({ vaccine: '', date: '', notes: '' });
  
  const [newDoctorVisitDialog, setNewDoctorVisitDialog] = useState(false);
  const [newDoctorVisitData, setNewDoctorVisitData] = useState({ doctor: '', specialty: '', date: '', status: 'planned', notes: '' });

  const [newMedicationDialog, setNewMedicationDialog] = useState(false);
  const [editMedicationDialog, setEditMedicationDialog] = useState(false);
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [newMedicationData, setNewMedicationData] = useState({ 
    name: '', 
    startDate: '', 
    endDate: '', 
    frequency: '', 
    dosage: '',
    instructions: '',
    times: ['09:00'] as string[]
  });
  const [viewDocumentsDialog, setViewDocumentsDialog] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<MedicalDocument[]>([]);
  
  if (loading || !data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Загрузка данных...</p>
      </div>
    );
  }
  
  const vaccinations = data?.health?.vaccinations || [];
  const doctorVisits = data?.health?.doctorVisits || [];
  
  const healthDocuments: MedicalDocument[] = Array.isArray(data?.health?.documents) 
    ? data.health.documents.map((doc: any) => ({
        id: doc.id,
        childId: doc.child_id,
        documentType: doc.document_type,
        fileUrl: doc.file_url,
        fileType: doc.file_type,
        originalFilename: doc.original_filename,
        relatedId: doc.related_id,
        relatedType: doc.related_type,
        title: doc.title,
        description: doc.description,
        uploadedAt: doc.uploaded_at || doc.created_at
      }))
    : [];

  const handleFileUpload = async (file: File, documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination' | 'other', relatedId?: string) => {
    setUploadingFor(documentType);
    const result = await uploadFile({
      file,
      documentType,
      childId: child.id,
      relatedId,
      relatedType: documentType,
    });

    if (result.success && result.document) {
      console.log('Файл успешно загружен:', result.document);
      fetchChildData();
    } else {
      console.error('Ошибка загрузки:', result.error);
      alert(result.error || 'Ошибка загрузки файла');
    }
    setUploadingFor(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination' | 'other', relatedId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType, relatedId);
    }
  };

  const handleAddVaccination = async () => {
    if (!newVaccinationData.vaccine || !newVaccinationData.date) {
      alert('Заполните обязательные поля');
      return;
    }

    const result = await addItem('vaccination', {
      vaccine: newVaccinationData.vaccine,
      date: newVaccinationData.date,
      notes: newVaccinationData.notes,
      family_id: localStorage.getItem('familyId') || '',
    });

    if (result.success) {
      setNewVaccinationDialog(false);
      setNewVaccinationData({ vaccine: '', date: '', notes: '' });
    } else {
      alert(result.error || 'Ошибка добавления');
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    if (!confirm('Удалить эту прививку?')) return;
    
    const result = await deleteItem('vaccination', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleAddDoctorVisit = async () => {
    if (!newDoctorVisitData.doctor || !newDoctorVisitData.date) {
      alert('Заполните обязательные поля');
      return;
    }

    const result = await addItem('doctor_visit', {
      doctor: newDoctorVisitData.doctor,
      specialty: newDoctorVisitData.specialty,
      date: newDoctorVisitData.date,
      status: newDoctorVisitData.status,
      notes: newDoctorVisitData.notes,
      family_id: localStorage.getItem('familyId') || '',
    });

    if (result.success) {
      setNewDoctorVisitDialog(false);
      setNewDoctorVisitData({ doctor: '', specialty: '', date: '', status: 'planned', notes: '' });
    } else {
      alert(result.error || 'Ошибка добавления');
    }
  };

  const handleAddMedication = async () => {
    if (!newMedicationData.name || !newMedicationData.startDate || !newMedicationData.endDate) {
      alert('Заполните обязательные поля: название, дата начала и окончания');
      return;
    }
    
    if (newMedicationData.times.length === 0) {
      alert('Добавьте хотя бы одно время приема');
      return;
    }

    const result = await addItem('medication', {
      name: newMedicationData.name,
      start_date: newMedicationData.startDate,
      end_date: newMedicationData.endDate,
      frequency: newMedicationData.frequency,
      dosage: newMedicationData.dosage,
      instructions: newMedicationData.instructions,
      times: newMedicationData.times,
      family_id: localStorage.getItem('familyId') || '',
    });

    if (result.success) {
      setNewMedicationDialog(false);
      setNewMedicationData({ 
        name: '', 
        startDate: '', 
        endDate: '', 
        frequency: '', 
        dosage: '',
        instructions: '',
        times: ['09:00']
      });
    } else {
      alert(result.error || 'Ошибка добавления');
    }
  };

  const handleEditMedication = (med: any) => {
    setEditingMedicationId(med.id);
    setNewMedicationData({
      name: med.name,
      startDate: med.start_date,
      endDate: med.end_date,
      frequency: med.frequency || '',
      dosage: med.dosage || '',
      instructions: med.instructions || '',
      times: (med.schedule || []).map((s: any) => s.time_of_day.slice(0, 5))
    });
    setEditMedicationDialog(true);
  };

  const handleUpdateMedication = async () => {
    if (!newMedicationData.name || !newMedicationData.startDate || !newMedicationData.endDate) {
      alert('Заполните обязательные поля: название, дата начала и окончания');
      return;
    }
    
    if (newMedicationData.times.length === 0) {
      alert('Добавьте хотя бы одно время приема');
      return;
    }

    const result = await updateItem('medication', editingMedicationId!, {
      name: newMedicationData.name,
      start_date: newMedicationData.startDate,
      end_date: newMedicationData.endDate,
      frequency: newMedicationData.frequency,
      dosage: newMedicationData.dosage,
      instructions: newMedicationData.instructions,
      times: newMedicationData.times,
    });

    if (result.success) {
      setEditMedicationDialog(false);
      setEditingMedicationId(null);
      setNewMedicationData({ 
        name: '', 
        startDate: '', 
        endDate: '', 
        frequency: '', 
        dosage: '',
        instructions: '',
        times: ['09:00']
      });
    } else {
      alert(result.error || 'Ошибка обновления');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Удалить это лекарство? Это также удалит все отметки о приёме.')) return;
    
    const result = await deleteItem('medication', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleDeleteDoctorVisit = async (id: string) => {
    if (!confirm('Удалить этот визит?')) return;
    
    const result = await deleteItem('doctor_visit', id);
    if (!result.success) {
      alert(result.error || 'Ошибка удаления');
    }
  };

  const handleMarkIntake = async (intakeId: string, taken: boolean) => {
    const CHILDREN_DATA_API = 'https://functions.poehali.dev/d6f787e2-2e12-4c83-959c-8220442c6203';
    
    try {
      const token = localStorage.getItem('authToken') || '';
      const response = await fetch(CHILDREN_DATA_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          action: 'mark_intake',
          child_id: child.id,
          type: 'medication',
          data: {
            intake_id: intakeId,
            taken: taken,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        await fetchChildData();
      } else {
        alert(result.error || 'Ошибка обновления');
      }
    } catch (error) {
      console.error('Error marking intake:', error);
      alert('Ошибка обновления: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Syringe" size={20} />
              Прививки
            </CardTitle>
            {canAddDoctor && (
              <Dialog open={newVaccinationDialog} onOpenChange={setNewVaccinationDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить прививку
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить прививку</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название *</label>
                    <Input 
                      placeholder="Например: Грипп" 
                      value={newVaccinationData.vaccine}
                      onChange={(e) => setNewVaccinationData(prev => ({ ...prev, vaccine: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата *</label>
                    <Input 
                      type="date" 
                      value={newVaccinationData.date}
                      onChange={(e) => setNewVaccinationData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Примечания</label>
                    <Textarea
                      placeholder="Дополнительная информация"
                      value={newVaccinationData.notes}
                      onChange={(e) => setNewVaccinationData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddVaccination}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : vaccinations.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Прививок пока нет</p>
              <p className="text-sm">Добавьте первую прививку, чтобы начать вести историю</p>
            </div>
          ) : (
            vaccinations.map((vac: any) => (
              <div key={vac.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💉</div>
                  <div>
                    <p className="font-medium">{vac.vaccine}</p>
                    <p className="text-sm text-gray-500">Дата: {vac.date}</p>
                    {vac.notes && (
                      <p className="text-sm text-gray-600 mt-1">{vac.notes}</p>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteVaccination(vac.id)}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Pill" size={20} />
              Лекарства
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="gap-2"
                onClick={() => setNotificationSettingsDialog(true)}
              >
                <Icon name="Bell" size={16} />
                Уведомления
                {settings.enabled && <Badge variant="outline" className="ml-1 bg-green-50 text-green-700">ВКЛ</Badge>}
              </Button>
              <Dialog open={newMedicationDialog} onOpenChange={setNewMedicationDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить лекарство
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Добавить лекарство</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название препарата</label>
                    <Input 
                      placeholder="Например: Амоксициллин" 
                      value={newMedicationData.name}
                      onChange={(e) => setNewMedicationData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Начало приема</label>
                      <Input 
                        type="date" 
                        value={newMedicationData.startDate}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Конец приема</label>
                      <Input 
                        type="date" 
                        value={newMedicationData.endDate}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Дозировка</label>
                      <Input 
                        placeholder="Например: 500 мг" 
                        value={newMedicationData.dosage}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, dosage: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Частота</label>
                      <Input 
                        placeholder="Например: 3 раза в день" 
                        value={newMedicationData.frequency}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Время приема *</label>
                    <div className="space-y-2">
                      {newMedicationData.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <Input 
                            type="time" 
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...newMedicationData.times];
                              newTimes[index] = e.target.value;
                              setNewMedicationData(prev => ({ ...prev, times: newTimes }));
                            }}
                            className="flex-1"
                          />
                          {newMedicationData.times.length > 1 && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newTimes = newMedicationData.times.filter((_, i) => i !== index);
                                setNewMedicationData(prev => ({ ...prev, times: newTimes }));
                              }}
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setNewMedicationData(prev => ({ 
                            ...prev, 
                            times: [...prev.times, '09:00'] 
                          }));
                        }}
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить время
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Инструкция по приему</label>
                    <Textarea 
                      placeholder="Например: После еды, запивать водой" 
                      value={newMedicationData.instructions}
                      onChange={(e) => setNewMedicationData(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddMedication}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={editMedicationDialog} onOpenChange={setEditMedicationDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Редактировать лекарство</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название препарата</label>
                    <Input 
                      placeholder="Например: Амоксициллин" 
                      value={newMedicationData.name}
                      onChange={(e) => setNewMedicationData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Начало приема</label>
                      <Input 
                        type="date" 
                        value={newMedicationData.startDate}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Конец приема</label>
                      <Input 
                        type="date" 
                        value={newMedicationData.endDate}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Дозировка</label>
                      <Input 
                        placeholder="Например: 500 мг" 
                        value={newMedicationData.dosage}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, dosage: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Частота</label>
                      <Input 
                        placeholder="Например: 3 раза в день" 
                        value={newMedicationData.frequency}
                        onChange={(e) => setNewMedicationData(prev => ({ ...prev, frequency: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Время приема *</label>
                    <div className="space-y-2">
                      {newMedicationData.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <Input 
                            type="time" 
                            value={time}
                            onChange={(e) => {
                              const newTimes = [...newMedicationData.times];
                              newTimes[index] = e.target.value;
                              setNewMedicationData(prev => ({ ...prev, times: newTimes }));
                            }}
                            className="flex-1"
                          />
                          {newMedicationData.times.length > 1 && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                const newTimes = newMedicationData.times.filter((_, i) => i !== index);
                                setNewMedicationData(prev => ({ ...prev, times: newTimes }));
                              }}
                            >
                              <Icon name="X" size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button 
                        type="button"
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setNewMedicationData(prev => ({ 
                            ...prev, 
                            times: [...prev.times, '09:00'] 
                          }));
                        }}
                      >
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить время
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Инструкция по приему</label>
                    <Textarea 
                      placeholder="Например: После еды, запивать водой" 
                      value={newMedicationData.instructions}
                      onChange={(e) => setNewMedicationData(prev => ({ ...prev, instructions: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleUpdateMedication}>Сохранить изменения</Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Лекарств пока нет</p>
              <p className="text-sm">Добавьте первое лекарство</p>
            </div>
          ) : (
            medications.map((med: any) => {
              const todayIntakes = (med.intakes || []).filter((intake: any) => {
                const intakeDate = new Date(intake.scheduled_date).toDateString();
                const today = new Date().toDateString();
                return intakeDate === today;
              });
              
              const upcomingIntakes = todayIntakes.filter((intake: any) => !intake.taken);
              const completedToday = todayIntakes.filter((intake: any) => intake.taken).length;
              
              return (
                <Card key={med.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{med.name}</CardTitle>
                          {med.dosage && <Badge variant="outline">{med.dosage}</Badge>}
                          {med.frequency && <Badge>{med.frequency}</Badge>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {new Date(med.start_date).toLocaleDateString('ru-RU')} - {new Date(med.end_date).toLocaleDateString('ru-RU')}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 mt-2">💊 {med.instructions}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditMedication(med)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMedication(med.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                        <div className="text-sm font-medium text-gray-600 ml-2">
                          Сегодня: {completedToday}/{todayIntakes.length}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium mb-3">⏰ Расписание приема:</p>
                      {(med.schedule && med.schedule.length > 0) ? (
                        (med.schedule || []).map((scheduleItem: any) => {
                          const todayIntake = todayIntakes.find((intake: any) => 
                            intake.schedule_id === scheduleItem.id
                          );
                          
                          return (
                            <div key={scheduleItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-blue-200">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={todayIntake?.taken || false}
                                  onChange={(e) => {
                                    if (todayIntake) {
                                      handleMarkIntake(todayIntake.id, e.target.checked);
                                    }
                                  }}
                                  className="w-5 h-5 cursor-pointer"
                                />
                                <div>
                                  <span className="text-sm font-medium">
                                    {scheduleItem.time_of_day.slice(0, 5)}
                                  </span>
                                  {todayIntake?.taken_at && (
                                    <p className="text-xs text-gray-500">
                                      Принято: {new Date(todayIntake.taken_at).toLocaleTimeString('ru-RU', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {todayIntake?.taken ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Icon name="Check" size={14} className="mr-1" />
                                  Принято
                                </Badge>
                              ) : (
                                <Button 
                                  size="sm" 
                                  className="gap-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => todayIntake && handleMarkIntake(todayIntake.id, true)}
                                  disabled={!todayIntake}
                                >
                                  <Icon name="Check" size={14} />
                                  Отметить прием
                                </Button>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-center mb-3">
                            <p className="text-sm text-yellow-800 font-medium mb-1">
                              📋 Расписание не создано
                            </p>
                            <p className="text-xs text-yellow-700">
                              Создайте расписание приема чтобы отмечать прием лекарства
                            </p>
                          </div>
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                            onClick={async () => {
                              const CHILDREN_DATA_API = 'https://functions.poehali.dev/d6f787e2-2e12-4c83-959c-8220442c6203';
                              try {
                                const token = localStorage.getItem('authToken') || '';
                                const response = await fetch(CHILDREN_DATA_API, {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'X-Auth-Token': token,
                                  },
                                  body: JSON.stringify({
                                    action: 'rebuild_medication_schedule',
                                    child_id: child.id,
                                    type: 'medication',
                                    data: {}
                                  })
                                });
                                const result = await response.json();
                                if (result.success) {
                                  await fetchChildData();
                                  alert('✅ Расписание создано! Теперь можно отмечать прием.');
                                } else {
                                  alert('Ошибка: ' + (result.error || 'Не удалось создать расписание'));
                                }
                              } catch (error) {
                                console.error('Rebuild error:', error);
                                alert('Ошибка создания расписания: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
                              }
                            }}
                          >
                            <Icon name="CalendarPlus" size={16} />
                            Создать расписание приема
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Stethoscope" size={20} />
              План посещения врачей
            </CardTitle>
            <Dialog open={newDoctorVisitDialog} onOpenChange={setNewDoctorVisitDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Icon name="Plus" size={16} />
                  Добавить посещение
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Добавить посещение врача</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">ФИО врача *</label>
                    <Input 
                      placeholder="Например: Иванова А.П." 
                      value={newDoctorVisitData.doctor}
                      onChange={(e) => setNewDoctorVisitData(prev => ({ ...prev, doctor: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Специальность</label>
                    <Input 
                      placeholder="Например: Педиатр" 
                      value={newDoctorVisitData.specialty}
                      onChange={(e) => setNewDoctorVisitData(prev => ({ ...prev, specialty: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата посещения *</label>
                    <Input 
                      type="date" 
                      value={newDoctorVisitData.date}
                      onChange={(e) => setNewDoctorVisitData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заметки</label>
                    <Textarea 
                      placeholder="Рекомендации, результаты осмотра..." 
                      value={newDoctorVisitData.notes}
                      onChange={(e) => setNewDoctorVisitData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddDoctorVisit}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Загрузка...</div>
          ) : doctorVisits.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>Визитов к врачу пока нет</p>
              <p className="text-sm">Добавьте первую запись</p>
            </div>
          ) : (
            doctorVisits.map((visit: any) => (
              <div key={visit.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{visit.doctor}</p>
                    <p className="text-sm text-gray-600">{visit.specialty}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteDoctorVisit(visit.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={14} className="text-gray-400" />
                    <span>Дата: {visit.date}</span>
                  </div>
                  {visit.notes && (
                    <p className="text-gray-600 mt-2">{visit.notes}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Прикрепленные файлы ({healthDocuments.length})
            </CardTitle>
            <label className="cursor-pointer">
              <Button variant="outline" className="gap-2" disabled={uploading} type="button" asChild>
                <span>
                  <Icon name="Upload" size={16} />
                  {uploading ? `Загрузка ${progress}%` : 'Загрузить файл'}
                </span>
              </Button>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => handleFileInputChange(e, 'other')}
                disabled={uploading}
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {healthDocuments.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">📸</div>
              <p className="font-medium text-gray-700">Пока нет загруженных файлов</p>
              <p className="text-sm text-gray-500">
                Загрузите рецепты, анализы, заключения врачей
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {healthDocuments.map((doc) => (
                <div key={doc.id} className="relative group">
                  <button
                    onClick={() => {
                      setSelectedDocuments([doc]);
                      setViewDocumentsDialog(true);
                    }}
                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    {doc.fileType.startsWith('image/') ? (
                      <img src={doc.fileUrl} alt={doc.originalFilename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                        <Icon name="FileText" size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 px-2 text-center">{doc.originalFilename}</span>
                      </div>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{doc.originalFilename}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDocumentsDialog} onOpenChange={setViewDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Просмотр документа</DialogTitle>
          </DialogHeader>
          {selectedDocuments.length > 0 && (
            <div className="space-y-4">
              {selectedDocuments[0].fileType.startsWith('image/') ? (
                <img
                  src={selectedDocuments[0].fileUrl}
                  alt={selectedDocuments[0].originalFilename}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Icon name="FileText" size={64} className="text-gray-400" />
                  <p className="text-lg font-medium">{selectedDocuments[0].originalFilename}</p>
                  <Button asChild>
                    <a href={selectedDocuments[0].fileUrl} download={selectedDocuments[0].originalFilename}>
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать файл
                    </a>
                  </Button>
                </div>
              )}
              <div className="text-sm text-gray-500">
                <p>Тип: {selectedDocuments[0].documentType}</p>
                <p>Загружено: {new Date(selectedDocuments[0].uploadedAt).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={notificationSettingsDialog} onOpenChange={setNotificationSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Bell" size={20} />
              Настройка уведомлений о приёме лекарств
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {permission === 'denied' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Уведомления заблокированы в настройках браузера. Пожалуйста, разрешите уведомления для этого сайта.
                </p>
              </div>
            )}
            
            {permission === 'default' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  💡 Для получения напоминаний о приёме лекарств нужно разрешить уведомления
                </p>
                <Button 
                  onClick={requestPermission}
                  className="w-full gap-2"
                >
                  <Icon name="Bell" size={16} />
                  Разрешить уведомления
                </Button>
              </div>
            )}

            {permission === 'granted' && (
              <>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Включить уведомления</p>
                    <p className="text-sm text-gray-500">Получать напоминания о приёме лекарств</p>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                  />
                </div>

                {settings.enabled && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Звуковой сигнал</p>
                        <p className="text-sm text-gray-500">Проигрывать звук при уведомлении</p>
                      </div>
                      <Switch
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Напоминать за (минут)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 15, 30].map((minutes) => (
                          <Button
                            key={minutes}
                            variant={settings.minutesBefore === minutes ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateSettings({ minutesBefore: minutes })}
                          >
                            {minutes}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Icon name="Check" size={20} className="text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">Уведомления настроены!</p>
                          <p className="text-sm text-green-700 mt-1">
                            Вы будете получать напоминания за {settings.minutesBefore} минут до приёма лекарства и в момент приёма.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}