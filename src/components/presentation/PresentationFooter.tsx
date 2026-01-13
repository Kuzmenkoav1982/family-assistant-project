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

      <div className="text-center text-gray-600 pb-8">
        <p className="text-lg">
          © 2026 Наша семья. Все права защищены.
        </p>
        <p className="mt-2 text-sm">
          Объединяем семьи. Укрепляем общество.
        </p>
      </div>
    </>
  );
}