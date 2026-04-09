import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';
import { articles, articleCategories } from '@/data/articles';

export default function Articles() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredArticles = articles.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryName = (id: string) =>
    articleCategories.find(c => c.id === id)?.name || id;

  const categoryColors: Record<string, string> = {
    'бюджет': 'bg-emerald-100 text-emerald-700',
    'воспитание': 'bg-blue-100 text-blue-700',
    'отношения': 'bg-pink-100 text-pink-700',
    'здоровье': 'bg-red-100 text-red-700',
    'планирование': 'bg-purple-100 text-purple-700',
    'питание': 'bg-orange-100 text-orange-700',
  };

  return (
    <>
      <Helmet>
        <title>Полезные статьи для семьи — Наша Семья</title>
        <meta name="description" content="Экспертные статьи о семейном бюджете, воспитании детей, здоровом питании, отношениях и планировании. Полезные советы для всей семьи." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <SectionHero
            title="Полезные статьи"
            subtitle="Экспертные советы для счастливой семейной жизни"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d5779686-8c50-4133-926f-a8290f3fab9b.jpg"
            backPath="/"
          />

          <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {articleCategories.map(cat => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="text-sm"
                  >
                    {cat.icon && <Icon name={cat.icon} size={16} className="mr-1" />}
                    {cat.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map(article => (
              <Card
                key={article.slug}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/articles/${article.slug}`)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={categoryColors[article.category] || 'bg-gray-100 text-gray-700'}>
                      {getCategoryName(article.category)}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Icon name="Clock" size={12} />
                      {article.readTime} мин
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2.5 rounded-lg flex-shrink-0 group-hover:bg-orange-200 transition-colors">
                      <Icon name={article.icon} size={22} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base leading-tight group-hover:text-orange-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">{formatDate(article.date)}</span>
                    <span className="text-xs text-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Читать <Icon name="ArrowRight" size={14} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Icon name="FileText" size={48} className="mx-auto mb-3 text-gray-300" />
              <p>В этой категории пока нет статей</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
