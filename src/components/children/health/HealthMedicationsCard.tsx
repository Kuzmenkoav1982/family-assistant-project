import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

interface MedicationData {
  name: string;
  startDate: string;
  endDate: string;
  frequency: string;
  dosage: string;
  instructions: string;
  times: string[];
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  minutesBefore: number;
}

interface HealthMedicationsCardProps {
  medications: unknown[];
  canAddMedicine: boolean;
  canMarkMedicine: boolean;
  canDelete: boolean;
  permission: NotificationPermission | 'default';
  settings: NotificationSettings;
  onAdd: () => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onEditStart: (med: unknown) => void;
  onMarkIntake: (intakeId: string, taken: boolean) => void;
  onRebuildSchedule: (medId: string) => void;
  onRequestPermission: () => void;
  onUpdateSettings: (s: Partial<NotificationSettings>) => void;
  notificationSettingsDialog: boolean;
  setNotificationSettingsDialog: (v: boolean) => void;
  editMedicationDialog: boolean;
  setEditMedicationDialog: (v: boolean) => void;
  newMedicationDialog: boolean;
  setNewMedicationDialog: (v: boolean) => void;
  newMedicationData: MedicationData;
  setNewMedicationData: (v: MedicationData) => void;
}

export function HealthMedicationsCard({
  medications,
  canAddMedicine: _canAddMedicine,
  canMarkMedicine: _canMarkMedicine,
  canDelete: _canDelete,
  permission,
  settings,
  onAdd,
  onUpdate,
  onDelete,
  onEditStart,
  onMarkIntake,
  onRebuildSchedule,
  onRequestPermission,
  onUpdateSettings,
  notificationSettingsDialog,
  setNotificationSettingsDialog,
  editMedicationDialog,
  setEditMedicationDialog,
  newMedicationDialog,
  setNewMedicationDialog,
  newMedicationData,
  setNewMedicationData,
}: HealthMedicationsCardProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Pill" size={20} />
              Лекарства
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 flex-shrink-0"
                onClick={() => setNotificationSettingsDialog(true)}
              >
                <Icon name="Bell" size={16} />
                <span className="hidden sm:inline">Уведомления</span>
                {settings.enabled && <Badge variant="outline" className="ml-1 bg-green-50 text-green-700">ВКЛ</Badge>}
              </Button>
              <Dialog open={newMedicationDialog} onOpenChange={setNewMedicationDialog}>
                <Button
                  size="sm"
                  className="gap-2 flex-1 sm:flex-initial whitespace-nowrap"
                  onClick={() => setNewMedicationDialog(true)}
                >
                  <Icon name="Plus" size={16} />
                  <span className="hidden sm:inline">Добавить лекарство</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
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
                        onChange={(e) => setNewMedicationData({ ...newMedicationData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Начало приема</label>
                        <Input
                          type="date"
                          value={newMedicationData.startDate}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Конец приема</label>
                        <Input
                          type="date"
                          value={newMedicationData.endDate}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Дозировка</label>
                        <Input
                          placeholder="Например: 500 мг"
                          value={newMedicationData.dosage}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, dosage: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Частота</label>
                        <Input
                          placeholder="Например: 3 раза в день"
                          value={newMedicationData.frequency}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, frequency: e.target.value })}
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
                                setNewMedicationData({ ...newMedicationData, times: newTimes });
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
                                  setNewMedicationData({ ...newMedicationData, times: newTimes });
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
                            setNewMedicationData({ ...newMedicationData, times: [...newMedicationData.times, '09:00'] });
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
                        onChange={(e) => setNewMedicationData({ ...newMedicationData, instructions: e.target.value })}
                      />
                    </div>
                    <Button className="w-full" onClick={onAdd}>Сохранить</Button>
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
                        onChange={(e) => setNewMedicationData({ ...newMedicationData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Начало приема</label>
                        <Input
                          type="date"
                          value={newMedicationData.startDate}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Конец приема</label>
                        <Input
                          type="date"
                          value={newMedicationData.endDate}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Дозировка</label>
                        <Input
                          placeholder="Например: 500 мг"
                          value={newMedicationData.dosage}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, dosage: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Частота</label>
                        <Input
                          placeholder="Например: 3 раза в день"
                          value={newMedicationData.frequency}
                          onChange={(e) => setNewMedicationData({ ...newMedicationData, frequency: e.target.value })}
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
                                setNewMedicationData({ ...newMedicationData, times: newTimes });
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
                                  setNewMedicationData({ ...newMedicationData, times: newTimes });
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
                            setNewMedicationData({ ...newMedicationData, times: [...newMedicationData.times, '09:00'] });
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
                        onChange={(e) => setNewMedicationData({ ...newMedicationData, instructions: e.target.value })}
                      />
                    </div>
                    <Button className="w-full" onClick={onUpdate}>Сохранить изменения</Button>
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
            (medications as Record<string, unknown>[]).map((med) => {
              const intakes = (med.intakes as Record<string, unknown>[] | undefined) || [];
              const schedule = (med.schedule as Record<string, unknown>[] | undefined) || [];
              const todayIntakes = intakes.filter((intake) => {
                const intakeDate = new Date(intake.scheduled_date as string).toDateString();
                const today = new Date().toDateString();
                return intakeDate === today;
              });

              const completedToday = todayIntakes.filter((intake) => intake.taken).length;

              return (
                <Card key={med.id as string} className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{med.name as string}</CardTitle>
                          {med.dosage && <Badge variant="outline">{med.dosage as string}</Badge>}
                          {med.frequency && <Badge>{med.frequency as string}</Badge>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {new Date(med.start_date as string).toLocaleDateString('ru-RU')} - {new Date(med.end_date as string).toLocaleDateString('ru-RU')}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-600 mt-2">💊 {med.instructions as string}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditStart(med)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(med.id as string)}
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
                      {(schedule && schedule.length > 0) ? (
                        schedule.map((scheduleItem) => {
                          const todayIntake = todayIntakes.find((intake) =>
                            intake.schedule_id === scheduleItem.id
                          );

                          return (
                            <div key={scheduleItem.id as string} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-blue-200">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={(todayIntake?.taken as boolean) || false}
                                  onChange={(e) => {
                                    if (todayIntake) {
                                      onMarkIntake(todayIntake.id as string, e.target.checked);
                                    }
                                  }}
                                  className="w-5 h-5 cursor-pointer"
                                />
                                <div>
                                  <span className="text-sm font-medium">
                                    {(scheduleItem.time_of_day as string).slice(0, 5)}
                                  </span>
                                  {todayIntake?.taken_at && (
                                    <p className="text-xs text-gray-500">
                                      Принято: {new Date(todayIntake.taken_at as string).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit',
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
                                  onClick={() => todayIntake && onMarkIntake(todayIntake.id as string, true)}
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
                            onClick={() => onRebuildSchedule(med.id as string)}
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
                  onClick={onRequestPermission}
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
                    onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
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
                        onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
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
                            onClick={() => onUpdateSettings({ minutesBefore: minutes })}
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
    </>
  );
}
