import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Props {
  viewMode: 'parent' | 'child';
  onChange: (mode: 'parent' | 'child') => void;
}

export default function ViewModeSwitcher({ viewMode, onChange }: Props) {
  return (
    <div className="flex items-center justify-end mb-4">
      <div className="flex gap-2 z-50 flex-wrap justify-end">
        <Button
          variant={viewMode === 'parent' ? 'default' : 'outline'}
          onClick={() => onChange('parent')}
          className="gap-2 shadow-lg text-sm px-3 py-2 whitespace-nowrap"
        >
          <Icon name="BarChart3" size={16} />
          <span className="hidden sm:inline">Родительский режим</span>
          <span className="sm:hidden">Родитель</span>
        </Button>
        <Button
          variant={viewMode === 'child' ? 'default' : 'outline'}
          onClick={() => onChange('child')}
          className="gap-2 shadow-lg text-sm px-3 py-2 whitespace-nowrap"
        >
          <Icon name="Smile" size={16} />
          <span className="hidden sm:inline">Детский режим</span>
          <span className="sm:hidden">Детский</span>
        </Button>
      </div>
    </div>
  );
}
