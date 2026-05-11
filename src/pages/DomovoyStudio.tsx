import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  studioApi, StudioEnv, StudioRole, StudioRoleVersion, StudioAIConfig,
  StudioContextSource, StudioTrace, StudioAuditEvent, StudioOverview,
  StudioSandboxResult, RegressionQuestion, RegressionRunSummary, RegressionRunResult,
} from '@/lib/studio/api';

const ENV_OPTIONS: StudioEnv[] = ['stage', 'prod'];

export default function DomovoyStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [env, setEnv] = useState<StudioEnv>('prod');
  const [tab, setTab] = useState('overview');

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/domovoy')}>
            <Icon name="ArrowLeft" size={16} />
          </Button>
          <Icon name="Sparkles" size={22} className="text-violet-600" />
          <h1 className="text-xl font-bold">Мозг Домового</h1>
          <span className="text-xs text-slate-500 hidden md:inline">Studio · Stage 1</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500">Среда:</span>
            <div className="inline-flex bg-slate-100 rounded-lg p-0.5">
              {ENV_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setEnv(opt)}
                  className={`px-3 py-1 text-xs rounded-md transition ${
                    env === opt ? 'bg-white shadow text-slate-900 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {opt === 'prod' ? 'Production' : 'Stage'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 md:grid-cols-9 gap-1 mb-6">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="architecture">Архитектура</TabsTrigger>
            <TabsTrigger value="roles">Роли</TabsTrigger>
            <TabsTrigger value="engine">Движок</TabsTrigger>
            <TabsTrigger value="context">Контекст</TabsTrigger>
            <TabsTrigger value="sandbox">Песочница</TabsTrigger>
            <TabsTrigger value="regression">Тесты</TabsTrigger>
            <TabsTrigger value="traces">Логи</TabsTrigger>
            <TabsTrigger value="audit">Аудит</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab env={env} /></TabsContent>
          <TabsContent value="architecture"><ArchitectureTab /></TabsContent>
          <TabsContent value="roles"><RolesTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="engine"><EngineTab env={env} /></TabsContent>
          <TabsContent value="context"><ContextTab env={env} /></TabsContent>
          <TabsContent value="sandbox"><SandboxTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="regression"><RegressionTab env={env} toast={toast} /></TabsContent>
          <TabsContent value="traces"><TracesTab env={env} /></TabsContent>
          <TabsContent value="audit"><AuditTab env={env} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================
// Overview
// ============================================================
function OverviewTab({ env }: { env: StudioEnv }) {
  const [data, setData] = useState<StudioOverview | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    studioApi.overview(env).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [env]);
  if (loading) return <Loader />;
  if (!data) return <EmptyState text="Нет данных" />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="Users" label="Всего ролей" value={data.roles.total} hint={`Активных: ${data.roles.active}`} />
        <StatCard icon="FileEdit" label="Черновики" value={data.roles.drafts} hint="Ждут публикации" />
        <StatCard icon="MessageSquare" label="Ответов за 24ч" value={data.traces.last_24h} hint={`За 7 дней: ${data.traces.last_7d}`} />
        <StatCard icon="Timer" label="Средняя задержка" value={`${data.avg_latency_ms} мс`} hint={`Токенов: ${data.avg_output_tokens}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Топ-5 ролей за 7 дней</CardTitle></CardHeader>
          <CardContent>
            {data.top_roles.length === 0 ? (
              <p className="text-sm text-slate-500">Пока нет данных</p>
            ) : (
              <ul className="space-y-2">
                {data.top_roles.map(r => (
                  <li key={r.role_code} className="flex justify-between text-sm">
                    <span className="font-mono text-slate-700">{r.role_code}</span>
                    <span className="font-semibold">{r.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Что изменилось</CardTitle></CardHeader>
          <CardContent>
            {data.recent_changes.length === 0 ? (
              <p className="text-sm text-slate-500">Изменений пока нет</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {data.recent_changes.slice(0, 8).map(e => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span className="text-slate-700">
                      <span className="font-mono">{e.event_type}</span>{' '}
                      <span className="text-slate-500">{e.entity_type}{e.entity_id ? `#${e.entity_id}` : ''}</span>
                    </span>
                    <span className="text-slate-400 whitespace-nowrap">{formatDate(e.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Architecture
// ============================================================
function ArchitectureTab() {
  const layers = [
    { code: 'resolver', name: 'Role Resolver', desc: 'Определяет роль и активную версию по точке входа.', icon: 'Route' },
    { code: 'context', name: 'Context Builder', desc: 'Собирает данные семьи: финансы, дом, дети, питомцы…', icon: 'Database' },
    { code: 'memory', name: 'Memory Layer', desc: 'Подмешивает последние сообщения из chat_messages.', icon: 'Brain' },
    { code: 'prompt', name: 'Prompt Builder', desc: 'Persona + role + safety + memory + context → итоговый prompt.', icon: 'FileText' },
    { code: 'llm', name: 'LLM Engine', desc: 'YandexGPT с параметрами из AI Config. Retry / fallback / timeout.', icon: 'Cpu' },
    { code: 'post', name: 'Post-processing', desc: 'Фильтры, обрезка, форматирование, safety-check ответа.', icon: 'Filter' },
    { code: 'trace', name: 'Trace & Audit', desc: 'Краткий trace в БД всегда. Полный — в S3 по 5 правилам.', icon: 'FileSearch' },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline сборки ответа</CardTitle>
        <p className="text-xs text-slate-500">7 слоёв, через которые проходит каждый запрос к Домовому.</p>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {layers.map((l, i) => (
            <li key={l.code} className="flex gap-3 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-mono text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon name={l.icon} size={16} className="text-slate-600" />
                  <span className="font-semibold">{l.name}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{l.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Roles
// ============================================================
type ToastFn = ReturnType<typeof useToast>['toast'];
function RolesTab({ env, toast }: { env: StudioEnv; toast: ToastFn }) {
  const [roles, setRoles] = useState<StudioRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudioRole | null>(null);
  const [versions, setVersions] = useState<StudioRoleVersion[]>([]);
  const [editPrompt, setEditPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await studioApi.rolesList(env);
      setRoles(data.items);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [env]);

  const openRole = async (r: StudioRole) => {
    setSelected(r);
    const data = await studioApi.roleGet(env, r.code);
    setVersions(data.versions);
    const published = data.versions.find(v => v.status === 'published');
    setEditPrompt(published?.role_prompt || '');
  };

  const saveDraft = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await studioApi.createDraft(env, selected.code, { role_prompt: editPrompt, notes: 'Edited via Studio' });
      toast({ title: 'Черновик сохранён', description: `Версия v${res.version_number}` });
      const data = await studioApi.roleGet(env, selected.code);
      setVersions(data.versions);
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally { setSaving(false); }
  };

  const publishVersion = async (versionId: number) => {
    if (!selected) return;
    if (!confirm(`Опубликовать в ${env}?`)) return;
    try {
      await studioApi.publishVersion(env, versionId);
      toast({ title: 'Опубликовано' });
      const data = await studioApi.roleGet(env, selected.code);
      setVersions(data.versions);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    }
  };

  const rollback = async () => {
    if (!selected) return;
    if (!confirm('Откатить на предыдущую версию?')) return;
    try {
      await studioApi.rollback(env, selected.code);
      toast({ title: 'Откат выполнен' });
      const data = await studioApi.roleGet(env, selected.code);
      setVersions(data.versions);
      load();
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    }
  };

  if (loading) return <Loader />;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {roles.map(r => (
          <Card
            key={r.id}
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => openRole(r)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              {r.image_url ? (
                <img src={r.image_url} alt={r.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                  {r.emoji || '🏠'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{r.name}</div>
                <div className="text-xs text-slate-500 font-mono truncate">{r.code}</div>
                <div className="flex gap-1 mt-1">
                  {r.is_active && <Badge variant="secondary" className="text-[10px]">active</Badge>}
                  {(r.draft_count ?? 0) > 0 && <Badge className="text-[10px] bg-amber-500">draft {r.draft_count}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.emoji} {selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Код: <span className="font-mono">{selected.code}</span></p>
                <p className="text-sm text-slate-600">{selected.description}</p>
              </div>

              <div>
                <label className="text-sm font-semibold">Промпт роли (правишь — создаётся новый draft)</label>
                <Textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  rows={8}
                  className="font-mono text-xs mt-1"
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={saveDraft} disabled={saving} size="sm">
                    <Icon name="Save" size={14} className="mr-1" /> Сохранить черновик
                  </Button>
                  <Button variant="outline" onClick={rollback} size="sm">
                    <Icon name="Undo2" size={14} className="mr-1" /> Откатить
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Версии ({env})</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>v</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Заметка</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map(v => (
                      <TableRow key={v.id}>
                        <TableCell className="font-mono">v{v.version_number}</TableCell>
                        <TableCell>
                          <Badge variant={v.status === 'published' ? 'default' : v.status === 'draft' ? 'secondary' : 'outline'}>
                            {v.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{formatDate(v.published_at || v.created_at)}</TableCell>
                        <TableCell className="text-xs text-slate-600">{v.notes || '—'}</TableCell>
                        <TableCell>
                          {v.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => publishVersion(v.id)}>
                              <Icon name="Send" size={12} className="mr-1" /> Publish
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================
// Engine
// ============================================================
function EngineTab({ env }: { env: StudioEnv }) {
  const [cfg, setCfg] = useState<StudioAIConfig | null>(null);
  useEffect(() => {
    studioApi.aiConfig(env).then(setCfg).catch(() => setCfg(null));
  }, [env]);
  if (!cfg) return <Loader />;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Параметры LLM ({env})</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Field label="Провайдер" value={cfg.provider} />
            <Field label="Модель" value={cfg.model_uri.split('/').pop()} mono />
            <Field label="Fallback" value={cfg.fallback_model_uri || '—'} mono />
            <Field label="Temperature" value={String(cfg.temperature)} />
            <Field label="Max tokens" value={String(cfg.max_tokens)} />
            <Field label="History depth" value={String(cfg.history_depth)} />
            <Field label="Timeout" value={`${cfg.timeout_sec} с`} />
            <Field label="Цена за ответ" value={`${cfg.price_rub} ₽`} />
            <Field label="Лимит семьи/день" value={String(cfg.limit_family_day)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Persona</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Домовой</p>
            <p className="text-sm bg-slate-50 p-3 rounded">{cfg.persona_domovoy}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Neutral</p>
            <p className="text-sm bg-slate-50 p-3 rounded">{cfg.persona_neutral}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Секреты</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {cfg.secrets && Object.entries(cfg.secrets).map(([key, ok]) => (
              <div key={key} className="flex items-center gap-2">
                <Icon name={ok ? 'CheckCircle2' : 'XCircle'} size={14} className={ok ? 'text-emerald-600' : 'text-rose-600'} />
                <span className="font-mono text-xs">{key}</span>
                <span className="text-xs text-slate-500">{ok ? 'подключён' : 'не настроен'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// Context
// ============================================================
function ContextTab({ env }: { env: StudioEnv }) {
  const [sources, setSources] = useState<StudioContextSource[]>([]);
  useEffect(() => {
    studioApi.contextSources(env).then(d => setSources(d.items)).catch(() => setSources([]));
  }, [env]);
  if (!sources.length) return <Loader />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Источники контекста ({sources.length})</CardTitle>
        <p className="text-xs text-slate-500">Какие данные семьи могут подмешиваться в prompt Домового.</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Код</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Лимит токенов</TableHead>
              <TableHead>Приоритет</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.code}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.token_limit}</TableCell>
                <TableCell>{s.priority}</TableCell>
                <TableCell>
                  <Badge variant={s.is_enabled_global ? 'default' : 'outline'}>
                    {s.is_enabled_global ? 'вкл' : 'выкл'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Regression Suite (Tests)
// ============================================================
function RegressionTab({ env, toast }: { env: StudioEnv; toast: ToastFn }) {
  const [roles, setRoles] = useState<StudioRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [questions, setQuestions] = useState<RegressionQuestion[]>([]);
  const [versions, setVersions] = useState<StudioRoleVersion[]>([]);
  const [versionId, setVersionId] = useState<number | null>(null);
  const [persona, setPersona] = useState<'domovoy' | 'neutral'>('domovoy');
  const [newQ, setNewQ] = useState('');
  const [newHint, setNewHint] = useState('');
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<RegressionRunResult | null>(null);
  const [history, setHistory] = useState<RegressionRunSummary[]>([]);

  useEffect(() => {
    studioApi.rolesList(env).then(d => {
      setRoles(d.items);
      if (d.items.length && !selectedRole) setSelectedRole(d.items[0].code);
    });
  }, [env]);

  const loadRoleData = async (code: string) => {
    const [rg, qs, runs] = await Promise.all([
      studioApi.roleGet(env, code),
      studioApi.regressionQuestions(env, code),
      studioApi.regressionRunsList(env, code),
    ]);
    setVersions(rg.versions);
    const pub = rg.versions.find(v => v.status === 'published');
    setVersionId(pub?.id || rg.versions[0]?.id || null);
    setQuestions(qs.items);
    setHistory(runs.items);
  };

  useEffect(() => {
    if (selectedRole) loadRoleData(selectedRole);
  }, [selectedRole, env]);

  const addQuestion = async () => {
    if (!newQ.trim() || !selectedRole) return;
    const r = await studioApi.regressionQuestionCreate(env, {
      role_code: selectedRole,
      question: newQ.trim(),
      expected_hint: newHint.trim() || undefined,
    });
    if (r.success) {
      setNewQ('');
      setNewHint('');
      loadRoleData(selectedRole);
    } else {
      toast({ title: 'Ошибка', description: r.error || 'Не удалось добавить' });
    }
  };

  const toggleActive = async (q: RegressionQuestion) => {
    await studioApi.regressionQuestionUpdate(env, { id: q.id, is_active: !q.is_active });
    loadRoleData(selectedRole);
  };

  const runAll = async () => {
    if (!selectedRole || !versionId) return;
    setRunning(true);
    setLastRun(null);
    try {
      const res = await studioApi.regressionRun(env, {
        role_code: selectedRole, version_id: versionId, persona,
      });
      if (!res.success) {
        toast({ title: 'Прогон не запустился', description: res.message || res.error });
      }
      setLastRun(res);
      loadRoleData(selectedRole);
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally {
      setRunning(false);
    }
  };

  const role = roles.find(r => r.code === selectedRole);
  const activeQs = questions.filter(q => q.is_active);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Регрессионный набор тестов</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              {activeQs.length} активных / {questions.length}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Контрольные вопросы для роли. Запускаем все сразу против выбранной версии — проверяем, что роль
            не сломалась после правки промпта. Кошелёк не списываем.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500">Роль</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {roles.map(r => (
                  <option key={r.code} value={r.code}>{r.emoji} {r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Версия</label>
              <select
                value={versionId || ''}
                onChange={e => setVersionId(Number(e.target.value))}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>v{v.version_number} · {v.status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Persona</label>
              <select
                value={persona}
                onChange={e => setPersona(e.target.value as 'domovoy' | 'neutral')}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                <option value="domovoy">Домовой</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button onClick={runAll} disabled={running || activeQs.length === 0 || !versionId}>
              {running
                ? <><Icon name="Loader2" size={14} className="mr-1 animate-spin" /> Прогон {activeQs.length} вопросов…</>
                : <><Icon name="PlayCircle" size={14} className="mr-1" /> Прогнать все ({activeQs.length})</>}
            </Button>
            {role && <span className="text-xs text-slate-500">{role.name}</span>}
          </div>
        </CardContent>
      </Card>

      {lastRun && lastRun.success && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Последний прогон</CardTitle>
              <div className="flex gap-2 text-xs">
                <Badge variant="default" className="bg-emerald-600">
                  ✓ {lastRun.summary.passed}
                </Badge>
                {lastRun.summary.errored > 0 && (
                  <Badge variant="destructive">✗ {lastRun.summary.errored}</Badge>
                )}
                <Badge variant="outline">{lastRun.summary.avg_latency_ms} мс ср.</Badge>
                <Badge variant="outline">{lastRun.summary.input_tokens}/{lastRun.summary.output_tokens} ток.</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastRun.results.map((r, i) => (
                <details key={i} className="border rounded">
                  <summary className="cursor-pointer text-xs px-3 py-2 flex items-center gap-2 bg-slate-50">
                    <Badge variant={r.status === 'ok' ? 'default' : 'destructive'} className="text-[10px]">
                      {r.status === 'ok' ? '✓' : '✗'}
                    </Badge>
                    <span className="flex-1 truncate">{r.question}</span>
                    <span className="text-slate-400">{r.latency_ms} мс</span>
                  </summary>
                  <div className="p-3 space-y-2 text-xs">
                    {r.expected_hint && (
                      <div>
                        <div className="text-[10px] uppercase text-slate-500">Ожидалось</div>
                        <div className="text-slate-600 italic">{r.expected_hint}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-[10px] uppercase text-slate-500">Ответ</div>
                      <div className="bg-slate-50 p-2 rounded whitespace-pre-wrap">
                        {r.response || r.error_code || '—'}
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Банк вопросов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 border rounded p-3 bg-slate-50">
            <div className="text-xs font-semibold text-slate-600">Новый вопрос</div>
            <Textarea
              value={newQ}
              onChange={e => setNewQ(e.target.value)}
              placeholder="Например: Что делать, если у ребёнка температура 38,5?"
              rows={2}
              className="text-sm"
            />
            <Textarea
              value={newHint}
              onChange={e => setNewHint(e.target.value)}
              placeholder="Подсказка проверяющему: что должно быть в ответе (опционально)"
              rows={1}
              className="text-xs"
            />
            <Button size="sm" onClick={addQuestion} disabled={!newQ.trim()}>
              <Icon name="Plus" size={12} className="mr-1" /> Добавить
            </Button>
          </div>

          {questions.length === 0 ? (
            <EmptyState text="Вопросов пока нет — добавь первый сверху" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Вопрос</TableHead>
                  <TableHead>Подсказка</TableHead>
                  <TableHead className="w-20">Вес</TableHead>
                  <TableHead className="w-24">Активен</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map(q => (
                  <TableRow key={q.id}>
                    <TableCell className="text-xs">{q.question}</TableCell>
                    <TableCell className="text-xs text-slate-500">{q.expected_hint || '—'}</TableCell>
                    <TableCell className="text-xs">{q.weight}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleActive(q)}
                        className={`text-xs px-2 py-0.5 rounded ${q.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
                      >
                        {q.is_active ? 'да' : 'нет'}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">История прогонов</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Когда</TableHead>
                  <TableHead>Версия</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Результат</TableHead>
                  <TableHead>Средняя задержка</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="text-xs">{formatDate(h.started_at)}</TableCell>
                    <TableCell className="text-xs">v{h.version_number}</TableCell>
                    <TableCell className="text-xs">{h.persona}</TableCell>
                    <TableCell className="text-xs">
                      <span className="text-emerald-600">✓{h.passed}</span>
                      {h.errored > 0 && <span className="text-rose-600 ml-2">✗{h.errored}</span>}
                      <span className="text-slate-400"> / {h.total_questions}</span>
                    </TableCell>
                    <TableCell className="text-xs">{h.avg_latency_ms} мс</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================
// Sandbox
// ============================================================
function SandboxTab({ env, toast }: { env: StudioEnv; toast: ToastFn }) {
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [roles, setRoles] = useState<StudioRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [versionsA, setVersionsA] = useState<StudioRoleVersion[]>([]);
  const [versionA, setVersionA] = useState<number | null>(null);
  const [versionB, setVersionB] = useState<number | null>(null);
  const [persona, setPersona] = useState<'domovoy' | 'neutral'>('domovoy');
  const [question, setQuestion] = useState('Какие три блюда можно приготовить из курицы, картошки и моркови?');
  const [extraContext, setExtraContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState<StudioSandboxResult | null>(null);
  const [resultB, setResultB] = useState<StudioSandboxResult | null>(null);

  useEffect(() => {
    studioApi.rolesList(env).then(d => {
      setRoles(d.items);
      if (d.items.length && !selectedRole) {
        setSelectedRole(d.items[0].code);
      }
    });
  }, [env]);

  useEffect(() => {
    if (!selectedRole) return;
    studioApi.roleGet(env, selectedRole).then(d => {
      setVersionsA(d.versions);
      const published = d.versions.find(v => v.status === 'published');
      const draft = d.versions.find(v => v.status === 'draft');
      setVersionA(published?.id || d.versions[0]?.id || null);
      setVersionB(draft?.id || published?.id || null);
    });
  }, [selectedRole, env]);

  const run = async () => {
    if (!question.trim() || !versionA) return;
    setLoading(true);
    setResultA(null);
    setResultB(null);
    try {
      const payloadA = {
        question,
        version_id: versionA,
        persona,
        extra_context: extraContext || undefined,
      };
      if (mode === 'compare' && versionB && versionB !== versionA) {
        const [a, b] = await Promise.all([
          studioApi.sandboxRun(env, payloadA),
          studioApi.sandboxRun(env, { ...payloadA, version_id: versionB }),
        ]);
        setResultA(a);
        setResultB(b);
      } else {
        const a = await studioApi.sandboxRun(env, payloadA);
        setResultA(a);
      }
    } catch (e) {
      toast({ title: 'Ошибка', description: String(e) });
    } finally {
      setLoading(false);
    }
  };

  const role = roles.find(r => r.code === selectedRole);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Песочница</CardTitle>
            <div className="inline-flex bg-slate-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setMode('single')}
                className={`px-3 py-1 rounded-md ${mode === 'single' ? 'bg-white shadow font-semibold' : 'text-slate-600'}`}
              >
                Одна версия
              </button>
              <button
                onClick={() => setMode('compare')}
                className={`px-3 py-1 rounded-md ${mode === 'compare' ? 'bg-white shadow font-semibold' : 'text-slate-600'}`}
              >
                A/B сравнение
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Тестовый прогон. Кошелёк не списываем. Trace сохраняется с reason=sandbox.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500">Роль</label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {roles.map(r => (
                  <option key={r.code} value={r.code}>{r.emoji} {r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Persona</label>
              <select
                value={persona}
                onChange={e => setPersona(e.target.value as 'domovoy' | 'neutral')}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                <option value="domovoy">Домовой (тёплый)</option>
                <option value="neutral">Neutral (профессиональный)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">{mode === 'compare' ? 'Версия A' : 'Версия'}</label>
              <select
                value={versionA || ''}
                onChange={e => setVersionA(Number(e.target.value))}
                className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
              >
                {versionsA.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.version_number} · {v.status}
                  </option>
                ))}
              </select>
            </div>
            {mode === 'compare' && (
              <div>
                <label className="text-xs text-slate-500">Версия B</label>
                <select
                  value={versionB || ''}
                  onChange={e => setVersionB(Number(e.target.value))}
                  className="w-full mt-1 border rounded-md px-2 py-1.5 text-sm bg-white"
                >
                  {versionsA.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.version_number} · {v.status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-slate-500">Вопрос пользователя</label>
            <Textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-slate-500">Доп. контекст (опционально)</label>
            <Textarea
              value={extraContext}
              onChange={e => setExtraContext(e.target.value)}
              rows={2}
              placeholder="Например: семья из 4 человек, ребёнок 5 лет, аллергия на орехи"
              className="mt-1 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={run} disabled={loading || !versionA || !question.trim()}>
              {loading
                ? <><Icon name="Loader2" size={14} className="mr-1 animate-spin" /> Запрос…</>
                : <><Icon name="Play" size={14} className="mr-1" /> Запустить</>}
            </Button>
            {role && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {role.image_url && (
                  <img src={role.image_url} alt={role.name} className="w-7 h-7 rounded-full object-cover" />
                )}
                <span>{role.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {mode === 'single' && resultA && <SandboxResult result={resultA} title="Результат" />}
      {mode === 'compare' && (resultA || resultB) && (
        <div className="grid md:grid-cols-2 gap-4">
          {resultA && <SandboxResult result={resultA} title="Версия A" />}
          {resultB && <SandboxResult result={resultB} title="Версия B" />}
        </div>
      )}
    </div>
  );
}

function SandboxResult({ result, title }: { result: StudioSandboxResult; title: string }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const ok = result.status === 'ok';
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title} · v{result.version?.version_number}</CardTitle>
          <Badge variant={ok ? 'default' : 'destructive'}>{result.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
          <span>⚡ {result.latency_ms} мс</span>
          <span>📥 {result.input_tokens} ток.</span>
          <span>📤 {result.output_tokens} ток.</span>
          <span className="font-mono">{result.model}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.error || !ok ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded">
            {result.message || result.error_code || result.error || 'Ошибка'}
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded text-sm whitespace-pre-wrap">{result.response}</div>
        )}

        <div className="border-t pt-2">
          <button
            onClick={() => setShowPrompt(s => !s)}
            className="text-xs text-violet-600 hover:underline flex items-center gap-1"
          >
            <Icon name={showPrompt ? 'ChevronDown' : 'ChevronRight'} size={12} />
            Финальный prompt (checksum: <span className="font-mono">{result.prompt_checksum}</span>)
          </button>
          {showPrompt && (
            <pre className="mt-2 text-xs bg-slate-900 text-slate-100 p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {result.final_prompt}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Traces
// ============================================================
function TracesTab({ env }: { env: StudioEnv }) {
  const [traces, setTraces] = useState<StudioTrace[]>([]);
  const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
  const [fullData, setFullData] = useState<Record<string, unknown> | null>(null);
  const [shortData, setShortData] = useState<StudioTrace | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    studioApi.traces(env, 100).then(d => setTraces(d.items)).catch(() => setTraces([]));
  }, [env]);

  const openTrace = async (t: StudioTrace) => {
    setSelectedUuid(t.trace_uuid);
    setFullData(null);
    setShortData(t);
    if (t.full_trace_available) {
      setLoading(true);
      try {
        const res = await studioApi.traceGet(env, t.trace_uuid);
        setFullData(res.full);
        setShortData(res.short);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Trace последних 100 ответов</CardTitle>
          <p className="text-xs text-slate-500">
            Краткий «паспорт» каждого ответа. Строки с «полным» trace кликабельны — внутри полная сборка prompt и raw-ответ модели.
          </p>
        </CardHeader>
        <CardContent>
          {traces.length === 0 ? (
            <EmptyState text="Trace пока нет — диалоги ещё не шли через новый pipeline" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Когда</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Точка входа</TableHead>
                  <TableHead>Модель</TableHead>
                  <TableHead>Задержка</TableHead>
                  <TableHead>Токены in/out</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Full</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {traces.map(t => (
                  <TableRow
                    key={t.trace_uuid}
                    onClick={() => openTrace(t)}
                    className={t.full_trace_available ? 'cursor-pointer hover:bg-slate-50' : 'cursor-pointer hover:bg-slate-50/50'}
                  >
                    <TableCell className="text-xs">{formatDate(t.created_at)}</TableCell>
                    <TableCell className="font-mono text-xs">{t.role_code || '—'}</TableCell>
                    <TableCell className="text-xs">{t.entry_point || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{t.model || '—'}</TableCell>
                    <TableCell className="text-xs">{t.latency_ms ? `${t.latency_ms} мс` : '—'}</TableCell>
                    <TableCell className="text-xs">{t.input_tokens ?? '—'}/{t.output_tokens ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'ok' ? 'default' : 'destructive'}>{t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {t.full_trace_available && (
                        <Badge variant="outline" className="text-[10px]">
                          {t.full_trace_reason || 'full'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedUuid} onOpenChange={(o) => !o && (setSelectedUuid(null), setFullData(null))}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trace</DialogTitle>
          </DialogHeader>
          {shortData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Field label="UUID" value={shortData.trace_uuid.slice(0, 8) + '…'} mono />
                <Field label="Когда" value={formatDate(shortData.created_at)} />
                <Field label="Роль" value={shortData.role_code || '—'} mono />
                <Field label="Статус" value={shortData.status} />
                <Field label="Модель" value={shortData.model || '—'} mono />
                <Field label="Задержка" value={shortData.latency_ms ? `${shortData.latency_ms} мс` : '—'} />
                <Field label="Токены вход" value={String(shortData.input_tokens ?? '—')} />
                <Field label="Токены выход" value={String(shortData.output_tokens ?? '—')} />
              </div>

              {!shortData.full_trace_available && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded">
                  Полный trace для этого запроса не сохранён. Полный trace пишется в 5 случаях: песочница, ошибка/таймаут,
                  явный debug-target, первые 24ч после publish роли/конфига, явный sample.
                </div>
              )}

              {loading && <Loader />}

              {fullData && (
                <div className="space-y-3">
                  <TraceSection title="Блоки prompt" data={(fullData.blocks as Record<string, string>) || {}} kind="blocks" />
                  {(fullData.final_prompt as string) && (
                    <details className="border rounded">
                      <summary className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-50">
                        Финальный prompt (checksum: {fullData.prompt_checksum as string})
                      </summary>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-3 overflow-x-auto whitespace-pre-wrap">
                        {fullData.final_prompt as string}
                      </pre>
                    </details>
                  )}
                  {fullData.request && (
                    <details className="border rounded">
                      <summary className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-50">Запрос к модели</summary>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-3 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(fullData.request, null, 2)}
                      </pre>
                    </details>
                  )}
                  {fullData.response && (
                    <details className="border rounded" open>
                      <summary className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-50">Ответ модели</summary>
                      <pre className="text-xs bg-slate-900 text-slate-100 p-3 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(fullData.response, null, 2)}
                      </pre>
                    </details>
                  )}
                  {fullData.metrics && (
                    <details className="border rounded">
                      <summary className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-50">Метрики</summary>
                      <pre className="text-xs bg-slate-50 p-3 overflow-x-auto">
                        {JSON.stringify(fullData.metrics, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function TraceSection({ title, data, kind }: { title: string; data: Record<string, string>; kind: string }) {
  const entries = Object.entries(data || {}).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <details className="border rounded" open={kind === 'blocks'}>
      <summary className="cursor-pointer text-xs font-semibold px-3 py-2 bg-slate-50">{title}</summary>
      <div className="p-3 space-y-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">{key}</div>
            <pre className="text-xs bg-slate-50 p-2 rounded whitespace-pre-wrap mt-0.5">{value}</pre>
          </div>
        ))}
      </div>
    </details>
  );
}

// ============================================================
// Audit
// ============================================================
function AuditTab({ env }: { env: StudioEnv }) {
  const [events, setEvents] = useState<StudioAuditEvent[]>([]);
  useEffect(() => {
    studioApi.audit(env, 100).then(d => setEvents(d.items)).catch(() => setEvents([]));
  }, [env]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Лог изменений ({events.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState text="Изменений пока нет" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Событие</TableHead>
                <TableHead>Объект</TableHead>
                <TableHead>Среда</TableHead>
                <TableHead>Заметка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs whitespace-nowrap">{formatDate(e.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{e.event_type}</TableCell>
                  <TableCell className="text-xs">{e.entity_type}{e.entity_id ? `#${e.entity_id}` : ''}</TableCell>
                  <TableCell className="text-xs">{e.environment || '—'}</TableCell>
                  <TableCell className="text-xs text-slate-600">{e.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// UI helpers
// ============================================================
function Loader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="text-center py-12 text-sm text-slate-500">{text}</div>;
}

function StatCard({ icon, label, value, hint }: { icon: string; label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Icon name={icon} size={14} />
          <span className="text-xs">{label}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {hint && <div className="text-xs text-slate-500 mt-0.5">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-sm ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}