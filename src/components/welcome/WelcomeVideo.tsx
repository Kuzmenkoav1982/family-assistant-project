import Icon from '@/components/ui/icon';

export default function WelcomeVideo() {
  const handlePlay = () => {
    window.open('https://disk.yandex.ru/i/WJiFgBqyAS_AzA', '_blank');
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Посмотрите, как это работает
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Короткое видео о возможностях платформы «Наша Семья»
          </p>
        </div>

        <div
          onClick={handlePlay}
          className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 aspect-video cursor-pointer group hover:shadow-3xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/90 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Icon name="Play" size={40} className="text-orange-500 ml-1" />
            </div>
            <p className="text-xl sm:text-2xl font-bold drop-shadow-lg">Смотреть презентацию</p>
            <p className="text-sm sm:text-base opacity-80 mt-2">Откроется в новом окне</p>
          </div>
        </div>
      </div>
    </section>
  );
}
