import SEOHead from "@/components/SEOHead";
import SectionHero from '@/components/ui/section-hero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useFamilyNews } from '@/components/family-news/useFamilyNews';
import NewsCategoryFilter from '@/components/family-news/NewsCategoryFilter';
import NewsCard from '@/components/family-news/NewsCard';
import NewsSubscriptionCard from '@/components/family-news/NewsSubscriptionCard';

export default function FamilyNews() {
  const {
    selectedCategory, setSelectedCategory,
    expandedNews, toggleExpanded,
    filteredNews, getCategoryColor, formatDate,
    categories,
  } = useFamilyNews();

  return (
    <>
      <SEOHead
        title="Новости для семей — законы и инициативы"
        description="Актуальные новости семейной политики: новые законы, выплаты, льготы, программы поддержки семей в России."
        path="/family-news"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <SectionHero
            title="Новости и инициативы"
            subtitle="Актуальные новости семейного законодательства и политики"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d5779686-8c50-4133-926f-a8290f3fab9b.jpg"
            backPath="/"
          />

          <NewsCategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />

          <div className="space-y-4">
            {filteredNews.map(item => (
              <NewsCard
                key={item.id}
                item={item}
                isExpanded={expandedNews === item.id}
                categoryColor={getCategoryColor(item.category)}
                formattedDate={formatDate(item.date)}
                onToggle={toggleExpanded}
              />
            ))}
          </div>

          {filteredNews.length === 0 && (
            <Card className="text-center p-12">
              <Icon name="Newspaper" size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">Новостей в этой категории пока нет</p>
              <Button variant="ghost" onClick={() => setSelectedCategory('all')}>
                Показать все новости
              </Button>
            </Card>
          )}

          <NewsSubscriptionCard />
        </div>
      </div>
    </>
  );
}
