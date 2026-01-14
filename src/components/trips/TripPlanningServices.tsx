import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TripPlanningServicesProps {
  destination: string;
  country: string;
}

export function TripPlanningServices({ destination, country }: TripPlanningServicesProps) {
  const bookingServices = [
    {
      name: 'OneTwoTrip',
      url: `https://www.onetwotrip.com/ru/search/?city_from=MOW&city_to=${encodeURIComponent(destination)}`,
      icon: 'Plane',
      description: 'Авиабилеты и отели',
      color: 'blue',
    },
    {
      name: 'Booking.com',
      url: `https://www.booking.com/searchresults.ru.html?ss=${encodeURIComponent(destination)}`,
      icon: 'Hotel',
      description: 'Отели и апартаменты',
      color: 'indigo',
    },
    {
      name: 'Островок',
      url: `https://ostrovok.ru/hotel/${encodeURIComponent(destination)}/`,
      icon: 'Bed',
      description: 'Отели по всему миру',
      color: 'purple',
    },
    {
      name: 'Яндекс Путешествия',
      url: `https://travel.yandex.ru/hotels/?city=${encodeURIComponent(destination)}`,
      icon: 'MapPin',
      description: 'Отели и билеты',
      color: 'red',
    },
  ];

  const tourServices = [
    {
      name: 'OneTwoTrip',
      url: `https://www.onetwotrip.com/ru/tours/?destination=${encodeURIComponent(destination)}`,
      icon: 'Plane',
      description: 'Туры и экскурсии',
      color: 'blue',
    },
    {
      name: 'Booking.com',
      url: `https://www.booking.com/experiences/index.ru.html?location=${encodeURIComponent(destination)}`,
      icon: 'Hotel',
      description: 'Активности и развлечения',
      color: 'indigo',
    },
    {
      name: 'Островок',
      url: `https://ostrovok.ru/experiences/?city=${encodeURIComponent(destination)}`,
      icon: 'Bed',
      description: 'Экскурсии и развлечения',
      color: 'purple',
    },
    {
      name: 'Яндекс Путешествия',
      url: `https://travel.yandex.ru/excursions/?city=${encodeURIComponent(destination)}`,
      icon: 'MapPin',
      description: 'Экскурсии и туры',
      color: 'red',
    },
    {
      name: 'Трипстер',
      url: `https://experience.tripster.ru/search/?city=${encodeURIComponent(destination)}`,
      icon: 'Compass',
      description: 'Экскурсии с гидами',
      color: 'orange',
    },
    {
      name: 'GetYourGuide',
      url: `https://www.getyourguide.ru/-l/?q=${encodeURIComponent(destination)}`,
      icon: 'Users',
      description: 'Билеты и туры',
      color: 'green',
    },
    {
      name: 'Viator',
      url: `https://www.viator.com/searchResults/all?text=${encodeURIComponent(destination)}`,
      icon: 'Star',
      description: 'Экскурсии от Tripadvisor',
      color: 'yellow',
    },
  ];

  const esimProviders = [
    {
      name: 'Airalo',
      url: 'https://www.airalo.com/',
      icon: 'Wifi',
      description: 'eSIM для 200+ стран',
      info: 'От $4.50 за 1GB',
      color: 'green',
    },
    {
      name: 'Holafly',
      url: 'https://esim.holafly.com/',
      icon: 'Globe',
      description: 'Безлимитный интернет',
      info: 'Лучше для длительных поездок',
      color: 'cyan',
    },
    {
      name: 'Drimsim',
      url: 'https://drimsim.com/',
      icon: 'Signal',
      description: 'eSIM для путешественников',
      info: 'Работает в 197 странах',
      color: 'teal',
    },
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Icon name="Link" size={20} />
        Полезные сервисы
      </h3>

      <Tabs defaultValue="booking" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="booking">Бронирование</TabsTrigger>
          <TabsTrigger value="tours">Экскурсии</TabsTrigger>
          <TabsTrigger value="esim">eSIM</TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-3 mt-0">
          {bookingServices.map((service) => (
            <div
              key={service.name}
              className="flex items-start gap-3 p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-all"
            >
              <div className={`p-2 rounded-lg bg-${service.color}-100`}>
                <Icon name={service.icon} size={20} className={`text-${service.color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(service.url, '_blank')}
                className="flex-shrink-0"
              >
                <Icon name="ExternalLink" size={16} className="mr-1" />
                Открыть
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="tours" className="space-y-3 mt-0">
          {tourServices.map((service) => (
            <div
              key={service.name}
              className="flex items-start gap-3 p-3 rounded-lg border hover:border-orange-300 hover:bg-orange-50/50 transition-all"
            >
              <div className={`p-2 rounded-lg bg-${service.color}-100`}>
                <Icon name={service.icon} size={20} className={`text-${service.color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Индивидуальные и групповые экскурсии от местных гидов
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(service.url, '_blank')}
                className="flex-shrink-0"
              >
                <Icon name="ExternalLink" size={16} className="mr-1" />
                Открыть
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="esim" className="space-y-3 mt-0">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <Icon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Что такое eSIM?</p>
                <p>
                  Виртуальная SIM-карта для интернета за границей. Не нужно покупать физическую
                  карту — просто установите профиль на телефон. Работает на iPhone XS и новее,
                  Google Pixel 3 и новее, большинстве Samsung Galaxy.
                </p>
              </div>
            </div>
          </div>

          {esimProviders.map((service) => (
            <div
              key={service.name}
              className="flex items-start gap-3 p-3 rounded-lg border hover:border-green-300 hover:bg-green-50/50 transition-all"
            >
              <div className={`p-2 rounded-lg bg-${service.color}-100`}>
                <Icon name={service.icon} size={20} className={`text-${service.color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.description}</p>
                <p className="text-xs text-gray-500 mt-1">{service.info}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(service.url, '_blank')}
                className="flex-shrink-0"
              >
                <Icon name="ExternalLink" size={16} className="mr-1" />
                Открыть
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
}