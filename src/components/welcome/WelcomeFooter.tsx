import Icon from '@/components/ui/icon';

interface WelcomeFooterProps {
  openTelegramSupport: () => void;
}

export default function WelcomeFooter({ openTelegramSupport }: WelcomeFooterProps) {
  return (
    <div className="space-y-16">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
                alt="Наша семья"
                className="h-12 w-12 object-contain rounded-lg"
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
                <a href="/privacy-policy" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                  <Icon name="Shield" size={16} />
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                  <Icon name="FileText" size={16} />
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                  <Icon name="FileCheck" size={16} />
                  Оферта
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                  <Icon name="RotateCcw" size={16} />
                  Возврат средств
                </a>
              </li>
              <li>
                <a href="/documentation#about" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                  <Icon name="BookOpen" size={16} />
                  Документация
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-1">ИП Кузьменко А.В.</p>
              <p className="text-xs text-gray-400">ОГРНИП: 325774600908955</p>
              <p className="text-xs text-gray-400">ИНН: 231805728780</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3">Контакты</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="Mail" size={16} />
                <a href="mailto:info@nasha-semiya.ru" className="hover:text-white transition-colors">
                  info@nasha-semiya.ru
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="HelpCircle" size={16} />
                <a href="mailto:support@nasha-semiya.ru" className="hover:text-white transition-colors">
                  support@nasha-semiya.ru
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="MessageCircle" size={16} />
                <a 
                  href="https://max.ru/id231805288780_biz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Наш канал в MAX
                  <Icon name="ExternalLink" size={12} />
                </a>
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <Icon name="Send" size={16} />
                <a 
                  href="https://t.me/Nasha7iya" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  Наш канал в Telegram
                  <Icon name="ExternalLink" size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Наша семья. Все права защищены.</p>
            <p className="flex items-center gap-2">
              <Icon name="Heart" size={16} className="text-red-500" />
              Создано с любовью к семьям
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}