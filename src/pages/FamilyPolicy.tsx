import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';

interface PolicyDirection {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  achievements: string[];
  goals: string[];
  documents: { title: string; link: string }[];
}

const policyDirections: PolicyDirection[] = [
  {
    id: 'demographic',
    title: 'Демографическая политика',
    description: 'Повышение рождаемости и улучшение демографической ситуации в стране',
    icon: 'Users',
    color: 'blue',
    achievements: [
      'Материнский капитал увеличен до 833 тыс. рублей',
      'Введены выплаты при рождении первого ребенка',
      'Льготная ипотека под 6% для семей с детьми',
      'Государственная программа поддержки рождаемости'
    ],
    goals: [
      'Достижение коэффициента рождаемости 1,7 к 2030 году',
      'Снижение младенческой смертности до 4,5 на 1000',
      'Увеличение продолжительности жизни до 78 лет'
    ],
    documents: [
      { title: 'Концепция демографической политики до 2030 года', link: 'https://mintrud.gov.ru/ministry/programms/6' }
    ]
  },
  {
    id: 'social',
    title: 'Социальная поддержка',
    description: 'Финансовая и материальная помощь семьям с детьми',
    icon: 'HandHeart',
    color: 'green',
    achievements: [
      'Единое пособие на детей до 17 лет (действует с 2023 года)',
      'Выплата 450 тыс. рублей на ипотеку многодетным',
      'Компенсация платы за детский сад до 70%',
      'Бесплатное горячее питание в школах 1-4 классов'
    ],
    goals: [
      'Охват господдержкой 100% нуждающихся семей',
      'Снижение уровня бедности семей с детьми до 8%',
      'Увеличение размера пособий выше инфляции'
    ],
    documents: [
      { title: 'Единое пособие на детей до 17 лет', link: 'https://mintrud.gov.ru/ministry/programms/3/0' },
      { title: 'Меры социальной поддержки семей', link: 'https://mintrud.gov.ru/ministry/programms' }
    ]
  },
  {
    id: 'housing',
    title: 'Жилищная политика',
    description: 'Обеспечение семей доступным и комфортным жильем',
    icon: 'Home',
    color: 'orange',
    achievements: [
      'Программа льготной ипотеки для семей с детьми',
      'Выделение бесплатных земельных участков многодетным',
      'Субсидии на строительство частного дома',
      'Программа улучшения жилищных условий семей с детьми'
    ],
    goals: [
      'Обеспечение жильем всех многодетных семей к 2030 году',
      'Снижение ставки по семейной ипотеке до 5%',
      'Строительство 50 млн кв.м. жилья для семей ежегодно'
    ],
    documents: [
      { title: 'Национальный проект "Жилье и городская среда"', link: 'https://minstroyrf.gov.ru/trades/natsionalnye-proekty/natsionalnyy-proekt-zhilye-i-gorodskaya-sreda/' }
    ]
  },
  {
    id: 'education',
    title: 'Образование детей',
    description: 'Доступное качественное образование для всех детей',
    icon: 'GraduationCap',
    color: 'purple',
    achievements: [
      '100% детей охвачены бесплатным дошкольным образованием',
      'Цифровая образовательная среда в 85% школ',
      'Бесплатное дополнительное образование для всех детей',
      'Открытие 1200 новых школ с 2019 года'
    ],
    goals: [
      'Обеспечение местами в детсадах всех детей от 1,5 лет к 2030 году',
      'Вхождение РФ в ТОП-10 стран по качеству образования',
      'Охват допобразованием 85% детей к 2030 году'
    ],
    documents: [
      { title: 'Национальный проект "Образование"', link: 'https://edu.gov.ru/national-project/' }
    ]
  },
  {
    id: 'health',
    title: 'Охрана здоровья',
    description: 'Медицинская помощь и забота о здоровье детей',
    icon: 'Heart',
    color: 'red',
    achievements: [
      'Бесплатная медпомощь детям по ОМС',
      'Льготные лекарства для детей до 3 лет',
      'Неонатальный скрининг для всех новорожденных',
      'Снижение младенческой смертности на 15% с 2018 года'
    ],
    goals: [
      'Снижение детской смертности до уровня развитых стран',
      'Обеспечение лекарствами всех детей с тяжелыми заболеваниями',
      'Создание системы раннего выявления заболеваний'
    ],
    documents: [
      { title: 'Национальный проект «Здравоохранение»', link: 'https://национальныепроекты.рф/projects/zdravookhranenie/' }
    ]
  },
  {
    id: 'values',
    title: 'Семейные ценности',
    description: 'Укрепление института семьи и традиционных ценностей',
    icon: 'Heart',
    color: 'pink',
    achievements: [
      'День семьи, любви и верности — государственный праздник',
      'Поддержка многопоколенных семей',
      'Программы укрепления семейных отношений',
      'Награды "Родительская слава" для образцовых семей'
    ],
    goals: [
      'Снижение количества разводов на 20% к 2030 году',
      'Популяризация многодетности как нормы',
      'Формирование уважения к институту брака'
    ],
    documents: [
      { title: 'Концепция государственной семейной политики', link: 'https://mintrud.gov.ru/ministry/programms/16' }
    ]
  }
];

