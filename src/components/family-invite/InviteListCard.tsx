import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface Invite {
  id: string;
  code: string;
  max_uses: number;
  uses_count: number;
  days_valid: number;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  qr_code?: string;
}

interface InviteListCardProps {
  invites: Invite[];
  familyName: string;
  isInstructionOpen: boolean;
  onInstructionToggle: (open: boolean) => void;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
  onShare: (code: string) => void;
  onShareViaTelegram: (code: string) => void;
  onShareViaMax: (code: string) => void;
  onDelete: (inviteId: string) => void;
}

export function InviteListCard({
  invites,
  familyName,
  isInstructionOpen,
  onInstructionToggle,
  onCopyCode,
  onCopyLink,
  onShare,
  onShareViaTelegram,
  onShareViaMax,
  onDelete
}: InviteListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Users" size={24} />
          Приглашения в семью
        </CardTitle>
        <CardDescription>
          Создавайте коды для приглашения родственников
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg overflow-hidden">
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-purple-100 transition-colors">
              <div className="flex items-center gap-2">
                <Icon name="BookOpen" size={18} className="text-purple-600" />
                <h4 className="font-semibold">📖 Инструкция: Как пригласить родственников?</h4>
              </div>
              <Icon 
                name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className="text-purple-600 transition-transform"
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-6">
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
                    <h5 className="font-bold text-lg">Создайте приглашение</h5>
                  </div>
                  <p className="text-sm text-gray-700">
                    Нажмите кнопку «Создать приглашение» ниже. Вы получите уникальный код (например: ABC123).
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <h5 className="font-bold text-lg">Отправьте приглашение</h5>
                  </div>
                  <p className="text-sm text-gray-700">
                    Отправьте код или ссылку родственнику удобным способом: скопируйте, поделитесь через мессенджер или отправьте по SMS/Email.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <h5 className="font-bold text-lg">Родственник присоединяется</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">🔗 Если получил ссылку:</p>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-1">
                        <li>Откроется страница приглашения с кодом</li>
                        <li>Нужно войти в аккаунт или зарегистрироваться</li>
                        <li>Ввести своё имя и выбрать степень родства</li>
                        <li>Нажать «Присоединиться»</li>
                      </ol>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">📝 Если получил только код (ABC123):</p>
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-1">
                        <li>Зайти на сайт и войти/зарегистрироваться</li>
                        <li>Открыть меню → «Присоединиться к семье»</li>
                        <li>Ввести код, имя и степень родства</li>
                        <li>Нажать «Присоединиться»</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="CheckCircle2" size={20} className="text-green-600" />
                    <h5 className="font-bold text-green-800">Готово! 🎉</h5>
                  </div>
                  <p className="text-sm text-green-700">
                    Родственник автоматически появится в вашей семье. Вы увидите уведомление и сможете управлять правами доступа.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Info" size={18} className="text-blue-600" />
                    <h6 className="font-semibold text-blue-800">Полезные советы</h6>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                    <li>Приглашение действует 7 дней (настраивается при создании)</li>
                    <li>Можно ограничить количество использований кода</li>
                    <li>Удаляйте неиспользованные коды для безопасности</li>
                    <li>Один человек может быть только в одной семье одновременно</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="space-y-3">
          {invites.length === 0 ? (
            <p className="text-muted-foreground text-sm">Нет активных приглашений</p>
          ) : (
            invites.map(invite => (
              <Card key={invite.id} className={invite.is_expired ? 'opacity-60' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-xl">{invite.code}</span>
                        {invite.is_expired && (
                          <Badge variant="destructive">Истёк</Badge>
                        )}
                        {!invite.is_expired && invite.uses_count >= invite.max_uses && (
                          <Badge variant="secondary">Исчерпан</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Использований: {invite.uses_count} / {invite.max_uses}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Истекает: {new Date(invite.expires_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(invite.id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>

                  {invite.qr_code && (
                    <div className="mb-3 flex justify-center">
                      <img 
                        src={invite.qr_code} 
                        alt="QR код приглашения" 
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyCode(invite.code)}
                    >
                      <Icon name="Copy" size={14} />
                      Код
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyLink(invite.code)}
                    >
                      <Icon name="Link" size={14} />
                      Ссылка
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onShare(invite.code)}
                    >
                      <Icon name="Share2" size={14} />
                      Поделиться
                    </Button>

                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}