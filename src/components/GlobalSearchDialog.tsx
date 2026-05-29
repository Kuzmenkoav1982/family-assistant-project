import { useContext, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import func2url from '../../backend/func2url.json';

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
  'Разделы':       { title: 'Разделы',        icon: 'LayoutGrid',   color: 'text-violet-600' },
  'Люди':          { title: 'Члены семьи',    icon: 'Users',        color: 'text-blue-600' },
  'События':       { title: 'События',        icon: 'Calendar',     color: 'text-indigo-600' },
  'Задачи':        { title: 'Задачи',         icon: 'CheckSquare',  color: 'text-emerald-600' },
  'Рецепты':       { title: 'Рецепты',        icon: 'ChefHat',      color: 'text-amber-600' },
  'Быстрые':       { title: 'Быстрые ссылки', icon: 'Zap',          color: 'text-pink-600' },
  'Блог':          { title: 'Блог',           icon: 'BookOpen',     color: 'text-rose-600' },
  'Покупки':       { title: 'Покупки',        icon: 'ShoppingCart', color: 'text-teal-600' },
  'Воспоминания':  { title: 'Воспоминания',   icon: 'Images',       color: 'text-orange-600' },
};

interface ServerResult {
  type: string;
  id: string;
  title: string;
  snippet: string;
  url: string;
  icon: string;
  group: string;
}

const SEARCH_URL = (func2url as Record<string, string>)['global-search'] ?? '';
const SERVER_GROUPS = ['Блог', 'Задачи', 'События', 'Рецепты', 'Покупки', 'Воспоминания'];

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

// ── Общая логика (shared between desktop/mobile) ──────────────────────────────

function useSearchLogic(open: boolean, onOpenChange: (v: boolean) => void) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [serverResults, setServerResults] = useState<ServerResult[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const familyCtx = useContext(FamilyMembersContext);
  const staticEntries = useStaticEntries();
  const dynamicEntries = useDynamicEntries();

  useEffect(() => {
    if (!open) { setQuery(''); setServerResults([]); }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setServerResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      if (!SEARCH_URL) return;
      setServerLoading(true);
      try {
        const token = localStorage.getItem('authToken') || '';
        const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          headers: token ? { 'X-Auth-Token': token } : {},
        });
        const data = await res.json();
        setServerResults(data.results || []);
      } catch {
        setServerResults([]);
      } finally {
        setServerLoading(false);
      }
    }, 400);
  }, [query]);

  const grouped = useMemo(() => {
    const order = ['Разделы', 'Люди', 'События', 'Задачи', 'Рецепты', 'Блог', 'Покупки', 'Воспоминания', 'Быстрые'];
    const map = new Map<string, SearchEntry[]>();

    for (const e of [...staticEntries, ...dynamicEntries]) {
      if (!map.has(e.groupKey)) map.set(e.groupKey, []);
      map.get(e.groupKey)!.push(e);
    }

    for (const r of serverResults) {
      const entry: SearchEntry = {
        id: `srv:${r.type}:${r.id}`,
        label: r.title,
        sublabel: r.snippet || undefined,
        icon: r.icon,
        path: r.url,
        groupKey: r.group,
        keywords: r.title.toLowerCase(),
      };
      if (!map.has(r.group)) map.set(r.group, []);
      const existing = map.get(r.group)!;
      if (!existing.find(e => e.path === r.url && e.label === r.title)) {
        existing.push(entry);
      }
    }

    return order.filter(k => map.has(k)).map(k => [k, map.get(k)!] as const);
  }, [staticEntries, dynamicEntries, serverResults, familyCtx]);

  const go = useCallback((path: string) => {
    onOpenChange(false);
    navigate(path);
  }, [navigate, onOpenChange]);

  return { query, setQuery, grouped, go, serverLoading };
}

// ── Desktop (CommandDialog) ───────────────────────────────────────────────────

function DesktopSearch({ open, onOpenChange }: GlobalSearchDialogProps) {
  const { query, setQuery, grouped, go, serverLoading } = useSearchLogic(open, onOpenChange);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Поиск по сайту…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {serverLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" />
              Ищу…
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Ничего не найдено.<br />
              <span className="text-xs">Попробуйте «Альбом», «Финансы», «Дети», «Рецепты»…</span>
            </div>
          )}
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
                    {serverLoading && SERVER_GROUPS.includes(groupKey) && (
                      <Icon name="Loader2" size={10} className="animate-spin text-muted-foreground/40" />
                    )}
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

