import { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  blogApi,
  BlogCategory,
  BlogPostListItem,
  BlogTag,
} from '@/lib/blogApi';
import BlogPostCard from '@/components/blog/BlogPostCard';

const POSTS_PER_PAGE = 12;

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams<{ category?: string; tag?: string }>();
  const navigate = useNavigate();
  const page = Number(searchParams.get('page') || '1');
  const category = params.category || searchParams.get('category') || '';
  const tag = params.tag || searchParams.get('tag') || '';
  const q = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(q);
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [popularTags, setPopularTags] = useState<BlogTag[]>([]);

  useEffect(() => {
    blogApi.getCategories().then(d => setCategories(d.categories)).catch(console.error);
    blogApi.getTags(15).then(d => setPopularTags(d.tags)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    blogApi
      .list({ page, limit: POSTS_PER_PAGE, category, tag, q })
      .then(d => {
        setPosts(d.posts);
        setTotal(d.total);
        setPages(d.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, category, tag, q]);

  const updateParams = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    if (changes.page === undefined) next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null, page: null });
  };

  const isFiltered = category || tag || q;
  const activeCategoryName = category
    ? categories.find(c => c.slug === category)?.name
    : null;

  const heroTitle = activeCategoryName
    ? `${categories.find(c => c.slug === category)?.emoji ?? ''} ${activeCategoryName}`
    : tag
    ? `#${tag}`
    : 'Блог «Наша Семья»';

  const heroSubtitle = activeCategoryName
    ? categories.find(c => c.slug === category)?.description ?? ''
    : tag
    ? `Посты с тегом «${tag}»`
    : 'Экспертные материалы о семье, детях, отношениях, здоровье и финансах';

  return (
    <>
      <Helmet>
        <title>
          {activeCategoryName
            ? `${activeCategoryName} — Блог Наша Семья`
            : 'Блог о семье — Наша Семья'}
        </title>
        <meta
          name="description"
          content="Экспертный блог о семейной жизни: психология, дети, отношения, здоровье, финансы. Реальные исследования, практические советы и поддержка платформы «Наша Семья»."
        />
        <link rel="canonical" href={`https://nasha-semiya.ru/blog${category ? `/category/${category}` : tag ? `/tag/${tag}` : ''}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Наша Семья" />
        <meta property="og:title" content="Блог о семье — Наша Семья" />
        <meta property="og:description" content="Экспертные материалы о семье, детях, отношениях, здоровье и финансах." />
        <meta property="og:url" content="https://nasha-semiya.ru/blog" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="keywords" content="блог о семье, семейная психология, воспитание детей, семейные финансы, отношения, традиции" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Блог Наша Семья',
            description: 'Экспертный блог о семейной жизни',
            url: 'https://nasha-semiya.ru/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Наша Семья',
              url: 'https://nasha-semiya.ru',
            },
            inLanguage: 'ru',
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50">
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-white transition-colors">Главная</Link>
              <Icon name="ChevronRight" size={14} />
              <Link to="/blog" className="hover:text-white transition-colors">Блог</Link>
              {activeCategoryName && (
                <>
                  <Icon name="ChevronRight" size={14} />
                  <span className="text-white">{activeCategoryName}</span>
                </>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 font-[Montserrat]">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              {heroSubtitle}
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-xl flex gap-2">
              <div className="relative flex-1">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <Input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Поиск по блогу..."
                  className="pl-10 h-12 bg-white text-gray-900 border-0 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-white text-orange-600 hover:bg-orange-50 rounded-xl h-12 px-6 font-semibold"
              >
                Найти
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={!category && !tag ? 'default' : 'outline'}
                onClick={() => navigate('/blog')}
                className="rounded-full"
              >
                Все темы
                {!category && !tag && total > 0 && (
                  <span className="ml-1.5 opacity-80">{total}</span>
                )}
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat.slug}
                  size="sm"
                  variant={category === cat.slug ? 'default' : 'outline'}
                  onClick={() => navigate(`/blog/category/${cat.slug}`)}
                  className="rounded-full"
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.name}
                  {cat.posts_count > 0 && (
                    <span className="ml-1.5 opacity-60">{cat.posts_count}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {(isFiltered) && (
            <div className="mb-6 flex items-center gap-3 text-sm text-gray-600">
              <span>Найдено: <strong className="text-gray-900">{total}</strong></span>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  navigate('/blog');
                }}
                className="text-orange-600 h-auto p-0"
              >
                <Icon name="X" size={14} className="mr-1" />
                Сбросить фильтры
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="FileSearch" size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ничего не найдено</h3>
              <p className="text-gray-500 mb-4">Попробуйте изменить запрос или сбросить фильтры</p>
              <Button onClick={() => navigate('/blog')}>
                Показать все посты
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
              >
                <Icon name="ChevronLeft" size={16} />
                Назад
              </Button>
              <span className="px-4 text-sm text-gray-600">
                Страница <strong>{page}</strong> из <strong>{pages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => updateParams({ page: String(page + 1) })}
              >
                Вперёд
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          )}

          {popularTags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 font-[Montserrat]">
                Популярные темы
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(t => (
                  <button
                    key={t.slug}
                    onClick={() => navigate(`/blog/tag/${t.slug}`)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tag === t.slug
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                    }`}
                  >
                    #{t.name}
                    {t.posts_count && t.posts_count > 1 && (
                      <span className="ml-1 opacity-60 text-xs">{t.posts_count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16">
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 font-[Montserrat]">
                  Понравились материалы?
                </h2>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Создай Семейный ID бесплатно и получи доступ ко всем инструментам платформы «Наша Семья» — от семейного бюджета до ИИ-помощника
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold h-12 px-8 rounded-xl">
                      Создать Семейный ID
                    </Button>
                  </Link>
                  <a href="https://max.ru/id231805288780_biz" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 h-12 px-8 rounded-xl">
                      <Icon name="MessageCircle" size={18} className="mr-2" />
                      Подписаться в МАХ
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}