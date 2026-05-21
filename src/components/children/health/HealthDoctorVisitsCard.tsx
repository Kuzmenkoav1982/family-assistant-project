import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface DoctorVisitItem {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  notes?: string;
}

interface DoctorVisitData {
  doctor: string;
  specialty: string;
  date: string;
  status: string;
  notes: string;
}

interface HealthDoctorVisitsCardProps {
  doctorVisits: DoctorVisitItem[];
  loading: boolean;
  canAddDoctor: boolean;
  newDoctorVisitDialog: boolean;
  setNewDoctorVisitDialog: (v: boolean) => void;
  newDoctorVisitData: DoctorVisitData;
  setNewDoctorVisitData: (v: DoctorVisitData) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function HealthDoctorVisitsCard({
  doctorVisits,
  loading,
  canAddDoctor: _canAddDoctor,
  newDoctorVisitDialog,
  setNewDoctorVisitDialog,
  newDoctorVisitData,
  setNewDoctorVisitData,
  onAdd,
  onDelete,
}: HealthDoctorVisitsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Stethoscope" size={20} />
            План посещения врачей
          </CardTitle>
          <Dialog open={newDoctorVisitDialog} onOpenChange={setNewDoctorVisitDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 w-full sm:w-auto whitespace-nowrap">
                <Icon name="Plus" size={16} />
                <span className="hidden sm:inline">Добавить посещение</span>
                <span className="sm:hidden">Добавить</span>
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
                    onChange={(e) => setNewDoctorVisitData({ ...newDoctorVisitData, doctor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Специальность</label>
                  <Input
                    placeholder="Например: Педиатр"
                    value={newDoctorVisitData.specialty}
                    onChange={(e) => setNewDoctorVisitData({ ...newDoctorVisitData, specialty: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Дата посещения *</label>
                  <Input
                    type="date"
                    value={newDoctorVisitData.date}
                    onChange={(e) => setNewDoctorVisitData({ ...newDoctorVisitData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Заметки</label>
                  <Textarea
                    placeholder="Рекомендации, результаты осмотра..."
                    value={newDoctorVisitData.notes}
                    onChange={(e) => setNewDoctorVisitData({ ...newDoctorVisitData, notes: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={onAdd}>Сохранить</Button>
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
          doctorVisits.map((visit) => (
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
                  onClick={() => onDelete(visit.id)}
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
  );
}
