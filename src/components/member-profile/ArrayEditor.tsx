import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { MemberProfile } from '@/types/family.types';

interface ArrayEditorProps {
  label: string;
  placeholder: string;
  field: keyof MemberProfile;
  inputValue: string;
  setInputValue: (v: string) => void;
  items: string[];
  onAdd: (field: keyof MemberProfile, value: string, setter: (v: string) => void) => void;
  onRemove: (field: keyof MemberProfile, index: number) => void;
  badgeClassName?: string;
}

export function ArrayEditor({
  label,
  placeholder,
  field,
  inputValue,
  setInputValue,
  items,
  onAdd,
  onRemove,
  badgeClassName = 'bg-green-50',
}: ArrayEditorProps) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 mb-1">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAdd(field, inputValue, setInputValue)}
        />
        <Button size="sm" onClick={() => onAdd(field, inputValue, setInputValue)}>
          <Icon name="Plus" size={16} />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-2">💡 Введите текст и нажмите + или Enter. Можно через запятую добавить сразу несколько</p>
      <div className="flex flex-wrap gap-2">
        {(items || []).map((item, i) => (
          <Badge key={i} variant="outline" className={badgeClassName}>
            {item}
            <button onClick={() => onRemove(field, i)} className="ml-2">×</button>
          </Badge>
        ))}
      </div>
    </div>
  );
}
