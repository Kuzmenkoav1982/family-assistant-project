import Icon from '@/components/ui/icon';

interface WelcomeScreenProps {
  showWelcome: boolean;
  welcomeText: string;
  onDismiss: () => void;
}

export function WelcomeScreen({ showWelcome, welcomeText, onDismiss }: WelcomeScreenProps) {
  if (!showWelcome) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 animate-fade-in cursor-pointer"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8 animate-bounce-slow">
          <div className="inline-block bg-white rounded-3xl p-6 shadow-2xl">
            <img 
              src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
              alt="Наша семья"
              className="w-64 h-64 md:w-80 md:h-80 mx-auto object-contain"
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            Наша семья
          </h1>
          
          <div className="min-h-[200px] flex items-center justify-center px-4">
            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl">
              {welcomeText}
              <span className="inline-block w-1 h-7 bg-purple-600 ml-1 animate-pulse"></span>
            </p>
          </div>
          
          <div className="flex justify-center gap-4 mt-12 animate-fade-in" style={{ animationDelay: '3s' }}>
            <div className="flex items-center gap-2 text-orange-600">
              <Icon name="Heart" className="animate-pulse" size={24} />
              <span className="text-lg font-semibold">Любовь</span>
            </div>
            <div className="flex items-center gap-2 text-pink-600">
              <Icon name="Users" className="animate-pulse" size={24} style={{ animationDelay: '0.2s' }} />
              <span className="text-lg font-semibold">Команда</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Icon name="Sparkles" className="animate-pulse" size={24} style={{ animationDelay: '0.4s' }} />
              <span className="text-lg font-semibold">Традиции</span>
            </div>
          </div>
          
          <div className="mt-8 space-y-2">
            <p className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '4s' }}>
              Нажмите в любом месте, чтобы продолжить
            </p>
            <p className="text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '5s' }}>
              🎭 Демо-режим: все данные хранятся локально в вашем браузере
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
