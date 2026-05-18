import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Invite { id: string; clan_name: string; invited_by_name?: string }

interface Props {
  invite: Invite;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export default function ClanInviteBanner({ invite, onAccept, onDecline }: Props) {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Mail" size={16} className="text-blue-600" />
            <span className="text-sm text-blue-800">
              Вас приглашают в род «{invite.clan_name}»
              {invite.invited_by_name && ` от ${invite.invited_by_name}`}
            </span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-7 text-xs" onClick={() => onAccept(invite.id)}>
              Принять
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onDecline(invite.id)}>
              Нет
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
