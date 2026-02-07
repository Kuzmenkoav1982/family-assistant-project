import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* О проекте - сворачиваемый блок */}
        <details className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg mb-8 border border-purple-700/50 group">
          <summary className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Info" size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold flex items-center gap-2 flex-1">
              О проекте "Наша семья"
            </h3>
            <Icon name="ChevronDown" size={18} className="text-gray-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-4 pb-4">
            <div className="pl-11 space-y-3 text-gray-300">
              <p className="text-base leading-relaxed">
                <strong className="text-white">Миссия:</strong> Сохранение семейных ценностей и укрепление семейных связей в современном мире.
              </p>
              <p className="text-base leading-relaxed">
                <strong className="text-white">Цель:</strong> Создать единое пространство для организации семейной жизни, где каждый член семьи может внести свой вклад, 
                делиться воспоминаниями и вместе планировать будущее.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Target" size={18} className="text-purple-400" />
                    <h4 className="font-semibold text-white">Что мы делаем</h4>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Помогаем организовать семейный быт</li>
                    <li>• Сохраняем традиции и воспоминания</li>
                    <li>• Укрепляем связь между поколениями</li>
                  </ul>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Users" size={18} className="text-blue-400" />
                    <h4 className="font-semibold text-white">Для кого</h4>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Семьи с детьми любого возраста</li>
                    <li>• Многопоколенные семьи</li>
                    <li>• Все, кто ценит семейные отношения</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-700/30">
                <p className="text-sm font-medium text-white mb-2">Свяжитесь с нами:</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Mail" size={14} className="text-purple-400" />
                    <a href="mailto:info@nasha-semiya.ru" className="text-gray-300 hover:text-white transition-colors">
                      info@nasha-semiya.ru
                    </a>
                    <span className="text-gray-500 text-xs">— общие вопросы</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="HelpCircle" size={14} className="text-blue-400" />
                    <a href="mailto:support@nasha-semiya.ru" className="text-gray-300 hover:text-white transition-colors">
                      support@nasha-semiya.ru
                    </a>
                    <span className="text-gray-500 text-xs">— техподдержка</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CreditCard" size={14} className="text-green-400" />
                    <a href="mailto:payment@nasha-semiya.ru" className="text-gray-300 hover:text-white transition-colors">
                      payment@nasha-semiya.ru
                    </a>
                    <span className="text-gray-500 text-xs">— оплата и возвраты</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.poehali.dev/files/Логотип Наша Семья.JPG" 
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
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                >
                  <Icon name="Shield" size={16} />
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                >
                  <Icon name="FileText" size={16} />
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                >
                  <Icon name="FileCheck" size={16} />
                  Оферта
                </Link>
              </li>
              <li>
                <Link 
                  to="/refund-policy" 
                  className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm"
                >
                  <Icon name="RotateCcw" size={16} />
                  Возврат средств
                </Link>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Кузьменко А.В.</p>
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
            <p>© {currentYear} Наша семья. Все права защищены.</p>
            <div className="flex items-center gap-6">
              <Link 
                to="/admin/login"
                className="text-gray-500 hover:text-orange-400 transition-colors flex items-center gap-1 text-xs"
              >
                <Icon name="Shield" size={12} />
                Админ
              </Link>
              <p className="flex items-center gap-2">
                <Icon name="Heart" size={16} className="text-red-500" />
                Создано с любовью к семьям
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}