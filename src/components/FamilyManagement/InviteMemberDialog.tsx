import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type Role } from '@/utils/permissions';

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onInviteSent: () => void;
  familyId: string;
}

export default function InviteMemberDialog({
  open,
  onClose,
  onInviteSent,
  familyId,
}: InviteMemberDialogProps) {
  const [inviteType, setInviteType] = useState<'email' | 'sms' | 'link'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (inviteType === 'email' && !email) {
      setError('Введите email');
      return;
    }

    if (inviteType === 'sms' && !phone) {
      setError('Введите номер телефона');
      return;
    }

    try {
      setLoading(true);

      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const inviteValue = inviteType === 'email' ? email : inviteType === 'sms' ? phone : 'link';

      const response = await fetch('https://functions.yandexcloud.net/d4e2gq97vqd2kh0r5aj5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('authToken') || '',
        },
        body: JSON.stringify({
          action: 'create',
          max_uses: 1,
          days_valid: 7,
          role: selectedRole,
          invite_type: inviteType,
          invite_value: inviteValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания приглашения');
      }

      const data = await response.json();

      if (inviteType === 'link') {
        const link = `${window.location.origin}/invite/${data.invite?.code || token}`;
        setGeneratedLink(link);
        setSuccess('Ссылка-приглашение создана!');
      } else if (inviteType === 'email') {
        setSuccess(`Приглашение отправлено на ${email}`);
      } else {
        setSuccess(`SMS отправлена на ${phone}`);
      }

      setTimeout(() => {
        if (inviteType !== 'link') {
          onInviteSent();
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error('Error creating invite:', err);
      setError('Не удалось создать приглашение');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setSuccess('Ссылка скопирована!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Пригласить участника</DialogTitle>
          <DialogDescription>
            Отправьте приглашение новому участнику семьи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Роль участника</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <span>{ROLE_LABELS[role]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </p>
          </div>

          <Tabs value={inviteType} onValueChange={(v) => setInviteType(v as 'email' | 'sms' | 'link')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email">
                <Icon name="Mail" className="mr-2 h-4 w-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="link">
                <Icon name="Link" className="mr-2 h-4 w-4" />
                Ссылка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email адрес</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  На указанный email будет отправлено письмо с приглашением
                </p>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  На указанный номер будет отправлена SMS с кодом приглашения
                </p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4">
              {generatedLink ? (
                <div className="space-y-4">
                  <Alert>
                    <Icon name="CheckCircle2" className="h-4 w-4" />
                    <AlertDescription>
                      Ссылка создана! Отправьте её участнику любым удобным способом.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Input value={generatedLink} readOnly className="font-mono text-sm" />
                    <Button onClick={copyToClipboard} variant="outline">
                      <Icon name="Copy" className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(`https://wa.me/?text=${encodeURIComponent(generatedLink)}`, '_blank');
                      }}
                    >
                      <Icon name="MessageCircle" className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(generatedLink)}`, '_blank');
                      }}
                    >
                      <Icon name="Send" className="mr-2 h-4 w-4" />
                      Telegram
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Icon name="Link" className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    Создайте универсальную ссылку-приглашение
                  </p>
                  <Badge variant="outline">Ссылка действует 7 дней</Badge>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive">
              <Icon name="AlertCircle" className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <Icon name="CheckCircle2" className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Закрыть
            </Button>
            {(!generatedLink || inviteType !== 'link') && (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
