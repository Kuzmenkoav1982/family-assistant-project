import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface VaccinationsCardProps {
  vaccinations: any[];
  canDelete: boolean;
  uploading: boolean;
  uploadingFor: string | null;
  onAdd: (data: { vaccine: string; date: string; notes: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, documentType: 'vaccination', relatedId?: string) => void;
}

export function VaccinationsCard({
  vaccinations,
  canDelete,
  uploading,
  uploadingFor,
  onAdd,
  onDelete,
  onFileUpload
}: VaccinationsCardProps) {
  const [newVaccinationDialog, setNewVaccinationDialog] = useState(false);
  const [newVaccinationData, setNewVaccinationData] = useState({ vaccine: '', date: '', notes: '' });

  const handleAdd = async () => {
    if (!newVaccinationData.vaccine || !newVaccinationData.date) {
      alert('Заполните обязательные поля');
      return;
    }

    await onAdd(newVaccinationData);
    setNewVaccinationDialog(false);
    setNewVaccinationData({ vaccine: '', date: '', notes: '' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Icon name="Syringe" className="h-5 w-5 text-blue-600" />
          Прививки
        </CardTitle>
        <Dialog open={newVaccinationDialog} onOpenChange={setNewVaccinationDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Icon name="Plus" className="h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить прививку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Название вакцины *</label>
                <Input
                  value={newVaccinationData.vaccine}
                  onChange={(e) => setNewVaccinationData({ ...newVaccinationData, vaccine: e.target.value })}
                  placeholder="Например: Корь, краснуха, паротит"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Дата прививки *</label>
                <Input
                  type="date"
                  value={newVaccinationData.date}
                  onChange={(e) => setNewVaccinationData({ ...newVaccinationData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Заметки</label>
                <Textarea
                  value={newVaccinationData.notes}
                  onChange={(e) => setNewVaccinationData({ ...newVaccinationData, notes: e.target.value })}
                  placeholder="Реакция, особенности..."
                  rows={3}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Добавить прививку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {vaccinations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Syringe" className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Прививок пока нет</p>
            <p className="text-sm">Добавьте первую прививку</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vaccinations.map((vaccination) => (
              <div key={vaccination.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{vaccination.vaccine}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(vaccination.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(vaccination.id)}
                    >
                      <Icon name="Trash2" className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                {vaccination.notes && (
                  <p className="text-sm text-gray-700 mt-2">{vaccination.notes}</p>
                )}
                <div className="mt-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => onFileUpload(e, 'vaccination', vaccination.id)}
                      disabled={uploading && uploadingFor === 'vaccination'}
                    />
                    <Button variant="outline" size="sm" asChild disabled={uploading && uploadingFor === 'vaccination'}>
                      <span className="gap-2">
                        {uploading && uploadingFor === 'vaccination' ? (
                          <Icon name="Loader2" className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon name="Upload" className="h-4 w-4" />
                        )}
                        Прикрепить документ
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
