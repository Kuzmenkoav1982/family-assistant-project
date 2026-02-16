import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import SectionHero from '@/components/ui/section-hero';

interface SupportMeasure {
  id: string;
  title: string;
  description: string;
  category: string;
  amount?: string;
  conditions: string[];
  howToGet: string[];
  documents: string[];
  icon: string;
  link?: string;
}

const supportMeasures: SupportMeasure[] = [
  {
    id: 'maternity-capital',
    title: 'Материнский капитал',
    description: 'Государственная поддержка семей при рождении или усыновлении детей',
    category: 'financial',
    amount: '630 380 ₽ на первого ребенка, 833 024 ₽ на второго',
    conditions: [
      'Рождение или усыновление первого ребенка с 2020 года',
      'Рождение или усыновление второго/третьего ребенка',
      'Гражданство РФ у ребенка'
    ],
    howToGet: [
      'Подать заявление через Госуслуги',
      'Обратиться в МФЦ или Пенсионный фонд',
      'Дождаться решения (до 15 рабочих дней)',
      'Получить сертификат в электронном виде'
    ],
    documents: [
      'Свидетельство о рождении ребенка',
      'СНИЛС матери и ребенка',
      'Паспорт заявителя'
    ],
    icon: 'Baby',
    link: 'https://www.gosuslugi.ru/10058/1'
  },
  {
    id: 'monthly-payment',
    title: 'Ежемесячные выплаты на детей',
    description: 'Единое пособие на детей до 17 лет для семей с низким доходом',
    category: 'financial',
    amount: 'От 7 000 до 15 000 ₽ в зависимости от региона',
    conditions: [
      'Среднедушевой доход семьи ниже прожиточного минимума',
      'Имущество семьи не превышает установленный перечень',
      'Ребенку до 17 лет'
    ],
    howToGet: [
      'Подать заявление через Госуслуги',
      'Заполнить сведения о доходах и имуществе',
      'Дождаться решения СФР (до 35 рабочих дней)'
    ],
    documents: [
      'Свидетельство о рождении детей',
      'Справки о доходах за 12 месяцев',
      'Реквизиты счета для перечисления'
    ],
    icon: 'HandCoins',
    link: 'https://www.gosuslugi.ru/600426/1'
  },
  {
    id: 'birth-payment',
    title: 'Единовременная выплата при рождении',
    description: 'Разовая выплата на каждого рожденного ребенка',
    category: 'financial',
    amount: '23 011 ₽',
    conditions: [
      'Рождение ребенка',
      'Обращение в течение 6 месяцев после рождения'
    ],
    howToGet: [
      'Работающие — подать заявление работодателю',
      'Неработающие — обратиться в СФР',
      'Через Госуслуги (автоматически при регистрации рождения)'
    ],
    documents: [
      'Свидетельство о рождении',
      'Справка о том, что второй родитель не получал выплату'
    ],
    icon: 'Gift',
    link: 'https://www.gosuslugi.ru/10376/1'
  },
  {
    id: 'tax-deduction',
    title: 'Налоговый вычет на детей',
    description: 'Уменьшение налогооблагаемого дохода для родителей',
    category: 'financial',
    amount: '1 400 ₽ на первого/второго, 3 000 ₽ на третьего ребенка ежемесячно',
    conditions: [
      'Наличие официального дохода, облагаемого НДФЛ 13%',
      'Ребенок до 18 лет (до 24 лет, если учится)'
    ],
    howToGet: [
      'Подать заявление работодателю',
      'Приложить копию свидетельства о рождении',
      'Вычет применяется автоматически каждый месяц'
    ],
    documents: [
      'Свидетельство о рождении ребенка',
      'Справка из учебного заведения (если ребенок старше 18 лет)'
    ],
    icon: 'Calculator'
  },
  {
    id: 'free-kindergarten',
    title: 'Бесплатный детский сад',
    description: 'Право на место в государственном дошкольном учреждении',
    category: 'education',
    conditions: [
      'Ребенку от 2 месяцев до 7 лет',
      'Постоянная регистрация в регионе'
    ],
    howToGet: [
      'Встать в очередь через Госуслуги сразу после рождения',
      'Дождаться направления в детский сад',
      'Получить компенсацию части родительской платы (20-70%)'
    ],
    documents: [
      'Свидетельство о рождении',
      'Паспорт родителя',
      'СНИЛС ребенка',
      'Медицинская карта'
    ],
    icon: 'School',
    link: 'https://www.gosuslugi.ru/10909/1'
  },
  {
    id: 'school-meals',
    title: 'Бесплатное питание в школе',
    description: 'Горячее питание для учеников начальных классов и льготных категорий',
    category: 'education',
    conditions: [
      'Ученики 1-4 классов (всем)',
      'Многодетные семьи (5-11 классы)',
      'Малоимущие семьи'
    ],
    howToGet: [
      'Автоматически предоставляется в 1-4 классах',
      'Для льготников — подать заявление через школу или МФЦ'
    ],
    documents: [
      'Справка о составе семьи',
      'Справка о доходах (для малоимущих)',
      'Удостоверение многодетной семьи'
    ],
    icon: 'UtensilsCrossed'
  },
  {
    id: 'mortgage-subsidy',
    title: 'Льготная ипотека для семей',
    description: 'Ипотека под 6% годовых на покупку жилья',
    category: 'housing',
    amount: 'Ставка 6% на весь срок кредита',
    conditions: [
      'Рождение ребенка с 2018 года',
      'Первоначальный взнос от 20%',
      'Покупка жилья на первичном рынке'
    ],
    howToGet: [
      'Обратиться в банк-участник программы',
      'Предоставить документы на ребенка',
      'Получить одобрение ипотеки'
    ],
    documents: [
      'Свидетельство о рождении ребенка',
      'Паспорт, СНИЛС',
      'Справка о доходах',
      'Документы на приобретаемое жилье'
    ],
    icon: 'Home',
    link: 'https://dom.gosuslugi.ru/mortgage'
  },
  {
    id: 'land-plot',
    title: 'Бесплатный земельный участок',
    description: 'Предоставление земли многодетным семьям',
    category: 'housing',
    conditions: [
      'Семья с 3 и более детьми',
      'Проживание в регионе от 5 лет',
      'Нуждаемость в улучшении жилищных условий'
    ],
    howToGet: [
      'Встать на учет в местной администрации',
      'Дождаться очереди',
      'Получить участок в собственность'
    ],
    documents: [
      'Удостоверение многодетной семьи',
      'Справка о составе семьи',
      'Документы на детей'
    ],
    icon: 'Trees'
  },
  {
    id: 'free-medicine',
    title: 'Бесплатные лекарства для детей',
    description: 'Льготные рецепты на медикаменты для детей до 3 лет',
    category: 'health',
    conditions: [
      'Ребенок до 3 лет',
      'Наличие полиса ОМС',
      'Рецепт от врача на льготный препарат'
    ],
    howToGet: [
      'Получить рецепт у педиатра',
      'Обратиться в аптеку с льготными лекарствами',
      'Получить препарат бесплатно'
    ],
    documents: [
      'Полис ОМС',
      'Свидетельство о рождении',
      'Рецепт врача'
    ],
    icon: 'Pill'
  },
  {
    id: 'social-contract',
    title: 'Социальный контракт',
    description: 'Целевая помощь для выхода из трудной жизненной ситуации',
    category: 'social',
    amount: 'До 350 000 ₽ на открытие бизнеса, обучение, покупку техники',
    conditions: [
      'Среднедушевой доход ниже прожиточного минимума',
      'Готовность выполнить условия контракта'
    ],
    howToGet: [
      'Обратиться в отдел соцзащиты',
      'Составить план выхода из трудной ситуации',
      'Подписать социальный контракт',
      'Получить выплату и отчитаться о расходах'
    ],
    documents: [
      'Паспорт',
      'Справки о доходах',
      'План использования средств'
    ],
    icon: 'FileCheck'
  },
  {
    id: 'vacation-vouchers',
    title: 'Льготные путевки в санатории',
    description: 'Бесплатный или частично оплаченный отдых для детей',
    category: 'social',
    conditions: [
      'Дети из малообеспеченных или многодетных семей',
      'Дети-инвалиды',
      'Дети, нуждающиеся в санаторно-курортном лечении'
    ],
    howToGet: [
      'Получить направление от врача (если по медпоказаниям)',
      'Обратиться в соцзащиту или профсоюз',
      'Встать в очередь на путевку'
    ],
    documents: [
      'Справка о доходах',
      'Справка из школы/детсада',
      'Медицинская справка (если требуется лечение)'
    ],
    icon: 'Palmtree'
  }
];

