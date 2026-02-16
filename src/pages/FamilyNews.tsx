import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  content: string;
  category: 'законы' | 'выплаты' | 'программы' | 'инициативы' | 'регионы';
  source: string;
  sourceLink: string;
  icon: string;
}

const news: NewsItem[] = [
  {
    id: '1',
    date: '2024-12-10',
    title: 'Материнский капитал проиндексируют на 7,3% с 1 января 2025 года',
    summary: 'Размер маткапитала вырастет до 677 тыс. рублей на первого ребенка и до 893 тыс. на второго',
    content: 'Правительство РФ утвердило индексацию материнского капитала на 2025 год. Размер выплаты на первого ребенка составит 677 тысяч рублей (рост с 630 тыс.), на второго — 893 тысячи рублей (рост с 833 тыс.). Для семей, которые уже использовали часть капитала, остаток также будет проиндексирован. Заявления принимаются через Госуслуги автоматически.',
    category: 'выплаты',
    source: 'Правительство РФ',
    sourceLink: 'https://government.ru',
    icon: 'TrendingUp'
  },
  {
    id: '2',
    date: '2024-12-08',
    title: 'Запущена программа "450 тысяч на ипотеку" для многодетных',
    summary: 'Государство погасит до 450 тыс. рублей ипотечного кредита семьям с тремя и более детьми',
    content: 'С 1 декабря 2024 года возобновлена программа выплаты 450 тысяч рублей на погашение ипотеки многодетным семьям. Средства перечисляются напрямую банку в счет основного долга. Условия: третий ребенок родился с 2019 года, ипотека оформлена до 1 июля 2024 года. Подать заявление можно через банк-кредитор или МФЦ.',
    category: 'программы',
    source: 'Минстрой РФ',
    sourceLink: '#',
    icon: 'Home'
  },
  {
    id: '3',
    date: '2024-12-05',
    title: 'Единое пособие на детей увеличено до 18 000 рублей',
    summary: 'Максимальный размер единого пособия вырастет в 2025 году в связи с повышением МРОТ',
    content: 'С 1 января 2025 года МРОТ вырастет до 22 440 рублей, что автоматически увеличит максимальный размер единого пособия на детей. Семьи с доходом ниже прожиточного минимума смогут получать до 18 000 рублей на одного ребенка. Пересчет произойдет автоматически, подавать новое заявление не нужно.',
    category: 'выплаты',
    source: 'СФР',
    sourceLink: '#',
    icon: 'HandCoins'
  },
  {
    id: '4',
    date: '2024-12-01',
    title: 'В Москве открылись 50 новых детских садов',
    summary: 'Столичные власти ввели в эксплуатацию 50 дошкольных учреждений на 8 500 мест',
    content: 'Мэр Москвы объявил об открытии 50 новых детских садов в рамках программы "Московское образование". Всего создано 8 500 мест для детей от 1,5 до 7 лет. Садики оснащены современным оборудованием, имеют бассейны, спортзалы и зоны для творчества. Очередь в детсады в Москве сократилась на 30% за год.',
    category: 'регионы',
    source: 'Правительство Москвы',
    sourceLink: '#',
    icon: 'School'
  },
  {
    id: '5',
    date: '2024-11-28',
    title: 'Президент подписал закон о налоговых льготах для многодетных',
    summary: 'Многодетные семьи освобождаются от уплаты транспортного и земельного налогов',
    content: 'Владимир Путин подписал федеральный закон, освобождающий многодетные семьи (3+ детей) от уплаты транспортного налога на один автомобиль и земельного налога на участок до 12 соток. Льгота действует с 1 января 2025 года автоматически — обращаться в налоговую не нужно. Ожидается, что мера поддержит более 5 млн семей.',
    category: 'законы',
    source: 'Кремль',
    sourceLink: '#',
    icon: 'FileCheck'
  },
  {
    id: '6',
    date: '2024-11-25',
    title: 'Запуск нацпроекта "Семья России" до 2030 года',
    summary: 'Правительство утвердило новый национальный проект с бюджетом 10 трлн рублей',
    content: 'Кабмин утвердил нацпроект "Семья России" на 2025-2030 годы с финансированием 10 триллионов рублей. Цели: рост рождаемости до 1,7 детей на семью, строительство 200 тыс. квартир для многодетных, создание 50 тыс. мест в детских технопарках, бесплатное допобразование для всех детей. Координатором назначен вице-премьер Татьяна Голикова.',
    category: 'программы',
    source: 'Правительство РФ',
    sourceLink: '#',
    icon: 'Sparkles'
  },
  {
    id: '7',
    date: '2024-11-20',
    title: 'Семейная ипотека продлена до 2030 года',
    summary: 'Программа льготной ипотеки под 6% будет действовать еще 6 лет',
    content: 'Президент поручил продлить программу семейной ипотеки до 2030 года. Условия остаются прежними: ставка 6% на весь срок кредита для семей с детьми, рожденными с 2018 года. Максимальная сумма кредита — 12 млн рублей в Москве и МО, 6 млн в регионах. С 2018 года по программе выдано более 1,5 млн кредитов на сумму свыше 7 трлн рублей.',
    category: 'программы',
    source: 'Минфин РФ',
    sourceLink: '#',
    icon: 'Home'
  },
  {
    id: '8',
    date: '2024-11-15',
    title: 'Дагестан выплатит по 100 тыс. рублей при рождении первого ребенка',
    summary: 'Региональная программа поддержки молодых семей стартует с 2025 года',
    content: 'Глава Дагестана подписал указ о выплате 100 тысяч рублей при рождении первого ребенка в семьях, где оба родителя младше 25 лет. Дополнительно семьи получат сертификат на детские товары на 50 тысяч рублей. Программа направлена на снижение возраста первых родов и повышение рождаемости в республике. Бюджет программы — 2 млрд рублей.',
    category: 'регионы',
    source: 'Правительство Дагестана',
    sourceLink: '#',
    icon: 'MapPin'
  },
  {
    id: '9',
    date: '2024-11-10',
    title: 'Упрощен порядок получения статуса многодетной семьи',
    summary: 'Теперь достаточно подать заявление через Госуслуги — справки не нужны',
    content: 'МВД и Минтруд упростили процедуру получения удостоверения многодетной семьи. С 1 декабря 2024 года все данные проверяются автоматически через ЕГРН и ЗАГС — родителям не нужно собирать справки. Заявление подается на Госуслугах, решение принимается за 3 дня, удостоверение приходит в электронном виде. Бумажную версию можно получить в МФЦ по желанию.',
    category: 'инициативы',
    source: 'МВД РФ',
    sourceLink: '#',
    icon: 'Users'
  },
  {
    id: '10',
    date: '2024-11-05',
    title: 'В школах введут курс "Основы семейной жизни"',
    summary: 'С 2025 года старшеклассники будут изучать психологию отношений и воспитание детей',
    content: 'Минпросвещения утвердило новый предмет для 9-11 классов — "Основы семейной жизни". Программа включает психологию отношений, планирование семьи, финансовую грамотность, воспитание детей, разрешение конфликтов. Цель — подготовить подростков к созданию крепких семей и ответственному родительству. Предмет будет преподаваться 1 час в неделю.',
    category: 'инициативы',
    source: 'Минпросвещения РФ',
    sourceLink: '#',
    icon: 'BookOpen'
  }
];

