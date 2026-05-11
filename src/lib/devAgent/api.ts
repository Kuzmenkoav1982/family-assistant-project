/**
 * Dev Agent Studio — клиент API.
 * Action-based эндпоинт, две функции: dev-agent-admin (read+chat) и dev-agent-indexer (seed).
 */
import func2url from '../../../backend/func2url.json';

const ADMIN_URL = (func2url as Record<string, string>)['dev-agent-admin'];
const INDEXER_URL = (func2url as Record<string, string>)['dev-agent-indexer'];

export type DAEnv = 'stage' | 'prod';
export type DAMode = 'explain' | 'locate' | 'plan' | 'patch';

/**
 * Resolve current user id for X-User-Id header.
 * Tries (in order): explicit 'userId' / 'familyMemberId' keys → user_data/userData JSON
 * (member_id → memberId → id). Returns '' if nothing usable found.
 */
function resolveUserId(): string {
  const direct = localStorage.getItem('userId') || localStorage.getItem('familyMemberId');
  if (direct) return String(direct);
  for (const key of ['user_data', 'userData', 'user']) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const u = JSON.parse(raw);
      const id = u?.member_id ?? u?.memberId ?? u?.id;
      if (id !== undefined && id !== null && id !== '') return String(id);
    } catch {
      /* ignore parse errors, try next key */
    }
  }
  return '';
}

function resolveAuthToken(): string {
  return localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';
}

async function call<T>(url: string, action: string, env: DAEnv,
                       query: Record<string, string> = {}, body?: Record<string, unknown>): Promise<T> {
  const userId = resolveUserId();
  const authToken = resolveAuthToken();
  const qs = new URLSearchParams({ action, env, ...query }).toString();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userId) headers['X-User-Id'] = userId;
  if (authToken) headers['X-Authorization'] = `Bearer ${authToken}`;
  const init: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers,
  };
  if (body) init.body = JSON.stringify({ action, env, ...body });
  const resp = await fetch(`${url}?${qs}`, init);
  return resp.json();
}

export interface DASnapshot {
  id: number;
  snapshot_uuid?: string;
  commit_sha: string;
  commit_message?: string;
  branch_name?: string;
  indexing_status: string;
  files_count: number;
  chunks_count: number;
  symbols_count: number;
  routes_count: number;
  endpoints_count: number;
  indexed_at?: string;
  created_at: string;
  is_active: boolean;
}

export interface DAOverview {
  environment: DAEnv;
  active_snapshot: DASnapshot | null;
  snapshot_id: number | null;
  metrics: { runs_7d: number; active_sessions: number };
  flags: Array<{ code: string; env: string; enabled: boolean }>;
}

export interface DAConfig {
  id: number;
  environment: DAEnv;
  primary_model: string;
  fallback_model?: string;
  repo_provider: string;
  repo_slug?: string;
  default_branch: string;
  snapshot_s3_prefix: string;
  max_context_chars: number;
  max_chunks: number;
  patch_apply_mode: string;
  sandbox_enabled: boolean;
  updated_at?: string;
}

export interface DASearchItem {
  type: 'file' | 'symbol' | 'route' | 'api' | 'chunk';
  score: number;
  path?: string;
  file_id?: number;
  language?: string;
  category?: string;
  line_count?: number;
  symbol_id?: number;
  symbol_name?: string;
  symbol_kind?: string;
  line_no?: number;
  route_id?: number;
  route_path?: string;
  page_component?: string;
  area?: string;
  api_id?: number;
  function_name?: string;
  action_name?: string;
  http_method?: string;
  endpoint_path?: string;
  chunk_id?: number;
  start_line?: number;
  end_line?: number;
  snippet?: string;
}

export interface DAFile {
  id: number;
  snapshot_id: number;
  path: string;
  language?: string;
  category?: string;
  line_count?: number;
  size_bytes: number;
  sha256?: string;
  raw_s3_key?: string;
  chunks?: Array<{ id: number; chunk_index: number; chunk_kind: string; symbol_name?: string; start_line?: number; end_line?: number; preview: string }>;
  symbols?: Array<{ id: number; symbol_name: string; symbol_kind: string; exported: boolean; line_no?: number }>;
}

