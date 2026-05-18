import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  membersCount: number;
  showClanPanel: boolean;
  onToggleClan: () => void;
  onAdd: () => void;
}

export default function TreeToolbar({ membersCount, showClanPanel, onToggleClan, onAdd }: Props) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-amber-700 font-medium">
        {membersCount > 0 ? `В древе ${membersCount} чел.` : 'Начните строить историю рода'}
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="border-amber-300 text-amber-700"
          onClick={onToggleClan}
        >
          <Icon name="Users" className="mr-1" size={16} />
          Род
        </Button>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={onAdd}>
          <Icon name="Plus" className="mr-1" size={16} />
          Добавить
        </Button>
      </div>
    </div>
  );
}
