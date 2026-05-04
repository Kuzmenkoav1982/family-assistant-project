import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useFileUpload } from '@/hooks/useFileUpload';
import func2url from '@/config/func2url';

interface AddMedicationAdvancedDialogProps {
  profileId: string;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function AddMedicationAdvancedDialog({ profileId, onSuccess, trigger }: AddMedicationAdvancedDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationSettingsOpen, setNotificationSettingsOpen] = useState(false);
  const { toast } = useToast();
  const { upload, uploading } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    times: ['09:00'],
    purpose: '',
    sideEffects: '',
    prescribedBy: ''
  });

  const [attachedFiles, setAttachedFiles] = useState<Array<{ url: string; filename: string; fileType: string }>>([]);

  const [notificationSettings, setNotificationSettings] = useState({
    enabled: false,
    soundEnabled: true,
    minutesBefore: 15
  });

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === 'granted') {
        setNotificationSettings({ ...notificationSettings, enabled: true });
        localStorage.setItem('medicationNotifications', JSON.stringify({ ...notificationSettings, enabled: true }));
      }
    }
  };

  const updateNotificationSettings = (updates: Partial<typeof notificationSettings>) => {
    const newSettings = { ...notificationSettings, ...updates };
    setNotificationSettings(newSettings);
    localStorage.setItem('medicationNotifications', JSON.stringify(newSettings));
  };

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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': profileId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          profileId,
          ...formData,
          endDate: formData.endDate || null,
          status: 'active',
          files: attachedFiles,
          notificationSettings: notificationSettings.enabled ? notificationSettings : null
        })
      });

      if (response.ok) {
        toast({
          title: 'Лекарство добавлено',
          description: 'Информация о лекарстве сохранена'
        });
        setOpen(false);
        setFormData({
          name: '',
          dosage: '',
          frequency: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          times: ['09:00'],
          purpose: '',
          sideEffects: '',
          prescribedBy: ''
        });
        setAttachedFiles([]);
        onSuccess();
      } else {
        throw new Error('Ошибка при добавлении лекарства');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить лекарство',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button className="gap-2">
              <Icon name="Plus" size={16} />
              Добавить лекарство
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full">
          <DialogHeader>
            <DialogTitle>Добавить лекарство</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название препарата *</Label>
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
                <Label htmlFor="startDate">Начало приема</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Конец приема</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dosage">Дозировка</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="Например: 500 мг"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Частота</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="Например: 3 раза в день"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Время приема *</Label>
              <div className="space-y-2">
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
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveTime(index)}
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
                  onClick={handleAddTime}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить время
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Инструкция по приему</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Например: После еды, запивать водой"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescribedBy">Назначил врач</Label>
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
              <Label>Прикрепить файлы</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Icon name="Paperclip" size={16} />
                {uploading ? 'Загрузка...' : 'Прикрепить рецепт или документ'}
              </Button>
              
              {attachedFiles.length > 0 && (
                <div className="space-y-2 mt-2">
                  {attachedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Icon name="FileText" size={16} className="text-blue-600" />
                      <span className="flex-1 text-sm truncate">{file.filename}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Icon name="X" size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => setNotificationSettingsOpen(true)}
              >
                <Icon name="Bell" size={16} />
                {notificationSettings.enabled 
                  ? `Уведомления включены (за ${notificationSettings.minutesBefore} мин)` 
                  : 'Настроить уведомления'
                }
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={notificationSettingsOpen} onOpenChange={setNotificationSettingsOpen}>
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
                    checked={notificationSettings.enabled}
                    onCheckedChange={(checked) => updateNotificationSettings({ enabled: checked })}
                  />
                </div>

                {notificationSettings.enabled && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Звуковой сигнал</p>
                        <p className="text-sm text-gray-500">Проигрывать звук при уведомлении</p>
                      </div>
                      <Switch
                        checked={notificationSettings.soundEnabled}
                        onCheckedChange={(checked) => updateNotificationSettings({ soundEnabled: checked })}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Напоминать за (минут)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[5, 10, 15, 30].map((minutes) => (
                          <Button
                            key={minutes}
                            type="button"
                            variant={notificationSettings.minutesBefore === minutes ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateNotificationSettings({ minutesBefore: minutes })}
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
                            Вы будете получать напоминания за {notificationSettings.minutesBefore} минут до времени приёма лекарства.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium mb-2">Как это работает:</p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>За 30 минут до приёма придёт уведомление</li>
                        <li>Можно отметить приём или отложить на 15 минут</li>
                        <li>История приёма сохраняется автоматически</li>
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}