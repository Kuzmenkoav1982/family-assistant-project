import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useMemoryPageState } from '@/components/memory/useMemoryPageState';
import MemoryCard from '@/components/memory/MemoryCard';
import MemoryAlbumDialog from '@/components/memory/MemoryAlbumDialog';
import MemoryEntryDialog from '@/components/memory/MemoryEntryDialog';
import MemoryEntryView from '@/components/memory/MemoryEntryView';
import BulkAddToAlbumDialog from '@/components/memory/BulkAddToAlbumDialog';
import SelectAlbumCoverDialog from '@/components/memory/SelectAlbumCoverDialog';
import MemoryFiltersBar from '@/components/memory/MemoryFiltersBar';
import MemoryAlbumShelf from '@/components/memory/MemoryAlbumShelf';
import MemoryAlbumHeader from '@/components/memory/MemoryAlbumHeader';
import MemoryEmptyState from '@/components/memory/MemoryEmptyState';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { resolveAlbumCover } from '@/components/memory/coverResolver';

export default function Memory() {
  const p = useMemoryPageState();

  return (
    <SectionPageFrame
      title="Альбом поколений"
      subtitle="Осмысленная семейная память для детей и внуков"
      backPath="/family-hub"
      imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/7caf5914-dd0e-49ba-830b-c44b378c04ae.jpg"
      backgroundClass="bg-gradient-to-b from-violet-50 via-purple-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
      rightAction={
        <Button
          onClick={() => p.setCreateOpen(true)}
          size="sm"
          className="bg-white text-violet-700 hover:bg-white/90 shadow-lg"
        >
          <Icon name="Plus" size={16} className="mr-1.5" />
          Добавить
        </Button>
      }
    >

      <div className="mb-4">
        <HubInstructionBlock
          accent="violet"
          intro="Альбом поколений — третий слой семейного кода. Древо отвечает «кто мы», Дорога жизни — «что мы прошли», а Альбом — «что мы чувствовали». Через 30 лет внуки откроют профиль прабабушки и увидят живые мгновения."
          steps={[
            { number: 1, title: 'Добавьте память', description: 'Загрузите до 10 фото, напишите историю, поставьте дату и место — это превращает снимок в свидетельство эпохи.' },
            { number: 2, title: 'Свяжите с Древом', description: 'Отметьте, кто на фото. Память автоматически появится в карточке каждого человека в Древе семьи.' },
            { number: 3, title: 'Привяжите к Дороге жизни', description: 'Выберите событие — память встанет на свою точку на Дороге жизни и обогатит общую хронику семьи.' },
            { number: 4, title: 'Соберите альбом', description: 'Группируйте карточки в тематические альбомы: «Лето на даче», «Школа», «90-е». Готовая глава вашей истории.' },
            { number: 5, title: 'Находите за секунды', description: 'Фильтры по человеку, событию, году и полнотекстовый поиск — найдёте нужный момент даже через 20 лет.' },
          ]}
          tips={[
            { text: 'Память хранится приватно — доступна только членам вашей семьи.' },
            { text: 'Архив скрывает карточку из ленты, но связи с Древом и Дорогой жизни сохраняются навсегда.' },
          ]}
        />

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/tree" className="group relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-green-950/30 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name="GitBranch" size={22} className="text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Связанный раздел</span>
                </div>
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-50 leading-tight">Древо семьи</h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed mt-1">Отметьте людей на фото — и память появится в карточке каждого из них.</p>
              </div>
              <Icon name="ArrowRight" size={18} className="text-emerald-600 dark:text-emerald-300 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link to="/life-road" className="group relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-red-950/30 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name="Milestone" size={22} className="text-amber-600 dark:text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Связанный раздел</span>
                </div>
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-50 leading-tight">Дорога жизни</h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed mt-1">Привяжите фото к событию — и оно встанет на свою точку семейной хроники.</p>
              </div>
              <Icon name="ArrowRight" size={18} className="text-amber-600 dark:text-amber-300 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>

      {p.showAlbumShelf && (
        <div className="mb-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/40 dark:from-violet-950/20 dark:via-gray-900 dark:to-fuchsia-950/20 dark:border-violet-900/40 p-4 sm:p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Icon name="FolderHeart" size={16} className="text-violet-600 dark:text-violet-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-violet-900 dark:text-violet-100">Альбомы</h2>
              <p className="text-[11px] text-violet-700/70 dark:text-violet-300/70">Тематические подборки воспоминаний</p>
            </div>
          </div>
          <MemoryAlbumShelf
            albums={p.albums}
            entries={p.entries}
            loading={p.albumsLoading}
            onOpen={p.openAlbum}
            onCreate={() => { p.setEditingAlbum(null); p.setAlbumDialogOpen(true); }}
          />
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <Icon name="SlidersHorizontal" size={16} className="text-sky-600 dark:text-sky-300" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Поиск и фильтры</h2>
            <p className="text-[11px] text-muted-foreground">Найдите момент по человеку, событию или году</p>
          </div>
        </div>
        <MemoryFiltersBar
          q={p.filterQ ?? ''}
          memberId={p.filterMemberId}
          eventId={p.filterEventId}
          year={p.filterYear}
          sort={p.sortParam}
          years={p.yearsAvailable}
          members={p.memberOptions}
          events={p.eventOptions}
          hasAny={p.hasAnyOrAlbum || p.sortParam !== p.DEFAULT_SORT}
          onChangeQ={v => p.updateParam('q', v)}
          onChangeMember={v => p.updateParam('memberId', v != null ? String(v) : undefined)}
          onChangeEvent={v => p.updateParam('eventId', v)}
          onChangeYear={v => p.updateParam('year', v != null ? String(v) : undefined)}
          onChangeSort={v => p.updateParam('sort', v === p.DEFAULT_SORT ? undefined : v)}
          onResetAll={p.resetAllFilters}
        />
      </div>

      {p.filterAlbum && (
        <MemoryAlbumHeader
          album={p.filterAlbum}
          coverUrl={resolveAlbumCover(p.filterAlbum, p.entries)}
          canSelect={p.entries.length > 0}
          onClear={p.clearFilter}
          onEdit={() => { p.setEditingAlbum(p.filterAlbum); p.setAlbumDialogOpen(true); }}
          onArchive={p.handleArchiveAlbum}
          onBulkAdd={() => p.setBulkAddOpen(true)}
          onPickCover={() => p.setCoverDialogOpen(true)}
          onStartSelection={() => p.setSelectionMode(true)}
        />
      )}

      {p.error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {p.error}
          <Button variant="link" size="sm" onClick={p.reload} className="ml-2 h-auto p-0">
            Повторить
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center">
              <Icon name="Images" size={16} className="text-pink-600 dark:text-pink-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Воспоминания</h2>
              <p className="text-[11px] text-muted-foreground">
                {p.loading ? 'Загружаем…' : `Всего карточек: ${p.entries.length}`}
              </p>
            </div>
          </div>
        </div>

        {p.loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
            ))}
          </div>
        ) : p.entries.length === 0 ? (
          <MemoryEmptyState
            filterKind={
              p.hasAnyFilter ? 'search'
                : p.filterMember ? 'member'
                : p.filterEvent ? 'event'
                : p.filterAlbum ? 'album'
                : null
            }
            filterLabel={p.filterMember?.name || p.filterEvent?.title || p.filterAlbum?.title}
            onAdd={() => p.setCreateOpen(true)}
            onBulkAdd={p.filterAlbum ? () => p.setBulkAddOpen(true) : undefined}
            onClearFilter={p.hasFilter || p.hasAnyFilter ? p.resetAllFilters : undefined}
          />
        ) : (
          <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 ${p.selectionMode ? 'pb-24' : ''}`}>
            {p.entries.map(entry => (
              <MemoryCard
                key={entry.id}
                entry={entry}
                selectable={p.selectionMode}
                selected={p.selectedIds.has(entry.id)}
                onClick={() => p.selectionMode ? p.toggleSelect(entry.id) : p.setViewEntry(entry)}
              />
            ))}
          </div>
        )}
      </div>

      <MemoryEntryDialog
        open={p.createOpen}
        onOpenChange={p.setCreateOpen}
        initialMemberId={p.filterMemberId}
        initialEventId={p.filterEventId}
        initialAlbumId={p.filterAlbumId}
        suggestedTitle={p.filterEvent?.title}
        suggestedDate={p.filterEvent?.date}
        onSaved={p.handleSaved}
      />

      <MemoryEntryDialog
        open={Boolean(p.editEntry)}
        onOpenChange={open => !open && p.setEditEntry(null)}
        initialEntry={p.editEntry}
        onSaved={p.handleSaved}
      />

      <MemoryEntryView
        entry={p.viewEntry}
        open={Boolean(p.viewEntry)}
        onOpenChange={open => !open && p.setViewEntry(null)}
        onEdit={e => { p.setViewEntry(null); p.setEditEntry(e); }}
        onArchive={p.filterAlbum ? p.handleRemoveFromAlbum : p.handleArchive}
        removeFromAlbumMode={Boolean(p.filterAlbum)}
      />

      <MemoryAlbumDialog
        open={p.albumDialogOpen}
        onOpenChange={open => { p.setAlbumDialogOpen(open); if (!open) p.setEditingAlbum(null); }}
        initialAlbum={p.editingAlbum}
        onSaved={() => p.reloadAlbums()}
      />

      <BulkAddToAlbumDialog
        open={p.bulkAddOpen}
        onOpenChange={p.setBulkAddOpen}
        album={p.filterAlbum || null}
        excludeEntryIds={new Set(p.entries.map(e => e.id))}
        onAdded={() => { p.reload(); p.reloadAlbums(); }}
      />

      <SelectAlbumCoverDialog
        open={p.coverDialogOpen}
        onOpenChange={p.setCoverDialogOpen}
        album={p.filterAlbum || null}
        onSaved={() => p.reloadAlbums()}
      />

      {p.selectionMode && p.filterAlbum && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
            <div className="text-sm">
              <span className="font-medium">Выбрано: {p.selectedIds.size}</span>
              <span className="ml-2 hidden text-muted-foreground sm:inline">
                в альбоме «{p.filterAlbum.title}»
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={p.exitSelectionMode} disabled={p.bulkRemoving}>
                Снять выбор
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={p.handleBulkRemove}
                disabled={p.selectedIds.size === 0 || p.bulkRemoving}
              >
                {p.bulkRemoving ? (
                  <>
                    <Icon name="Loader2" size={14} className="mr-1.5 animate-spin" />
                    Убираем...
                  </>
                ) : (
                  <>
                    <Icon name="FolderMinus" size={14} className="mr-1.5" />
                    Убрать из альбома{p.selectedIds.size > 0 ? ` (${p.selectedIds.size})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SectionPageFrame>
  );
}