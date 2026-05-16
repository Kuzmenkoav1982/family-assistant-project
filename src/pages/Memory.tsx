import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useMemoryEntries } from '@/components/memory/useMemoryEntries';
import MemoryCard from '@/components/memory/MemoryCard';
import MemoryEntryDialog from '@/components/memory/MemoryEntryDialog';
import MemoryEntryView from '@/components/memory/MemoryEntryView';
import type { MemoryEntry } from '@/components/memory/types';

export default function Memory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const memberIdParam = searchParams.get('memberId');
  const filterMemberId = memberIdParam ? Number(memberIdParam) : undefined;

  const { members } = useFamilyTree();
  const { entries, loading, error, reload, archive, replaceEntry } = useMemoryEntries({
    memberId: filterMemberId,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<MemoryEntry | null>(null);
  const [viewEntry, setViewEntry] = useState<MemoryEntry | null>(null);

  const filterMember = useMemo(
    () => (filterMemberId ? members.find(m => m.id === filterMemberId) : null),
    [filterMemberId, members],
  );

  useEffect(() => {
    const prev = document.title;
    document.title = filterMember
      ? `Память — ${filterMember.name}`
      : 'Альбом поколений — Наша Семья';
    return () => { document.title = prev; };
  }, [filterMember]);

  const handleSaved = (entry: MemoryEntry) => {
    if (editEntry) {
      replaceEntry(entry);
      setEditEntry(null);
    } else {
      reload();
    }
  };

  const handleArchive = async (entry: MemoryEntry) => {
    if (!confirm(`Перенести «${entry.title}» в архив?`)) return;
    await archive(entry.id);
    setViewEntry(null);
  };

  const clearFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('memberId');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Альбом поколений</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Не свалка фотографий — а осмысленная семейная память. Сохраняйте важные моменты с
            подписью и людьми, чтобы передать их детям и внукам.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg" className="shrink-0">
          <Icon name="Plus" size={18} className="mr-1.5" />
          Добавить память
        </Button>
      </header>

      {filterMember && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <Icon name="Filter" size={14} className="text-amber-700" />
          <span className="text-sm text-amber-900">Память про</span>
          <Badge variant="secondary" className="gap-1.5 bg-white">
            <span className="text-base leading-none">{filterMember.avatar || '👤'}</span>
            {filterMember.name}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 gap-1 px-2 text-xs"
            onClick={clearFilter}
          >
            <Icon name="X" size={12} />
            Сбросить
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
          <Button variant="link" size="sm" onClick={reload} className="ml-2 h-auto p-0">
            Повторить
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          filtered={Boolean(filterMember)}
          memberName={filterMember?.name}
          onAdd={() => setCreateOpen(true)}
          onClearFilter={filterMember ? clearFilter : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {entries.map(entry => (
            <MemoryCard key={entry.id} entry={entry} onClick={() => setViewEntry(entry)} />
          ))}
        </div>
      )}

      <MemoryEntryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialMemberId={filterMemberId}
        onSaved={handleSaved}
      />

      <MemoryEntryDialog
        open={Boolean(editEntry)}
        onOpenChange={open => !open && setEditEntry(null)}
        initialEntry={editEntry}
        onSaved={handleSaved}
      />

      <MemoryEntryView
        entry={viewEntry}
        open={Boolean(viewEntry)}
        onOpenChange={open => !open && setViewEntry(null)}
        onEdit={e => {
          setViewEntry(null);
          setEditEntry(e);
        }}
        onArchive={handleArchive}
      />
    </div>
  );
}

function EmptyState({
  filtered,
  memberName,
  onAdd,
  onClearFilter,
}: {
  filtered: boolean;
  memberName?: string;
  onAdd: () => void;
  onClearFilter?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-4 py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon name="BookHeart" size={40} />
      </div>
      <h2 className="text-xl font-semibold">
        {filtered && memberName
          ? `Пока нет воспоминаний про ${memberName}`
          : 'Здесь будут жить семейные моменты'}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {filtered
          ? 'Создайте первую карточку памяти — фото, дата и короткая история. Этот человек уже будет привязан.'
          : 'Добавьте первую карточку памяти: 1–10 фото, кто на них, дата и короткая история. Раз в месяц или раз в полгода — пополняйте альбом вместе с семьёй.'}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onAdd} size="lg">
          <Icon name="Plus" size={18} className="mr-1.5" />
          {filtered ? 'Добавить первое' : 'Создать первую память'}
        </Button>
        {onClearFilter && (
          <Button variant="ghost" size="lg" onClick={onClearFilter}>
            Показать все
          </Button>
        )}
      </div>
    </div>
  );
}
