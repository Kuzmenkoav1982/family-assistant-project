/**
 * Dev Agent Studio — внутренний инженерный AI-агент админки.
 * Stage 1: read-only индекс проекта + поиск + чат без LLM.
 */
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  devAgent, DAEnv, DAMode, DAOverview, DASnapshot, DASearchItem,
  DARoute, DAApiEndpoint, DADbTable, DASession, DARun,
} from '@/lib/devAgent/api';
import {
  SEED_FILES, SEED_ROUTES, SEED_SYMBOLS, buildSeedEndpoints,
} from '@/lib/devAgent/seedData';

type ToastFn = ReturnType<typeof useToast>['toast'];

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
  } catch { return d; }
}

function Empty({ text }: { text: string }) {
  return <div className="text-center py-8 text-xs text-slate-400">{text}</div>;
}

export default function DevAgentStudio() {
  const [env, setEnv] = useState<DAEnv>('stage');
  const [tab, setTab] = useState('overview');
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Icon name="Bot" size={20} /> Dev Agent Studio
            </h1>
            <p className="text-xs text-slate-500">Внутренний инженерный AI-агент · Stage 1 (read-only)</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={env}
              onChange={e => setEnv(e.target.value as DAEnv)}
              className="border rounded-md px-2 py-1.5 text-sm bg-white"
            >
              <option value="stage">stage</option>
              <option value="prod">prod</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-1 mb-6">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="search">Поиск</TabsTrigger>
            <TabsTrigger value="chat">Чат</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="routes">Роуты/API</TabsTrigger>
            <TabsTrigger value="db">БД</TabsTrigger>
            <TabsTrigger value="runs">Запуски</TabsTrigger>
            <TabsTrigger value="help">Инструкция</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="search"><SearchTab env={env} /></TabsContent>
          <TabsContent value="chat"><ChatTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="files"><FilesTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="routes"><RoutesApiTab env={env} /></TabsContent>
          <TabsContent value="db"><DbTab env={env} /></TabsContent>
          <TabsContent value="runs"><RunsTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="help"><HelpTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// Overview
// ============================================================
function OverviewTab({ env, toast }: { env: DAEnv; toast: ToastFn }) {
  const [data, setData] = useState<DAOverview | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [ghOpen, setGhOpen] = useState(false);
  const [snapOpen, setSnapOpen] = useState(false);
  const [pathsOpen, setPathsOpen] = useState(false);

  const load = () => devAgent.overview(env).then(setData);
  useEffect(() => { load();   }, [env]);

  const seedFallback = async () => {
    setSeeding(true);
    try {
      const res = await devAgent.seedCreate(env, {
        commit_sha: 'seed-' + Date.now(),
        commit_message: 'Manual reindex from admin UI (legacy seed)',
        files: SEED_FILES,
        routes: SEED_ROUTES,
        endpoints: buildSeedEndpoints(),
        symbols: SEED_SYMBOLS,
      });
      if (res.success) {
        toast({ title: 'Seed-индекс обновлён (метаданные без содержимого)' });
        load();
      } else {
        toast({ title: 'Не удалось переиндексировать' });
      }
    } finally {
      setSeeding(false);
    }
  };

  if (!data) return <div className="text-sm text-slate-500">Загрузка…</div>;

  const snap = data.active_snapshot;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm">Активный snapshot</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setGhOpen(true)}>
                <Icon name="Github" size={14} className="mr-1" /> Из GitHub
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPathsOpen(true)}>
                <Icon name="FileCode" size={14} className="mr-1" /> Из путей
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSnapOpen(true)}>
                <Icon name="Upload" size={14} className="mr-1" /> Загрузить snapshot
              </Button>
              <Button size="sm" variant="ghost" onClick={seedFallback} disabled={seeding} title="Только метаданные, без содержимого">
                {seeding
                  ? <Icon name="Loader2" size={14} className="animate-spin" />
                  : <Icon name="Layers" size={14} />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {snap ? (
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Commit</div>
                <div className="font-mono text-xs">{snap.commit_sha}</div>
                <div className="text-xs text-slate-500 mt-1">{snap.commit_message}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Статус</div>
                <Badge variant={snap.is_active ? 'default' : 'outline'} className="mt-1">
                  {snap.indexing_status} {snap.is_active ? '· активный' : ''}
                </Badge>
                <div className="text-xs text-slate-500 mt-1">Создан: {formatDate(snap.created_at)}</div>
                <div className="text-xs text-slate-500">Проиндексирован: {formatDate(snap.indexed_at)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><div className="text-slate-500">Файлы</div><div className="text-lg font-bold">{snap.files_count}</div></div>
                <div><div className="text-slate-500">Символы</div><div className="text-lg font-bold">{snap.symbols_count}</div></div>
                <div><div className="text-slate-500">Роуты</div><div className="text-lg font-bold">{snap.routes_count}</div></div>
                <div><div className="text-slate-500">API</div><div className="text-lg font-bold">{snap.endpoints_count}</div></div>
              </div>
            </div>
          ) : (
            <Empty text="Snapshot ещё не создан. Нажми «Переиндексировать» — соберём первый индекс." />
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Активность</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Запусков за 7 дней</div>
                <div className="text-2xl font-bold">{data.metrics.runs_7d}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Активных сессий</div>
                <div className="text-2xl font-bold">{data.metrics.active_sessions}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Feature flags</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {data.flags.length === 0 && <Empty text="Нет flag для среды" />}
              {data.flags.map(f => (
                <div key={f.code} className="flex items-center justify-between text-xs">
                  <span className="font-mono">{f.code}</span>
                  <Badge variant={f.enabled ? 'default' : 'outline'} className="text-[10px]">
                    {f.enabled ? 'on' : 'off'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Что умеет агент сейчас</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-1.5 text-slate-600">
          <div>· V1.6: реальная индексация TSX/PY-файлов из GitHub или ручного snapshot</div>
          <div>· Symbol-aware chunking + line-window fallback, sha256 для дедупа</div>
          <div>· Извлекает symbols, imports, routes, API-эндпоинты, схему БД</div>
          <div>· Чат с YandexGPT + grounded citations, полный trace</div>
          <div className="text-xs text-slate-400 pt-2">
            Patch generation, PR-интеграция, review.file — следующие спринты.
          </div>
        </CardContent>
      </Card>

      <GithubIndexDialog open={ghOpen} onOpenChange={setGhOpen} env={env} toast={toast} onDone={load} />
      <LocalPathsIndexDialog open={pathsOpen} onOpenChange={setPathsOpen} env={env} toast={toast} onDone={load} />
      <SnapshotUploadDialog open={snapOpen} onOpenChange={setSnapOpen} env={env} toast={toast} onDone={load} />
    </div>
  );
}

// ============================================================
// GitHub ingestion dialog (V1.6)
// ============================================================
function GithubIndexDialog({
  open, onOpenChange, env, toast, onDone,
}: { open: boolean; onOpenChange: (v: boolean) => void; env: DAEnv; toast: ToastFn; onDone: () => void }) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [ref, setRef] = useState('main');
  const [maxFiles, setMaxFiles] = useState(40);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof devAgent.indexFromGithub>> | null>(null);

  const run = async () => {
    if (!owner.trim() || !repo.trim()) {
      toast({ title: 'Заполни owner и repo' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await devAgent.indexFromGithub(env, {
        owner: owner.trim(), repo: repo.trim(), ref: ref.trim() || 'main', max_files: maxFiles,
      });
      setResult(r);
      if (r.success) {
        toast({
          title: 'Индекс собран из GitHub',
          description: `Файлов: ${r.counts?.files}, чанков: ${r.counts?.chunks}, символов: ${r.counts?.symbols}`,
        });
        onDone();
      } else {
        toast({ title: 'Ошибка индексации', description: r.error || r.message });
      }
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Icon name="Github" size={16} /> Индексация из GitHub
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500">Owner</label>
              <Input value={owner} onChange={e => setOwner(e.target.value)} placeholder="poehali-dev" />
            </div>
            <div>
              <label className="text-slate-500">Repo</label>
              <Input value={repo} onChange={e => setRepo(e.target.value)} placeholder="family-assistant-pro" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500">Ref (branch / tag / sha)</label>
              <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="main" />
            </div>
            <div>
              <label className="text-slate-500">Max files</label>
              <Input type="number" value={maxFiles} onChange={e => setMaxFiles(Number(e.target.value) || 40)} />
            </div>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 border rounded p-2">
            Индексируем priority-whitelist V1.6 (App, Sidebar, Studio, Admin*, Pricing, ProfileNew,
            FamilyMembersGrid, TasksWidget и т.д.) + func2url.json.
            Нужен секрет <code>GITHUB_TOKEN</code> с правом чтения репозитория.
          </div>

          {result && (
            <div className={`text-[11px] rounded p-2 border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              {result.success ? (
                <>
                  <div className="font-semibold text-emerald-800">Готово за {result.elapsed_sec}с</div>
                  <div className="text-emerald-700">
                    commit: <code>{result.commit_sha?.slice(0, 8)}</code> · {result.commit_message}
                  </div>
                  <div className="text-emerald-700">
                    files: {result.counts?.files} · chunks: {result.counts?.chunks} ·
                    symbols: {result.counts?.symbols} · routes: {result.counts?.routes} ·
                    api: {result.counts?.endpoints}
                  </div>
                  {(result.fetch_errors?.length || 0) > 0 && (
                    <div className="text-amber-700 mt-1">
                      Не удалось загрузить: {result.fetch_errors!.length} файл(ов)
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-semibold text-rose-800">{result.error}</div>
                  <pre className="text-[10px] mt-1 whitespace-pre-wrap text-rose-700">
                    {JSON.stringify(result.detail || result.message, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Закрыть</Button>
            <Button size="sm" onClick={run} disabled={loading}>
              {loading
                ? <><Icon name="Loader2" size={12} className="mr-1 animate-spin" /> Индексируем…</>
                : <><Icon name="Download" size={12} className="mr-1" /> Запустить</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Local paths ingestion dialog (V1.7 — точечный smoke)
// ============================================================
const DEFAULT_TARGET_PATHS = [
  'src/App.tsx',
  'src/components/ProfileNew.tsx',
  'src/components/FamilyMembersGrid.tsx',
  'src/components/TasksWidget.tsx',
  'src/pages/Pricing.tsx',
  'src/pages/DevAgentStudio.tsx',
].join('\n');

function LocalPathsIndexDialog({
  open, onOpenChange, env, toast, onDone,
}: { open: boolean; onOpenChange: (v: boolean) => void; env: DAEnv; toast: ToastFn; onDone: () => void }) {
  const [repo, setRepo] = useState('Kuzmenkoav1982/family-assistant-project');
  const [commitSha, setCommitSha] = useState('2315f88');
  const [pathsText, setPathsText] = useState(DEFAULT_TARGET_PATHS);
  const [includeImports, setIncludeImports] = useState(true);
  const [appMode, setAppMode] = useState<'structural-only' | 'all'>('structural-only');
  const [activate, setActivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof devAgent.indexFromLocalPaths>> | null>(null);

  const run = async () => {
    const target_paths = pathsText.split('\n').map(s => s.trim()).filter(Boolean);
    if (!repo.includes('/')) {
      toast({ title: 'Repo должен быть в формате owner/repo' });
      return;
    }
    if (!commitSha.trim()) {
      toast({ title: 'Заполни commit_sha (SHA, ветка или тег)' });
      return;
    }
    if (target_paths.length === 0) {
      toast({ title: 'Нужен хотя бы один target_path' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const r = await devAgent.indexFromLocalPaths(env, {
        repo: repo.trim(),
        commit_sha: commitSha.trim(),
        target_paths,
        include_direct_imports: includeImports,
        app_import_mode: appMode,
        activate_snapshot: activate,
      });
      setResult(r);
      if (r.success) {
        toast({
          title: 'Индекс собран по локальным путям',
          description: `Файлов: ${r.counts?.files}, чанков: ${r.counts?.chunks}, символов: ${r.counts?.symbols}`,
        });
        onDone();
      } else {
        toast({ title: 'Ошибка индексации', description: r.error || r.message });
      }
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Icon name="FileCode" size={16} /> Индексация из локальных путей
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-500">Repo (owner/repo)</label>
              <Input value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repo" />
            </div>
            <div>
              <label className="text-slate-500">Commit SHA / branch / tag</label>
              <Input value={commitSha} onChange={e => setCommitSha(e.target.value)} placeholder="2315f88" />
            </div>
          </div>
          <div>
            <label className="text-slate-500">Target paths (по одному в строке)</label>
            <Textarea
              value={pathsText}
              onChange={e => setPathsText(e.target.value)}
              rows={7}
              className="font-mono text-[11px]"
              placeholder="src/App.tsx&#10;src/components/Foo.tsx"
            />
            <div className="text-[10px] text-slate-400 mt-1">
              Лимит ~6 целей + до 20 прямых соседей-импортов. Всего не более 30 файлов.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 items-end">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeImports}
                onChange={e => setIncludeImports(e.target.checked)}
              />
              <span>Подгружать прямые импорты</span>
            </label>
            <div>
              <label className="text-slate-500 block">App.tsx import mode</label>
              <select
                value={appMode}
                onChange={e => setAppMode(e.target.value as 'structural-only' | 'all')}
                className="border rounded px-2 py-1.5 text-xs bg-white w-full"
              >
                <option value="structural-only">structural-only</option>
                <option value="all">all</option>
              </select>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={activate}
                onChange={e => setActivate(e.target.checked)}
              />
              <span>Активировать snapshot</span>
            </label>
          </div>
          <div className="text-[11px] text-slate-500 bg-slate-50 border rounded p-2">
            Точечный smoke: тянем только указанные файлы + их прямые импорты (./, ../, @/ алиасы).
            Для App.tsx режим <code>structural-only</code> отбрасывает /pages/* импорты, если их нет в target_paths.
            Нужен секрет <code>GITHUB_TOKEN</code> с правом чтения репозитория.
          </div>

          {result && (
            <div className={`text-[11px] rounded p-2 border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              {result.success ? (
                <>
                  <div className="font-semibold text-emerald-800">
                    Готово за {result.elapsed_sec}с · snapshot_id: {result.snapshot_id} · {result.activated ? 'активирован' : 'не активирован'}
                  </div>
                  <div className="text-emerald-700">
                    commit: <code>{result.commit_sha?.slice(0, 8)}</code> · {result.commit_message}
                  </div>
                  <div className="text-emerald-700">
                    files: {result.counts?.files} · chunks: {result.counts?.chunks} ·
                    symbols: {result.counts?.symbols} · routes: {result.counts?.routes} ·
                    api: {result.counts?.endpoints}
                  </div>
                  <div className="text-emerald-700">
                    targets: {result.targets_loaded} · neighbors: {result.neighbors_loaded} ·
                    alias: tsconfig={String(result.alias_sources?.tsconfig)}, vite={String(result.alias_sources?.vite)}
                  </div>
                  {(result.missing_paths?.length || 0) > 0 && (
                    <div className="text-amber-700 mt-1">
                      Не найдены: {result.missing_paths!.map(m => m.path).join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="font-semibold text-rose-800">{result.error}</div>
                  <pre className="text-[10px] mt-1 whitespace-pre-wrap text-rose-700">
                    {JSON.stringify(result.detail || result.message, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Закрыть</Button>
            <Button size="sm" onClick={run} disabled={loading}>
              {loading
                ? <><Icon name="Loader2" size={12} className="mr-1 animate-spin" /> Индексируем…</>
                : <><Icon name="Download" size={12} className="mr-1" /> Запустить</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Manual snapshot upload (V1.6)
// ============================================================
function SnapshotUploadDialog({
  open, onOpenChange, env, toast, onDone,
}: { open: boolean; onOpenChange: (v: boolean) => void; env: DAEnv; toast: ToastFn; onDone: () => void }) {
  const [json, setJson] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async () => {
    let parsed: { files?: Array<{ path: string; content: string }>; commit_sha?: string; commit_message?: string; branch_name?: string };
    try {
      parsed = JSON.parse(json);
    } catch {
      toast({ title: 'Невалидный JSON' });
      return;
    }
    if (!parsed.files || !Array.isArray(parsed.files) || parsed.files.length === 0) {
      toast({ title: 'В JSON должно быть поле files: [...]' });
      return;
    }
    setLoading(true);
    try {
      const r = await devAgent.indexFromSnapshot(env, {
        files: parsed.files,
        commit_sha: parsed.commit_sha,
        commit_message: parsed.commit_message,
        branch_name: parsed.branch_name,
      });
      if (r.success) {
        toast({
          title: 'Snapshot загружен',
          description: `Файлов: ${r.counts?.files}, чанков: ${r.counts?.chunks}, символов: ${r.counts?.symbols}`,
        });
        onDone();
        onOpenChange(false);
        setJson('');
      } else {
        toast({ title: 'Ошибка', description: r.error || r.message });
      }
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Icon name="Upload" size={16} /> Ручной snapshot
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-xs">
          <div className="text-slate-600">
            Формат JSON:
            <pre className="bg-slate-50 border rounded p-2 mt-1 text-[10px] overflow-x-auto">{`{
  "commit_sha": "manual-2026-05-11",
  "branch_name": "manual",
  "files": [
    { "path": "src/App.tsx", "content": "..." }
  ]
}`}</pre>
          </div>
          <Textarea
            value={json}
            onChange={e => setJson(e.target.value)}
            placeholder='{"files": [{"path": "src/App.tsx", "content": "..."}]}'
            className="font-mono text-[11px] min-h-[200px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Закрыть</Button>
            <Button size="sm" onClick={run} disabled={loading || !json.trim()}>
              {loading
                ? <><Icon name="Loader2" size={12} className="mr-1 animate-spin" /> Загрузка…</>
                : <><Icon name="Upload" size={12} className="mr-1" /> Загрузить</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Search
// ============================================================
function SearchTab({ env }: { env: DAEnv }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<DASearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  const run = async (query: string) => {
    if (!query.trim()) { setItems([]); setReason(null); return; }
    setLoading(true);
    try {
      const r = await devAgent.search(env, query);
      setItems(r.items || []);
      setReason((r as unknown as { reason?: string }).reason || null);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') run(q); }}
              placeholder="FamilyWallet, /admin/domovoy, ai-assistant, handler…"
              className="text-sm"
            />
            <Button onClick={() => run(q)} disabled={loading}>
              {loading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Search" size={14} />}
            </Button>
          </div>
          {reason === 'no_snapshot' && (
            <div className="mt-2 text-xs text-amber-600">
              Snapshot не создан — открой вкладку «Обзор» и нажми «Переиндексировать».
            </div>
          )}
        </CardContent>
      </Card>

      {items.length === 0 && q && !loading && (
        <Empty text="Ничего не нашёл. Попробуй имя компонента, роута, action или таблицы." />
      )}

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Результаты ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {items.map((it, i) => (
                <SearchHit key={i} item={it} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchHit({ item }: { item: DASearchItem }) {
  const typeColor: Record<string, string> = {
    file: 'bg-blue-100 text-blue-700',
    symbol: 'bg-emerald-100 text-emerald-700',
    route: 'bg-violet-100 text-violet-700',
    api: 'bg-amber-100 text-amber-700',
    chunk: 'bg-slate-100 text-slate-700',
  };
  return (
    <div className="flex items-start gap-2 text-xs border rounded p-2 hover:bg-slate-50">
      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${typeColor[item.type] || ''}`}>{item.type}</span>
      <div className="flex-1 min-w-0">
        {item.type === 'file' && <div className="font-mono truncate">{item.path} <span className="text-slate-400">· {item.language || '?'}</span></div>}
        {item.type === 'symbol' && (
          <div className="truncate">
            <span className="font-semibold">{item.symbol_name}</span>
            <span className="text-slate-400 ml-1">[{item.symbol_kind}]</span>
            <span className="font-mono text-slate-500 ml-2">{item.path}:{item.line_no || '?'}</span>
          </div>
        )}
        {item.type === 'route' && (
          <div className="truncate">
            <span className="font-mono">{item.route_path}</span>
            <span className="text-slate-400 ml-2">→ {item.page_component}</span>
            <span className="text-slate-400 ml-1">[{item.area}]</span>
          </div>
        )}
        {item.type === 'api' && (
          <div className="truncate">
            <span className="font-mono">{item.function_name}</span>
            {item.action_name && <span className="text-slate-400 ml-1">#{item.action_name}</span>}
          </div>
        )}
        {item.type === 'chunk' && (
          <div>
            <div className="font-mono text-[10px] text-slate-500">{item.path}:{item.start_line}—{item.end_line}</div>
            <div className="text-slate-600 mt-0.5 truncate">{item.snippet}</div>
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-400">{Math.round((item.score || 0) * 100)}%</span>
    </div>
  );
}

// ============================================================
// Trace Modal (V1.5 — reusable)
// ============================================================
function TraceModal({
  env, runId, open, onOpenChange, toast,
}: {
  env: DAEnv;
  runId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  toast: ToastFn;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof devAgent.runTrace>> | null>(null);
  const [tab, setTab] = useState<'prompt' | 'raw' | 'validated' | 'citations'>('prompt');

  useEffect(() => {
    if (!open || !runId) return;
    setLoading(true);
    setData(null);
    setTab('prompt');
    devAgent.runTrace(env, runId)
      .then(r => {
        setData(r);
        if (r.error) toast({ title: 'Trace недоступен', description: r.reason || r.error });
      })
      .catch(e => toast({ title: 'Ошибка чтения trace', description: String(e) }))
      .finally(() => setLoading(false));
  }, [open, runId, env, toast]);

  const copyCurrent = () => {
    if (!data?.trace) return;
    const content =
      tab === 'prompt' ? data.trace.prompt :
      tab === 'raw' ? (data.trace.llm_text || JSON.stringify(data.trace.llm_raw, null, 2)) :
      tab === 'validated' ? JSON.stringify(data.trace.validated, null, 2) :
      JSON.stringify(data.trace.allowed_citations, null, 2);
    navigator.clipboard.writeText(content || '');
    toast({ title: 'Скопировано в буфер' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Icon name="FileSearch" size={16} />
            Полный trace YandexGPT
            {data?.run_uuid && (
              <code className="text-[10px] text-slate-400 font-mono">{data.run_uuid.slice(0, 8)}</code>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 py-8 justify-center">
            <Icon name="Loader2" size={14} className="animate-spin" />
            Читаем trace из S3…
          </div>
        )}

        {!loading && data?.error && (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded p-3">
            <div className="font-semibold mb-1">{data.error}</div>
            <div className="text-amber-600">{data.reason}</div>
          </div>
        )}

        {!loading && data?.trace && (
          <>
            <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pb-1">
              <Badge variant="outline" className="text-[9px]">mode: {data.trace.mode}</Badge>
              <Badge variant="outline" className="text-[9px]">env: {data.environment}</Badge>
              <Badge variant="outline" className="text-[9px]">model: {data.model}</Badge>
              <Badge variant="outline" className="text-[9px]">status: {data.status}</Badge>
              {data.trace.fallback_used && (
                <Badge className="bg-amber-100 text-amber-800 text-[9px]">
                  fallback: {data.trace.fallback_reason}
                </Badge>
              )}
              <span className="font-mono">checksum: {data.trace.prompt_checksum}</span>
            </div>

            <div className="flex gap-1 border-b">
              {([
                { id: 'prompt', label: 'Prompt', icon: 'FileText' },
                { id: 'raw', label: 'Raw response', icon: 'Code2' },
                { id: 'validated', label: 'Validated', icon: 'CheckCircle2' },
                { id: 'citations', label: 'Allowed citations', icon: 'Quote' },
              ] as const).map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs border-b-2 transition-colors ${
                    tab === t.id ? 'border-violet-600 text-violet-700 font-semibold' : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon name={t.icon} size={12} />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 rounded p-3 font-mono text-[10px] leading-relaxed whitespace-pre-wrap break-words">
              {tab === 'prompt' && (data.trace.prompt || '(пусто)')}
              {tab === 'raw' && (data.trace.llm_text || JSON.stringify(data.trace.llm_raw, null, 2) || '(нет ответа от модели)')}
              {tab === 'validated' && JSON.stringify(data.trace.validated, null, 2)}
              {tab === 'citations' && JSON.stringify(data.trace.allowed_citations, null, 2)}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <code className="truncate flex-1">s3://files/{data.s3_key}</code>
              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={copyCurrent}>
                <Icon name="Copy" size={11} className="mr-1" /> Копировать
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


// ============================================================
// Chat (V1.5 — Search + LLM)
// ============================================================
type ChatBackend = 'search' | 'llm';

function ChatTab({ env, toast }: { env: DAEnv; toast: ToastFn }) {
  const [sessions, setSessions] = useState<DASession[]>([]);
  const [activeSess, setActiveSess] = useState<number | null>(null);
  const [sessDetail, setSessDetail] = useState<DASession | null>(null);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'explain' | 'locate'>('explain');
  const [backend, setBackend] = useState<ChatBackend>('llm');
  const [sending, setSending] = useState(false);
  const [stage, setStage] = useState<string>('');
  const [lastLLM, setLastLLM] = useState<Awaited<ReturnType<typeof devAgent.chatSendLLM>> | null>(null);
  const [lastSearchCitations, setLastSearchCitations] = useState<DASearchItem[] | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceRunId, setTraceRunId] = useState<number | null>(null);

  const openTrace = (runId: number) => {
    setTraceRunId(runId);
    setTraceOpen(true);
  };

  const loadSessions = async () => {
    const r = await devAgent.sessionsList(env);
    setSessions(r.items || []);
  };
  useEffect(() => { loadSessions(); }, [env]);

  const openSession = async (id: number) => {
    setActiveSess(id);
    const r = await devAgent.sessionGet(env, id);
    if (!r.id) {
      toast({ title: 'Сессия не найдена' });
      return;
    }
    setSessDetail(r);
  };

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      if (backend === 'llm') {
        setStage('Поиск контекста…');
        await new Promise(r => setTimeout(r, 50));
        setStage('Сбор prompt…');
        const r = await devAgent.chatSendLLM(env, message.trim(), activeSess || undefined, mode);
        if (!r.success) {
          if (r.error === 'auth_required') {
            toast({ title: 'Нужно войти как админ', description: 'X-User-Id не передан в запросе' });
          } else {
            toast({ title: 'Ошибка', description: r.error });
          }
          return;
        }
        setLastLLM(r);
        setLastSearchCitations(null);
        if (!activeSess) setActiveSess(r.session_id);
        await openSession(r.session_id);
      } else {
        const r = await devAgent.chatSend(env, message.trim(), activeSess || undefined, mode as DAMode);
        if (!r.success) {
          if (r.error === 'auth_required') {
            toast({ title: 'Нужно войти как админ' });
          } else {
            toast({ title: 'Ошибка', description: r.error });
          }
          return;
        }
        setLastSearchCitations((r.citations || []) as unknown as DASearchItem[]);
        setLastLLM(null);
        if (!activeSess) setActiveSess(r.session_id);
        await openSession(r.session_id);
      }
      setMessage('');
      await loadSessions();
    } finally {
      setSending(false);
      setStage('');
    }
  };

  return (
    <div className="grid md:grid-cols-[240px_1fr_320px] gap-3 h-[calc(100vh-220px)]">
      {/* Sessions */}
      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center justify-between">
            Сессии
            <Button size="sm" variant="ghost" onClick={() => {
              setActiveSess(null); setSessDetail(null); setLastLLM(null); setLastSearchCitations(null);
            }}>
              <Icon name="Plus" size={12} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1 space-y-1 p-2">
          {sessions.length === 0 && <Empty text="Нет сессий" />}
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => openSession(s.id)}
              className={`w-full text-left text-xs px-2 py-1.5 rounded hover:bg-slate-100 ${activeSess === s.id ? 'bg-slate-100 font-medium' : ''}`}
            >
              <div className="truncate">{s.title}</div>
              <div className="text-[10px] text-slate-400">{formatDate(s.updated_at)} · {s.default_mode}</div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-xs truncate flex-1">{sessDetail?.title || 'Новый запрос'}</CardTitle>
            <div className="flex items-center gap-1">
              {/* Backend toggle */}
              <div className="flex rounded-md border overflow-hidden text-[10px]">
                <button
                  onClick={() => setBackend('search')}
                  className={`px-2 py-1 ${backend === 'search' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon name="Search" size={10} className="inline mr-1" />Поиск
                </button>
                <button
                  onClick={() => setBackend('llm')}
                  className={`px-2 py-1 ${backend === 'llm' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                >
                  <Icon name="Sparkles" size={10} className="inline mr-1" />YandexGPT
                </button>
              </div>
              <select value={mode} onChange={e => setMode(e.target.value as 'explain' | 'locate')}
                className="border rounded px-1.5 py-0.5 text-[10px] bg-white">
                <option value="explain">explain</option>
                <option value="locate">locate</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 px-3">
          {!sessDetail && (
            <div className="text-xs text-slate-400 text-center py-12">
              Выбери сессию слева или задай новый вопрос внизу.<br />
              Например: «где AIAssistantWidget», «как работает chat.send_llm», «routes admin».
            </div>
          )}

          {/* Fallback / status banner */}
          {lastLLM?.run_meta?.fallback_used && (
            <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded p-2">
              <Icon name="AlertTriangle" size={12} className="inline mr-1" />
              LLM недоступен или вернул невалидный JSON. Показан grounded fallback.
              <div className="text-[10px] text-amber-600 mt-0.5">reason: {lastLLM.run_meta.fallback_reason}</div>
            </div>
          )}
          {lastLLM && !lastLLM.run_meta?.llm_enabled && (
            <div className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 rounded p-2">
              LLM выключен флагом <code>dev_agent.llm_enabled</code>. Включи в БД, чтобы получать ответы YandexGPT.
            </div>
          )}

          {sessDetail?.messages?.map(m => (
            <div key={m.id} className={`text-xs ${m.speaker === 'asker' ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[85%] px-3 py-2 rounded-lg ${m.speaker === 'asker' ? 'bg-blue-50 text-blue-900' : 'bg-slate-100'}`}>
                <div className="text-[10px] uppercase text-slate-400 mb-0.5">{m.speaker}</div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{formatDate(m.created_at)}</div>
            </div>
          ))}

          {sending && (
            <div className="text-xs text-slate-500 flex items-center gap-2 py-2">
              <Icon name="Loader2" size={12} className="animate-spin" />
              <span>{stage || 'Отвечаем…'}</span>
            </div>
          )}
        </CardContent>
        <div className="border-t p-2 flex gap-2">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }}
            placeholder={backend === 'llm'
              ? 'Спроси YandexGPT по коду проекта (Ctrl+Enter = отправить)…'
              : 'Поиск по индексу (Ctrl+Enter)…'}
            rows={2}
            className="text-xs"
          />
          <Button onClick={send} disabled={sending || !message.trim()}>
            {sending ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
          </Button>
        </div>
      </Card>

      {/* Inspector */}
      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center justify-between">
            Инспектор
            {lastLLM && (
              <Badge variant={lastLLM.confidence === 'high' ? 'default' : lastLLM.confidence === 'medium' ? 'secondary' : 'outline'} className="text-[9px]">
                {lastLLM.confidence}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1 space-y-2 p-2 text-[11px]">
          {!lastLLM && !lastSearchCitations && <Empty text="Здесь появится контекст ответа" />}

          {/* LLM Run meta */}
          {lastLLM && (
            <div className="border rounded p-2 bg-slate-50 space-y-1">
              <div className="text-[10px] uppercase text-slate-400">Run meta</div>
              <div className="flex justify-between"><span>модель</span><span className="font-mono">{lastLLM.run_meta.model}</span></div>
              <div className="flex justify-between"><span>статус</span><Badge variant="outline" className="text-[9px] py-0">{lastLLM.run_meta.status}</Badge></div>
              <div className="flex justify-between"><span>latency</span><span>{lastLLM.run_meta.latency_ms} мс</span></div>
              <div className="flex justify-between"><span>tokens in/out</span><span>{lastLLM.run_meta.input_tokens} / {lastLLM.run_meta.output_tokens}</span></div>
              <Button
                size="sm"
                variant={lastLLM.run_meta.full_trace_s3_key ? 'default' : 'outline'}
                className="w-full h-7 text-[10px] mt-1"
                onClick={() => openTrace(lastLLM.run_id)}
              >
                <Icon name="FileSearch" size={11} className="mr-1" />
                {lastLLM.run_meta.full_trace_s3_key ? 'Открыть полный trace' : 'Trace недоступен'}
              </Button>
            </div>
          )}

          {/* Context preview */}
          {lastLLM?.context_preview && (
            <details className="border rounded bg-slate-50">
              <summary className="cursor-pointer px-2 py-1 text-[10px] uppercase text-slate-500">
                Контекст ({lastLLM.context_preview.total_allowed} цитат)
              </summary>
              <div className="p-2 space-y-0.5">
                {lastLLM.context_preview.files.map(f => (
                  <div key={f} className="font-mono text-[10px] text-slate-600 truncate">{f}</div>
                ))}
              </div>
            </details>
          )}

          {/* Citations */}
          {lastLLM && lastLLM.citations.length > 0 && (
            <div>
              <div className="text-[10px] uppercase text-slate-400 mb-1">Цитаты ({lastLLM.citations.length})</div>
              <div className="space-y-1.5">
                {lastLLM.citations.map(c => (
                  <div key={c.citation_id} className="border rounded p-2 bg-white">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-[9px] py-0">{c.citation_id}</Badge>
                      <span className="font-mono text-slate-700 truncate flex-1">{c.file_path}</span>
                    </div>
                    {c.start_line && (
                      <div className="text-slate-400 text-[10px]">строки {c.start_line}{c.end_line && c.end_line !== c.start_line ? `—${c.end_line}` : ''}</div>
                    )}
                    {c.symbol_name && <div className="text-emerald-700 text-[10px]">{c.symbol_name}</div>}
                    {c.reason && <div className="text-slate-500 text-[10px] mt-0.5">{c.reason}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affected files */}
          {lastLLM && lastLLM.affected_files.length > 0 && (
            <div>
              <div className="text-[10px] uppercase text-slate-400 mb-1">Затронутые файлы</div>
              <div className="space-y-0.5">
                {lastLLM.affected_files.map(f => (
                  <div key={f} className="font-mono text-[10px] text-slate-600 truncate">{f}</div>
                ))}
              </div>
            </div>
          )}

          {/* Search-only citations */}
          {lastSearchCitations?.map((c, i) => (
            <div key={i} className="border rounded p-2 bg-slate-50">
              <div className="font-mono text-slate-700 truncate">{c.path || '(no path)'}</div>
              {(c.start_line || c.line_no) && (
                <div className="text-slate-400">строки {c.start_line || c.line_no}{c.end_line ? `—${c.end_line}` : ''}</div>
              )}
              {c.symbol_name && <div className="text-emerald-700">{c.symbol_name}</div>}
              {c.snippet && <div className="text-slate-500 mt-1 line-clamp-3">{c.snippet}</div>}
            </div>
          ))}
        </CardContent>
      </Card>

      <TraceModal env={env} runId={traceRunId} open={traceOpen} onOpenChange={setTraceOpen} toast={toast} />
    </div>
  );
}

// ============================================================
// Files
// ============================================================
function FilesTab({ env, toast }: { env: DAEnv; toast: ToastFn }) {
  const [items, setItems] = useState<Array<{ id: number; path: string; language?: string; category?: string; line_count?: number; size_bytes: number }>>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [file, setFile] = useState<Awaited<ReturnType<typeof devAgent.fileGet>> | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState<'review' | 'improve'>('improve');

  useEffect(() => {
    devAgent.filesTree(env).then(r => setItems(r.items || []));
  }, [env]);

  const filtered = useMemo(() => {
    if (!filter) return items;
    const f = filter.toLowerCase();
    return items.filter(i => i.path.toLowerCase().includes(f));
  }, [items, filter]);

  const open = async (id: number) => {
    setSelected(id);
    const r = await devAgent.fileGet(env, id);
    setFile(r);
  };

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-3 h-[calc(100vh-220px)]">
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <Input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Фильтр по пути…" className="text-xs" />
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1 space-y-0.5 p-2">
          {filtered.map(f => (
            <button key={f.id} onClick={() => open(f.id)}
              className={`w-full text-left text-[11px] px-2 py-1 rounded hover:bg-slate-100 font-mono truncate ${selected === f.id ? 'bg-slate-100 font-semibold' : ''}`}>
              {f.path}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-mono truncate">{file?.path || 'Выбери файл'}</CardTitle>
            {file && (
              <div className="flex gap-1 shrink-0">
                <select
                  value={reviewMode}
                  onChange={e => setReviewMode(e.target.value as 'review' | 'improve')}
                  className="text-[10px] border rounded px-1 py-0.5 bg-white"
                >
                  <option value="improve">Improve</option>
                  <option value="review">Review</option>
                </select>
                <Button size="sm" variant="default" className="h-7 text-[11px]"
                  onClick={() => setReviewOpen(true)}>
                  <Icon name="Sparkles" size={12} className="mr-1" />
                  Что улучшить?
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          {!file && <Empty text="Выбери файл слева" />}
          {file && (
            <div className="space-y-3 text-xs">
              <div className="flex gap-3 text-slate-500">
                <span>{file.language}</span>
                <span>· {file.category}</span>
                <span>· {file.line_count || '?'} строк</span>
                <span>· {(file.size_bytes / 1024).toFixed(1)} KB</span>
              </div>
              {file.symbols && file.symbols.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">Символы ({file.symbols.length})</div>
                  <div className="space-y-1">
                    {file.symbols.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-[11px]">
                        <Badge variant="outline" className="text-[9px]">{s.symbol_kind}</Badge>
                        <span className="font-semibold">{s.symbol_name}</span>
                        {s.exported && <span className="text-emerald-600">export</span>}
                        {s.line_no && <span className="text-slate-400 ml-auto">L{s.line_no}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {file.chunks && file.chunks.length > 0 && (
                <div>
                  <div className="font-semibold mb-1">Чанки ({file.chunks.length})</div>
                  <div className="space-y-1.5">
                    {file.chunks.map(c => (
                      <details key={c.id} className="border rounded">
                        <summary className="cursor-pointer text-[11px] px-2 py-1 bg-slate-50">
                          {c.symbol_name || c.chunk_kind} · L{c.start_line}—{c.end_line}
                        </summary>
                        <div className="p-2 font-mono text-[10px] whitespace-pre-wrap text-slate-600">{c.preview}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewModal
        env={env}
        filePath={file?.path || ''}
        mode={reviewMode}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        toast={toast}
      />
    </div>
  );
}

// ============================================================
// Review modal (V1.7)
// ============================================================
function ReviewModal({
  env, filePath, mode, open, onOpenChange, toast,
}: {
  env: DAEnv;
  filePath: string;
  mode: 'review' | 'improve';
  open: boolean;
  onOpenChange: (v: boolean) => void;
  toast: ToastFn;
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Awaited<ReturnType<typeof devAgent.reviewFile>> | null>(null);
  const [focus, setFocus] = useState<Array<'readability' | 'architecture' | 'performance' | 'state' | 'types' | 'routing' | 'forms' | 'effects' | 'api' | 'testing'>>([]);
  const [traceOpen, setTraceOpen] = useState(false);

  useEffect(() => {
    if (!open || !filePath) return;
    setData(null);
    setLoading(true);
    devAgent.reviewFile(env, { file_path: filePath, mode, focus })
      .then(r => {
        setData(r);
        if (!r.success && r.error) {
          toast({ title: 'Ошибка review', description: r.error });
        }
      })
      .catch(e => toast({ title: 'Ошибка', description: String(e) }))
      .finally(() => setLoading(false));
  }, [open]);

  const rerun = async () => {
    setLoading(true);
    setData(null);
    try {
      const r = await devAgent.reviewFile(env, { file_path: filePath, mode, focus });
      setData(r);
    } finally {
      setLoading(false);
    }
  };

  const toggleFocus = (f: typeof focus[number]) => {
    setFocus(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const focusOptions: Array<{ id: typeof focus[number]; label: string }> = [
    { id: 'readability', label: 'Читаемость' },
    { id: 'architecture', label: 'Архитектура' },
    { id: 'performance', label: 'Performance' },
    { id: 'state', label: 'State' },
    { id: 'types', label: 'Типы' },
    { id: 'routing', label: 'Routing' },
    { id: 'forms', label: 'Формы' },
    { id: 'effects', label: 'Effects' },
    { id: 'api', label: 'API' },
    { id: 'testing', label: 'Testing' },
  ];

  const sevColor = (s: string) =>
    s === 'high' ? 'bg-rose-100 text-rose-700' :
    s === 'medium' ? 'bg-amber-100 text-amber-700' :
    'bg-slate-100 text-slate-700';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Icon name="Sparkles" size={16} className="text-violet-600" />
              {mode === 'improve' ? 'План улучшений' : 'Технический review'}
              <code className="text-[10px] text-slate-400 font-mono">{filePath}</code>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-1 pb-2 border-b">
            <span className="text-[10px] text-slate-500 mr-1 self-center">Focus:</span>
            {focusOptions.map(o => (
              <button
                key={o.id}
                onClick={() => toggleFocus(o.id)}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  focus.includes(o.id)
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {o.label}
              </button>
            ))}
            <Button size="sm" variant="ghost" className="h-6 text-[10px] ml-auto"
              onClick={rerun} disabled={loading}>
              {loading
                ? <Icon name="Loader2" size={11} className="animate-spin" />
                : <><Icon name="RefreshCw" size={11} className="mr-1" /> Перезапустить</>}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pt-2">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-8 justify-center">
                <Icon name="Loader2" size={14} className="animate-spin" />
                Анализируем файл…
              </div>
            )}

            {!loading && data && data.success && (
              <>
                {data.run_meta?.fallback_used && (
                  <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded p-2">
                    <Icon name="AlertTriangle" size={12} className="inline mr-1" />
                    Fallback: {data.run_meta.fallback_reason}. Открой trace, чтобы понять причину.
                  </div>
                )}

                <div className="text-xs">
                  <div className="font-semibold text-slate-700 mb-1">Summary</div>
                  <div className="text-slate-600 leading-relaxed bg-slate-50 border rounded p-2">
                    {data.summary || '—'}
                  </div>
                </div>

                {data.issues.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1.5">Проблемы ({data.issues.length})</div>
                    <div className="space-y-1.5">
                      {data.issues.map(i => (
                        <div key={i.id} className="border rounded p-2 bg-white">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${sevColor(i.severity)}`}>{i.severity}</span>
                            <div className="text-xs font-semibold flex-1">{i.title}</div>
                            <div className="flex gap-0.5">
                              {i.citation_ids.map(c => (
                                <span key={c} className="text-[9px] font-mono px-1 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600 leading-relaxed">{i.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.suggestions.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1.5">Рекомендации ({data.suggestions.length})</div>
                    <div className="space-y-1.5">
                      {data.suggestions.map(s => (
                        <div key={s.id} className="border-l-2 border-violet-400 bg-violet-50/40 rounded-r p-2">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${sevColor(s.priority)}`}>P:{s.priority}</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${sevColor(s.impact)}`}>I:{s.impact}</span>
                            <div className="text-xs font-semibold flex-1">{s.title}</div>
                            <div className="flex gap-0.5">
                              {s.citation_ids.map(c => (
                                <span key={c} className="text-[9px] font-mono px-1 py-0.5 bg-violet-100 text-violet-800 border border-violet-300 rounded">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-700 leading-relaxed">{s.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.quick_wins.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1.5">Quick wins</div>
                    <ul className="text-[11px] text-slate-700 space-y-0.5 pl-4 list-disc">
                      {data.quick_wins.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                )}

                {data.citations.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold mb-1.5">Citations ({data.citations.length})</div>
                    <div className="space-y-1">
                      {data.citations.map(c => (
                        <div key={c.citation_id} className="text-[10px] font-mono flex items-center gap-2">
                          <span className="px-1 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded">{c.citation_id}</span>
                          <span className="text-slate-600">{c.file_path}</span>
                          {c.start_line && (
                            <span className="text-slate-400">L{c.start_line}{c.end_line && c.end_line !== c.start_line ? `–${c.end_line}` : ''}</span>
                          )}
                          {c.symbol_name && <span className="text-emerald-600">· {c.symbol_name}</span>}
                          <span className="text-slate-400 ml-auto truncate">{c.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.run_meta && (
                  <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-2 border-t">
                    <Badge variant="outline" className="text-[9px]">model: {data.run_meta.model}</Badge>
                    <Badge variant="outline" className="text-[9px]">status: {data.run_meta.status}</Badge>
                    <Badge variant="outline" className="text-[9px]">latency: {data.run_meta.latency_ms} мс</Badge>
                    <Badge variant="outline" className="text-[9px]">tokens: {data.run_meta.input_tokens}/{data.run_meta.output_tokens}</Badge>
                    <Badge variant="outline" className="text-[9px]">confidence: {data.confidence}</Badge>
                    {data.run_meta.full_trace_available && (
                      <Button size="sm" variant="ghost" className="h-5 text-[10px] ml-auto"
                        onClick={() => setTraceOpen(true)}>
                        <Icon name="FileSearch" size={10} className="mr-1" /> Открыть trace
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {!loading && data && !data.success && (
              <div className="text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded p-3">
                Ошибка: {data.error || 'неизвестная ошибка'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TraceModal
        env={env}
        runId={data?.run_id || null}
        open={traceOpen}
        onOpenChange={setTraceOpen}
        toast={toast}
      />
    </>
  );
}

// ============================================================
// Routes / API
// ============================================================
function RoutesApiTab({ env }: { env: DAEnv }) {
  const [routes, setRoutes] = useState<DARoute[]>([]);
  const [apis, setApis] = useState<DAApiEndpoint[]>([]);

  useEffect(() => {
    devAgent.routesList(env).then(r => setRoutes(r.items || []));
    devAgent.apiList(env).then(r => setApis(r.items || []));
  }, [env]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Frontend роуты ({routes.length})</CardTitle></CardHeader>
        <CardContent>
          {routes.length === 0 ? <Empty text="Нет роутов в индексе" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Компонент</TableHead>
                  <TableHead className="w-20">Area</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.route_path}</TableCell>
                    <TableCell className="text-xs">{r.page_component || '—'}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{r.area}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Backend API ({apis.length})</CardTitle></CardHeader>
        <CardContent>
          {apis.length === 0 ? <Empty text="Нет endpoint в индексе" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Функция</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="w-16">Метод</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apis.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-mono">{a.function_name}</TableCell>
                    <TableCell className="text-xs">{a.action_name || '—'}</TableCell>
                    <TableCell className="text-xs">{a.http_method || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// DB
// ============================================================
function DbTab({ env }: { env: DAEnv }) {
  const [tables, setTables] = useState<DADbTable[]>([]);
  const [selected, setSelected] = useState<DADbTable | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    devAgent.dbTablesList(env).then(r => setTables(r.items || []));
  }, [env]);

  const filtered = useMemo(() => {
    if (!filter) return tables;
    const f = filter.toLowerCase();
    return tables.filter(t => t.table_name.toLowerCase().includes(f));
  }, [tables, filter]);

  const open = async (id: number) => {
    const r = await devAgent.dbTableGet(env, id);
    setSelected(r as unknown as DADbTable);
  };

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-3">
      <Card>
        <CardHeader className="pb-2">
          <Input value={filter} onChange={e => setFilter(e.target.value)}
            placeholder="Фильтр таблиц…" className="text-xs" />
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-0.5 p-2">
          {filtered.map(t => (
            <button key={t.id} onClick={() => open(t.id)}
              className="w-full text-left text-[11px] px-2 py-1 rounded hover:bg-slate-100 font-mono flex items-center justify-between">
              <span className="truncate">{t.table_name}</span>
              <span className="text-slate-400 text-[10px] ml-1">{t.columns_count}c</span>
            </button>
          ))}
          {tables.length === 0 && <Empty text="БД snapshot ещё не создан" />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{selected?.table_name || 'Выбери таблицу'}</CardTitle></CardHeader>
        <CardContent>
          {!selected && <Empty text="Выбери таблицу слева" />}
          {selected && Array.isArray(selected.columns_json) && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Колонка</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead className="w-20">Null</TableHead>
                  <TableHead>Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selected.columns_json || []).map((c, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{c.name}</TableCell>
                    <TableCell className="text-xs">{c.type}</TableCell>
                    <TableCell className="text-xs">{c.nullable ? 'yes' : 'no'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{c.default || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Runs
// ============================================================
function RunsTab({ env, toast }: { env: DAEnv; toast: ToastFn }) {
  const [runs, setRuns] = useState<DARun[]>([]);
  const [selected, setSelected] = useState<Awaited<ReturnType<typeof devAgent.runGet>> | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [traceRunId, setTraceRunId] = useState<number | null>(null);

  const reload = () => devAgent.runsList(env).then(r => setRuns(r.items || []));
  useEffect(() => { reload();   }, [env]);

  const open = async (id: number) => {
    const r = await devAgent.runGet(env, id);
    setSelected(r);
  };

  const openTrace = (id: number) => {
    setTraceRunId(id);
    setTraceOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Запуски ({runs.length})
            <Button size="sm" variant="ghost" onClick={reload} className="h-7">
              <Icon name="RefreshCw" size={12} className="mr-1" /> Обновить
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? <Empty text="Запусков пока нет" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Когда</TableHead>
                  <TableHead>Сессия</TableHead>
                  <TableHead className="w-20">Mode</TableHead>
                  <TableHead className="w-20">Модель</TableHead>
                  <TableHead className="w-20">Статус</TableHead>
                  <TableHead className="w-20">Latency</TableHead>
                  <TableHead className="w-24">Tokens</TableHead>
                  <TableHead className="w-20 text-right">Trace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map(r => (
                  <TableRow key={r.id} className="hover:bg-slate-50">
                    <TableCell className="text-xs cursor-pointer" onClick={() => open(r.id)}>{formatDate(r.created_at)}</TableCell>
                    <TableCell className="text-xs cursor-pointer truncate max-w-[200px]" onClick={() => open(r.id)}>{r.session_title || '—'}</TableCell>
                    <TableCell className="text-xs cursor-pointer" onClick={() => open(r.id)}>{r.mode}</TableCell>
                    <TableCell className="text-xs font-mono cursor-pointer" onClick={() => open(r.id)}>{r.model}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => open(r.id)}>
                      <Badge variant={r.status === 'ok' ? 'default' : r.status === 'partial' ? 'secondary' : 'destructive'} className="text-[10px]">{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs cursor-pointer" onClick={() => open(r.id)}>{r.latency_ms || '—'} мс</TableCell>
                    <TableCell className="text-xs cursor-pointer" onClick={() => open(r.id)}>{r.input_tokens || 0}/{r.output_tokens || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={r.full_trace_available ? 'outline' : 'ghost'}
                        disabled={!r.full_trace_available}
                        className="h-6 text-[10px] px-2"
                        onClick={() => openTrace(r.id)}
                        title={r.full_trace_available ? 'Открыть полный trace' : 'Trace не сохранён для этого запуска'}
                      >
                        <Icon name="FileSearch" size={11} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TraceModal env={env} runId={traceRunId} open={traceOpen} onOpenChange={setTraceOpen} toast={toast} />

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Run #{selected.run.id}
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                <Icon name="X" size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-500">UUID</div>
                <div className="font-mono">{selected.run.run_uuid}</div>
              </div>
              <div>
                <div className="text-slate-500">Mode / status</div>
                <div>{selected.run.mode} · <Badge variant="outline" className="text-[10px]">{selected.run.status}</Badge></div>
              </div>
              <div>
                <div className="text-slate-500">Tokens</div>
                <div>{selected.run.input_tokens || 0} / {selected.run.output_tokens || 0}</div>
              </div>
              <div>
                <div className="text-slate-500">Latency</div>
                <div>{selected.run.latency_ms} мс</div>
              </div>
            </div>
            {selected.tool_calls.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold mb-1">Tool calls ({selected.tool_calls.length})</div>
                <div className="space-y-1">
                  {selected.tool_calls.map(t => (
                    <div key={t.id} className="text-[11px] border rounded p-2 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{t.tool_name}</span>
                        <span className="text-slate-400">{t.latency_ms} мс · {t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Help / Инструкция
// ============================================================
function HelpTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-4 text-sm leading-relaxed">
      {/* Intro */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Bot" size={18} className="text-violet-600" />
            Что такое Dev Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <p>
            Dev Agent — это внутренний инженерный AI-агент для админки проекта. Он индексирует кодовую базу,
            понимает её структуру (файлы, символы, маршруты, API-эндпоинты, таблицы БД) и помогает разбираться,
            где что находится и как устроено.
          </p>
          <p>
            Сейчас агент работает в режиме <b>V1.5</b>: только чтение индекса + ответы YandexGPT с обязательными цитатами.
            Изменять файлы, делать PR или выкатывать патчи он <b>не умеет</b> — это безопасный диагностический инструмент.
          </p>
        </CardContent>
      </Card>

      {/* Tabs guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="LayoutDashboard" size={18} />
            Вкладки и что в них делать
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HelpItem icon="Home" title="Обзор" >
            Состояние индекса: сколько файлов, символов, роутов, API, таблиц проиндексировано.
            Здесь же кнопка <b>«Переиндексировать»</b> — запускает свежий снапшот по текущему коду.
            Делай это после крупных изменений в проекте.
          </HelpItem>
          <HelpItem icon="Search" title="Поиск">
            Быстрый поиск по индексу без LLM. Ищет одновременно по файлам, символам, роутам, API-эндпоинтам
            и фрагментам кода. Подходит для точечных запросов: «AIAssistantWidget», «family-wallet», «/admin/».
          </HelpItem>
          <HelpItem icon="MessageSquare" title="Чат — главная фича">
            Здесь задаёшь вопросы агенту на русском. В правом верхнем углу есть тоггл:
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><b>Поиск</b> — только grounded search, без LLM. Быстро и без расхода токенов.</li>
              <li><b>YandexGPT</b> — полный режим: retrieval → prompt → ответ модели с цитатами.</li>
            </ul>
            Селектор <b>mode</b>:
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><b>explain</b> — объяснить, как устроен участок («как работает chat.send_llm»).</li>
              <li><b>locate</b> — найти, где что лежит («где зарегистрирован /admin/dev-agent»).</li>
            </ul>
            <div className="text-[11px] text-slate-500 mt-1">Ctrl+Enter — отправить.</div>
          </HelpItem>
          <HelpItem icon="FolderTree" title="Файлы">
            Дерево всех проиндексированных файлов с метаданными: язык, категория, размер, количество строк.
            Клик по файлу — превью содержимого + извлечённые символы.
            В правой панели кнопка <b>«Что улучшить?»</b> (V1.7) — структурированный AI-ревью
            с issues, suggestions, quick wins и цитатами. Режимы: <b>review</b> (проблемы)
            и <b>improve</b> (план улучшений). Можно выбрать focus: readability, architecture,
            performance, state, types, routing, forms, effects, api, testing.
          </HelpItem>
          <HelpItem icon="Route" title="Роуты/API">
            Все маршруты фронта (React Router) и backend-эндпоинты (Cloud Functions). Полезно, когда хочешь
            понять, какие URL обслуживаются и какая функция за это отвечает.
          </HelpItem>
          <HelpItem icon="Database" title="БД">
            Структура PostgreSQL: список таблиц, колонки, типы, ключи. Снимок берётся из живой БД.
          </HelpItem>
          <HelpItem icon="History" title="Запуски">
            История всех LLM-вызовов: latency, токены, статус (<code>ok</code>/<code>partial</code>),
            модель. Колонка <b>Trace</b> — открывает полный лог конкретного запроса:
            какой prompt ушёл в YandexGPT, что вернула модель, какие цитаты были разрешены.
          </HelpItem>
        </CardContent>
      </Card>

      {/* How LLM mode works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Sparkles" size={18} className="text-violet-600" />
            Как работает режим YandexGPT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <ol className="list-decimal ml-5 space-y-1.5">
            <li>Твой вопрос идёт в backend <code>chat.send_llm</code>.</li>
            <li>
              Делается <b>retrieval</b> по индексу: до 8 фрагментов кода, 5 символов, 5 файлов,
              3 роута, 3 API-эндпоинта, 3 таблицы БД.
            </li>
            <li>Каждой найденной сущности присваивается <code>citation_id</code>: c1, c2, c3…</li>
            <li>Собирается prompt из 7 слоёв: правила → режим → разрешённые цитаты → контекст → вопрос → схема ответа.</li>
            <li>
              YandexGPT возвращает <b>только</b> JSON: <code>answer</code>, <code>citation_ids</code>,
              <code> confidence</code>. Модель <b>не</b> видит file_path — только id, чтобы не выдумывать пути.
            </li>
            <li>
              Backend валидирует JSON. Если что-то не так — graceful <b>fallback</b>:
              ответ собирается из retrieval, status = <code>partial</code>, в чате жёлтый баннер.
            </li>
            <li>
              Run сохраняется в БД, tool_calls — 4 шага: <code>search.query</code>, <code>context.build</code>,
              <code>llm.generate</code>, <code>response.validate</code>.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Lightbulb" size={18} className="text-amber-500" />
            Примеры запросов
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ExampleBlock mode="explain" examples={[
            'Как устроен chat.send_llm в backend dev-agent-admin?',
            'Объясни архитектуру FamilyWallet — где данные, где UI, где backend',
            'Как работает индексация в Dev Agent — какие таблицы используются?',
            'Опиши, как устроена авторизация пользователя в проекте',
          ]} />
          <ExampleBlock mode="locate" examples={[
            'Где зарегистрирован маршрут /admin/dev-agent?',
            'В каких файлах используется hook useToast?',
            'Найди все upload-функции в backend',
            'Где хранится таблица dev_agent_runs и кто её пишет?',
          ]} />
        </CardContent>
      </Card>

      {/* Trace */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="FileSearch" size={18} />
            Полный trace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <p>
            После каждого LLM-ответа в правом инспекторе появляется кнопка <b>«Открыть полный trace»</b>.
            То же доступно во вкладке <b>Запуски</b> — колонка Trace.
          </p>
          <p>Внутри 4 вкладки:</p>
          <ul className="list-disc ml-5 space-y-0.5 text-[13px]">
            <li><b>Prompt</b> — финальный текст, ушедший в YandexGPT (все 7 слоёв).</li>
            <li><b>Raw response</b> — сырой ответ модели до парсинга.</li>
            <li><b>Validated</b> — нормализованный объект после валидации.</li>
            <li><b>Allowed citations</b> — какие цитаты были разрешены модели.</li>
          </ul>
          <p className="text-[12px] text-slate-500">
            Trace сохраняется в S3 (<code>dev-agent/traces/&#123;env&#125;/&#123;uuid&#125;.json</code>)
            если: включён флаг <code>dev_agent.llm_debug_enabled</code>, был fallback, или ошибка модели.
          </p>
        </CardContent>
      </Card>

      {/* Feature flags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="ToggleRight" size={18} />
            Конфиг и флаги
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-700">
          <FlagRow code="dev_agent.llm_enabled" desc="Включает режим YandexGPT в чате. На stage = ON, на prod = OFF по умолчанию." />
          <FlagRow code="dev_agent.llm_debug_enabled" desc="Сохранять полный trace в S3 для каждого запроса. Stage = ON, prod = OFF." />
          <p className="text-[12px] text-slate-500 pt-1">
            Управление флагами — таблица <code>domovoy_feature_flags</code> в БД.
            Конфиг агента (max_chunks, max_context_chars, primary_model) — <code>dev_agent_configs</code>.
          </p>
        </CardContent>
      </Card>

      {/* Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="AlertTriangle" size={18} className="text-amber-500" />
            Что Dev Agent НЕ умеет (пока)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-5 space-y-1 text-slate-700">
            <li>Изменять файлы (patch generation, apply)</li>
            <li>Создавать pull requests или коммиты</li>
            <li>Запускать тесты или билд</li>
            <li>Выполнять SQL-запросы (только смотреть структуру)</li>
            <li>Многошаговые автономные циклы</li>
          </ul>
          <p className="mt-2 text-[12px] text-slate-500">
            Если хочешь что-то изменить в коде — пиши Юре в обычный чат. Dev Agent сейчас только показывает и объясняет.
          </p>
        </CardContent>
      </Card>

      {/* Quick start */}
      <Card className="border-violet-200 bg-violet-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-violet-900">
            <Icon name="Rocket" size={18} />
            Быстрый старт
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-5 space-y-1 text-slate-800">
            <li>Вкладка <b>Обзор</b> → если индекс пустой, нажми <b>«Переиндексировать»</b>.</li>
            <li>Вкладка <b>Чат</b> → переключи на <b>YandexGPT</b>, выбери mode <b>explain</b>.</li>
            <li>Спроси что-нибудь конкретное про код.</li>
            <li>Изучи цитаты справа и открой <b>полный trace</b>, чтобы убедиться, что ответ обоснован.</li>
            <li>Если модель ошиблась — в jellow-баннере увидишь fallback reason.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function HelpItem({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
      <div className="shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
        <Icon name={icon} size={16} className="text-slate-700" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-[13px] text-slate-600 mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function ExampleBlock({ mode, examples }: { mode: 'explain' | 'locate'; examples: string[] }) {
  return (
    <div>
      <Badge variant="outline" className="mb-1 text-[10px]">mode: {mode}</Badge>
      <ul className="space-y-1">
        {examples.map((e, i) => (
          <li key={i} className="text-[13px] text-slate-700 pl-3 border-l-2 border-slate-200">
            «{e}»
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlagRow({ code, desc }: { code: string; desc: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l-2 border-violet-300 pl-3">
      <code className="text-[12px] font-mono text-violet-700">{code}</code>
      <span className="text-[12px] text-slate-600">{desc}</span>
    </div>
  );
}