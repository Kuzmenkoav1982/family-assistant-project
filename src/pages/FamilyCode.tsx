import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { familyCodeCategories, familyCodeArticles, FamilyCodeArticle } from '@/data/familyCodeData';

export default function FamilyCode() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<FamilyCodeArticle | null>(null);

  const filteredArticles = familyCodeArticles.filter(article => {
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (categoryId: string) => {
    const category = familyCodeCategories.find(c => c.id === categoryId);
    return category?.color || 'blue';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHero
          title="Семейный кодекс РФ"
          subtitle="Изучайте права и обязанности членов семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6cfbf071-8a12-494d-90e2-93c37aaa217c.jpg"
          backPath="/state-hub"
        />

        <div className="relative">
          <Icon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Поиск по статьям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Icon name="List" size={24} />
            <span className="text-xs">Все статьи</span>
          </Button>
          {familyCodeCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Icon name={category.icon as any} size={24} />
              <span className="text-xs text-center">{category.name}</span>
            </Button>
          ))}
        </div>

        {selectedCategory && (
          <Card className="border-l-4 border-purple-500">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Icon 
                  name={familyCodeCategories.find(c => c.id === selectedCategory)?.icon as any} 
                  size={24} 
                  className="text-purple-600 mt-1"
                />
                <div>
                  <h3 className="font-semibold text-lg">
                    {familyCodeCategories.find(c => c.id === selectedCategory)?.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {familyCodeCategories.find(c => c.id === selectedCategory)?.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card 
              key={article.id} 
              className={`cursor-pointer transition-all hover:shadow-lg border-l-4 ${
                selectedArticle?.id === article.id ? 'ring-2 ring-purple-500' : ''
              }`}
              style={{
                borderLeftColor: `var(--${getCategoryColor(article.category)}-500)`
              }}
              onClick={() => setSelectedArticle(selectedArticle?.id === article.id ? null : article)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-${getCategoryColor(article.category)}-100`}>
                      <Icon name={article.icon as any} size={24} className={`text-${getCategoryColor(article.category)}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{article.number}</Badge>
                        <Badge variant="secondary">
                          {familyCodeCategories.find(c => c.id === article.category)?.name}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                    </div>
                  </div>
                  <Icon 
                    name={selectedArticle?.id === article.id ? "ChevronUp" : "ChevronDown"} 
                    size={20} 
                  />
                </div>
              </CardHeader>

              {selectedArticle?.id === article.id && (
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm leading-relaxed">{article.content}</p>
                  </div>

                  {article.examples && article.examples.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Lightbulb" size={18} className="text-yellow-600" />
                        Примеры из жизни:
                      </h4>
                      <ul className="space-y-2">
                        {article.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Icon name="CheckCircle" size={16} className="text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Icon name="Info" size={18} className="text-blue-600" />
                    <p className="text-xs text-blue-900">
                      Эта статья помогает понять ваши права и обязанности в семье
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Статьи не найдены. Попробуйте изменить фильтры или поисковый запрос.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}