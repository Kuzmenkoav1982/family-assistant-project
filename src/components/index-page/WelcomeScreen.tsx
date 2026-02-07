import Icon from '@/components/ui/icon';

interface WelcomeScreenProps {
  show: boolean;
  familyName: string;
  familyLogo: string;
  welcomeText: string;
  onClose: () => void;
}

export function WelcomeScreen({ show, familyName, familyLogo, welcomeText, onClose }: WelcomeScreenProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 animate-fade-in cursor-pointer select-none"
      onClick={onClose}
      onTouchEnd={onClose}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8 animate-bounce-slow">
          <div className="inline-block bg-white rounded-3xl p-6 shadow-2xl">
            <img
              src={familyLogo}
              alt={familyName}
              className="w-64 h-64 md:w-80 md:h-80 mx-auto object-contain"
            />
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
            {familyName}
          </h1>

          <div className="min-h-[200px] flex items-center justify-center px-4">
            <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-3xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {welcomeText}
            </p>
          </div>

          <div
            className="flex justify-center gap-4 mt-12 animate-fade-in"
            style={{ animationDelay: '3s' }}
          >
            <div className="flex items-center gap-2 text-orange-600">
              <Icon name="Heart" className="animate-pulse" size={24} />
              <span className="text-lg font-semibold">Любовь</span>
            </div>
            <div className="flex items-center gap-2 text-pink-600">
              <Icon
                name="Users"
                className="animate-pulse"
                size={24}
                style={{ animationDelay: '0.2s' }}
              />
              <span className="text-lg font-semibold">Команда</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Icon
                name="Sparkles"
                className="animate-pulse"
                size={24}
                style={{ animationDelay: '0.4s' }}
              />
              <span className="text-lg font-semibold">Традиции</span>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '2s' }}>
              Нажмите в любом месте, чтобы продолжить
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}