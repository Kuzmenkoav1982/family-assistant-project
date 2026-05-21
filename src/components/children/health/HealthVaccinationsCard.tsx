import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface VaccinationItem {
  id: string;
  vaccine: string;
  date: string;
  notes?: string;
}

interface HealthVaccinationsCardProps {
  vaccinations: VaccinationItem[];
  loading: boolean;
  canAddDoctor: boolean;
  newVaccinationDialog: boolean;
  setNewVaccinationDialog: (v: boolean) => void;
  newVaccinationData: { vaccine: string; date: string; notes: string };
  setNewVaccinationData: (v: { vaccine: string; date: string; notes: string }) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function HealthVaccinationsCard({
  vaccinations,
  loading,
  canAddDoctor,
  newVaccinationDialog,
  setNewVaccinationDialog,
  newVaccinationData,
  setNewVaccinationData,
  onDelete,
  onAdd,
}: HealthVaccinationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Syringe" size={20} />
            Прививки
          </CardTitle>
          {canAddDoctor && (
            <Dialog open={newVaccinationDialog} onOpenChange={setNewVaccinationDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 w-full sm:w-auto whitespace-nowrap">
                  <Icon name="Plus" size={16} />
                  <span className="hidden sm:inline">Добавить прививку</span>
                  <span className="sm:hidden">Добавить</span>
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
                      onChange={(e) => setNewVaccinationData({ ...newVaccinationData, vaccine: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дата *</label>
                    <Input
                      type="date"
                      value={newVaccinationData.date}
                      onChange={(e) => setNewVaccinationData({ ...newVaccinationData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Примечания</label>
                    <Textarea
                      placeholder="Дополнительная информация"
                      value={newVaccinationData.notes}
                      onChange={(e) => setNewVaccinationData({ ...newVaccinationData, notes: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={onAdd}>Сохранить</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
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
          vaccinations.map((vac) => (
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
                onClick={() => onDelete(vac.id)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