const categories = [
  { id: 'all', name: 'Все новости', color: 'gray' },
  { id: 'законы', name: 'Законы', color: 'blue' },
  { id: 'выплаты', name: 'Выплаты', color: 'green' },
  { id: 'программы', name: 'Программы', color: 'purple' },
  { id: 'инициативы', name: 'Инициативы', color: 'orange' },
  { id: 'регионы', name: 'Регионы', color: 'red' }
];

export default function FamilyNews() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedNews, setExpandedNews] = useState<string | null>(null);

  const filteredNews = news.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHero
          title="Новости и инициативы"
          subtitle="Актуальные новости семейного законодательства и политики"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/126eb1fc-4b71-4f1c-87fd-fa88beb6d32d.jpg"
          backPath="/state-hub"
        />

        <Card className="bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="text-sm"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredNews.map(item => {
            const isExpanded = expandedNews === item.id;
            const categoryColor = getCategoryColor(item.category);
            
            return (
              <Card 
                key={item.id}
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setExpandedNews(isExpanded ? null : item.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`bg-${categoryColor}-100 p-3 rounded-lg flex-shrink-0`}>
                      <Icon name={item.icon as any} size={24} className={`text-${categoryColor}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {formatDate(item.date)}
                        </Badge>
                        <Badge className={`bg-${categoryColor}-100 text-${categoryColor}-700 hover:bg-${categoryColor}-200`}>
                          {item.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <CardDescription className="text-sm">{item.summary}</CardDescription>
                    </div>
                    <Icon 
                      name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                      size={20} 
                      className="text-gray-400 flex-shrink-0"
                    />
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t pt-4 space-y-4">
                    <p className="text-gray-700 leading-relaxed">{item.content}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon name="Building2" size={16} />
                        <span>Источник: {item.source}</span>
                      </div>
                      {item.sourceLink !== '#' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.sourceLink, '_blank');
                          }}
                        >
                          <Icon name="ExternalLink" size={14} className="mr-2" />
                          Читать полностью
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {filteredNews.length === 0 && (
          <Card className="text-center p-12">
            <Icon name="Newspaper" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Новостей в этой категории пока нет</p>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCategory('all')}
            >
              Показать все новости
            </Button>
          </Card>
        )}

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Bell" size={24} className="text-blue-600" />
              Подписка на новости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Хотите первыми узнавать о новых мерах поддержки семей? 
              Подпишитесь на официальные каналы Правительства РФ:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" onClick={() => window.open('https://government.ru', '_blank')}>
                <Icon name="Globe" size={16} className="mr-2" />
                Сайт Правительства РФ
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.open('https://t.me/governmentru', '_blank')}>
                <Icon name="Send" size={16} className="mr-2" />
                Telegram Правительства
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.open('https://www.gosuslugi.ru', '_blank')}>
                <Icon name="Smartphone" size={16} className="mr-2" />
                Госуслуги
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => window.open('http://www.kremlin.ru', '_blank')}>
                <Icon name="Flag" size={16} className="mr-2" />
                Официальный сайт Кремля
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}