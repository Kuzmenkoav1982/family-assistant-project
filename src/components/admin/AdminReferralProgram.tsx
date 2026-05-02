import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API = 'https://functions.poehali.dev/f7e5b7b2-225c-43f5-b399-5b5201594228';

interface Settings {
  is_enabled: boolean;
  reward_inviter_on_signup: number;
  reward_inviter_on_active: number;
  reward_invitee_welcome: number;
  rating_bonus_percent: number;
  active_min_members: number;
  active_min_progress: number;
  active_window_days: number;
  max_rewards_per_inviter: number;
}

interface Invite {
  id: string;
  status: string;
  code: string;
  inviter_family_name?: string | null;
  invitee_family_name?: string | null;
  signed_up_at?: string | null;
  activated_at?: string | null;
  signup_reward_amount?: number;
  active_reward_amount?: number;
  is_fraud?: boolean;
  fraud_reason?: string | null;
  created_at?: string | null;
}

interface Props {
  adminToken: string;
}

const defaultSettings: Settings = {
  is_enabled: true,
  reward_inviter_on_signup: 500,
  reward_inviter_on_active: 1500,
  reward_invitee_welcome: 300,
  rating_bonus_percent: 10,
  active_min_members: 3,
  active_min_progress: 30,
  active_window_days: 7,
  max_rewards_per_inviter: 50,
};

