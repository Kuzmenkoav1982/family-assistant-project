import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  blogApi,
  BlogPostFull,
  CATEGORY_COLORS,
  CATEGORY_GRADIENTS,
  formatBlogDate,
} from '@/lib/blogApi';
import BlogPostCard from '@/components/blog/BlogPostCard';
import BlogPostEngagement from '@/components/blog/BlogPostEngagement';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    blogApi
      .getPost(slug)
      .then(d => setPost(d.post))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 flex items-center justify-center px-4">
        <Card className="max-w-md text-center p-8">
          <Icon name="FileX" size={48} className="mx-auto mb-3 text-gray-300" />
          <h1 className="text-2xl font-bold mb-2">Пост не найден</h1>
          <p className="text-gray-600 mb-6">
            Возможно, материал был удалён или адрес введён с ошибкой
          </p>
          <Button onClick={() => navigate('/blog')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться в блог
          </Button>
        </Card>
      </div>
    );
  }

  const catColor = post.category_slug
    ? CATEGORY_COLORS[post.category_slug] ?? 'bg-gray-100 text-gray-700'
    : 'bg-gray-100 text-gray-700';
  const catGradient = post.category_slug
    ? CATEGORY_GRADIENTS[post.category_slug] ?? 'from-orange-500 to-pink-500'
    : 'from-orange-500 to-pink-500';

  const canonicalUrl = `https://nasha-semiya.ru/blog/${post.slug}`;
  const ogImage = post.cover_image_url || 'https://cdn.poehali.dev/files/Логотип Наша Семья.JPG';

  return (
    <>
      <Helmet>
        <title>{post.seo_title || `${post.title} — Наша Семья`}</title>
        <meta name="description" content={post.seo_description || post.excerpt} />
        {post.seo_keywords && <meta name="keywords" content={post.seo_keywords} />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Наша Семья" />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:locale" content="ru_RU" />
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        {post.category_name && <meta property="article:section" content={post.category_name} />}
        {post.tags?.map(t => (
          <meta key={t.slug} property="article:tag" content={t.name} />
        ))}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title || post.title} />
        <meta name="twitter:description" content={post.seo_description || post.excerpt} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.seo_description || post.excerpt,
            image: post.cover_image_url ? [post.cover_image_url] : undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at,
            author: {
              '@type': 'Organization',
              name: post.author_name,
              url: 'https://nasha-semiya.ru',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Наша Семья',
              url: 'https://nasha-semiya.ru',
              logo: {
                '@type': 'ImageObject',
                url: 'https://cdn.poehali.dev/files/Логотип Наша Семья.JPG',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
            inLanguage: 'ru',
            articleSection: post.category_name,
            keywords: post.tags?.map(t => t.name).join(', '),
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://nasha-semiya.ru/' },
              { '@type': 'ListItem', position: 2, name: 'Блог', item: 'https://nasha-semiya.ru/blog' },
              ...(post.category_name && post.category_slug
                ? [{
                    '@type': 'ListItem',
                    position: 3,
                    name: post.category_name,
                    item: `https://nasha-semiya.ru/blog/category/${post.category_slug}`,
                  }]
                : []),
              {
                '@type': 'ListItem',
                position: post.category_name ? 4 : 3,
                name: post.title,
                item: canonicalUrl,
              },
            ],
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50">
        <div className={`bg-gradient-to-r ${catGradient} text-white`}>
          <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/80 mb-5">
              <Link to="/" className="hover:text-white transition-colors">Главная</Link>
              <Icon name="ChevronRight" size={14} />
              <Link to="/blog" className="hover:text-white transition-colors">Блог</Link>
              {post.category_name && post.category_slug && (
                <>
                  <Icon name="ChevronRight" size={14} />
                  <Link
                    to={`/blog/category/${post.category_slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {post.category_name}
                  </Link>
                </>
              )}
            </div>

            {post.category_name && (
              <Badge className={`${catColor} mb-4 font-medium border-0 shadow-sm`}>
                {post.category_emoji} {post.category_name}
              </Badge>
            )}

            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 font-[Montserrat] leading-tight">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Icon name="Calendar" size={15} />
                {formatBlogDate(post.published_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Clock" size={15} />
                {post.reading_time_min} мин чтения
              </span>
              {post.views_count > 0 && (
                <span className="flex items-center gap-1.5">
                  <Icon name="Eye" size={15} />
                  {post.views_count} просмотров
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Icon name="User" size={15} />
                {post.author_name}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          {post.cover_image_url && (
            <div className="mb-8 -mt-20 relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <Card className="p-6 md:p-10 shadow-lg border-0 bg-white">
            <article className="prose prose-lg max-w-none prose-headings:font-[Montserrat] prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-ul:my-4 prose-li:my-1 prose-li:text-gray-700">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </article>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-500 mr-1">Темы:</span>
                  {post.tags.map(t => (
                    <Link
                      key={t.slug}
                      to={`/blog/tag/${t.slug}`}
                      className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                    >
                      #{t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <BlogPostEngagement post={post} />

          <Card className="mt-8 overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">
                  💖
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl md:text-2xl font-extrabold mb-2 font-[Montserrat]">
                    Превратите идеи в семейные привычки
                  </h3>
                  <p className="text-white/90 mb-4">
                    Создай Семейный ID бесплатно — получи доступ к традициям, целям, ИИ-помощнику «Домовой» и всем инструментам платформы
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link to="/register">
                      <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-xl">
                        Создать Семейный ID
                      </Button>
                    </Link>
                    <a href="https://max.ru/id231805288780_biz" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-xl">
                        <Icon name="MessageCircle" size={18} className="mr-2" />
                        Канал в МАХ
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {post.related && post.related.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-6 font-[Montserrat] text-gray-900">
                Похожие материалы
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {post.related.map(rp => (
                  <BlogPostCard key={rp.id} post={rp} variant="compact" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/blog">
              <Button variant="outline" size="lg" className="rounded-xl">
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Все материалы блога
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}