export interface DARoute {
  id: number;
  route_path: string;
  page_component?: string;
  area: string;
  auth_scope?: string;
  source_path?: string;
}

export interface DAApiEndpoint {
  id: number;
  function_name: string;
  action_name?: string;
  http_method?: string;
  endpoint_path?: string;
  auth_scope?: string;
  source_path?: string;
}

export interface DADbTable {
  id: number;
  table_name: string;
  columns_count: number;
  indexes_count: number;
  fk_count: number;
  columns_json?: Array<{ name: string; type: string; nullable: boolean; default: string | null }>;
}

export interface DASession {
  id: number;
  session_uuid?: string;
  title: string;
  default_mode: DAMode;
  status: 'active' | 'archived';
  last_run_at?: string;
  created_at: string;
  updated_at: string;
  messages?: Array<{ id: number; speaker: string; content: string; citations: unknown; metadata: unknown; created_at: string }>;
}

export interface DAChatResult {
  success: boolean;
  session_id: number;
  run_id: number;
  question_msg_id: number;
  answer_msg_id: number;
  answer: string;
  citations: Array<{
    type?: string;
    path?: string;
    start_line?: number;
    end_line?: number;
    symbol_name?: string;
    snippet?: string;
  }>;
  retrieval?: { total: number; snapshot_id: number | null; latency_ms: number };
  error?: string;
}

export interface DALLMCitation {
  citation_id: string;
  file_path: string;
  start_line?: number | null;
  end_line?: number | null;
  symbol_name?: string | null;
  reason?: string | null;
}

export interface DAChatLLMResult {
  success: boolean;
  session_id: number;
  run_id: number;
  run_uuid: string;
  answer: string;
  citations: DALLMCitation[];
  affected_files: string[];
  confidence: 'low' | 'medium' | 'high';
  context_preview?: { files: string[]; chunks_count: number; total_allowed: number };
  run_meta: {
    model: string;
    status: 'ok' | 'partial' | 'error';
    latency_ms: number;
    input_tokens: number;
    output_tokens: number;
    fallback_used: boolean;
    fallback_reason: string | null;
    llm_enabled: boolean;
    full_trace_s3_key: string | null;
  };
  error?: string;
}

export interface DARunTraceResponse {
  success?: boolean;
  run_uuid?: string;
  s3_key?: string;
  environment?: string;
  model?: string;
  status?: string;
  trace?: {
    mode: string;
    environment: string;
    prompt: string;
    prompt_checksum: string;
    message: string;
    allowed_citations: Array<Record<string, unknown>>;
    llm_raw: unknown;
    llm_text: string | null;
    validated: Record<string, unknown>;
    fallback_used: boolean;
    fallback_reason: string | null;
  };
  error?: string;
  reason?: string;
}

export interface DARun {
  id: number;
  run_uuid?: string;
  session_id?: number;
  mode: DAMode;
  status: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
  created_at: string;
  session_title?: string;
  full_trace_available?: boolean;
  error_code?: string | null;
}