const presidentialInitiatives = [
  {
    year: 2024,
    title: 'Указ о приоритете семейной политики',
    description: 'Семья объявлена национальным приоритетом РФ. Все госпрограммы должны учитывать интересы семей с детьми.',
    icon: 'Flag'
  },
  {
    year: 2023,
    title: 'Единое пособие на детей',
    description: 'Запущена система единого пособия, упрощающая получение выплат на детей до 17 лет.',
    icon: 'HandCoins'
  },
  {
    year: 2022,
    title: 'Семейная ипотека 6%',
    description: 'Продление программы льготной ипотеки под 6% для семей с детьми на весь срок кредита.',
    icon: 'Home'
  },
  {
    year: 2020,
    title: 'Маткапитал на первого ребенка',
    description: 'Материнский капитал начали выплачивать уже при рождении первого ребенка.',
    icon: 'Baby'
  }
];

export default function FamilyPolicy() {
  const navigate = useNavigate();
  const [expandedDirection, setExpandedDirection] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-600', border: 'border-pink-200' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <SectionHero
          title="Семейная политика"
          subtitle="Стратегические направления поддержки семей со стороны государства"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/126eb1fc-4b71-4f1c-87fd-fa88beb6d32d.jpg"
          backPath="/state-hub"
        />

        <Card className="bg-gradient-to-r from-red-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="AlertCircle" size={24} className="text-red-600" />
              Семья — национальный приоритет России
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700">
              <strong>Указом Президента РФ от 2024 года</strong> семья официально признана национальным приоритетом. 
              Это означает, что все государственные программы, законы и инициативы разрабатываются с учетом интересов семей.
            </p>
            <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
              <p className="italic text-gray-800">
                "Семья — это основа государства. Без крепких, счастливых семей нет будущего для нашей страны. 
                Поддержка семей с детьми — наш безусловный приоритет." 
                <span className="block mt-2 text-sm text-gray-600">— Из обращения Президента РФ, 2024 год</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-purple-600" />
              Ключевые инициативы Президента и Правительства
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {presidentialInitiatives.map(initiative => (
                <div key={initiative.year} className="flex gap-4 items-start p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                    <Icon name={initiative.icon as any} size={24} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{initiative.year}</Badge>
                      <h4 className="font-semibold">{initiative.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700">{initiative.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Основные направления семейной политики</h2>
          
          {policyDirections.map(direction => {
            const colors = getColorClasses(direction.color);
            const isExpanded = expandedDirection === direction.id;
            
            return (
              <Card 
                key={direction.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${colors.border}`}
                onClick={() => setExpandedDirection(isExpanded ? null : direction.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${colors.bg} p-3 rounded-lg`}>
                        <Icon name={direction.icon as any} size={28} className={colors.text} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{direction.title}</CardTitle>
                        <CardDescription className="mt-1">{direction.description}</CardDescription>
                      </div>
                    </div>
                    <Icon 
                      name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                      size={24} 
                      className="text-gray-400 flex-shrink-0"
                    />
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="TrendingUp" size={18} className="text-green-600" />
                        Что уже сделано:
                      </h4>
                      <ul className="space-y-2">
                        {direction.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="CheckCircle2" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Target" size={18} className="text-blue-600" />
                        Цели на будущее:
                      </h4>
                      <ul className="space-y-2">
                        {direction.goals.map((goal, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Icon name="ArrowRight" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {direction.documents.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Icon name="FileText" size={18} className="text-purple-600" />
                          Документы и программы:
                        </h4>
                        <div className="space-y-2">
                          {direction.documents.map((doc, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (doc.link !== '#') window.open(doc.link, '_blank');
                              }}
                            >
                              <Icon name="ExternalLink" size={14} className="mr-2" />
                              {doc.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={24} className="text-blue-600" />
              Почему семья важна для государства?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Users" size={18} className="text-blue-600" />
                  Демографическое будущее
                </h4>
                <p className="text-sm text-gray-700">
                  Рост населения и сохранение народа — основа сильного государства. 
                  Без крепких семей нет демографического развития.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="TrendingUp" size={18} className="text-green-600" />
                  Экономическое развитие
                </h4>
                <p className="text-sm text-gray-700">
                  Семьи — потребители, работники, создатели бизнеса. 
                  Поддержка семей стимулирует экономический рост страны.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Heart" size={18} className="text-purple-600" />
                  Социальная стабильность
                </h4>
                <p className="text-sm text-gray-700">
                  Крепкие семьи — это здоровое общество без конфликтов. 
                  Дети из полных семей реже попадают в криминал.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Icon name="Shield" size={18} className="text-orange-600" />
                  Национальная безопасность
                </h4>
                <p className="text-sm text-gray-700">
                  Сильная семья воспитывает патриотов, защитников Родины. 
                  Семейные ценности — основа духовной безопасности.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}