// ── Mobile fullscreen overlay ─────────────────────────────────────────────────

function MobileSearch({ open, onOpenChange }: GlobalSearchDialogProps) {
  const { query, setQuery, grouped, go, serverLoading } = useSearchLogic(open, onOpenChange);
  const inputRef = useRef<HTMLInputElement>(null);

  // Блокируем скролл фона
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const overlay = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#fff',
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'grid',
          gridTemplateColumns: '1fr 44px',
          gap: '8px',
          alignItems: 'center',
          paddingTop: 'calc(12px + env(safe-area-inset-top))',
          paddingBottom: '12px',
          paddingLeft: 'calc(16px + env(safe-area-inset-left))',
          paddingRight: 'calc(8px + env(safe-area-inset-right))',
        }}
      >
        {/* Input */}
        <div style={{ position: 'relative', minWidth: 0 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }}>
            <Icon name={serverLoading ? 'Loader2' : 'Search'} size={18} className={serverLoading ? 'animate-spin' : ''} />
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '42px',
              paddingRight: '14px',
              border: '1.5px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '16px',
              lineHeight: '1.2',
              boxSizing: 'border-box',
              outline: 'none',
              background: '#f9fafb',
            }}
          />
        </div>
        {/* Close */}
        <button
          onClick={() => onOpenChange(false)}
          aria-label="Закрыть поиск"
          style={{
            width: '44px',
            height: '44px',
            border: 'none',
            background: '#f3f4f6',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <Icon name="X" size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Scrollable results */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          paddingLeft: 'calc(12px + env(safe-area-inset-left))',
          paddingRight: 'calc(12px + env(safe-area-inset-right))',
          paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
          paddingTop: '8px',
        }}
      >
        {grouped.length === 0 && !serverLoading && query.length >= 2 && (
          <div className="py-12 text-center text-sm text-gray-400">
            Ничего не найдено
          </div>
        )}
        {grouped.length === 0 && query.length < 2 && (
          <div className="py-8 text-center text-sm text-gray-400">
            Введите хотя бы 2 символа
          </div>
        )}

        {grouped.map(([groupKey, items]) => {
          const meta = GROUP_META[groupKey] || { title: groupKey, icon: 'Folder', color: 'text-gray-500' };
          return (
            <div key={groupKey} className="mb-4">
              {/* Group heading */}
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <Icon name={meta.icon} size={12} className={meta.color} />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{meta.title}</span>
                <span className="text-[10px] text-gray-400">{items.length}</span>
                {serverLoading && SERVER_GROUPS.includes(groupKey) && (
                  <Icon name="Loader2" size={10} className="animate-spin text-gray-300" />
                )}
              </div>

              {/* Items */}
              {items.slice(0, 30).map(entry => (
                <button
                  key={entry.id}
                  onClick={() => go(entry.path)}
                  className="w-full flex items-center gap-3 text-left rounded-xl px-3 py-2.5 mb-1 active:bg-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Icon name={entry.icon} size={17} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {entry.label}
                      {entry.badge && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                          {entry.badge}
                        </span>
                      )}
                    </div>
                    {entry.sublabel && (
                      <div className="text-xs text-gray-400 truncate">{entry.sublabel}</div>
                    )}
                  </div>
                  <Icon name="ChevronRight" size={15} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}

// ── Root export ───────────────────────────────────────────────────────────────

function GlobalSearchInner({ open, onOpenChange }: GlobalSearchDialogProps) {
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    return <MobileSearch open={open} onOpenChange={onOpenChange} />;
  }
  return <DesktopSearch open={open} onOpenChange={onOpenChange} />;
}

export default function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
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

  const [everOpen, setEverOpen] = useState(false);
  useEffect(() => {
    if (open) setEverOpen(true);
  }, [open]);

  if (!everOpen) return null;
  return <GlobalSearchInner open={open} onOpenChange={onOpenChange} />;
}