export const devAgent = {
  overview: (env: DAEnv) => call<DAOverview>(ADMIN_URL, 'overview.get', env),
  config: (env: DAEnv) => call<DAConfig>(ADMIN_URL, 'config.get', env),
  snapshotsList: (env: DAEnv) => call<{ items: DASnapshot[] }>(ADMIN_URL, 'snapshots.list', env),
  search: (env: DAEnv, query: string) =>
    call<{ items: DASearchItem[]; total: number; query: string }>(ADMIN_URL, 'search.query', env, {}, { query }),
  filesTree: (env: DAEnv) =>
    call<{ items: Array<{ id: number; path: string; language?: string; category?: string; line_count?: number; size_bytes: number }>; snapshot_id: number }>(
      ADMIN_URL, 'files.tree', env
    ),
  fileGet: (env: DAEnv, fileId: number) =>
    call<DAFile>(ADMIN_URL, 'files.get', env, { file_id: String(fileId) }),
  symbolsFind: (env: DAEnv, name: string, kind?: string) =>
    call<{ items: Array<{ id: number; symbol_name: string; symbol_kind: string; exported: boolean; line_no?: number; path: string }> }>(
      ADMIN_URL, 'symbols.find', env, {}, { name, kind }
    ),
  routesList: (env: DAEnv) => call<{ items: DARoute[] }>(ADMIN_URL, 'routes.list', env),
  apiList: (env: DAEnv) => call<{ items: DAApiEndpoint[] }>(ADMIN_URL, 'api.list', env),
  dbTablesList: (env: DAEnv) => call<{ items: DADbTable[]; db_snapshot_id: number }>(ADMIN_URL, 'db.tables.list', env),
  dbTableGet: (env: DAEnv, tableId: number) =>
    call<DADbTable & { columns_json: DADbTable['columns_json']; metadata: unknown }>(
      ADMIN_URL, 'db.tables.get', env, { table_id: String(tableId) }
    ),
  sessionsList: (env: DAEnv) => call<{ items: DASession[] }>(ADMIN_URL, 'sessions.list', env),
  sessionCreate: (env: DAEnv, title: string, mode: DAMode = 'explain') =>
    call<{ success: boolean; id: number; session_uuid: string }>(
      ADMIN_URL, 'sessions.create', env, {}, { title, default_mode: mode }
    ),
  sessionGet: (env: DAEnv, sessionId: number) =>
    call<DASession>(ADMIN_URL, 'sessions.get', env, { session_id: String(sessionId) }),
  chatSend: (env: DAEnv, message: string, sessionId?: number, mode: DAMode = 'explain') =>
    call<DAChatResult>(ADMIN_URL, 'chat.send', env, {}, {
      message, mode, ...(sessionId ? { session_id: sessionId } : {}),
    }),
  chatSendLLM: (env: DAEnv, message: string, sessionId?: number,
                mode: 'explain' | 'locate' = 'explain', debug = false) =>
    call<DAChatLLMResult>(ADMIN_URL, 'chat.send_llm', env, {}, {
      message, mode, debug,
      include_context_preview: true,
      ...(sessionId ? { session_id: sessionId } : {}),
    }),
  runsList: (env: DAEnv) => call<{ items: DARun[] }>(ADMIN_URL, 'runs.list', env),
  runGet: (env: DAEnv, runId: number) =>
    call<{ run: DARun; tool_calls: Array<{ id: number; tool_name: string; tool_input: unknown; tool_output: unknown; latency_ms?: number; status: string; created_at: string }> }>(
      ADMIN_URL, 'runs.get', env, { run_id: String(runId) }
    ),
  runTrace: (env: DAEnv, runId: number) =>
    call<DARunTraceResponse>(ADMIN_URL, 'runs.trace', env, { run_id: String(runId) }),

  // Indexer
  seedCreate: (env: DAEnv, payload: {
    commit_sha?: string;
    commit_message?: string;
    files?: Array<{ path: string; language?: string; category?: string; size_bytes?: number; line_count?: number }>;
    routes?: Array<{ route_path: string; page_component?: string; area: string; auth_scope?: string }>;
    endpoints?: Array<{ function_name: string; action_name?: string; http_method?: string; endpoint_path?: string }>;
    symbols?: Array<{ path: string; symbol_name: string; symbol_kind?: string; exported?: boolean; line_no?: number }>;
  }) => call<{ success: boolean; snapshot_id: number; files_count: number; routes_count: number; endpoints_count: number; symbols_count: number; db_snapshot_id: number }>(
    INDEXER_URL, 'seed.create', env, {}, payload
  ),
  seedStatus: (env: DAEnv) => call<{ snapshot: DASnapshot | null }>(INDEXER_URL, 'seed.status', env),
  snapshotActivate: (env: DAEnv, snapshotId: number) =>
    call<{ success: boolean }>(INDEXER_URL, 'snapshots.activate', env, {}, { snapshot_id: snapshotId }),

  // V1.6 — real ingestion
  indexFromGithub: (env: DAEnv, payload: {
    owner: string;
    repo: string;
    ref?: string;
    whitelist?: string[];
    extra_globs?: string[];
    max_files?: number;
  }) => call<{
    success: boolean;
    snapshot_id?: number;
    commit_sha?: string;
    commit_message?: string;
    counts?: { files: number; chunks: number; symbols: number; routes: number; endpoints: number };
    fetch_errors?: Array<{ path: string; error: unknown }>;
    elapsed_sec?: number;
    error?: string;
    detail?: unknown;
    message?: string;
  }>(INDEXER_URL, 'index.from_github', env, {}, payload),

  indexFromLocalPaths: (env: DAEnv, payload: {
    repo: string;
    commit_sha: string;
    target_paths: string[];
    include_direct_imports?: boolean;
    app_import_mode?: 'structural-only' | 'all';
    activate_snapshot?: boolean;
    branch?: string;
  }) => call<{
    success: boolean;
    snapshot_id?: number;
    commit_sha?: string;
    commit_message?: string;
    counts?: { files: number; chunks: number; symbols: number; routes: number; endpoints: number };
    targets_loaded?: number;
    neighbors_loaded?: number;
    missing_paths?: Array<{ path: string; error?: unknown }>;
    alias_sources?: { tsconfig?: boolean; vite?: boolean };
    activated?: boolean;
    elapsed_sec?: number;
    error?: string;
    detail?: unknown;
    message?: string;
  }>(INDEXER_URL, 'index.from_local_paths', env, {}, payload),

  indexFromSnapshot: (env: DAEnv, payload: {
    commit_sha?: string;
    commit_message?: string;
    branch_name?: string;
    files: Array<{ path: string; content: string }>;
  }) => call<{
    success: boolean;
    snapshot_id?: number;
    commit_sha?: string;
    counts?: { files: number; chunks: number; symbols: number; routes: number; endpoints: number };
    error?: string;
    message?: string;
  }>(INDEXER_URL, 'index.from_snapshot', env, {}, payload),

  indexStatus: (env: DAEnv) => call<{
    snapshot: (DASnapshot & {
      source_kind?: string;
      source_repo?: string;
      source_ref?: string;
      err_text?: string | null;
    }) | null
  }>(INDEXER_URL, 'index.status', env),

  indexActivate: (env: DAEnv, snapshotId: number) =>
    call<{ success: boolean }>(INDEXER_URL, 'index.activate_snapshot', env, {}, { snapshot_id: snapshotId }),

  // V1.7 — review.file
  reviewFile: (env: DAEnv, payload: {
    file_path: string;
    mode?: 'review' | 'improve';
    focus?: DAReviewFocus[];
    session_id?: number;
    max_chunks?: number;
    debug?: boolean;
  }) => call<DAReviewResult>(ADMIN_URL, 'review.file', env, {}, payload),
};

