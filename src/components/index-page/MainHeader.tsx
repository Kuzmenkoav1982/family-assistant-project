interface MainHeaderProps {
  activeSection: string;
  getSectionTitle: (section: string) => string;
  themeClasses: {
    headingFont: string;
    primaryGradient: string;
  };
}

export const MainHeader = ({ activeSection, getSectionTitle, themeClasses }: MainHeaderProps) => {
  return (
    <header className="text-center mb-8 relative -mx-4 lg:-mx-8 py-6 rounded-2xl overflow-hidden" style={{
        backgroundImage: 'url(https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/99031d20-2ea8-4a39-a89e-1ebe098b6ba4.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/85 to-white/80 backdrop-blur-[1px]"></div>
      <div className="relative">
      <div className="flex items-center justify-center gap-4 mb-3">
        <h1 className={`${themeClasses.headingFont} text-3xl lg:text-4xl font-bold bg-gradient-to-r ${themeClasses.primaryGradient.replace('bg-gradient-to-r ', '')} bg-clip-text text-transparent mt-2 animate-fade-in`}>
          {getSectionTitle(activeSection)}
        </h1>
      </div>
      
      <p className="text-lg lg:text-xl text-gray-700 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
        {activeSection === 'tasks' && 'Управление задачами семьи'}
        {activeSection === 'family' && 'Просмотр и редактирование профилей всех членов семьи'}
        {activeSection === 'goals' && 'Долгосрочное планирование и контроль целей'}
        {activeSection === 'cohesion' && 'Анализ сплочённости и рейтинг семьи'}
        {activeSection === 'children' && 'Развитие и достижения детей'}
        {activeSection === 'values' && 'Семейные ценности и принципы'}
        {activeSection === 'traditions' && 'Традиции и ритуалы'}
        {activeSection === 'blog' && 'Семейный блог и истории'}
        {activeSection === 'album' && 'Фотоальбом семьи'}
        {activeSection === 'tree' && 'Генеалогическое древо'}
        {activeSection === 'chat' && 'Семейный чат'}
        {activeSection === 'rules' && 'Правила и договоренности'}
        {activeSection === 'complaints' && 'Разрешение семейных конфликтов'}
        {activeSection === 'about' && 'Миссия проекта'}
        {activeSection === 'shopping' && 'Список покупок семьи'}
      </p>
      </div>
    </header>
  );
};
