import SEOHead from "@/components/SEOHead";
import SectionPageFrame from '@/components/ui/SectionPageFrame';
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
      <SectionPageFrame
        title="Новости и инициативы"
        subtitle="Актуальные новости семейного законодательства и политики"
        backPath="/family-hub"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6f29ed16-c83c-4536-af97-d690659fa4a7.jpg"
        width="standard"
        backgroundClass="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
      >
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
      </SectionPageFrame>
    </>
  );
}