import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import type { FamilyMember } from '@/types/family.types';

interface ZodiacSign {
  sign: string;
  emoji: string;
  element: string;
  ruler: string;
  dates: string;
}

interface BaziElement {
  element: string;
  yin: boolean;
  animal?: string;
}

interface BaziChart {
  year: BaziElement;
  month: BaziElement;
  day: BaziElement;
  hour: BaziElement;
}

export function AstrologyService() {
  const { members } = useFamilyMembers();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [activeTab, setActiveTab] = useState('daily');

  // Выбираем текущего пользователя по умолчанию
  useEffect(() => {
    if (members.length > 0 && !selectedMember) {
      setSelectedMember(members[0]);
    }
  }, [members, selectedMember]);

  const zodiacSigns: ZodiacSign[] = [
    { sign: 'Овен', emoji: '♈', element: 'Огонь', ruler: 'Марс', dates: '21.03 - 19.04' },
    { sign: 'Телец', emoji: '♉', element: 'Земля', ruler: 'Венера', dates: '20.04 - 20.05' },
    { sign: 'Близнецы', emoji: '♊', element: 'Воздух', ruler: 'Меркурий', dates: '21.05 - 20.06' },
    { sign: 'Рак', emoji: '♋', element: 'Вода', ruler: 'Луна', dates: '21.06 - 22.07' },
    { sign: 'Лев', emoji: '♌', element: 'Огонь', ruler: 'Солнце', dates: '23.07 - 22.08' },
    { sign: 'Дева', emoji: '♍', element: 'Земля', ruler: 'Меркурий', dates: '23.08 - 22.09' },
    { sign: 'Весы', emoji: '♎', element: 'Воздух', ruler: 'Венера', dates: '23.09 - 22.10' },
    { sign: 'Скорпион', emoji: '♏', element: 'Вода', ruler: 'Плутон', dates: '23.10 - 21.11' },
    { sign: 'Стрелец', emoji: '♐', element: 'Огонь', ruler: 'Юпитер', dates: '22.11 - 21.12' },
    { sign: 'Козерог', emoji: '♑', element: 'Земля', ruler: 'Сатурн', dates: '22.12 - 19.01' },
    { sign: 'Водолей', emoji: '♒', element: 'Воздух', ruler: 'Уран', dates: '20.01 - 18.02' },
    { sign: 'Рыбы', emoji: '♓', element: 'Вода', ruler: 'Нептун', dates: '19.02 - 20.03' },
  ];

  const getZodiacSign = (birthDate: string): ZodiacSign | null => {
    if (!birthDate) return null;
    
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0];
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1];
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2];
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3];
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4];
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5];
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6];
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7];
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8];
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9];
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10];
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return zodiacSigns[11];

    return null;
  };

  const getChineseZodiac = (year: number): string => {
    const animals = ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'];
    const index = (year - 1900) % 12;
    return animals[index];
  };

  const getBaziChart = (birthDate: string, birthTime?: string): BaziChart | null => {
    if (!birthDate) return null;

    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Упрощенная версия Бацзы
    const elements = ['Дерево', 'Огонь', 'Земля', 'Металл', 'Вода'];
    const animals = getChineseZodiac(year);

    // Столпы года
    const yearElement = elements[year % 5];
    const yearYin = year % 2 === 0;

    // Столпы месяца
    const monthElement = elements[month % 5];
    const monthYin = month % 2 === 0;

    // Столпы дня
    const dayElement = elements[day % 5];
    const dayYin = day % 2 === 0;

    // Столпы часа (если указано время)
    let hourElement = 'Дерево';
    let hourYin = false;
    if (birthTime) {
      const [hours] = birthTime.split(':').map(Number);
      hourElement = elements[Math.floor(hours / 2) % 5];
      hourYin = hours % 2 === 0;
    }

    return {
      year: { element: yearElement, yin: yearYin, animal: animals },
      month: { element: monthElement, yin: monthYin },
      day: { element: dayElement, yin: dayYin },
      hour: { element: hourElement, yin: hourYin },
    };
  };

  const getDailyHoroscope = (zodiacSign: string): string => {
    const horoscopes: Record<string, string> = {
      'Овен': 'Сегодня отличный день для новых начинаний! Ваша энергия на пике, используйте её для воплощения давних идей. В семейных делах проявите инициативу.',
      'Телец': 'День благоприятствует укреплению семейных связей. Займитесь домашним уютом, проведите время с близкими. Финансовые вопросы лучше отложить.',
      'Близнецы': 'Общение будет вашей сильной стороной сегодня. Отличное время для семейного совета или планирования совместных активностей.',
      'Рак': 'Прислушайтесь к своей интуиции в семейных вопросах. Эмоциональная близость с родными принесёт радость и умиротворение.',
      'Лев': 'Ваше творчество и лидерство помогут организовать семейное мероприятие. Дети особенно нуждаются в вашем внимании сегодня.',
      'Дева': 'Практичность и внимание к деталям помогут навести порядок в доме и в семейных делах. Отличный день для планирования бюджета.',
      'Весы': 'Гармония и компромисс - ваши союзники сегодня. Разрешите старые конфликты, найдите баланс в отношениях с близкими.',
      'Скорпион': 'Глубокие беседы с членами семьи помогут лучше понять друг друга. Не бойтесь открывать свои чувства близким людям.',
      'Стрелец': 'День благоприятен для семейных путешествий или планирования отпуска. Вдохновляйте близких на новые приключения!',
      'Козерог': 'Ответственный подход к семейным обязанностям принесёт уважение и признательность. Структурируйте домашние дела.',
      'Водолей': 'Ваши оригинальные идеи оживят семейную рутину. Предложите необычное развлечение для всей семьи.',
      'Рыбы': 'Интуиция подскажет, как поддержать близких. Уделите время творчеству вместе с детьми, это укрепит связь.'
    };

    return horoscopes[zodiacSign] || 'Хороший день для семейных дел и общения с близкими!';
  };

  const getWeeklyAdvice = (zodiacSign: string): string => {
    const advice: Record<string, string> = {
      'Овен': 'На этой неделе сосредоточьтесь на физической активности всей семьёй. Совместные прогулки или спортивные игры укрепят здоровье и отношения.',
      'Телец': 'Уделите внимание домашнему уюту и кулинарии. Семейные ужины и совместное приготовление блюд создадут атмосферу тепла.',
      'Близнецы': 'Неделя общения и обучения. Организуйте семейные игры, обсуждения интересных тем, читайте вместе книги.',
      'Рак': 'Время для эмоционального сближения. Делитесь чувствами, создавайте семейные традиции, проявляйте заботу.',
      'Лев': 'Организуйте яркое семейное событие. Праздник, концерт, творческий вечер - покажите свои таланты!',
      'Дева': 'Наведите порядок в семейных делах. Создайте систему распределения обязанностей, обновите расписание.',
      'Весы': 'Укрепляйте партнёрские отношения. Ищите компромиссы, создавайте гармонию, украшайте дом.',
      'Скорпион': 'Углубите эмоциональные связи. Откровенные разговоры помогут лучше понять друг друга.',
      'Стрелец': 'Расширяйте горизонты семьи. Изучайте новое, планируйте поездки, делитесь знаниями.',
      'Козерог': 'Строите планы на будущее. Обсудите семейные цели, финансы, образование детей.',
      'Водолей': 'Внесите новизну в семейную жизнь. Пробуйте необычные активности, меняйте привычки.',
      'Рыбы': 'Развивайте духовную сторону семьи. Медитации, творчество, помощь другим укрепят связь.'
    };

    return advice[zodiacSign] || 'Проводите больше времени с семьёй, укрепляйте связи!';
  };

  if (!selectedMember || !selectedMember.birthDate) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-6xl mb-4 animate-bounce">🌙</div>
          <h3 className="text-2xl font-bold text-purple-900">Астрологический сервис Домового</h3>
          <div className="bg-white/70 rounded-lg p-6 space-y-4">
            <p className="text-gray-800 text-lg font-medium">
              👋 Приветствую! Я Домовой-астролог.
            </p>
            <p className="text-gray-700">
              Чтобы составить персональный астрологический прогноз, мне нужно знать вашу дату рождения.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">📝 Как заполнить:</p>
              <ol className="text-sm text-left text-blue-800 space-y-2">
                <li>1️⃣ Перейдите в <strong>профиль члена семьи</strong></li>
                <li>2️⃣ Откройте вкладку <strong>"Редактировать"</strong></li>
                <li>3️⃣ Заполните <strong>"Дата рождения 🌟"</strong></li>
                <li>4️⃣ По желанию укажите <strong>"Время рождения 🕐"</strong> (для точной карты Бацзы)</li>
                <li>5️⃣ Сохраните изменения</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 italic">
              ⭐ С датой и временем рождения я смогу рассчитать знак зодиака, китайское животное года,<br />
              карту Бацзы и дать точные персональные рекомендации для вашей семьи!
            </p>
          </div>
          <Button 
            onClick={() => {
              const memberId = selectedMember?.id;
              if (memberId) {
                window.location.href = `/member/${memberId}`;
              } else {
                window.location.href = '/?section=family';
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            <Icon name="UserCircle" className="mr-2" size={20} />
            Заполнить дату рождения
          </Button>
        </CardContent>
      </Card>
    );
  }

  const zodiac = getZodiacSign(selectedMember.birthDate);
  const chineseZodiac = getChineseZodiac(new Date(selectedMember.birthDate).getFullYear());
  const baziChart = getBaziChart(selectedMember.birthDate, selectedMember.birthTime);

  return (
    <div className="space-y-6">
      {/* Выбор члена семьи */}
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Icon name="User" size={20} />
            <span className="font-medium">Прогноз для:</span>
            <select
              value={selectedMember.id}
              onChange={(e) => setSelectedMember(members.find(m => m.id === e.target.value) || null)}
              className="flex-1 border rounded-md p-2 bg-white"
            >
              {members.filter(m => m.birthDate).map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Подсказка об отсутствии времени рождения */}
      {!selectedMember.birthTime && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  Совет от Домового
                </p>
                <p className="text-sm text-amber-800">
                  Вы не указали время рождения. Для составления более точной карты Бацзы (Четыре Столпа Судьбы) 
                  рекомендую добавить время рождения в профиле. Это поможет мне дать более точные рекомендации!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-amber-400 text-amber-900 hover:bg-amber-100"
                  onClick={() => window.location.href = `/member/${selectedMember.id}`}
                >
                  <Icon name="Clock" size={16} className="mr-2" />
                  Добавить время рождения
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Знак зодиака */}
      {zodiac && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-3xl">{zodiac.emoji}</span>
              <div>
                <div className="text-2xl">{zodiac.sign}</div>
                <div className="text-sm font-normal text-gray-600">{zodiac.dates}</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-sm text-gray-600">Стихия</div>
                <div className="font-semibold">{zodiac.element}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-sm text-gray-600">Планета</div>
                <div className="font-semibold">{zodiac.ruler}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🐉</div>
                <div className="text-sm text-gray-600">Год</div>
                <div className="font-semibold">{chineseZodiac}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Вкладки с прогнозами */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="daily">На сегодня</TabsTrigger>
          <TabsTrigger value="weekly">На неделю</TabsTrigger>
          <TabsTrigger value="bazi">Карта Бацзы</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Sun" size={20} />
                Прогноз на сегодня
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {zodiac && getDailyHoroscope(zodiac.sign)}
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Icon name="Sparkles" size={16} />
                  <span className="font-medium">Совет Домового:</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Учитывайте настроение близких, используйте анкету семьи для лучшего понимания потребностей каждого.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                Прогноз на неделю
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">
                {zodiac && getWeeklyAdvice(zodiac.sign)}
              </p>
              
              {/* Совместимость с членами семьи */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icon name="Heart" size={16} />
                  Совместимость с семьёй
                </h4>
                <div className="space-y-2">
                  {members.filter(m => m.id !== selectedMember.id && m.birthDate).map(member => {
                    const memberZodiac = getZodiacSign(member.birthDate!);
                    return (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <span>{member.name}</span>
                          {memberZodiac && <span className="text-xl">{memberZodiac.emoji}</span>}
                        </div>
                        <Badge variant="outline">
                          {zodiac && memberZodiac && zodiac.element === memberZodiac.element ? 'Отличная' : 'Хорошая'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bazi" className="space-y-4">
          {baziChart ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Layers" size={20} />
                  Карта Бацзы (Четыре Столпа Судьбы)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Карта Бацзы показывает энергетическую структуру личности на основе даты и времени рождения
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Столп года */}
                  <Card className="bg-gradient-to-br from-red-50 to-orange-50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🐉</div>
                      <div className="font-semibold mb-1">Год</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {baziChart.year.yin ? 'Инь' : 'Ян'} {baziChart.year.element}
                      </div>
                      <div className="text-xs text-gray-500">{baziChart.year.animal}</div>
                      <div className="text-xs text-gray-500 mt-2">Предки, корни</div>
                    </CardContent>
                  </Card>

                  {/* Столп месяца */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🌱</div>
                      <div className="font-semibold mb-1">Месяц</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {baziChart.month.yin ? 'Инь' : 'Ян'} {baziChart.month.element}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Родители, детство</div>
                    </CardContent>
                  </Card>

                  {/* Столп дня */}
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="font-semibold mb-1">День</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {baziChart.day.yin ? 'Инь' : 'Ян'} {baziChart.day.element}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Личность, супруг</div>
                    </CardContent>
                  </Card>

                  {/* Столп часа */}
                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">🌙</div>
                      <div className="font-semibold mb-1">Час</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {baziChart.hour.yin ? 'Инь' : 'Ян'} {baziChart.hour.element}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Дети, будущее</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Sparkles" size={16} />
                    Интерпретация от Домового
                  </h4>
                  <p className="text-sm text-gray-700">
                    Ваша энергетическая структура показывает баланс элементов: 
                    {Object.values([baziChart.year, baziChart.month, baziChart.day, baziChart.hour])
                      .map(p => p.element)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .join(', ')}. 
                    Это определяет ваши сильные стороны и подход к семейным делам.
                  </p>
                </div>

                {!selectedMember.birthTime && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-2 text-sm text-yellow-800">
                      <Icon name="Info" size={16} className="mt-0.5" />
                      <div>
                        <p className="font-medium">Укажите время рождения для точной карты</p>
                        <p className="text-xs mt-1">Столп часа рассчитан приблизительно</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Недостаточно данных для построения карты Бацзы</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Рекомендации на основе анкеты */}
      {selectedMember.profile && (
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Lightbulb" size={20} />
              Персональные рекомендации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="Clock" size={18} className="mt-1 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Энергетический тип: {selectedMember.profile.energyType || 'не указан'}</p>
                <p className="text-sm text-gray-600">
                  {selectedMember.profile.energyType === 'жаворонок' && 'Планируйте важные дела на утро'}
                  {selectedMember.profile.energyType === 'сова' && 'Ваша продуктивность выше вечером'}
                  {selectedMember.profile.energyType === 'голубь' && 'У вас равномерная энергия в течение дня'}
                </p>
              </div>
            </div>

            {selectedMember.profile.hobbies && selectedMember.profile.hobbies.length > 0 && (
              <div className="flex items-start gap-3">
                <Icon name="Heart" size={18} className="mt-1 text-pink-600" />
                <div className="flex-1">
                  <p className="font-medium">Увлечения учтены в прогнозе</p>
                  <p className="text-sm text-gray-600">
                    {selectedMember.profile.hobbies.slice(0, 3).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {selectedMember.profile.stressRelief && selectedMember.profile.stressRelief.length > 0 && (
              <div className="flex items-start gap-3">
                <Icon name="Wind" size={18} className="mt-1 text-purple-600" />
                <div className="flex-1">
                  <p className="font-medium">Снятие стресса</p>
                  <p className="text-sm text-gray-600">
                    Рекомендую: {selectedMember.profile.stressRelief[0]}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}