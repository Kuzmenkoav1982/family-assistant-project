import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import Icon from '@/components/ui/icon';
import { menuSections, GROUPS, type MenuItem } from '@/components/layout/sidebar.config';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useRecipes } from '@/hooks/useRecipes';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchEntry {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  path: string;
  groupKey: string;
  badge?: string;
  keywords: string;
}

const QUICK_LINKS: Omit<SearchEntry, 'keywords'>[] = [
  { id: 'q:memory', label: 'Альбом поколений', icon: 'Images', path: '/memory', groupKey: 'Быстрые' },
  { id: 'q:notifications', label: 'Уведомления', icon: 'Bell', path: '/notifications', groupKey: 'Быстрые' },
  { id: 'q:settings', label: 'Настройки', icon: 'Settings', path: '/settings', groupKey: 'Быстрые' },
  { id: 'q:wallet', label: 'Кошелёк сервиса', icon: 'Wallet', path: '/wallet', groupKey: 'Быстрые' },
  { id: 'q:support', label: 'Поддержка', icon: 'LifeBuoy', path: '/support', groupKey: 'Быстрые' },
  { id: 'q:blog', label: 'Блог', icon: 'BookOpen', path: '/blog', groupKey: 'Быстрые' },
];

const GROUP_META: Record<string, { title: string; icon: string; color: string }> = {
  'Разделы': { title: 'Разделы',        icon: 'LayoutGrid',  color: 'text-violet-600' },
  'Люди':    { title: 'Члены семьи',    icon: 'Users',       color: 'text-blue-600' },
  'События': { title: 'События',        icon: 'Calendar',    color: 'text-indigo-600' },
  'Задачи':  { title: 'Задачи',         icon: 'CheckSquare', color: 'text-emerald-600' },
  'Рецепты': { title: 'Рецепты',        icon: 'ChefHat',     color: 'text-amber-600' },
  'Быстрые': { title: 'Быстрые ссылки', icon: 'Zap',         color: 'text-pink-600' },
};

function useStaticEntries(): SearchEntry[] {
  return useMemo(() => {
    const groupTitleById = Object.fromEntries(GROUPS.map(g => [g.id, g.title]));
    const all: SearchEntry[] = [];
    for (const section of menuSections) {
      const groupTitle = groupTitleById[section.group] || '';
      for (const item of section.items as MenuItem[]) {
        if (!item.path) continue;
        all.push({
          id: `sec:${section.id}:${item.id}`,
          label: item.label,
          sublabel: `${section.title} · ${groupTitle}`,
          icon: item.icon,
          path: item.path,
          groupKey: 'Разделы',
          badge: item.badge,
          keywords: `${item.label} ${section.title} ${groupTitle}`.toLowerCase(),
        });
      }
      if (section.hubPath) {
        all.push({
          id: `hub:${section.id}`,
          label: section.title,
          sublabel: `Хаб · ${groupTitle}`,
          icon: section.icon,
          path: section.hubPath,
          groupKey: 'Разделы',
          badge: section.topBadge,
          keywords: `${section.title} ${groupTitle} хаб раздел`.toLowerCase(),
        });
      }
    }
    for (const ql of QUICK_LINKS) {
      if (!all.find(e => e.path === ql.path)) {
        all.push({ ...ql, keywords: `${ql.label} быстрая ссылка`.toLowerCase() });
      }
    }
    return all;
  }, []);
}

