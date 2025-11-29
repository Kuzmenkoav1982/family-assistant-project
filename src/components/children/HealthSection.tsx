import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
import { useUploadMedicalFile, type MedicalDocument } from '@/hooks/useUploadMedicalFile';
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
  const { data, loading } = useChildrenData(child.id);
  const { uploadFile, uploading, progress } = useUploadMedicalFile();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    { id: '1', name: 'Корь, краснуха, паротит', date: '2023-05-15', nextDate: '2024-05-15', completed: true },
    { id: '2', name: 'АДСМ (дифтерия, столбняк)', date: '2023-08-20', nextDate: '2024-08-20', completed: true },
    { id: '3', name: 'Грипп', date: '2024-10-01', completed: false },
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Амоксициллин',
      startDate: '2024-11-25',
      endDate: '2024-12-05',
      schedule: '3 раза в день',
      howToTake: 'После еды, запивать водой',
      doses: [
        { date: '2024-11-25', time: '08:00', taken: true },
        { date: '2024-11-25', time: '14:00', taken: true },
        { date: '2024-11-25', time: '20:00', taken: false },
      ],
    },
  ]);

  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>([
    {
      id: '1',
      doctor: 'Иванова А.П.',
      specialty: 'Педиатр',
      date: '2024-03-15',
      nextVisit: '2024-09-15',
      notes: 'Плановый осмотр, все в норме',
    },
    {
      id: '2',
      doctor: 'Петров С.И.',
      specialty: 'Окулист',
      date: '2024-01-20',
      nextVisit: '2024-12-15',
      notes: 'Зрение -0.5, рекомендованы упражнения',
    },
  ]);

  const [newMedicationDialog, setNewMedicationDialog] = useState(false);
  const [viewDocumentsDialog, setViewDocumentsDialog] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<MedicalDocument[]>([]);

  const handleFileUpload = async (file: File, documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination', relatedId?: string) => {
    setUploadingFor(documentType);
    const result = await uploadFile({
      file,
      documentType,
      childId: child.id,
      relatedId,
      relatedType: documentType,
    });

    if (result.success && result.document) {
      setDocuments(prev => [...prev, result.document!]);
      console.log('Файл успешно загружен:', result.document);
    } else {
      console.error('Ошибка загрузки:', result.error);
      alert(result.error || 'Ошибка загрузки файла');
    }
    setUploadingFor(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination', relatedId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, documentType, relatedId);
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
            <Dialog>
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
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input placeholder="Например: Грипп" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Следующая дата (опционально)</label>
                    <Input type="date" />
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {vaccinations.map((vac) => (
            <div key={vac.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{vac.completed ? '✅' : '📅'}</div>
                <div>
                  <p className="font-medium">{vac.name}</p>
                  <p className="text-sm text-gray-500">Дата: {vac.date}</p>
                  {vac.nextDate && (
                    <p className="text-sm text-blue-600">Следующая: {vac.nextDate}</p>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost">
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Pill" size={20} />
              Лекарства
            </CardTitle>
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
                    <Input placeholder="Например: Амоксициллин" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Начало приема</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Конец приема</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Периодичность приема</label>
                    <Input placeholder="Например: 3 раза в день" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Как принимать</label>
                    <Textarea placeholder="Например: После еды, запивать водой" />
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.map((med) => (
            <Card key={med.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{med.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {med.startDate} - {med.endDate}
                    </p>
                  </div>
                  <Badge>{med.schedule}</Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">{med.howToTake}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium mb-3">График приема:</p>
                  {med.doses.map((dose, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={dose.taken}
                          className="w-5 h-5"
                          readOnly
                        />
                        <span className="text-sm">
                          {dose.date} в {dose.time}
                        </span>
                      </div>
                      {dose.taken ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Принято</Badge>
                      ) : (
                        <Badge variant="outline">Ожидается</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Stethoscope" size={20} />
              План посещения врачей
            </CardTitle>
            <Dialog>
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
                    <label className="text-sm font-medium mb-2 block">ФИО врача</label>
                    <Input placeholder="Например: Иванова А.П." />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Специальность</label>
                    <Input placeholder="Например: Педиатр" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата посещения</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Следующий визит</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Заметки</label>
                    <Textarea placeholder="Рекомендации, результаты осмотра..." />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <Button variant="outline" className="w-full gap-2" type="button" disabled={uploadingFor === 'doctor_visit'}>
                        <Icon name="Upload" size={16} />
                        {uploadingFor === 'doctor_visit' ? `Загрузка ${progress}%` : 'Прикрепить фото'}
                      </Button>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileInputChange(e, 'doctor_visit')}
                        disabled={uploadingFor === 'doctor_visit'}
                      />
                    </label>
                  </div>
                  <Button className="w-full">Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {doctorVisits.map((visit) => (
            <div key={visit.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium">{visit.doctor}</p>
                  <p className="text-sm text-gray-600">{visit.specialty}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Icon name="Edit" size={16} />
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={14} className="text-gray-400" />
                  <span>Последний визит: {visit.date}</span>
                </div>
                {visit.nextVisit && (
                  <div className="flex items-center gap-2">
                    <Icon name="CalendarClock" size={14} className="text-blue-500" />
                    <span className="text-blue-600">Следующий: {visit.nextVisit}</span>
                  </div>
                )}
                <p className="text-gray-600 mt-2">{visit.notes}</p>
              </div>
              <Button variant="link" className="mt-2 p-0 h-auto text-sm gap-1">
                <Icon name="Calendar" size={14} />
                Добавить в календарь семьи
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Прикрепленные файлы ({documents.length})
            </CardTitle>
            <label>
              <Button variant="outline" className="gap-2" disabled={uploading}>
                <Icon name="Upload" size={16} />
                {uploading ? `Загрузка ${progress}%` : 'Загрузить файл'}
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
          {documents.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">📸</div>
              <p className="font-medium text-gray-700">Пока нет загруженных файлов</p>
              <p className="text-sm text-gray-500">
                Загрузите рецепты, анализы, заключения врачей
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {documents.map((doc) => (
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
    </div>
  );
}