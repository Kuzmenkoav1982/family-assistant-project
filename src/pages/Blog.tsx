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
  CATEGORY_ICONS,
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

      <div className="min-h-screen bg-[#FAF6EF]">
        <div className="relative bg-gradient-to-b from-[#F4EBDD] via-[#F8F1E4] to-[#FAF6EF] border-b border-[#E8DDC8]">
          <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-[#9C8467] mb-5">
              <Link to="/" className="hover:text-[#6B5340] transition-colors">Главная</Link>
              <Icon name="ChevronRight" size={12} />
              <Link to="/blog" className="hover:text-[#6B5340] transition-colors">Блог</Link>
              {activeCategoryName && (
                <>
                  <Icon name="ChevronRight" size={12} />
                  <span className="text-[#6B5340]">{activeCategoryName}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-light mb-4 text-[#3F2E1E] font-[Montserrat] tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-base md:text-lg text-[#6B5340] max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>

            <form onSubmit={handleSearch} className="mt-8 max-w-xl flex gap-2">
              <div className="relative flex-1">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B89B7A] pointer-events-none"
                />
                <Input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Поиск по блогу..."
                  className="pl-11 h-12 bg-white text-[#3F2E1E] placeholder:text-[#B89B7A] border border-[#E8DDC8] focus-visible:border-[#B89B7A] focus-visible:ring-0 rounded-xl shadow-sm"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="bg-[#B89B7A] hover:bg-[#A0825F] text-white rounded-xl h-12 px-7 font-medium shadow-sm transition-colors"
              >
                Найти
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <CategoryPill
                active={!category && !tag}
                onClick={() => navigate('/blog')}
                label="Все темы"
                count={!category && !tag ? total : undefined}
              />
              {categories.map(cat => (
                <CategoryPill
                  key={cat.slug}
                  active={category === cat.slug}
                  onClick={() => navigate(`/blog/category/${cat.slug}`)}
                  label={cat.name}
                  count={cat.posts_count > 0 ? cat.posts_count : undefined}
                  iconName={CATEGORY_ICONS[cat.slug]}
                />
              ))}
            </div>
          </div>

          {(isFiltered) && (
            <div className="mb-6 flex items-center gap-3 text-sm text-[#6B5340]">
              <span>Найдено: <strong className="text-[#3F2E1E]">{total}</strong></span>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearchInput('');
                  navigate('/blog');
                }}
                className="text-[#A0825F] hover:text-[#6B5340] h-auto p-0"
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
              <Icon name="FileSearch" size={56} className="mx-auto mb-4 text-[#D4B896]" strokeWidth={1.4} />
              <h3 className="text-xl font-medium text-[#3F2E1E] mb-2">Ничего не найдено</h3>
              <p className="text-[#6B5340] mb-5">Попробуйте изменить запрос или сбросить фильтры</p>
              <Button onClick={() => navigate('/blog')} className="bg-[#B89B7A] hover:bg-[#A0825F] text-white rounded-xl">
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
                className="border-[#E8DDC8] text-[#6B5340] hover:bg-[#F4EBDD] hover:text-[#3F2E1E] rounded-full"
              >
                <Icon name="ChevronLeft" size={16} />
                Назад
              </Button>
              <span className="px-4 text-sm text-[#6B5340]">
                Страница <strong className="text-[#3F2E1E]">{page}</strong> из <strong className="text-[#3F2E1E]">{pages}</strong>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pages}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="border-[#E8DDC8] text-[#6B5340] hover:bg-[#F4EBDD] hover:text-[#3F2E1E] rounded-full"
              >
                Вперёд
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          )}

          {popularTags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-[#E8DDC8]">
              <h3 className="text-lg font-medium text-[#3F2E1E] mb-4 font-[Montserrat]">
                Популярные темы
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(t => (
                  <button
                    key={t.slug}
                    onClick={() => navigate(`/blog/tag/${t.slug}`)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                      tag === t.slug
                        ? 'bg-[#B89B7A] text-white shadow-sm'
                        : 'bg-white text-[#6B5340] hover:bg-[#F4EBDD] hover:text-[#3F2E1E] border border-[#E8DDC8]'
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
            <Card className="overflow-hidden border border-[#E8DDC8] shadow-sm">
              <div className="bg-gradient-to-br from-[#F4EBDD] via-[#F8F1E4] to-[#FAF6EF] p-10 md:p-14 text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-white/70 border border-[#E8DDC8] flex items-center justify-center">
                  <Icon name="Heart" size={26} className="text-[#B89B7A]" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-light mb-3 font-[Montserrat] text-[#3F2E1E] tracking-tight">
                  Понравились материалы?
                </h2>
                <p className="text-[#6B5340] mb-7 max-w-2xl mx-auto leading-relaxed">
                  Создайте Семейный ID бесплатно и получите доступ ко всем инструментам платформы «Наша Семья» — от семейного бюджета до ИИ-помощника
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/register">
                    <Button size="lg" className="bg-[#B89B7A] hover:bg-[#A0825F] text-white font-medium h-12 px-8 rounded-xl shadow-sm">
                      Создать Семейный ID
                    </Button>
                  </Link>
                  <a href="https://max.ru/id231805288780_biz" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="bg-white border border-[#E8DDC8] text-[#6B5340] hover:bg-[#F4EBDD] hover:text-[#3F2E1E] h-12 px-8 rounded-xl">
                      <Icon name="MessageCircle" size={18} className="mr-2" strokeWidth={1.5} />
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

interface CategoryPillProps {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  iconName?: string;
}

function CategoryPill({ active, onClick, label, count, iconName }: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-[#B89B7A] text-white shadow-sm'
          : 'bg-white text-[#6B5340] hover:bg-[#F4EBDD] hover:text-[#3F2E1E] border border-[#E8DDC8]'
      }`}
    >
      {iconName && (
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${active ? 'bg-white/20' : 'bg-[#F4EBDD] group-hover:bg-white'} transition-colors`}>
          <Icon
            name={iconName}
            size={12}
            className={active ? 'text-white' : 'text-[#B89B7A]'}
            strokeWidth={1.8}
          />
        </span>
      )}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`text-xs ${active ? 'text-white/80' : 'text-[#B89B7A]'}`}>
          {count}
        </span>
      )}
    </button>
  );
}