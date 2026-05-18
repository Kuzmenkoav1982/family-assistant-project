import { useState } from 'react';
import { NEWS_ITEMS, NEWS_CATEGORIES } from './newsData';

export function useFamilyNews() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  const filteredNews = NEWS_ITEMS.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    const cat = NEWS_CATEGORIES.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const toggleExpanded = (id: string) => {
    setExpandedNews(prev => (prev === id ? null : id));
  };

  return {
    selectedCategory, setSelectedCategory,
    expandedNews, toggleExpanded,
    filteredNews, getCategoryColor, formatDate,
    categories: NEWS_CATEGORIES,
  };
}
