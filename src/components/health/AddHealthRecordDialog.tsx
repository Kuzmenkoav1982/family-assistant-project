import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '@/config/func2url';

interface AddHealthRecordDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddHealthRecordDialog({ profileId, onSuccess, trigger }: AddHealthRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'visit',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    doctor: '',
    clinic: '',
    diagnosis: '',
    recommendations: ''
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(func2url['health-records'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          ...formData,
          aiAnalysis: aiAnalysis
        })
      });

      if (response.ok) {
        toast({
          title: 'Запись добавлена',
          description: 'Медицинская запись успешно создана'
        });
        setOpen(false);
        setFormData({
          type: 'visit',
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          doctor: '',
          clinic: '',
          diagnosis: '',
          recommendations: ''
        });
        setAiAnalysis(null);
        setUploadedImage(null);
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении записи');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить запись',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="whitespace-nowrap">
            <Icon name="Plus" size={14} />
            <span className="hidden sm:inline">Добавить запись</span>
            <span className="inline sm:hidden">Добавить</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle>Новая медицинская запись</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип записи</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">Визит к врачу</SelectItem>
                <SelectItem value="analysis">Анализы</SelectItem>
                <SelectItem value="procedure">Процедура</SelectItem>
                <SelectItem value="hospitalization">Госпитализация</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Например: Плановый осмотр"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Дата *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Опишите визит или процедуру"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Врач</Label>
              <Input
                id="doctor"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="ФИО врача"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic">Клиника</Label>
              <Input
                id="clinic"
                value={formData.clinic}
                onChange={(e) => setFormData({ ...formData, clinic: e.target.value })}
                placeholder="Название клиники"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis">Диагноз</Label>
            <Input
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Поставленный диагноз"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recommendations">Рекомендации</Label>
            <Textarea
              id="recommendations"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              placeholder="Рекомендации врача"
              rows={3}
            />
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label>📸 Анализ документа с помощью ИИ</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Загрузите фото анализа — ИИ распознает текст и проанализирует показатели
            </p>
            
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    const base64 = event.target?.result as string;
                    const base64Data = base64.split(',')[1];
                    setUploadedImage(base64);
                    
                    setAnalyzingImage(true);
                    try {
                      const response = await fetch(func2url['health-ai-analysis'], {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          image: base64Data,
                          type: formData.type === 'analysis' ? 'blood_test' : 'general'
                        })
                      });
                      
                      const data = await response.json();
                      if (response.ok) {
                        setAiAnalysis({
                          ...data,
                          sourceImageUrl: base64
                        });
                        toast({
                          title: '✅ Анализ завершён',
                          description: 'ИИ обработал документ'
                        });
                      } else {
                        const hint = data.hint || data.error || 'Не удалось распознать текст на изображении';
                        toast({
                          title: 'Не удалось распознать документ',
                          description: hint,
                          variant: 'destructive'
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'Ошибка анализа',
                        description: 'Проверьте интернет-соединение и попробуйте снова',
                        variant: 'destructive'
                      });
                    } finally {
                      setAnalyzingImage(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              
              {analyzingImage && (
                <Alert>
                  <Icon name="Loader2" className="animate-spin" size={16} />
                  <AlertDescription>ИИ анализирует документ...</AlertDescription>
                </Alert>
              )}
              
              {uploadedImage && !analyzingImage && (
                <div className="border rounded p-2">
                  <img src={uploadedImage} alt="Загруженный документ" className="max-h-40 mx-auto" />
                </div>
              )}
              
              {aiAnalysis && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Icon name="Sparkles" size={16} className="text-blue-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold text-blue-900">Результат анализа ИИ:</p>
                      <p className="text-sm">{aiAnalysis.interpretation}</p>
                      
                      {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="font-semibold text-orange-700 text-sm">⚠️ Предупреждения:</p>
                          {aiAnalysis.warnings.map((warning: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="mr-1 bg-orange-50 text-orange-700 border-orange-300">
                              {warning}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            description: formData.description + '\n\nРезультат ИИ-анализа:\n' + aiAnalysis.interpretation
                          });
                          toast({ title: 'Добавлено', description: 'Результат ИИ добавлен в описание' });
                        }}
                      >
                        <Icon name="Copy" size={14} className="mr-1" />
                        Добавить в описание
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Создать запись'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}