const categories = [
  { id: 'all', name: 'Все меры', icon: 'LayoutGrid' },
  { id: 'financial', name: 'Финансовая поддержка', icon: 'HandCoins' },
  { id: 'education', name: 'Образование', icon: 'GraduationCap' },
  { id: 'housing', name: 'Жильё', icon: 'Home' },
  { id: 'health', name: 'Здоровье', icon: 'Heart' },
  { id: 'social', name: 'Социальная помощь', icon: 'Users' }
];

export default function StateSupport() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMeasure, setExpandedMeasure] = useState<string | null>(null);

  const filteredMeasures = supportMeasures.filter(measure => {
    const matchesCategory = selectedCategory === 'all' || measure.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      measure.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      measure.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHero
          title="Господдержка семей"
          subtitle="Меры поддержки от государства РФ для семей с детьми"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/837fd184-7adf-4cfa-9e10-87a2c24fc6f9.jpg"
          backPath="/state-hub"
        />

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск мер поддержки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                  {categories.map(cat => (
                    <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1 text-xs">
                      <Icon name={cat.icon as any} size={14} />
                      <span className="hidden lg:inline">{cat.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {filteredMeasures.map(measure => (
            <Card 
              key={measure.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setExpandedMeasure(expandedMeasure === measure.id ? null : measure.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Icon name={measure.icon as any} size={24} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{measure.title}</CardTitle>
                      <CardDescription className="mt-1">{measure.description}</CardDescription>
                      {measure.amount && (
                        <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-200">
                          {measure.amount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Icon 
                    name={expandedMeasure === measure.id ? "ChevronUp" : "ChevronDown"} 
                    size={20} 
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>
              </CardHeader>

              {expandedMeasure === measure.id && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="CheckCircle" size={16} className="text-green-600" />
                      Условия получения:
                    </h4>
                    <ul className="space-y-1 ml-6">
                      {measure.conditions.map((condition, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {condition}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="ListOrdered" size={16} className="text-blue-600" />
                      Как получить:
                    </h4>
                    <ol className="space-y-1 ml-6">
                      {measure.howToGet.map((step, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{idx + 1}. {step}</li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Icon name="FileText" size={16} className="text-purple-600" />
                      Необходимые документы:
                    </h4>
                    <ul className="space-y-1 ml-6">
                      {measure.documents.map((doc, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {doc}</li>
                      ))}
                    </ul>
                  </div>

                  {measure.link && (
                    <Button 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(measure.link, '_blank');
                      }}
                    >
                      <Icon name="ExternalLink" size={16} className="mr-2" />
                      Подать заявление на Госуслугах
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {filteredMeasures.length === 0 && (
          <Card className="text-center p-12">
            <Icon name="Search" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Меры поддержки не найдены</p>
            <Button 
              variant="ghost" 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4"
            >
              Сбросить фильтры
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}