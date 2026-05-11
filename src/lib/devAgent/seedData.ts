/**
 * Seed-метаданные для первой индексации.
 * Это упрощённый знаниевый слой о проекте, который мы знаем «вручную».
 * В V2 заменим CI-индексатором, который читает реальный snapshot из S3.
 */
import func2url from '../../../backend/func2url.json';

export interface SeedFile {
  path: string;
  language?: string;
  category: 'page' | 'component' | 'backend' | 'sql' | 'doc' | 'config';
  size_bytes?: number;
  line_count?: number;
}

export interface SeedRoute {
  route_path: string;
  page_component?: string;
  area: 'admin' | 'family' | 'public' | 'internal';
  auth_scope?: string;
}

export interface SeedEndpoint {
  function_name: string;
  action_name?: string;
  http_method?: string;
  endpoint_path?: string;
}

export interface SeedSymbol {
  path: string;
  symbol_name: string;
  symbol_kind?: 'component' | 'function' | 'class' | 'hook' | 'type' | 'const';
  exported?: boolean;
  line_no?: number;
}

export const SEED_ROUTES: SeedRoute[] = [
  { route_path: '/', page_component: 'Welcome', area: 'public' },
  { route_path: '/index', page_component: 'Index', area: 'public' },
  { route_path: '/admin/domovoy', page_component: 'AdminDomovoy', area: 'admin', auth_scope: 'admin' },
  { route_path: '/admin/domovoy/studio', page_component: 'DomovoyStudio', area: 'admin', auth_scope: 'admin' },
  { route_path: '/admin/dev-agent', page_component: 'DevAgentStudio', area: 'admin', auth_scope: 'admin' },
  { route_path: '/admin/blog', page_component: 'AdminBlog', area: 'admin', auth_scope: 'admin' },
  { route_path: '/admin/feedback', page_component: 'AdminFeedback', area: 'admin', auth_scope: 'admin' },
  { route_path: '/admin/users', page_component: 'AdminUsers', area: 'admin', auth_scope: 'admin' },
  { route_path: '/domovoy', page_component: 'DomovoyPage', area: 'family' },
  { route_path: '/health', page_component: 'HealthNew', area: 'family' },
  { route_path: '/finance', page_component: 'FinanceHub', area: 'family' },
  { route_path: '/family-chat', page_component: 'FamilyChat', area: 'family' },
  { route_path: '/family-wallet', page_component: 'FamilyWallet', area: 'family' },
  { route_path: '/garage', page_component: 'Garage', area: 'family' },
  { route_path: '/pets', page_component: 'PetsPage', area: 'family' },
  { route_path: '/events', page_component: 'Events', area: 'family' },
  { route_path: '/trips', page_component: 'Trips', area: 'family' },
  { route_path: '/portfolio', page_component: 'Portfolio', area: 'family' },
  { route_path: '/family-tree', page_component: 'FamilyTree', area: 'family' },
  { route_path: '/calendar', page_component: 'Calendar', area: 'family' },
];

export const SEED_FILES: SeedFile[] = [
  { path: 'src/App.tsx', language: 'tsx', category: 'config' },
  { path: 'src/pages/Welcome.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Index.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/DomovoyStudio.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/DevAgentStudio.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/AdminDomovoy.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/DomovoyPage.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/FamilyChat.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/FamilyWallet.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/HealthNew.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/FinanceHub.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Garage.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/PetsPage.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Events.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Trips.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Portfolio.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/FamilyTree.tsx', language: 'tsx', category: 'page' },
  { path: 'src/pages/Calendar.tsx', language: 'tsx', category: 'page' },
  { path: 'src/components/AIAssistantWidget.tsx', language: 'tsx', category: 'component' },
  { path: 'src/components/GlobalTopBar.tsx', language: 'tsx', category: 'component' },
  { path: 'src/components/GlobalSidebar.tsx', language: 'tsx', category: 'component' },
  { path: 'src/components/ui/icon.tsx', language: 'tsx', category: 'component' },
  { path: 'src/lib/studio/api.ts', language: 'ts', category: 'config' },
  { path: 'src/lib/devAgent/api.ts', language: 'ts', category: 'config' },
  { path: 'src/contexts/AIAssistantContext.tsx', language: 'tsx', category: 'config' },
  { path: 'backend/dev-agent-admin/index.py', language: 'python', category: 'backend' },
  { path: 'backend/dev-agent-indexer/index.py', language: 'python', category: 'backend' },
  { path: 'backend/domovoy-studio/index.py', language: 'python', category: 'backend' },
  { path: 'backend/ai-assistant/index.py', language: 'python', category: 'backend' },
  { path: 'backend/family-chat/index.py', language: 'python', category: 'backend' },
  { path: 'backend/finance-api/index.py', language: 'python', category: 'backend' },
  { path: 'backend/family-wallet/index.py', language: 'python', category: 'backend' },
  { path: 'backend/func2url.json', language: 'json', category: 'config' },
];

// Известные backend-функции — берём список из func2url.json и обогащаем
export function buildSeedEndpoints(): SeedEndpoint[] {
  const fns = Object.keys(func2url as Record<string, string>);
  return fns.map(fn => ({
    function_name: fn,
    endpoint_path: (func2url as Record<string, string>)[fn],
    http_method: 'POST',
  }));
}

export const SEED_SYMBOLS: SeedSymbol[] = [
  { path: 'src/pages/DomovoyStudio.tsx', symbol_name: 'DomovoyStudio', symbol_kind: 'component', exported: true },
  { path: 'src/pages/DevAgentStudio.tsx', symbol_name: 'DevAgentStudio', symbol_kind: 'component', exported: true },
  { path: 'src/pages/AdminDomovoy.tsx', symbol_name: 'AdminDomovoy', symbol_kind: 'component', exported: true },
  { path: 'src/pages/FamilyChat.tsx', symbol_name: 'FamilyChat', symbol_kind: 'component', exported: true },
  { path: 'src/pages/FamilyWallet.tsx', symbol_name: 'FamilyWallet', symbol_kind: 'component', exported: true },
  { path: 'src/components/AIAssistantWidget.tsx', symbol_name: 'AIAssistantWidget', symbol_kind: 'component', exported: true },
  { path: 'src/components/GlobalTopBar.tsx', symbol_name: 'GlobalTopBar', symbol_kind: 'component', exported: true },
  { path: 'src/components/GlobalSidebar.tsx', symbol_name: 'GlobalSidebar', symbol_kind: 'component', exported: true },
  { path: 'src/components/ui/icon.tsx', symbol_name: 'Icon', symbol_kind: 'component', exported: true },
  { path: 'src/lib/studio/api.ts', symbol_name: 'studioApi', symbol_kind: 'const', exported: true },
  { path: 'src/lib/devAgent/api.ts', symbol_name: 'devAgent', symbol_kind: 'const', exported: true },
  { path: 'src/contexts/AIAssistantContext.tsx', symbol_name: 'AIAssistantProvider', symbol_kind: 'component', exported: true },
  { path: 'backend/dev-agent-admin/index.py', symbol_name: 'handler', symbol_kind: 'function', exported: true },
  { path: 'backend/dev-agent-indexer/index.py', symbol_name: 'handler', symbol_kind: 'function', exported: true },
  { path: 'backend/domovoy-studio/index.py', symbol_name: 'handler', symbol_kind: 'function', exported: true },
];
