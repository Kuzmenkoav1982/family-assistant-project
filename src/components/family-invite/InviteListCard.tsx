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
          Создавайте ссылки для приглашения родственников
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
                    Нажмите кнопку «Создать приглашение» ниже. Система сгенерирует ссылку для вашего родственника.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <h5 className="font-bold text-lg">Отправьте ссылку</h5>
                  </div>
                  <p className="text-sm text-gray-700">
                    Скопируйте ссылку или поделитесь ей через мессенджер (Telegram, WhatsApp, MAX и другие).
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <h5 className="font-bold text-lg">Родственник присоединяется</h5>
                  </div>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside ml-1">
                    <li>Родственник переходит по ссылке</li>
                    <li>Входит в аккаунт или создаёт новый</li>
                    <li>Вводит своё имя и выбирает степень родства</li>
                    <li>Нажимает «Присоединиться» — и он в семье!</li>
                  </ol>
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
                    <li>Можно ограничить количество использований ссылки</li>
                    <li>Удаляйте неиспользованные приглашения для безопасности</li>
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
                      onClick={() => onCopyLink(invite.code)}
                    >
                      <Icon name="Link" size={14} />
                      Скопировать ссылку
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