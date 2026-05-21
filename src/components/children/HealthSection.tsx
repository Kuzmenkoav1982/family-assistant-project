import { useState } from 'react';
import { useChildrenData } from '@/hooks/useChildrenData';
import { useUploadMedicalFile, type MedicalDocument } from '@/hooks/useUploadMedicalFile';
import { useMedicationNotifications } from '@/hooks/useMedicationNotifications';
import { usePermissions } from '@/hooks/usePermissions';
import type { FamilyMember } from '@/types/family.types';
import { HealthVaccinationsCard } from './health/HealthVaccinationsCard';
import { HealthMedicationsCard } from './health/HealthMedicationsCard';
import { HealthDoctorVisitsCard } from './health/HealthDoctorVisitsCard';
import { HealthDocumentsCard } from './health/HealthDocumentsCard';

interface HealthSectionProps {
  child: FamilyMember;
}

export function HealthSection({ child }: HealthSectionProps) {
  const { data, loading, addItem, updateItem, deleteItem, fetchChildData } = useChildrenData(child.id);
  const { uploadFile, uploading, progress } = useUploadMedicalFile();
  const { canDo } = usePermissions();
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
    times: ['09:00'] as string[],
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
    ? data.health.documents.map((doc: Record<string, unknown>) => ({
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
        uploadedAt: doc.uploaded_at || doc.created_at,
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType as 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination' | 'other');
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
        times: ['09:00'],
      });
    } else {
      alert(result.error || 'Ошибка добавления');
    }
  };

  const handleEditMedication = (med: unknown) => {
    const m = med as Record<string, unknown>;
    setEditingMedicationId(m.id as string);
    setNewMedicationData({
      name: m.name as string,
      startDate: m.start_date as string,
      endDate: m.end_date as string,
      frequency: (m.frequency as string) || '',
      dosage: (m.dosage as string) || '',
      instructions: (m.instructions as string) || '',
      times: ((m.schedule as Array<Record<string, unknown>>) || []).map((s) => (s.time_of_day as string).slice(0, 5)),
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
        times: ['09:00'],
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

  const handleRebuildSchedule = async (_medId: string) => {
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
          data: {},
        }),
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
  };

  // suppress unused warning — uploadingFor used internally
  void uploadingFor;

  return (
    <div className="space-y-6">
      <HealthVaccinationsCard
        vaccinations={vaccinations}
        loading={loading}
        canAddDoctor={canAddDoctor}
        newVaccinationDialog={newVaccinationDialog}
        setNewVaccinationDialog={setNewVaccinationDialog}
        newVaccinationData={newVaccinationData}
        setNewVaccinationData={setNewVaccinationData}
        onDelete={handleDeleteVaccination}
        onAdd={handleAddVaccination}
      />

      <HealthMedicationsCard
        medications={medications}
        canAddMedicine={canAddMedicine}
        canMarkMedicine={canMarkMedicine}
        canDelete={canDelete}
        permission={permission}
        settings={settings}
        onAdd={handleAddMedication}
        onUpdate={handleUpdateMedication}
        onDelete={handleDeleteMedication}
        onEditStart={handleEditMedication}
        onMarkIntake={handleMarkIntake}
        onRebuildSchedule={handleRebuildSchedule}
        onRequestPermission={requestPermission}
        onUpdateSettings={updateSettings}
        notificationSettingsDialog={notificationSettingsDialog}
        setNotificationSettingsDialog={setNotificationSettingsDialog}
        editMedicationDialog={editMedicationDialog}
        setEditMedicationDialog={setEditMedicationDialog}
        newMedicationDialog={newMedicationDialog}
        setNewMedicationDialog={setNewMedicationDialog}
        newMedicationData={newMedicationData}
        setNewMedicationData={setNewMedicationData}
      />

      <HealthDoctorVisitsCard
        doctorVisits={doctorVisits}
        loading={loading}
        canAddDoctor={canAddDoctor}
        newDoctorVisitDialog={newDoctorVisitDialog}
        setNewDoctorVisitDialog={setNewDoctorVisitDialog}
        newDoctorVisitData={newDoctorVisitData}
        setNewDoctorVisitData={setNewDoctorVisitData}
        onAdd={handleAddDoctorVisit}
        onDelete={handleDeleteDoctorVisit}
      />

      <HealthDocumentsCard
        documents={healthDocuments}
        uploading={uploading}
        progress={progress}
        viewDocumentsDialog={viewDocumentsDialog}
        setViewDocumentsDialog={setViewDocumentsDialog}
        selectedDocuments={selectedDocuments}
        setSelectedDocuments={setSelectedDocuments}
        onFileChange={handleFileInputChange}
      />
    </div>
  );
}
