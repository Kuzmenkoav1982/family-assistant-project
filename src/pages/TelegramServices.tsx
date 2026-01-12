import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { TelegramContactForm } from '@/components/TelegramContactForm';

const services = [
  {
    id: 'nanny',
    icon: 'Baby',
    title: 'Няня',
    description: 'Профессиональный уход за детьми любого возраста',
    features: ['Опыт работы от 5 лет', 'Рекомендации', 'Медицинская книжка', 'Педагогическое образование'],
    price: 'от 300 ₽/час',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'cook',
    icon: 'ChefHat',
    title: 'Повар',
    description: 'Приготовление вкусной и здоровой домашней еды',
    features: ['Разные кухни мира', 'Диетическое меню', 'Праздничные блюда', 'Работа на мероприятиях'],
    price: 'от 500 ₽/час',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'gardener',
    icon: 'Leaf',
    title: 'Садовник',
    description: 'Профессиональный уход за садом и растениями',
    features: ['Стрижка газона', 'Обрезка деревьев', 'Уход за цветами', 'Ландшафтный дизайн'],
    price: 'от 400 ₽/час',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'cleaning',
    icon: 'Sparkles',
    title: 'Уборка',
    description: 'Поддержание чистоты и порядка в вашем доме',
    features: ['Генеральная уборка', 'Поддерживающая уборка', 'Мытье окон', 'Химчистка мебели'],
    price: 'от 250 ₽/час',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'tutor',
    icon: 'GraduationCap',
    title: 'Репетитор',
    description: 'Обучение и развитие детей и взрослых',
    features: ['Школьная программа', 'Подготовка к экзаменам', 'Иностранные языки', 'Развивающие занятия'],
    price: 'от 600 ₽/час',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 'driver',
    icon: 'Car',
    title: 'Водитель',
    description: 'Надежные транспортные услуги',
    features: ['Поездки по городу', 'Междугородние поездки', 'Сопровождение детей', 'Личный водитель'],
    price: 'от 350 ₽/час',
    color: 'from-indigo-500 to-blue-500'
  }
];

export default function TelegramServices() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <img 
              src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
              alt="Наша семья"
              className="h-16 w-16 object-contain rounded-xl shadow-lg"
            />
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Наша семья
              </h1>
              <p className="text-gray-600 text-sm">Семейные услуги в Москве</p>
            </div>
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Профессиональная помощь по дому от проверенных специалистов
          </p>
          <Badge className="mt-4 bg-green-500 text-white px-4 py-1">
            <Icon name="CheckCircle" size={14} className="mr-1" />
            Все специалисты проверены
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-xl transition-all border-2">
              <CardHeader>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center text-white mb-4 mx-auto`}>
                  <Icon name={service.icon} size={32} />
                </div>
                <CardTitle className="text-center text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-center">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{service.price}</div>
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Icon name="Check" size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Оставьте заявку</h2>
            <p className="text-gray-600">
              Заполните форму, и мы свяжемся с вами в течение часа
            </p>
          </div>
          <TelegramContactForm />
        </div>

        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Icon name="Shield" size={48} className="mx-auto mb-3 text-purple-600" />
                  <h3 className="font-bold text-lg mb-2">Безопасность</h3>
                  <p className="text-sm text-gray-600">Все специалисты проверены, имеют рекомендации</p>
                </div>
                <div>
                  <Icon name="Clock" size={48} className="mx-auto mb-3 text-purple-600" />
                  <h3 className="font-bold text-lg mb-2">Быстрый отклик</h3>
                  <p className="text-sm text-gray-600">Свяжемся с вами в течение часа</p>
                </div>
                <div>
                  <Icon name="Award" size={48} className="mx-auto mb-3 text-purple-600" />
                  <h3 className="font-bold text-lg mb-2">Качество</h3>
                  <p className="text-sm text-gray-600">Опытные специалисты с многолетним стажем</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>© 2026 Наша семья. Все права защищены.</p>
          <p className="mt-2">
            <a href="tel:+79001234567" className="hover:text-purple-600 transition-colors">
              +7 (900) 123-45-67
            </a>
            {' • '}
            <a href="mailto:info@nasha-semiya.ru" className="hover:text-purple-600 transition-colors">
              info@nasha-semiya.ru
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
