import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { FamilyMember, AlertSetting } from '@/hooks/useFamilyTracker';

interface AlertsPanelProps {
  familyMembers: FamilyMember[];
  alertSettings: AlertSetting[];
  setAlertSettings: (settings: AlertSetting[]) => void;
  savingSettings: boolean;
  onSave: () => void;
}

export default function AlertsPanel({ familyMembers, alertSettings, setAlertSettings, savingSettings, onSave }: AlertsPanelProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={20} />
          Уведомления о зонах
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-gray-500">Выберите, за кем следить при выходе из безопасных зон</p>
        {familyMembers.map((member) => {
          const setting = alertSettings.find(s => s.member_id === member.id);
          const isEnabled = setting ? setting.alerts_enabled : true;
          const notifyIds = setting?.notify_members || [];
          return (
            <div key={member.id} className="p-3 rounded-lg border" style={{ borderColor: member.color + '60' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: member.avatar_url ? 'transparent' : member.color + '20' }}>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: member.color }}>{member.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isEnabled} onChange={(e) => {
                    const newSettings = [...alertSettings];
                    const idx = newSettings.findIndex(s => s.member_id === member.id);
                    if (idx >= 0) newSettings[idx] = { ...newSettings[idx], alerts_enabled: e.target.checked };
                    else newSettings.push({ member_id: member.id, alerts_enabled: e.target.checked, notify_members: [] });
                    setAlertSettings(newSettings);
                  }} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              {isEnabled && (
                <div className="ml-9 space-y-1">
                  <p className="text-xs text-gray-400">Кому сообщать:</p>
                  {familyMembers.filter(m => m.id !== member.id).map((recipient) => {
                    const isSelected = notifyIds.length === 0 || notifyIds.includes(recipient.id);
                    return (
                      <label key={recipient.id} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isSelected} onChange={(e) => {
                          const newSettings = [...alertSettings];
                          const idx = newSettings.findIndex(s => s.member_id === member.id);
                          const others = familyMembers.filter(m => m.id !== member.id).map(m => m.id);
                          let currentNotify = notifyIds.length === 0 ? [...others] : [...notifyIds];
                          if (e.target.checked) { if (!currentNotify.includes(recipient.id)) currentNotify.push(recipient.id); }
                          else { currentNotify = currentNotify.filter(id => id !== recipient.id); }
                          const allSelected = currentNotify.length === others.length;
                          if (idx >= 0) newSettings[idx] = { ...newSettings[idx], notify_members: allSelected ? [] : currentNotify };
                          else newSettings.push({ member_id: member.id, alerts_enabled: true, notify_members: allSelected ? [] : currentNotify });
                          setAlertSettings(newSettings);
                        }} className="w-3.5 h-3.5 rounded accent-blue-600" />
                        <span className="text-xs text-gray-600">{recipient.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <Button onClick={onSave} disabled={savingSettings} className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
          <Icon name={savingSettings ? "Loader2" : "Save"} size={16} className={`mr-2 ${savingSettings ? 'animate-spin' : ''}`} />
          {savingSettings ? 'Сохраняю...' : 'Сохранить настройки'}
        </Button>
      </CardContent>
    </Card>
  );
}
