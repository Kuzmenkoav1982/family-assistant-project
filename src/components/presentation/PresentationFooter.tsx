import Icon from '@/components/ui/icon';
import { ArrowRight } from 'lucide-react';

export function PresentationFooter() {
  return (
    <>
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-12 mb-8 text-white">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Icon name="Rocket" size={64} />
          </div>
          
          <h2 className="text-4xl font-bold">
            Готовы объединить свою семью?
          </h2>
          
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Присоединяйтесь к тысячам семей, которые уже используют "Наша семья" 
            для создания крепких семейных связей
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => window.location.href = '/welcome'}
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Начать использовать
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Icon name="MessageCircle" className="text-green-600" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Контакты
          </h2>
        </div>
        
        <div className="space-y-4 text-lg text-gray-700">
          <div className="flex items-center gap-3">
            <Icon name="Mail" className="text-gray-600" size={24} />
            <a href="mailto:contact@nashaSemya.ru" className="hover:text-purple-600 transition-colors">
              contact@nashaSemya.ru
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Icon name="Phone" className="text-gray-600" size={24} />
            <a href="tel:+79991234567" className="hover:text-purple-600 transition-colors">
              +7 (999) 123-45-67
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <Icon name="Globe" className="text-gray-600" size={24} />
            <a href="https://nashaSemya.ru" className="hover:text-purple-600 transition-colors">
              nashaSemya.ru
            </a>
          </div>
        </div>
      </section>

      <div className="text-center text-gray-600 pb-8">
        <p className="text-lg">
          © 2024 Наша семья. Все права защищены.
        </p>
        <p className="mt-2 text-sm">
          Объединяем семьи. Укрепляем общество.
        </p>
      </div>
    </>
  );
}
