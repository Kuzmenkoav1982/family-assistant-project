import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ClanFamily { id: string; status: 'active' | 'pending'; role?: string; user_name?: string; user_email?: string }
interface ClanInvite { id: string; clan_name: string; invited_by_name?: string }
interface Clan { name: string; role: string }

interface Props {
  clan: Clan | null;
  families: ClanFamily[];
  invites: ClanInvite[];
  clanName: string;
  setClanName: (v: string) => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  saving: boolean;
  onClose: () => void;
  onCreateClan: () => void;
  onAcceptInvite: (id: string) => void;
  onDeclineInvite: (id: string) => void;
  onInviteByEmail: () => void;
}

export default function ClanPanel({
  clan, families, invites,
  clanName, setClanName,
  inviteEmail, setInviteEmail,
  saving, onClose,
  onCreateClan, onAcceptInvite, onDeclineInvite, onInviteByEmail,
}: Props) {
  const activeFamilies = families.filter(f => f.status === 'active');
  const pendingFamilies = families.filter(f => f.status === 'pending');

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
      <CardContent className="py-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <Icon name="Crown" size={18} className="text-amber-600" />
            {clan ? clan.name : 'Общий род'}
          </h3>
          <button onClick={onClose} className="text-amber-400 hover:text-amber-600">
            <Icon name="X" size={18} />
          </button>
        </div>

        {!clan ? (
          <div className="space-y-3">
            <p className="text-sm text-amber-700">Создайте общий род, чтобы родственники из других семей видели и дополняли одно древо.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Название рода (напр. Кузьменко)"
                value={clanName}
                onChange={e => setClanName(e.target.value)}
                className="flex-1"
              />
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                disabled={!clanName.trim() || saving}
                onClick={onCreateClan}
              >
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Создать'}
              </Button>
            </div>

            {invites.length > 0 && (
              <div className="space-y-2 border-t border-amber-200 pt-3">
                <p className="text-sm font-medium text-amber-800">Приглашения:</p>
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-amber-100">
                    <div>
                      <p className="text-sm font-medium">{inv.clan_name}</p>
                      {inv.invited_by_name && <p className="text-xs text-muted-foreground">от {inv.invited_by_name}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-7 text-xs" onClick={() => onAcceptInvite(inv.id)}>Принять</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onDeclineInvite(inv.id)}>Отклонить</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} className="text-amber-600" />
              <span className="text-sm text-amber-800">
                {activeFamilies.length} {(() => {
                  const n = activeFamilies.length;
                  if (n === 1) return 'семья';
                  if (n >= 2 && n <= 4) return 'семьи';
                  return 'семей';
                })()} в роду
              </span>
            </div>

            <div className="space-y-1">
              {activeFamilies.map(f => (
                <div key={f.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-amber-100">
                  <Icon name="Home" size={14} className="text-amber-500" />
                  <span className="text-sm">{f.user_name || f.user_email || 'Семья'}</span>
                  {f.role === 'owner' && <Badge className="bg-amber-500 text-white text-[10px] px-1 py-0 ml-auto">Создатель</Badge>}
                </div>
              ))}
              {pendingFamilies.map(f => (
                <div key={f.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 opacity-60">
                  <Icon name="Clock" size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{f.user_name || f.user_email || 'Семья'}</span>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">Ожидает</Badge>
                </div>
              ))}
            </div>

            {clan.role === 'owner' && (
              <div className="border-t border-amber-200 pt-3">
                <p className="text-sm font-medium text-amber-800 mb-2">Пригласить родственника</p>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Email родственника"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    className="bg-amber-600 hover:bg-amber-700"
                    disabled={!inviteEmail.trim() || saving}
                    onClick={onInviteByEmail}
                  >
                    <Icon name="Send" size={16} />
                  </Button>
                </div>
                <p className="text-[10px] text-amber-600 mt-1">Родственник должен быть зарегистрирован в приложении</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
