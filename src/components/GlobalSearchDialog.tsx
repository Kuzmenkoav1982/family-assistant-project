import { useEffect, useMemo, useState } from 'react';
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

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchEntry {
  id: string;
  label: string;
  icon: string;
  path: string;
  sectionTitle: string;
  sectionIcon: string;
  groupTitle: string;
  badge?: string;
  keywords: string;
}

const QUICK_LINKS: Array<Omit<SearchEntry, 'keywords'>> = [
  { id: 'memory', label: 'Альбом поколений', icon: 'Images', path: '/memory', sectionTitle: 'Семья', sectionIcon: 'Users', groupTitle: 'Жизнь семьи' },
  { id: 'notifications', label: 'Уведомления', icon: 'Bell', path: '/notifications', sectionTitle: 'Система', sectionIcon: 'Settings', groupTitle: 'Система' },
  { id: 'settings', label: 'Настройки', icon: 'Settings', path: '/settings', sectionTitle: 'Система', sectionIcon: 'Settings', groupTitle: 'Система' },
  { id: 'wallet', label: 'Кошелёк сервиса', icon: 'Wallet', path: '/wallet', sectionTitle: 'Финансы', sectionIcon: 'Wallet', groupTitle: 'Жизнь семьи' },
  { id: 'support', label: 'Поддержка', icon: 'LifeBuoy', path: '/support', sectionTitle: 'Система', sectionIcon: 'Settings', groupTitle: 'Система' },
  { id: 'blog', label: 'Блог', icon: 'BookOpen', path: '/blog', sectionTitle: 'Система', sectionIcon: 'Settings', groupTitle: 'Система' },
];

export default function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

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

  const entries: SearchEntry[] = useMemo(() => {
    const groupTitleById = Object.fromEntries(GROUPS.map(g => [g.id, g.title]));
    const all: SearchEntry[] = [];
    for (const section of menuSections) {
      const groupTitle = groupTitleById[section.group] || '';
      for (const item of section.items as MenuItem[]) {
        if (!item.path) continue;
        all.push({
          id: `${section.id}:${item.id}`,
          label: item.label,
          icon: item.icon,
          path: item.path,
          sectionTitle: section.title,
          sectionIcon: section.icon,
          groupTitle,
          badge: item.badge,
          keywords: `${item.label} ${section.title} ${groupTitle}`.toLowerCase(),
        });
      }
      if (section.hubPath) {
        all.push({
          id: `${section.id}:hub`,
          label: section.title,
          icon: section.icon,
          path: section.hubPath,
          sectionTitle: section.title,
          sectionIcon: section.icon,
          groupTitle,
          badge: section.topBadge,
          keywords: `${section.title} ${groupTitle} раздел`.toLowerCase(),
        });
      }
    }
    for (const ql of QUICK_LINKS) {
      if (!all.find(e => e.path === ql.path)) {
        all.push({ ...ql, keywords: `${ql.label} ${ql.sectionTitle}`.toLowerCase() });
      }
    }
    return all;
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const e of entries) {
      const key = e.sectionTitle;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries());
  }, [entries]);

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Поиск по разделам сайта…"
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
        {grouped.map(([sectionTitle, items], idx) => (
          <div key={sectionTitle}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={sectionTitle}>
              {items.map(entry => (
                <CommandItem
                  key={entry.id}
                  value={entry.keywords}
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
                    <div className="text-[11px] text-muted-foreground truncate">
                      {entry.groupTitle} · {entry.path}
                    </div>
                  </div>
                  <Icon name="ArrowRight" size={14} className="text-gray-400 shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
