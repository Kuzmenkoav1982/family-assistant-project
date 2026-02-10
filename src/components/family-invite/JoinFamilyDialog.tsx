import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const RELATIONSHIPS = [
  'Отец', 'Мать', 'Сын', 'Дочь',
  'Муж', 'Жена', 
  'Дедушка', 'Бабушка', 'Внук', 'Внучка',
  'Брат', 'Сестра',
  'Дядя', 'Тётя', 'Племянник', 'Племянница',
  'Двоюродный брат', 'Двоюродная сестра',
  'Другое'
];

interface JoinFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  initialCode?: string;
  onJoin: (data: {
    inviteCode: string;
    memberName: string;
    relationship: string;
    customRelationship: string;
  }) => Promise<void>;
}

export function JoinFamilyDialog({ 
  open, 
  onOpenChange, 
  isLoading, 
  initialCode = '',
  onJoin 
}: JoinFamilyDialogProps) {
  const [inviteCode, setInviteCode] = useState(initialCode);
  const [memberName, setMemberName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');

  const handleJoin = async () => {
    await onJoin({
      inviteCode,
      memberName,
      relationship,
      customRelationship
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Icon name="UserPlus" size={16} />
          Присоединиться к семье
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Присоединиться к семье</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="inviteCode">Код приглашения</Label>
            <Input
              id="inviteCode"
              placeholder="ABC123"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
          <div>
            <Label htmlFor="memberName">Ваше имя</Label>
            <Input
              id="memberName"
              placeholder="Иван"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="relationship">Кем вы приходитесь</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите родство" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map(rel => (
                  <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {relationship === 'Другое' && (
            <div>
              <Label htmlFor="customRelationship">Укажите родство</Label>
              <Input
                id="customRelationship"
                placeholder="Например: Крёстный"
                value={customRelationship}
                onChange={(e) => setCustomRelationship(e.target.value)}
              />
            </div>
          )}
          <Button 
            onClick={handleJoin} 
            disabled={isLoading || !inviteCode || !memberName || !relationship}
            className="w-full"
          >
            {isLoading ? 'Присоединение...' : 'Присоединиться'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
