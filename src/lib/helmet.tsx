import * as React from 'react';

// Drop-in replacement for react-helmet-async API.
// Реализует <Helmet> и <HelmetProvider> поверх document.head,
// без зависимости от shallowequal (которая ломает Vite/rolldown).
//
// Поддерживает дочерние теги: <title>, <meta>, <link>, <script>.
// Этого достаточно для всех 17 файлов проекта (SEOHead и пр.).
//
// Особенности:
// - Каждый <Helmet> монтирует свои теги в head и снимает их при unmount.
// - <title> переписывает document.title (последний смонтированный побеждает).
// - meta/link с одинаковым ключом дедуплицируются: новый перетирает старый.

const MANAGED_ATTR = 'data-rh-managed';

type TagSpec = {
  tag: 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  innerHTML?: string;
};

function getTagKey(spec: TagSpec): string {
  const a = spec.attrs;
  if (spec.tag === 'meta') {
    if (a.name) return `meta:name:${a.name}`;
    if (a.property) return `meta:property:${a.property}`;
    if (a.charset) return `meta:charset`;
    if (a['http-equiv']) return `meta:http-equiv:${a['http-equiv']}`;
    return `meta:${JSON.stringify(a)}`;
  }
  if (spec.tag === 'link') {
    return `link:${a.rel || ''}:${a.href || ''}:${a.sizes || ''}:${a.type || ''}`;
  }
  if (spec.tag === 'script') {
    return `script:${a.type || ''}:${a.src || ''}:${spec.innerHTML || ''}`;
  }
  return spec.tag;
}

function applyTagToHead(spec: TagSpec): HTMLElement {
  const el = document.createElement(spec.tag);
  for (const [k, v] of Object.entries(spec.attrs)) {
    if (v != null) el.setAttribute(k, String(v));
  }
  if (spec.innerHTML !== undefined) {
    el.textContent = spec.innerHTML;
  }
  el.setAttribute(MANAGED_ATTR, '1');
  // remove any previously managed tag with the same key to dedupe
  const key = getTagKey(spec);
  const existing = document.head.querySelectorAll(`[${MANAGED_ATTR}]`);
  existing.forEach((node) => {
    const nodeSpec: TagSpec = {
      tag: node.tagName.toLowerCase() as TagSpec['tag'],
      attrs: {},
      innerHTML: node.textContent || undefined,
    };
    for (const attr of Array.from(node.attributes)) {
      if (attr.name !== MANAGED_ATTR) nodeSpec.attrs[attr.name] = attr.value;
    }
    if (getTagKey(nodeSpec) === key) node.parentNode?.removeChild(node);
  });
  document.head.appendChild(el);
  return el;
}

function reactElementToSpec(child: React.ReactElement): TagSpec | string | null {
  const type = child.type as string;
  const props = (child.props || {}) as Record<string, unknown>;
  if (type === 'title') {
    const c = props.children;
    if (typeof c === 'string') return c;
    if (Array.isArray(c)) return c.filter((x) => typeof x === 'string').join('');
    return null;
  }
  if (type === 'meta' || type === 'link') {
    const attrs: Record<string, string> = {};
    for (const [k, v] of Object.entries(props)) {
      if (k === 'children') continue;
      if (v == null || typeof v === 'boolean') continue;
      attrs[k] = String(v);
    }
    return { tag: type, attrs };
  }
  if (type === 'script') {
    const attrs: Record<string, string> = {};
    let inner: string | undefined;
    for (const [k, v] of Object.entries(props)) {
      if (k === 'children') {
        if (typeof v === 'string') inner = v;
        else if (Array.isArray(v))
          inner = (v as unknown[]).filter((x) => typeof x === 'string').join('');
        continue;
      }
      if (v == null || typeof v === 'boolean') continue;
      attrs[k] = String(v);
    }
    return { tag: 'script', attrs, innerHTML: inner };
  }
  return null;
}

export const HelmetProvider: React.FC<{ children?: React.ReactNode; context?: unknown }> = ({
  children,
}) => <>{children}</>;

interface HelmetProps {
  children?: React.ReactNode;
}

export const Helmet: React.FC<HelmetProps> = ({ children }) => {
  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    const added: HTMLElement[] = [];
    let prevTitle: string | null = null;
    const arr = React.Children.toArray(children);
    for (const c of arr) {
      if (!React.isValidElement(c)) continue;
      const spec = reactElementToSpec(c);
      if (spec === null) continue;
      if (typeof spec === 'string') {
        if (prevTitle === null) prevTitle = document.title;
        document.title = spec;
      } else {
        added.push(applyTagToHead(spec));
      }
    }
    return () => {
      added.forEach((el) => el.parentNode?.removeChild(el));
      if (prevTitle !== null) document.title = prevTitle;
    };
  }, [children]);
  return null;
};

export default Helmet;
