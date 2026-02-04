import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import func2url from '../../../backend/func2url.json';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  times?: string[];
  purpose?: string;
  sideEffects?: string;
  prescribedBy?: string;
  files?: Array<{ url: string; filename: string; fileType: string }>;
}

interface EditMedicationDialogProps {
  medication: Medication;
  profileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditMedicationDialog({ 
  medication, 
  profileId, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditMedicationDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { upload, uploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: medication.name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency || '',
    startDate: medication.startDate || new Date().toISOString().split('T')[0],
    endDate: medication.endDate || '',
    times: medication.times || ['09:00'],
    purpose: medication.purpose || '',
    sideEffects: medication.sideEffects || '',
    prescribedBy: medication.prescribedBy || ''
  });

  const [attachedFiles, setAttachedFiles] = useState<Array<{ url: string; filename: string; fileType: string }>>(
    medication.files || []
  );

  useEffect(() => {
    setFormData({
      name: medication.name || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      startDate: medication.startDate || new Date().toISOString().split('T')[0],
      endDate: medication.endDate || '',
      times: medication.times || ['09:00'],
      purpose: medication.purpose || '',
      sideEffects: medication.sideEffects || '',
      prescribedBy: medication.prescribedBy || ''
    });
    setAttachedFiles(medication.files || []);
  }, [medication]);

  const handleAddTime = () => {
    setFormData({ ...formData, times: [...formData.times, '09:00'] });
  };

  const handleRemoveTime = (index: number) => {
    if (formData.times.length > 1) {
      setFormData({ ...formData, times: formData.times.filter((_, i) => i !== index) });
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await upload(file, 'medications');
        setAttachedFiles(prev => [...prev, { 
          url, 
          filename: file.name,
          fileType: file.type
        }]);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-medications'], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          id: medication.id,
          profileId,
          ...formData,
          endDate: formData.endDate || null,
          files: attachedFiles
        })
      });

      if (response.ok) {
        toast({
          title: 'Лекарство обновлено',
          description: 'Изменения успешно сохранены'
        });
        onOpenChange(false);
        onSuccess();
      } else {
        throw new Error('Ошибка при обновлении лекарства');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить лекарство',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать лекарство</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название лекарства *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Амоксициллин"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Дозировка *</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="Например: 500 мг"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Частота приёма *</Label>
              <Input
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                placeholder="Например: 2 раза в день"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Время приёма</Label>
            {formData.times.map((time, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(index, e.target.value)}
                  className="flex-1"
                />
                {formData.times.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveTime(index)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTime}
              className="mt-2"
            >
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить время приёма
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Назначение</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Для чего назначено"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescribedBy">Назначено врачом</Label>
            <Input
              id="prescribedBy"
              value={formData.prescribedBy}
              onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
              placeholder="ФИО врача"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sideEffects">Побочные эффекты</Label>
            <Textarea
              id="sideEffects"
              value={formData.sideEffects}
              onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
              placeholder="Возможные побочные эффекты"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Прикрепленные файлы</Label>
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                    <Icon name="FileText" size={12} />
                    <span className="text-xs">{file.filename}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Icon name="Paperclip" size={14} className="mr-1" />
                {uploading ? 'Загрузка...' : 'Прикрепить файлы'}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
