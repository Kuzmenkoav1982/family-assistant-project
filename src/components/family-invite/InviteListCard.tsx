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
                  <p className="text-sm text-gray-700 mb-3">
                    Нажмите кнопку "Создать приглашение" ниже. Вы получите уникальный код (например: ABC123) и QR-код.
                  </p>
                  <img 
                    src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a6b6eab2-d66b-46a5-81aa-c9c159310e3e.jpg"
                    alt="Экран с QR-кодом и кнопками отправки"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200 my-3"
                  />
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <h5 className="font-bold text-lg">Отправьте приглашение</h5>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">Выберите удобный способ:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Icon name="MessageCircle" size={16} className="text-blue-500 mt-0.5" />
                      <span><strong>Telegram / Max:</strong> Кнопка с логотипом откроет мессенджер со ссылкой</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Share2" size={16} className="text-green-500 mt-0.5" />
                      <span><strong>Поделиться:</strong> Системное меню для отправки в любое приложение</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Copy" size={16} className="text-orange-500 mt-0.5" />
                      <span><strong>Скопировать код/ссылку:</strong> Отправьте через WhatsApp, Email или SMS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="QrCode" size={16} className="text-purple-500 mt-0.5" />
                      <span><strong>QR-код:</strong> Покажите экран для сканирования камерой телефона</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">3</div>
                    <h5 className="font-bold text-lg">Родственник присоединяется</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">🔗 Если получил ссылку / отсканировал QR:</p>
                      <p className="text-sm text-gray-700">Откроется страница с автозаполненным кодом. Нужно только ввести имя и степень родства.</p>
                      <img 
                        src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/f04d46b4-a8c4-40dc-870d-f9f9e0f8efed.jpg"
                        alt="Форма присоединения с автозаполненным кодом"
                        className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200 my-3"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">📝 Если получил только код (ABC123):</p>
                      <p className="text-sm text-gray-700">На главной странице → "Присоединиться к семье" → ввести код, имя и родство.</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0088cc] text-white hover:bg-[#0077b3] border-[#0088cc]"
                      onClick={() => onShareViaTelegram(invite.code)}
                    >
                      <Icon name="Send" size={14} />
                      Telegram
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#0077FF] text-white hover:bg-[#0066DD] border-[#0077FF]"
                      onClick={() => onShareViaMax(invite.code)}
                    >
                      <Icon name="MessageCircle" size={14} />
                      Max
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
