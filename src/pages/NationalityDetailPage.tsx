import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface NationalityData {
  id: string;
  name: string;
  nameRu: string;
  population: string;
  region: string;
  image: string;
  history: string;
  traditions: {
    title: string;
    description: string;
    icon: string;
  }[];
  rituals: {
    title: string;
    description: string;
    season?: string;
  }[];
  culture: {
    language: string;
    religion: string;
    crafts: string[];
  };
}

const nationalitiesData: Record<string, NationalityData> = {
  russian: {
    id: 'russian',
    name: 'Русские',
    nameRu: 'Русские',
    population: '~111 млн',
    region: 'По всей России',
    image: 'https://cdn.poehali.dev/files/3e707393-c1f2-4550-a42f-5736711ffa7c.png',
    history: 'Русские — крупнейший народ России и Европы, основа российской государственности. Формирование русского этноса началось в IX веке с объединения восточнославянских племён. Древнерусское государство, принятие христианства в 988 году, культурное наследие Киевской Руси заложили основу русской культуры. Через века русский народ создал уникальную культуру, внёс значительный вклад в мировую науку, литературу и искусство.',
    traditions: [
      {
        title: 'Масленица',
        description: 'Древний праздник проводов зимы. Целую неделю пекут блины, устраивают гулянья, катаются на санях и сжигают чучело зимы.',
        icon: '🥞'
      },
      {
        title: 'Рождественские колядки',
        description: 'Хождение по домам с песнями и пожеланиями, получение угощений. Празднуется с 7 по 19 января.',
        icon: '⭐'
      },
      {
        title: 'Иван Купала',
        description: 'Летний праздник в ночь на 7 июля. Разжигают костры, прыгают через огонь, плетут венки и пускают по воде.',
        icon: '🔥'
      }
    ],
    rituals: [
      { title: 'Встреча хлебом-солью', description: 'Гостеприимный ритуал встречи дорогих гостей', season: 'круглый год' },
      { title: 'Сватовство', description: 'Традиционный обряд перед свадьбой', season: 'круглый год' },
      { title: 'Крещение в проруби', description: 'Купание в ледяной воде 19 января', season: 'зима' }
    ],
    culture: {
      language: 'Русский язык (славянская группа)',
      religion: 'Православие',
      crafts: ['Гжельская керамика', 'Хохломская роспись', 'Дымковская игрушка', 'Палехская миниатюра']
    }
  },
  tatar: {
    id: 'tatar',
    name: 'Татары',
    nameRu: 'Татары',
    population: '~5.3 млн',
    region: 'Татарстан',
    image: 'https://cdn.poehali.dev/files/3e707393-c1f2-4550-a42f-5736711ffa7c.png',
    history: 'Татары — второй по численности народ России. Этнос сформировался на основе булгар Волжской Булгарии и золотоордынских племён. Казанское ханство (XV-XVI вв.) стало центром татарской государственности. После присоединения к России татары сохранили свою культуру, язык и религию, внесли значительный вклад в развитие российской экономики, науки и культуры.',
    traditions: [
      {
        title: 'Сабантуй',
        description: 'Праздник плуга, отмечается после завершения весенних полевых работ. Включает национальные состязания, борьбу, скачки.',
        icon: '🏇'
      },
      {
        title: 'Ураза-байрам',
        description: 'Праздник разговения после месяца Рамадан. Праздничные молитвы, угощения, посещение родственников.',
        icon: '🌙'
      },
      {
        title: 'Карга боткасы',
        description: 'Праздник грачиной каши, встреча весны. Готовят кашу, кормят птиц, проводят обряды для хорошего урожая.',
        icon: '🦅'
      }
    ],
    rituals: [
      { title: 'Никах', description: 'Мусульманский свадебный обряд', season: 'круглый год' },
      { title: 'Имянаречение', description: 'Обряд наречения имени младенцу', season: 'круглый год' },
      { title: 'Обряд гадания на воде', description: 'Древний обряд предсказания будущего', season: 'весна' }
    ],
    culture: {
      language: 'Татарский язык (тюркская группа)',
      religion: 'Ислам (суннитского толка)',
      crafts: ['Кожаная мозаика', 'Тюбетейки с вышивкой', 'Каллиграфия', 'Ювелирное искусство']
    }
  },
  buryat: {
    id: 'buryat',
    name: 'Буряты',
    nameRu: 'Буряты',
    population: '~460 тыс.',
    region: 'Бурятия',
    image: 'https://cdn.poehali.dev/files/3e707393-c1f2-4550-a42f-5736711ffa7c.png',
    history: 'Буряты — коренной народ Сибири, проживающий вокруг озера Байкал. Формирование бурятского этноса началось в XII-XIV веках. Традиционно буряты были кочевниками-скотоводами. В XVII веке вошли в состав России. Буряты сохранили уникальную культуру, тесно связанную с тибетским буддизмом и шаманизмом, создали богатый эпос и музыкальное наследие.',
    traditions: [
      {
        title: 'Сагаалган',
        description: 'Праздник Белого месяца, буддийский Новый год. Отмечается по лунному календарю в феврале-марте. Ритуальные подношения, молитвы, посещение дацанов.',
        icon: '🎊'
      },
      {
        title: 'Обряд почитания обо',
        description: 'Священные места в горах, где совершаются обряды поклонения духам местности. Проводятся жертвоприношения, повязываются ленты.',
        icon: '⛰️'
      },
      {
        title: 'Ёрдынские игры',
        description: 'Традиционные состязания: стрельба из лука, конные скачки, борьба. Проводятся летом на природе.',
        icon: '🏹'
      }
    ],
    rituals: [
      { title: 'Обряд освящения юрты', description: 'Благословение нового жилища ламой', season: 'круглый год' },
      { title: 'Обряд подношения молока небу', description: 'Ритуал с кропления молоком', season: 'лето' },
      { title: 'Обряд встречи Нового года', description: 'Сагаалган с ритуальными подношениями', season: 'зима-весна' }
    ],
    culture: {
      language: 'Бурятский язык (монгольская группа)',
      religion: 'Буддизм (тибетская школа), шаманизм',
      crafts: ['Резьба по дереву', 'Изготовление седел', 'Буддийская живопись танка', 'Ювелирные изделия']
    }
  }
};

const NationalityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const nationality = id ? nationalitiesData[id] : null;

  if (!nationality) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Народ не найден</h2>
            <p className="text-muted-foreground mb-6">
              К сожалению, информация об этом народе пока не добавлена
            </p>
            <button
              onClick={() => navigate('/nationalities')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Вернуться к списку
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/nationalities')}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {nationality.nameRu}
            </h1>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="shadow-xl animate-fade-in">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                    <span className="text-6xl">🏛️</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Icon name="Users" size={14} className="mr-1" />
                      {nationality.population}
                    </Badge>
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      <Icon name="MapPin" size={14} className="mr-1" />
                      {nationality.region}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 pt-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Язык</div>
                      <div className="font-semibold">{nationality.culture.language}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Религия</div>
                      <div className="font-semibold">{nationality.culture.religion}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Народные промыслы</div>
                      <div className="font-semibold">{nationality.culture.crafts.length} направлений</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BookOpen" size={24} className="text-purple-600" />
                Историческая справка
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{nationality.history}</p>
            </CardContent>
          </Card>

          <Card className="shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Sparkles" size={24} className="text-rose-600" />
                Традиции и праздники
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-1 gap-4">
                {nationality.traditions.map((tradition, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0">{tradition.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{tradition.title}</h4>
                        <p className="text-sm text-muted-foreground">{tradition.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Flame" size={24} className="text-orange-600" />
                Обряды и ритуалы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nationality.rituals.map((ritual, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-4 rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{ritual.title}</h4>
                      <p className="text-sm text-muted-foreground">{ritual.description}</p>
                    </div>
                    {ritual.season && (
                      <Badge variant="outline" className="ml-4 flex-shrink-0">
                        {ritual.season}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Palette" size={24} className="text-indigo-600" />
                Народные промыслы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {nationality.culture.crafts.map((craft, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 text-center"
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-sm font-medium">{craft}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NationalityDetailPage;
