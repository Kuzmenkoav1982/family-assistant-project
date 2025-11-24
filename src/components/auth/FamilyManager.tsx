import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const INVITE_URL = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';

interface FamilyManagerProps {
  token: string;
  familyId?: string;
}

interface Invite {
  id: string;
  invite_code: string;
  max_uses: number;
  uses_count: number;
  expires_at: string;
  is_active: boolean;
}

export default function FamilyManager({ token, familyId }: FamilyManagerProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [maxUses, setMaxUses] = useState(5);
  const [daysValid, setDaysValid] = useState(7);
  const { toast } = useToast();

  const fetchInvites = async () => {
    if (!familyId) return;
    
    setLoading(true);
    try {
      const response = await fetch(INVITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ action: 'list' })
      });

      const data = await response.json();
      
      if (response.ok) {
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [familyId, token]);

  const createInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(INVITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create',
          max_uses: maxUses,
          days_valid: daysValid
        })
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать приглашение',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Приглашение создано!',
        description: `Код: ${data.invite_code}`
      });

      setShowCreateDialog(false);
      fetchInvites();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleInvite = async (inviteId: string, isActive: boolean) => {
    try {
      const response = await fetch(INVITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'toggle',
          invite_id: inviteId,
          is_active: !isActive
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: isActive ? 'Приглашение деактивировано' : 'Приглашение активировано'
        });
        fetchInvites();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус приглашения',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Скопировано!',
      description: `Код ${code} скопирован в буфер обмена`
    });
  };

  if (!familyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Управление семьей</CardTitle>
          <CardDescription>Вы не состоите ни в одной семье</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Приглашения в семью</CardTitle>
              <CardDescription>Создавайте коды для приглашения новых членов семьи</CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать приглашение
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="Loader2" size={24} className="animate-spin mx-auto mb-2" />
              Загрузка...
            </div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="UserPlus" size={48} className="mx-auto mb-4 opacity-30" />
              <p>Пока нет активных приглашений</p>
              <p className="text-sm">Создайте приглашение, чтобы пригласить новых членов семьи</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <Card key={invite.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-xl font-bold bg-blue-100 px-3 py-1 rounded">
                            {invite.invite_code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(invite.invite_code)}
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                          <Badge variant={invite.is_active ? 'default' : 'secondary'}>
                            {invite.is_active ? 'Активен' : 'Неактивен'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <Icon name="Users" size={14} className="inline mr-1" />
                            Использовано: {invite.uses_count} / {invite.max_uses}
                          </p>
                          <p>
                            <Icon name="Calendar" size={14} className="inline mr-1" />
                            Истекает: {new Date(invite.expires_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={invite.is_active ? 'destructive' : 'default'}
                        onClick={() => toggleInvite(invite.id, invite.is_active)}
                      >
                        {invite.is_active ? 'Деактивировать' : 'Активировать'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать приглашение</DialogTitle>
            <DialogDescription>
              Настройте параметры нового приглашения в семью
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Максимальное количество использований</Label>
              <Input
                id="maxUses"
                type="number"
                min={1}
                max={100}
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysValid">Срок действия (дней)</Label>
              <Input
                id="daysValid"
                type="number"
                min={1}
                max={365}
                value={daysValid}
                onChange={(e) => setDaysValid(parseInt(e.target.value) || 7)}
              />
            </div>
            <Button onClick={createInvite} disabled={loading} className="w-full">
              {loading ? (
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
              ) : (
                <Icon name="Plus" size={20} className="mr-2" />
              )}
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
