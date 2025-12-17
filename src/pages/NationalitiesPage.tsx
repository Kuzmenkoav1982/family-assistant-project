import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface Nationality {
  id: string;
  name: string;
  nameRu: string;
  population: string;
  image: string;
  region: string;
}

const nationalities: Nationality[] = [
  { id: 'avar', name: 'Аварцы', nameRu: 'Аварцы', population: '~1 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/88210e96-0fb7-4f84-8fe1-f4d8e28d8244.jpg', region: 'Дагестан' },
  { id: 'altai', name: 'Алтайцы', nameRu: 'Алтайцы', population: '~70 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b923533d-d379-46b3-afff-7c8f8f9a88e1.jpg', region: 'Алтай' },
  { id: 'armenian', name: 'Армяне', nameRu: 'Армяне', population: '~1.2 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/69e3134b-3aab-4566-b4da-1ebb735fcd54.jpg', region: 'По всей России' },
  { id: 'bashkir', name: 'Башкиры', nameRu: 'Башкиры', population: '~1.6 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/f2ad19ff-33f5-49ae-ab4c-f6a1bb842260.jpg', region: 'Башкортостан' },
  { id: 'buryat', name: 'Буряты', nameRu: 'Буряты', population: '~460 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/46541459-7bfc-4b16-a3bc-913987d99eb0.jpg', region: 'Бурятия' },
  { id: 'chechen', name: 'Чеченцы', nameRu: 'Чеченцы', population: '~1.4 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6c065500-0270-49fc-9154-d3490676d32f.jpg', region: 'Чечня' },
  { id: 'chuvash', name: 'Чуваши', nameRu: 'Чуваши', population: '~1.4 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/47580117-860f-49b7-ba77-92751d005077.jpg', region: 'Чувашия' },
  { id: 'dargin', name: 'Даргинцы', nameRu: 'Даргинцы', population: '~590 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/73bbd15a-3c3f-4590-89c2-198e881a70c4.jpg', region: 'Дагестан' },
  { id: 'ingush', name: 'Ингуши', nameRu: 'Ингуши', population: '~440 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/592f8e09-5b4d-424e-9aa5-8df1ae061ff7.jpg', region: 'Ингушетия' },
  { id: 'jewish', name: 'Евреи', nameRu: 'Евреи', population: '~150 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/eefb9ad4-e795-4776-b7f4-330d1aaaaeb9.jpg', region: 'По всей России' },
  { id: 'kalmyk', name: 'Калмыки', nameRu: 'Калмыки', population: '~180 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/916ad7c2-91b1-409b-a448-94abdd3c7b30.jpg', region: 'Калмыкия' },
  { id: 'karelian', name: 'Карелы', nameRu: 'Карелы', population: '~60 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a94bdd64-b306-4b39-89df-b5029fdadcc8.jpg', region: 'Карелия' },
  { id: 'kazakh', name: 'Казахи', nameRu: 'Казахи', population: '~650 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/6e339f14-7445-4920-88b3-f931985db943.jpg', region: 'По всей России' },
  { id: 'komi', name: 'Коми', nameRu: 'Коми', population: '~220 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/a6bd5ae6-dc77-4b7a-bf42-cfeec0ca701e.jpg', region: 'Коми' },
  { id: 'lezgin', name: 'Лезгины', nameRu: 'Лезгины', population: '~470 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c7eb3c38-e97f-4724-a0e2-54e926f7490d.jpg', region: 'Дагестан' },
  { id: 'mari', name: 'Марийцы', nameRu: 'Марийцы', population: '~550 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2484e180-d330-4c9c-9bee-184d275c6121.jpg', region: 'Марий Эл' },
  { id: 'mordvin', name: 'Мордва', nameRu: 'Мордва', population: '~740 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/1f163031-83a4-4494-9d15-3eb8226308b3.jpg', region: 'Мордовия' },
  { id: 'ossetian', name: 'Осетины', nameRu: 'Осетины', population: '~530 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/bb3dd842-7378-43e2-955e-323ece2193c7.jpg', region: 'Северная Осетия' },
  { id: 'russian', name: 'Русские', nameRu: 'Русские', population: '~111 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/5d32c55b-a58d-48bf-8348-439bd1d179b3.jpg', region: 'По всей России' },
  { id: 'tatar', name: 'Татары', nameRu: 'Татары', population: '~5.3 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/8b660ea8-70a7-4885-ac13-84209ae1ff92.jpg', region: 'Татарстан' },
  { id: 'tuvan', name: 'Тувинцы', nameRu: 'Тувинцы', population: '~270 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/cbf2b8bf-3137-463d-9734-587a1f0e7574.jpg', region: 'Тува' },
  { id: 'udmurt', name: 'Удмурты', nameRu: 'Удмурты', population: '~550 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/87aa47bc-3f2a-4edc-a653-6905b3fdc5dc.jpg', region: 'Удмуртия' },
  { id: 'ukrainian', name: 'Украинцы', nameRu: 'Украинцы', population: '~1.9 млн', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/89897a18-3437-4907-b3ab-9614e9f78b83.jpg', region: 'По всей России' },
  { id: 'yakut', name: 'Якуты', nameRu: 'Якуты (Саха)', population: '~480 тыс.', image: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2ff4b7d1-47df-49c5-ae1e-99bc692b625d.jpg', region: 'Якутия (Саха)' },
].sort((a, b) => a.nameRu.localeCompare(b.nameRu, 'ru'));

const NationalitiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredNationalities = nationalities.filter(nat =>
    nat.nameRu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Народы России
            </h1>
            <p className="text-muted-foreground">
              Познакомьтесь с культурным многообразием нашей страны
            </p>
          </div>
        </div>

        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск народа..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNationalities.map((nationality, idx) => (
            <Card
              key={nationality.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate(`/nationalities/${nationality.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{nationality.nameRu}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Users" size={14} />
                        <span className="truncate">{nationality.population}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        <span className="truncate">{nationality.region}</span>
                      </div>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNationalities.length === 0 && (
          <Card className="mt-8">
            <CardContent className="p-12 text-center">
              <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-sm text-muted-foreground">
                Попробуйте изменить поисковый запрос
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NationalitiesPage;