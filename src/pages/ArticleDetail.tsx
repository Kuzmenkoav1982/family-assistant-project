import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Helmet } from 'react-helmet-async';
import { articles, articleCategories } from '@/data/articles';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const article = articles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="FileX" size={64} className="mx-auto mb-4 text-gray-300" />
          <h1 className="text-xl font-bold mb-2">Статья не найдена</h1>
          <Button onClick={() => navigate('/articles')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            К списку статей
          </Button>
        </div>
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'бюджет': 'bg-emerald-100 text-emerald-700',
    'воспитание': 'bg-blue-100 text-blue-700',
    'отношения': 'bg-pink-100 text-pink-700',
    'здоровье': 'bg-red-100 text-red-700',
    'планирование': 'bg-purple-100 text-purple-700',
    'питание': 'bg-orange-100 text-orange-700',
  };

  const getCategoryName = (id: string) =>
    articleCategories.find(c => c.id === id)?.name || id;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  const currentIndex = articles.findIndex(a => a.slug === slug);
  const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

  const relatedArticles = articles
    .filter(a => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{article.title} — Наша Семья</title>
        <meta name="description" content={article.description} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.description} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 lg:p-8 pb-20">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/articles')}>
              <Icon name="ArrowLeft" size={18} className="mr-1" />
              Все статьи
            </Button>
          </div>

          <article>
            <header className="space-y-4 mb-8">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={categoryColors[article.category] || 'bg-gray-100 text-gray-700'}>
                  {getCategoryName(article.category)}
                </Badge>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  {formatDate(article.date)}
                </span>
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Icon name="Clock" size={14} />
                  {article.readTime} мин чтения
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {article.title}
              </h1>

              <p className="text-lg text-gray-600">
                {article.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </header>

            <Card>
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-gray max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-li:text-gray-700 prose-li:mb-1
                    prose-strong:text-gray-900
                    prose-ul:my-4 prose-ul:pl-5"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>
          </article>

          {article.sources && article.sources.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="BookCheck" size={20} className="text-blue-600" />
                  <h3 className="font-bold text-blue-900">Источники и ссылки</h3>
                </div>
                <ul className="space-y-2">
                  {article.sources.map((source, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Icon name="ExternalLink" size={14} className="text-blue-400 mt-1 flex-shrink-0" />
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        {source.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-6 text-center space-y-3">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Sparkles" size={24} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-lg">Управляйте семьёй проще</h3>
              <p className="text-sm text-gray-600">
                Бюджет, задачи, питание, здоровье — всё в одном приложении «Наша Семья»
              </p>
              <Button onClick={() => navigate('/register')} className="bg-orange-500 hover:bg-orange-600">
                Попробовать бесплатно
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-4">
            {prevArticle ? (
              <Button
                variant="outline"
                className="flex-1 justify-start text-left h-auto py-3"
                onClick={() => navigate(`/articles/${prevArticle.slug}`)}
              >
                <Icon name="ArrowLeft" size={16} className="mr-2 flex-shrink-0" />
                <span className="truncate text-sm">{prevArticle.title}</span>
              </Button>
            ) : <div className="flex-1" />}
            {nextArticle ? (
              <Button
                variant="outline"
                className="flex-1 justify-end text-right h-auto py-3"
                onClick={() => navigate(`/articles/${nextArticle.slug}`)}
              >
                <span className="truncate text-sm">{nextArticle.title}</span>
                <Icon name="ArrowRight" size={16} className="ml-2 flex-shrink-0" />
              </Button>
            ) : <div className="flex-1" />}
          </div>

          {relatedArticles.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Похожие статьи</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {relatedArticles.map(ra => (
                  <Card
                    key={ra.slug}
                    className="hover:shadow-md transition-all cursor-pointer"
                    onClick={() => navigate(`/articles/${ra.slug}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                          <Icon name={ra.icon} size={18} className="text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold leading-tight line-clamp-2">{ra.title}</h4>
                          <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Icon name="Clock" size={10} />
                            {ra.readTime} мин
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}