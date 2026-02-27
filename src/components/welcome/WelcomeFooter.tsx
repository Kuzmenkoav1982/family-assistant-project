import Icon from '@/components/ui/icon';

interface WelcomeFooterProps {
  openTelegramSupport: () => void;
}

export default function WelcomeFooter({ openTelegramSupport }: WelcomeFooterProps) {
  return (
    <footer className="pb-8">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/90f87bac-e708-4551-b2dc-061dd3d7b0ed.JPG"
                alt="Наша семья"
                className="h-12 w-12 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-bold text-lg">Наша семья</h3>
                <p className="text-sm text-gray-400">Объединяем семьи</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Платформа для организации семейной жизни: задачи, здоровье, питание, развитие, 
              AI-помощник и многое другое. Всё в одном месте.
            </p>
            <div className="flex gap-2 pt-2">
              <a
                href="https://t.me/Nasha7iya"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="Send" size={18} />
              </a>
              <a
                href="https://max.ru/id231805288780_biz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="MessageCircle" size={18} />
              </a>
              <button
                onClick={openTelegramSupport}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <Icon name="HelpCircle" size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3">Юридическая информация</h4>
            <ul className="space-y-2">
              {[
                { href: '/privacy-policy', icon: 'Shield', text: 'Политика конфиденциальности' },
                { href: '/terms-of-service', icon: 'FileText', text: 'Пользовательское соглашение' },
                { href: '/terms-of-service', icon: 'FileCheck', text: 'Оферта' },
                { href: '/refund-policy', icon: 'RotateCcw', text: 'Возврат средств' },
                { href: '/documentation', icon: 'BookOpen', text: 'Документация ПО' },
                { href: '/documentation#installation', icon: 'Download', text: 'Руководство по установке' },
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors text-sm">
                    <Icon name={link.icon} size={16} />
                    {link.text}
                  </a>
                </li>
              ))}
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
    </footer>
  );
}