export type DAReviewFocus =
  | 'readability' | 'architecture' | 'performance' | 'state' | 'types'
  | 'routing' | 'forms' | 'effects' | 'api' | 'testing';

export interface DAReviewIssue {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  citation_ids: string[];
}

export interface DAReviewSuggestion {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
  citation_ids: string[];
}

export interface DAReviewCitation {
  citation_id: string;
  file_path: string;
  start_line?: number | null;
  end_line?: number | null;
  symbol_name?: string | null;
  reason?: string;
}

export interface DAReviewResult {
  success: boolean;
  ok?: boolean;
  session_id?: number;
  run_id?: number;
  file_path: string;
  mode: 'review' | 'improve';
  focus: DAReviewFocus[];
  summary: string;
  issues: DAReviewIssue[];
  suggestions: DAReviewSuggestion[];
  quick_wins: string[];
  confidence: 'low' | 'medium' | 'high';
  citations: DAReviewCitation[];
  affected_files: string[];
  context_preview?: { files: string[]; chunks_count: number; allowed_count: number };
  run_meta?: {
    model: string;
    status: string;
    latency_ms: number;
    input_tokens: number;
    output_tokens: number;
    fallback_used: boolean;
    fallback_reason: string | null;
    full_trace_available: boolean;
  };
  error?: string;
}