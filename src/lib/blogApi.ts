const BLOG_API_URL = 'https://functions.poehali.dev/c3d1a7ab-aa2c-4aa8-981d-1a96e19dbd2d';

export interface BlogTag {
  slug: string;
  name: string;
  posts_count?: number;
}

export interface BlogCategory {
  id: number;
  slug: string;
  name: string;
  emoji: string;
  description?: string;
  sort_order: number;
  posts_count: number;
}

export interface BlogPostListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string | null;
  reading_time_min: number;
  views_count: number;
  likes_count: number;
  published_at: string;
  author_name: string;
  category_slug: string | null;
  category_name: string | null;
  category_emoji: string | null;
  tags?: BlogTag[];
}

export interface BlogPostFull extends BlogPostListItem {
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  category_id: number | null;
  related: BlogPostListItem[];
  tags: BlogTag[];
  updated_at: string;
}

export interface BlogListResponse {
  posts: BlogPostListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BLOG_API_URL}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Blog API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const blogApi = {
  list: (params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    q?: string;
  } = {}): Promise<BlogListResponse> => {
    const sp = new URLSearchParams({ action: 'list' });
    if (params.page) sp.set('page', String(params.page));
    if (params.limit) sp.set('limit', String(params.limit));
    if (params.category) sp.set('category', params.category);
    if (params.tag) sp.set('tag', params.tag);
    if (params.q) sp.set('q', params.q);
    return api<BlogListResponse>(`/?${sp.toString()}`);
  },

  getPost: (slug: string): Promise<{ post: BlogPostFull }> =>
    api(`/?action=post&slug=${encodeURIComponent(slug)}`),

  getCategories: (): Promise<{ categories: BlogCategory[] }> =>
    api('/?action=categories'),

  getTags: (limit = 30): Promise<{ tags: BlogTag[] }> =>
    api(`/?action=tags&limit=${limit}`),

  getFeed: (limit = 6): Promise<{ posts: BlogPostListItem[] }> =>
    api(`/?action=feed&limit=${limit}`),
};

export function formatBlogDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  psychology: 'bg-purple-100 text-purple-700',
  children: 'bg-blue-100 text-blue-700',
  relationships: 'bg-pink-100 text-pink-700',
  health: 'bg-emerald-100 text-emerald-700',
  finance: 'bg-amber-100 text-amber-700',
  leisure: 'bg-orange-100 text-orange-700',
  education: 'bg-indigo-100 text-indigo-700',
  safety: 'bg-red-100 text-red-700',
};

export const CATEGORY_GRADIENTS: Record<string, string> = {
  psychology: 'from-purple-500 to-violet-500',
  children: 'from-blue-500 to-cyan-500',
  relationships: 'from-pink-500 to-rose-500',
  health: 'from-emerald-500 to-green-500',
  finance: 'from-amber-500 to-yellow-500',
  leisure: 'from-orange-500 to-red-500',
  education: 'from-indigo-500 to-blue-500',
  safety: 'from-red-500 to-rose-600',
};