export default function AdminReferralProgram({ adminToken }: Props) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [checkingActivation, setCheckingActivation] = useState(false);

  const headers = {
    'X-Admin-Token': adminToken,
    'Content-Type': 'application/json',
  };

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const r = await fetch(`${API}?action=settings`, {
        headers: { 'X-Admin-Token': adminToken },
      });
      if (r.ok) {
        const j = await r.json();
        setSettings({ ...defaultSettings, ...(j.settings || j) });
      }
    } catch {
      // silent
    } finally {
      setSettingsLoading(false);
    }
  }, [adminToken]);

  const loadInvites = useCallback(async () => {
    setInvitesLoading(true);
    try {
      const r = await fetch(`${API}?action=admin_invites&limit=200`, {
        headers: { 'X-Admin-Token': adminToken },
      });
      if (r.ok) {
        const j = await r.json();
        setInvites(j.invites || j || []);
      } else {
        setInvites([]);
      }
    } catch {
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    loadSettings();
    loadInvites();
  }, [loadSettings, loadInvites]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const r = await fetch(`${API}?action=update_settings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(settings),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success !== false) {
        toast({ title: 'Настройки сохранены' });
      } else {
        toast({ title: 'Ошибка', description: j.error || 'Не удалось', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    } finally {
      setSavingSettings(false);
    }
  };

  const checkActivation = async () => {
    setCheckingActivation(true);
    try {
      const r = await fetch(`${API}?action=check_activation`, {
        method: 'POST',
        headers,
        body: '{}',
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        toast({
          title: 'Проверка завершена',
          description: j.activated ? `Активировано: ${j.activated}` : undefined,
        });
        loadInvites();
      } else {
        toast({ title: 'Ошибка', description: j.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    } finally {
      setCheckingActivation(false);
    }
  };

  const markFraud = async (inv: Invite) => {
    const reason = prompt('Причина пометки как фрод:');
    if (!reason) return;
    try {
      const r = await fetch(`${API}?action=mark_fraud`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ invite_id: inv.id, reason }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        toast({ title: 'Помечено как фрод' });
        loadInvites();
      } else {
        toast({ title: 'Ошибка', description: j.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', variant: 'destructive' });
    }
  };

  const filteredInvites =
    filter === 'all'
      ? invites
      : filter === 'fraud'
        ? invites.filter((i) => i.is_fraud || i.status === 'fraud')
        : invites.filter((i) => i.status === filter);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-700',
      signed_up: 'bg-blue-100 text-blue-700',
      activated: 'bg-green-100 text-green-700',
      fraud: 'bg-red-100 text-red-700',
    };
    return map[s] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-4">
      {/* Settings */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Настройки программы
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {settingsLoading ? (
            <div className="flex justify-center py-6">
              <Icon name="Loader2" className="animate-spin" size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-sm font-semibold">Программа включена</Label>
                  <p className="text-xs text-slate-500">Если выключена — новые рефералы не работают</p>
                </div>
                <Switch
                  checked={settings.is_enabled}
                  onCheckedChange={(v) => setSettings({ ...settings, is_enabled: v })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Награда пригласившему за регистрацию (₽)</Label>
                  <Input
                    type="number"
                    value={settings.reward_inviter_on_signup}
                    onChange={(e) =>
                      setSettings({ ...settings, reward_inviter_on_signup: +e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Награда пригласившему за активацию (₽)</Label>
                  <Input
                    type="number"
                    value={settings.reward_inviter_on_active}
                    onChange={(e) =>
                      setSettings({ ...settings, reward_inviter_on_active: +e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Приветственный бонус новичку (₽)</Label>
                  <Input
                    type="number"
                    value={settings.reward_invitee_welcome}
                    onChange={(e) =>
                      setSettings({ ...settings, reward_invitee_welcome: +e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Бонус к рейтингу (%)</Label>
                  <Input
                    type="number"
                    value={settings.rating_bonus_percent}
                    onChange={(e) =>
                      setSettings({ ...settings, rating_bonus_percent: +e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="text-xs uppercase tracking-wider text-slate-500 pt-2">
                Условия активации
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Мин. членов семьи</Label>
                  <Input
                    type="number"
                    value={settings.active_min_members}
                    onChange={(e) =>
                      setSettings({ ...settings, active_min_members: +e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Мин. прогресс (%)</Label>
                  <Input
                    type="number"
                    value={settings.active_min_progress}
                    onChange={(e) =>
                      setSettings({ ...settings, active_min_progress: +e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Окно активации (дн)</Label>
                  <Input
                    type="number"
                    value={settings.active_window_days}
                    onChange={(e) =>
                      setSettings({ ...settings, active_window_days: +e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Макс. наград на одного приглашающего</Label>
                <Input
                  type="number"
                  value={settings.max_rewards_per_inviter}
                  onChange={(e) =>
                    setSettings({ ...settings, max_rewards_per_inviter: +e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? (
                    <>
                      <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                      Сохраняю...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={14} className="mr-1.5" />
                      Сохранить
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invites */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="UserPlus" size={16} />
              Приглашения ({invites.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={checkActivation}
                disabled={checkingActivation}
              >
                {checkingActivation ? (
                  <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                ) : (
                  <Icon name="PlayCircle" size={12} className="mr-1" />
                )}
                Проверить активацию
              </Button>
              <Button size="sm" variant="outline" onClick={loadInvites}>
                <Icon name="RefreshCcw" size={12} className="mr-1" />
                Обновить
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex gap-2 mb-3 flex-wrap">
            {([
              { v: 'all', l: 'Все' },
              { v: 'pending', l: 'Ожидают' },
              { v: 'signed_up', l: 'Зарегистрировались' },
              { v: 'activated', l: 'Активированы' },
              { v: 'fraud', l: 'Фрод' },
            ] as const).map((f) => (
              <Button
                key={f.v}
                size="sm"
                variant={filter === f.v ? 'default' : 'outline'}
                onClick={() => setFilter(f.v)}
              >
                {f.l}
              </Button>
            ))}
          </div>

          {invitesLoading ? (
            <div className="flex justify-center py-10">
              <Icon name="Loader2" className="animate-spin" size={24} />
            </div>
          ) : filteredInvites.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-40" />
              Нет приглашений
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-2 px-2">Дата</th>
                    <th className="py-2 px-2">Код</th>
                    <th className="py-2 px-2">Пригласил</th>
                    <th className="py-2 px-2">Приглашён</th>
                    <th className="py-2 px-2">Статус</th>
                    <th className="py-2 px-2">Бонусы</th>
                    <th className="py-2 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvites.map((inv) => {
                    const date =
                      inv.activated_at || inv.signed_up_at || inv.created_at;
                    const fraud = inv.is_fraud || inv.status === 'fraud';
                    return (
                      <tr key={inv.id} className="border-b hover:bg-slate-50">
                        <td className="py-2 px-2 whitespace-nowrap text-slate-500">
                          {date ? new Date(date).toLocaleDateString('ru-RU') : '—'}
                        </td>
                        <td className="py-2 px-2">
                          <code className="font-mono">{inv.code || '—'}</code>
                        </td>
                        <td className="py-2 px-2 max-w-[150px] truncate">
                          {inv.inviter_family_name || '—'}
                        </td>
                        <td className="py-2 px-2 max-w-[150px] truncate">
                          {inv.invitee_family_name || '—'}
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <Badge className={`text-[10px] ${statusBadge(inv.status)}`}>
                              {inv.status}
                            </Badge>
                            {fraud && (
                              <Icon name="ShieldAlert" size={12} className="text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          {(inv.signup_reward_amount || 0) > 0 && (
                            <span className="text-blue-600">
                              +{inv.signup_reward_amount}₽
                            </span>
                          )}
                          {(inv.active_reward_amount || 0) > 0 && (
                            <span className="text-green-600 ml-1">
                              +{inv.active_reward_amount}₽
                            </span>
                          )}
                          {!inv.signup_reward_amount && !inv.active_reward_amount && '—'}
                        </td>
                        <td className="py-2 px-2">
                          {!fraud && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markFraud(inv)}
                              title="Пометить как фрод"
                            >
                              <Icon name="ShieldAlert" size={12} className="text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
