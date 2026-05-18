import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MemoryAlbum } from './types';

interface FamilyMember {
  id: number;
  name: string;
  avatar?: string;
  relation?: string;
}

interface LifeEvent {
  id: string;
  title: string;
  date?: string;
}

interface MemoryEntryParticipantsSectionProps {
  members: FamilyMember[];
  filteredMembers: FamilyMember[];
  memberIds: number[];
  memberSearch: string;
  events: LifeEvent[];
  eventId: string | null;
  albums: MemoryAlbum[];
  albumIds: string[];
  onMemberSearch: (q: string) => void;
  onToggleMember: (id: number) => void;
  onEventChange: (id: string | null) => void;
  onAlbumToggle: (id: string, checked: boolean) => void;
}

export default function MemoryEntryParticipantsSection({
  members,
  filteredMembers,
  memberIds,
  memberSearch,
  events,
  eventId,
  albums,
  albumIds,
  onMemberSearch,
  onToggleMember,
  onEventChange,
  onAlbumToggle,
}: MemoryEntryParticipantsSectionProps) {
  return (
    <>
      {/* Люди */}
      <div>
        <Label>Кто на фото</Label>
        {members.length > 6 && (
          <Input
            value={memberSearch}
            onChange={e => onMemberSearch(e.target.value)}
            placeholder="Найти..."
            className="mt-1"
          />
        )}
        <ScrollArea className="mt-2 h-48 rounded-md border p-2">
          {filteredMembers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Никто не найден. Добавьте людей в Древо семьи.
            </p>
          ) : (
            <div className="space-y-1">
              {filteredMembers.map(m => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                >
                  <Checkbox
                    checked={memberIds.includes(m.id)}
                    onCheckedChange={() => onToggleMember(m.id)}
                  />
                  <span className="text-lg">{m.avatar || '👤'}</span>
                  <span className="text-sm">{m.name}</span>
                  {m.relation && (
                    <span className="text-xs text-muted-foreground">· {m.relation}</span>
                  )}
                </label>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Событие */}
      <div>
        <Label>Событие на Дороге жизни</Label>
        <Select
          value={eventId ?? '__none__'}
          onValueChange={v => onEventChange(v === '__none__' ? null : v)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Не привязано" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">
              <span className="text-muted-foreground">Без события</span>
            </SelectItem>
            {events.map(ev => (
              <SelectItem key={ev.id} value={ev.id}>
                {ev.title}
                {ev.date && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    · {new Date(ev.date).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Альбомы */}
      <div>
        <Label>Альбомы ({albumIds.length})</Label>
        {albums.length === 0 ? (
          <p className="mt-1 rounded-md border border-dashed bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            Альбомов пока нет. Создайте их в разделе «Альбом поколений».
          </p>
        ) : (
          <ScrollArea className="mt-1 h-32 rounded-md border p-2">
            <div className="space-y-1">
              {albums.map(a => {
                const checked = albumIds.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => onAlbumToggle(a.id, checked)}
                    />
                    <Icon name="BookHeart" size={14} className="text-amber-600" />
                    <span className="text-sm">{a.title}</span>
                  </label>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </>
  );
}
