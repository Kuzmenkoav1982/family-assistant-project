/**
 * Domovoy AI Studio — клиент API.
 * Все запросы идут через единый action-based эндпоинт.
 */
import func2url from '../../../backend/func2url.json';

const STUDIO_URL = (func2url as Record<string, string>)['domovoy-studio'];

export type StudioEnv = 'stage' | 'prod';

export interface StudioRole {
  id: number;
  code: string;
  name: string;
  emoji?: string;
  icon?: string;
  color?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  updated_at?: string;
  published_version_id?: number | null;
  draft_count?: number;
  image_url?: string | null;
}

export interface StudioRoleVersion {
  id: number;
  version_number: number;
  status: 'draft' | 'published' | 'archived';
  environment: StudioEnv;
  role_prompt: string;
  bg_class?: string | null;
  image_css?: string | null;
  asset_id?: number | null;
  published_at?: string | null;
  notes?: string | null;
  created_at?: string;
  image_url?: string | null;
  greeting?: string | null;
  tone?: string | null;
  response_length?: string | null;
}

export interface StudioAIConfig {
  id: number;
  environment: StudioEnv;
  status: string;
  version_number: number;
  provider: string;
  model_uri: string;
  fallback_model_uri?: string | null;
  temperature: number;
  max_tokens: number;
  history_depth: number;
  timeout_sec: number;
  retry_count: number;
  retry_backoff_ms: number;
  price_rub: number;
  limit_family_day: number;
  limit_user_hour: number;
  debug_log_level: string;
  persona_domovoy?: string | null;
  persona_neutral?: string | null;
  notes?: string | null;
  published_at?: string | null;
  secrets?: Record<string, boolean>;
}

export interface StudioContextSource {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_enabled_global: boolean;
  token_limit: number;
  priority: number;
}

export interface StudioAsset {
  id: number;
  kind: string;
  name?: string;
  alt?: string;
  url: string;
  created_at: string;
  usages: number;
}

export interface StudioTrace {
  trace_uuid: string;
  created_at: string;
  family_id?: number | null;
  role_code?: string | null;
  role_version_id?: number | null;
  model?: string | null;
  latency_ms?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  status: string;
  error_code?: string | null;
  full_trace_available: boolean;
  full_trace_reason?: string | null;
}

export interface StudioAuditEvent {
  id: number;
  created_at: string;
  actor_user_id?: number | null;
  event_type: string;
  entity_type?: string | null;
  entity_id?: number | null;
  environment?: string | null;
  notes?: string | null;
}

export interface StudioOverview {
  environment: StudioEnv;
  roles: { total: number; active: number; drafts: number };
  traces: { last_24h: number; last_7d: number };
  avg_latency_ms: number;
  avg_output_tokens: number;
  top_roles: { role_code: string; count: number }[];
  recent_changes: StudioAuditEvent[];
}

function userHeaders(): Record<string, string> {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const uid = userData?.id ? String(userData.id) : '';
    return uid ? { 'X-User-Id': uid } : {};
  } catch {
    return {};
  }
}

async function call<T>(action: string, env: StudioEnv, params: Record<string, string> = {}, body?: Record<string, unknown>): Promise<T> {
  const search = new URLSearchParams({ action, env, ...params });
  const url = `${STUDIO_URL}?${search.toString()}`;
  const init: RequestInit = body
    ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...userHeaders() },
        body: JSON.stringify({ action, env, ...body }),
      }
    : { method: 'GET', headers: userHeaders() };
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Studio ${action} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export interface StudioSandboxResult {
  success: boolean;
  status: string;
  error_code?: string | null;
  response: string;
  role: { code: string; name: string };
  version: { id: number; version_number: number; environment: StudioEnv; status: string };
  model: string;
  temperature: number;
  max_tokens: number;
  final_prompt: string;
  prompt_checksum: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  cost_rub: number;
  trace_uuid?: string | null;
  error?: string;
  message?: string;
}

export interface StudioVersionFull extends StudioRoleVersion {
  role_code?: string;
  role_name?: string;
  role_id?: number;
}

export const studioApi = {
  overview: (env: StudioEnv) => call<StudioOverview>('overview', env),
  rolesList: (env: StudioEnv) => call<{ items: StudioRole[]; env: StudioEnv }>('roles.list', env),
  roleGet: (env: StudioEnv, code: string) =>
    call<{ role: StudioRole; versions: StudioRoleVersion[] }>('roles.get', env, { code }),
  createDraft: (env: StudioEnv, roleCode: string, fields: Partial<StudioRoleVersion> & { notes?: string }) =>
    call<{ success: boolean; version_id: number; version_number: number }>(
      'versions.create_draft', env, {}, { role_code: roleCode, ...fields }
    ),
  publishVersion: (env: StudioEnv, versionId: number) =>
    call<{ success: boolean }>('versions.publish', env, {}, { version_id: versionId }),
  rollback: (env: StudioEnv, roleCode: string) =>
    call<{ success: boolean; version_id: number }>('versions.rollback', env, {}, { role_code: roleCode }),
  versionGet: (env: StudioEnv, versionId: number) =>
    call<StudioVersionFull>('versions.get', env, { version_id: String(versionId) }),
  versionsCompare: (env: StudioEnv, a: number, b: number) =>
    call<{ a: StudioVersionFull; b: StudioVersionFull }>(
      'versions.compare', env, { a: String(a), b: String(b) }
    ),
  sandboxRun: (env: StudioEnv, params: {
    question: string;
    role_code?: string;
    version_id?: number;
    persona?: 'domovoy' | 'neutral';
    extra_context?: string;
    family_id?: number;
  }) => call<StudioSandboxResult>('sandbox.run', env, {}, params),
  aiConfig: (env: StudioEnv) => call<StudioAIConfig>('ai_config.get', env),
  contextSources: (env: StudioEnv) =>
    call<{ items: StudioContextSource[] }>('context_sources.list', env),
  assets: (env: StudioEnv) => call<{ items: StudioAsset[] }>('assets.list', env),
  traces: (env: StudioEnv, limit = 50) =>
    call<{ items: StudioTrace[]; env: StudioEnv }>('traces.list', env, { limit: String(limit) }),
  audit: (env: StudioEnv, limit = 50) =>
    call<{ items: StudioAuditEvent[] }>('audit.list', env, { limit: String(limit) }),
};