import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
                alt="Наша семья"
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="font-bold text-lg">Наша семья</h3>
                <p className="text-sm text-gray-400">Объединяем семьи</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              Сервис для организации семейной жизни, планирования задач и укрепления семейных связей.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3">Юридическая информация</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Icon name="Shield" size={16} />
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Icon name="FileText" size={16} />
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="Mail" size={16} />
                <a href="mailto:ip.kuzmenkoav@yandex.ru" className="hover:text-white transition-colors">
                  ip.kuzmenkoav@yandex.ru
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="Phone" size={16} />
                <a href="tel:+79850807888" className="hover:text-white transition-colors">
                  +7 985 080 78 88
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="User" size={16} />
                <span>Кузьменко Алексей</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© {currentYear} Наша семья. Все права защищены.</p>
            <p className="flex items-center gap-2">
              <Icon name="Heart" size={16} className="text-red-500" />
              Создано с любовью к семьям
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}