function useDynamicEntries(): SearchEntry[] {
  const familyCtx = useContext(FamilyMembersContext);
  const tasksApi = useTasks();
  const calApi = useCalendarEvents();
  const recipesApi = useRecipes();

  return useMemo(() => {
    const out: SearchEntry[] = [];

    for (const m of familyCtx?.members || []) {
      if (!m?.id || !m?.name) continue;
      out.push({
        id: `person:${m.id}`,
        label: m.name,
        sublabel: m.role || 'Член семьи',
        icon: 'User',
        path: `/member/${m.id}`,
        groupKey: 'Люди',
        keywords: `${m.name} ${m.role || ''} член семьи`.toLowerCase(),
      });
    }

    const events = (calApi as { events?: Array<{ id: string; title: string; date?: string }> })?.events || [];
    for (const e of events) {
      if (!e?.id || !e?.title) continue;
      out.push({
        id: `event:${e.id}`,
        label: e.title,
        sublabel: e.date ? `Событие · ${new Date(e.date).toLocaleDateString('ru-RU')}` : 'Событие',
        icon: 'Calendar',
        path: `/events/${e.id}`,
        groupKey: 'События',
        keywords: `${e.title} событие ${e.date || ''}`.toLowerCase(),
      });
    }

    const tasks = (tasksApi as { tasks?: Array<{ id: string; title: string; completed?: boolean }> })?.tasks || [];
    for (const t of tasks) {
      if (!t?.id || !t?.title) continue;
      out.push({
        id: `task:${t.id}`,
        label: t.title,
        sublabel: t.completed ? 'Задача · выполнена' : 'Задача',
        icon: 'CheckSquare',
        path: `/tasks?id=${t.id}`,
        groupKey: 'Задачи',
        keywords: `${t.title} задача`.toLowerCase(),
      });
    }

    const recipes = (recipesApi as { data?: Array<{ id: number | string; name?: string; title?: string }> })?.data || [];
    for (const r of recipes) {
      const name = r?.name || r?.title;
      if (!r?.id || !name) continue;
      out.push({
        id: `recipe:${r.id}`,
        label: name,
        sublabel: 'Рецепт',
        icon: 'ChefHat',
        path: `/recipes?id=${r.id}`,
        groupKey: 'Рецепты',
        keywords: `${name} рецепт еда`.toLowerCase(),
      });
    }

    return out;
  }, [familyCtx?.members, tasksApi, calApi, recipesApi]);
}

function GlobalSearchInner({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const staticEntries = useStaticEntries();
  const dynamicEntries = useDynamicEntries();

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const grouped = useMemo(() => {
    const order = ['Разделы', 'Люди', 'События', 'Задачи', 'Рецепты', 'Быстрые'];
    const map = new Map<string, SearchEntry[]>();
    for (const e of [...staticEntries, ...dynamicEntries]) {
      if (!map.has(e.groupKey)) map.set(e.groupKey, []);
      map.get(e.groupKey)!.push(e);
    }
    return order
      .filter(k => map.has(k))
      .map(k => [k, map.get(k)!] as const);
  }, [staticEntries, dynamicEntries]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Поиск по сайту: разделы, люди, события, задачи, рецепты…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="py-6 text-center text-sm text-muted-foreground">
            Ничего не найдено.<br />
            <span className="text-xs">Попробуйте «Альбом», «Финансы», «Дети», «Рецепты»…</span>
          </div>
        </CommandEmpty>
        {grouped.map(([groupKey, items], idx) => {
          const meta = GROUP_META[groupKey] || { title: groupKey, icon: 'Folder', color: 'text-gray-500' };
          return (
            <div key={groupKey}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup
                heading={
                  <span className="flex items-center gap-1.5">
                    <Icon name={meta.icon} size={12} className={meta.color} />
                    <span>{meta.title}</span>
                    <span className="text-[10px] text-muted-foreground/70 font-normal">{items.length}</span>
                  </span>
                }
              >
                {items.slice(0, 50).map(entry => (
                  <CommandItem
                    key={entry.id}
                    value={`${entry.keywords} ${entry.label.toLowerCase()}`}
                    onSelect={() => go(entry.path)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Icon name={entry.icon} size={16} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate flex items-center gap-2">
                        {entry.label}
                        {entry.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                            {entry.badge}
                          </span>
                        )}
                      </div>
                      {entry.sublabel && (
                        <div className="text-[11px] text-muted-foreground truncate">{entry.sublabel}</div>
                      )}
                    </div>
                    <Icon name="ArrowRight" size={14} className="text-gray-400 shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

export default function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  // Горячая клавиша Ctrl/⌘+K — всегда активна, без подгрузки данных.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K' || e.key === 'л' || e.key === 'Л') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  // Inner-компонент монтируется только после первого открытия — чтобы хуки данных
  // не дёргали сеть на каждой странице.
  const [everOpen, setEverOpen] = useState(false);
  useEffect(() => {
    if (open) setEverOpen(true);
  }, [open]);

  if (!everOpen) return null;
  return <GlobalSearchInner open={open} onOpenChange={onOpenChange} />;
}
