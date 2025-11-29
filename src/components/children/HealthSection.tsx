import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useChildrenData } from '@/hooks/useChildrenData';
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
}

export function HealthSection({ child }: HealthSectionProps) {
  const { data, loading } = useChildrenData(child.id);
  
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
                    <Button variant="outline" className="flex-1 gap-2">
                      <Icon name="Upload" size={16} />
                      Прикрепить фото
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Icon name="FileText" size={16} />
                      Добавить рецепт
                    </Button>
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

      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="text-4xl">📸</div>
            <p className="font-medium">Прикрепленные файлы</p>
            <p className="text-sm text-gray-500">
              Рецепты, анализы, заключения врачей
            </p>
            <Button variant="outline" className="gap-2">
              <Icon name="Upload" size={16} />
              Загрузить файлы
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}