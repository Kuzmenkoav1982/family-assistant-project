import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { DashboardPlan, TodayActivityData, NotifSetting } from '@/data/dietProgressTypes';
import { sosReasons, exerciseTypes } from '@/data/dietProgressTypes';

interface ActivityModalProps {
  show: boolean;
  onClose: () => void;
  actSteps: string; setActSteps: (v: string) => void;
  actType: string; setActType: (v: string) => void;
  actDuration: string; setActDuration: (v: string) => void;
  actNote: string; setActNote: (v: string) => void;
  savingActivity: boolean;
  onSave: () => void;
}

export function ActivityModal({
  show, onClose,
  actSteps, setActSteps, actType, setActType,
  actDuration, setActDuration, actNote, setActNote,
  savingActivity, onSave,
}: ActivityModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icon name="Footprints" size={20} className="text-blue-600" />
              Активность сегодня
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}><Icon name="X" size={18} /></Button>
          </div>
          <div>
            <Label className="text-sm">Шаги</Label>
            <Input type="number" placeholder="0" value={actSteps} onChange={e => setActSteps(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm">Тип тренировки</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {exerciseTypes.map(t => (
                <button key={t.id} className={`p-2 rounded-lg border text-center text-xs transition-all ${actType === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setActType(t.id)}>
                  <div className="text-lg">{t.icon}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-sm">Продолжительность (мин)</Label>
            <Input type="number" placeholder="0" value={actDuration} onChange={e => setActDuration(e.target.value)} />
          </div>
          <div>
            <Label className="text-sm">Заметка (необязательно)</Label>
            <Textarea rows={2} placeholder="Как прошла тренировка..." value={actNote} onChange={e => setActNote(e.target.value)} />
          </div>
          <Button className="w-full bg-blue-600" onClick={onSave} disabled={savingActivity}>
            {savingActivity ? 'Сохраняю...' : 'Сохранить активность'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface ActivityCardProps {
  plan: DashboardPlan;
  todayActivity: TodayActivityData | null;
  onOpen: () => void;
}

export function ActivityCard({ plan, todayActivity, onOpen }: ActivityCardProps) {
  if (!plan.exercise_recommendation && !plan.daily_steps) return null;
  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold flex items-center gap-2 text-blue-900">
            <Icon name="Footprints" size={18} className="text-blue-600" />
            Активность
          </h3>
          <Button size="sm" variant="outline" className="text-xs h-7 border-blue-300 text-blue-700" onClick={onOpen}>
            <Icon name="Plus" size={12} className="mr-1" />
            {todayActivity ? 'Обновить' : 'Записать'}
          </Button>
        </div>
        {plan.exercise_recommendation && <p className="text-sm text-blue-800 mb-2">{plan.exercise_recommendation}</p>}
        <div className="grid grid-cols-3 gap-2">
          {plan.daily_steps && (
            <div className="text-center p-2 rounded-lg bg-white/70">
              <div className="text-lg font-bold text-blue-700">{todayActivity?.steps?.toLocaleString() || 0}</div>
              <div className="text-[10px] text-muted-foreground">/ {plan.daily_steps.toLocaleString()} шагов</div>
              <Progress value={Math.min(100, ((todayActivity?.steps || 0) / plan.daily_steps) * 100)} className="h-1 mt-1" />
            </div>
          )}
          <div className="text-center p-2 rounded-lg bg-white/70">
            <div className="text-lg font-bold text-blue-700">{todayActivity?.exercise_duration_min || 0}</div>
            <div className="text-[10px] text-muted-foreground">мин тренировки</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-white/70">
            <div className="text-lg font-bold text-orange-600">{todayActivity?.calories_burned || 0}</div>
            <div className="text-[10px] text-muted-foreground">ккал сожжено</div>
          </div>
        </div>
        {plan.daily_water_ml && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
            <Icon name="Droplets" size={14} />
            <span>{(plan.daily_water_ml / 1000).toFixed(1)} л воды/день</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface SOSModalProps {
  show: boolean;
  sosResponse: string | null;
  sosComment: string;
  setSosComment: (v: string) => void;
  sendingSOS: boolean;
  onSOS: (reason: string) => void;
  onClose: () => void;
  onDismiss: () => void;
}

export function SOSModal({ show, sosResponse, sosComment, setSosComment, sendingSOS, onSOS, onClose, onDismiss }: SOSModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <Card className="w-full max-w-md border-red-200 max-h-[85vh] overflow-y-auto">
        <CardContent className="p-5 space-y-4">
          {sosResponse ? (
            <>
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon name="Heart" size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">Я рядом!</h3>
                <p className="text-sm leading-relaxed">{sosResponse}</p>
              </div>
              <Button className="w-full" onClick={onDismiss}>Спасибо, продолжаю!</Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Icon name="LifeBuoy" size={20} className="text-red-500" />
                  Что случилось?
                </h3>
                <Button variant="ghost" size="sm" onClick={onClose}><Icon name="X" size={18} /></Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sosReasons.map(r => (
                  <Button key={r.id} variant="outline" className="h-auto py-3 flex-col gap-1" disabled={sendingSOS} onClick={() => onSOS(r.id)}>
                    <span className="text-xl">{r.icon}</span>
                    <span className="text-xs">{r.label}</span>
                  </Button>
                ))}
              </div>
              <div>
                <Label className="text-xs">Комментарий (необязательно)</Label>
                <Textarea rows={2} placeholder="Расскажите подробнее..." value={sosComment} onChange={e => setSosComment(e.target.value)} />
              </div>
              {sendingSOS && <div className="text-center text-sm text-muted-foreground animate-pulse">Обрабатываю...</div>}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface FinalReportModalProps {
  show: boolean;
  onClose: () => void;
  loadingReport: boolean;
  finalReport: Record<string, unknown> | null;
  extending: boolean;
  finishing: boolean;
  onExtend: (days: number) => void;
  onFinish: () => void;
}

export function FinalReportModal({ show, onClose, loadingReport, finalReport, extending, finishing, onExtend, onFinish }: FinalReportModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icon name="Trophy" size={20} className="text-amber-500" />
              Итоги диеты
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}><Icon name="X" size={18} /></Button>
          </div>
          {loadingReport ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : finalReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-gradient-to-b from-green-50 to-green-100 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{String(finalReport.actual_loss)} кг</div>
                  <div className="text-xs text-green-600">сброшено</div>
                  {Number(finalReport.target_loss) > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1">цель: {String(finalReport.target_loss)} кг ({String(finalReport.goal_pct)}%)</div>
                  )}
                </div>
                <div className="text-center p-3 rounded-xl bg-gradient-to-b from-violet-50 to-violet-100 border border-violet-200">
                  <div className="text-2xl font-bold text-violet-700">{String(finalReport.adherence)}%</div>
                  <div className="text-xs text-violet-600">соблюдение плана</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{String(finalReport.meals_done)} из {String(finalReport.meals_total)} приёмов</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-lg font-bold text-blue-700">{String(finalReport.days_active)}</div>
                  <div className="text-[10px] text-muted-foreground">дней</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-lg font-bold text-orange-700">{Number(finalReport.total_steps).toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">шагов</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-lg font-bold text-red-600">{String(finalReport.total_cal_burned)}</div>
                  <div className="text-[10px] text-muted-foreground">ккал сожжено</div>
                </div>
              </div>
              <div className="flex gap-3 text-center">
                <div className="flex-1 p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-bold">{String(finalReport.streak)}</div>
                  <div className="text-[10px] text-muted-foreground">дней стрик</div>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-bold">{String(finalReport.weigh_in_days)}</div>
                  <div className="text-[10px] text-muted-foreground">дней взвешивания</div>
                </div>
                <div className="flex-1 p-2 rounded-lg bg-gray-50">
                  <div className="text-sm font-bold">{String(finalReport.sos_count)}</div>
                  <div className="text-[10px] text-muted-foreground">SOS</div>
                </div>
              </div>
              {finalReport.ai_summary && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                  <p className="text-sm leading-relaxed">{String(finalReport.ai_summary)}</p>
                </div>
              )}
              {finalReport.plan_status === 'active' && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-muted-foreground text-center font-medium">Что дальше?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 14, 30].map(d => (
                      <Button key={d} size="sm" variant="outline" className="text-xs" disabled={extending} onClick={() => onExtend(d)}>
                        +{d} дней
                      </Button>
                    ))}
                  </div>
                  <Button className="w-full bg-green-600" size="sm" onClick={onFinish} disabled={finishing}>
                    {finishing ? 'Завершаю...' : 'Завершить и закрепить'}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Стабилизация: +200 ккал/день ({String(finalReport.stabilization_calories)} ккал) для закрепления результата
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Не удалось загрузить отчёт</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface NotifSettingsModalProps {
  show: boolean;
  onClose: () => void;
  settings: NotifSetting[];
  loadingNotif: boolean;
  savingNotif: boolean;
  onToggle: (type: string) => void;
  onUpdateTime: (type: string, time: string) => void;
  onUpdateInterval: (type: string, minutes: number) => void;
  onSave: () => void;
}

export function NotifSettingsModal({
  show, onClose, settings, loadingNotif, savingNotif,
  onToggle, onUpdateTime, onUpdateInterval, onSave,
}: NotifSettingsModalProps) {
  if (!show) return null;
  const icons: Record<string, string> = {
    weight_reminder: 'Scale', meal_reminder: 'UtensilsCrossed', water_reminder: 'Droplets',
    motivation: 'Sparkles', weekly_report: 'BarChart3', sos_followup: 'Heart', plan_ending: 'Flag',
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
      <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Icon name="Bell" size={20} className="text-violet-600" />
              Уведомления диеты
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}><Icon name="X" size={18} /></Button>
          </div>
          {loadingNotif ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {settings.map(s => (
                <div key={s.type} className={`p-3 rounded-lg border transition-all ${s.enabled ? 'bg-violet-50/50 border-violet-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name={icons[s.type] || 'Bell'} size={16} className={s.enabled ? 'text-violet-600' : 'text-gray-400'} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <button className={`w-10 h-5 rounded-full transition-colors relative ${s.enabled ? 'bg-violet-500' : 'bg-gray-300'}`} onClick={() => onToggle(s.type)}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${s.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  {s.enabled && s.time_value !== undefined && s.type !== 'meal_reminder' && s.type !== 'sos_followup' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Время:</span>
                      <input type="time" className="text-xs border rounded px-2 py-1 w-24" value={s.time_value || ''} onChange={e => onUpdateTime(s.type, e.target.value)} />
                    </div>
                  )}
                  {s.enabled && s.type === 'water_reminder' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Каждые:</span>
                      <select className="text-xs border rounded px-2 py-1" value={s.interval_minutes || 120} onChange={e => onUpdateInterval(s.type, parseInt(e.target.value))}>
                        <option value={60}>1 час</option>
                        <option value={90}>1.5 часа</option>
                        <option value={120}>2 часа</option>
                        <option value={180}>3 часа</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Button className="w-full bg-violet-600" onClick={onSave} disabled={savingNotif}>
                  {savingNotif ? 'Сохраняю...' : 'Сохранить настройки'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
