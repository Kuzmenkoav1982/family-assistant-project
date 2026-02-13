import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import WelcomePromo from '@/components/welcome/WelcomePromo';
import WelcomeSections from '@/components/welcome/WelcomeSections';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import { sections, trackSectionClick } from '@/components/welcome/welcome-data';

const openTelegramSupport = () => {
  window.open('https://t.me/Nasha7iya', '_blank');
};

export default function Welcome() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [carouselIndexes, setCarouselIndexes] = useState<Record<number, number>>({});
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; title: string; sectionIndex: number } | null>(null);
  const carouselRefs = useRef<Record<number, NodeJS.Timeout>>({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    sections.forEach((section, index) => {
      const itemsCount = section.carousel?.length || section.securitySlides?.length || 0;
      if (itemsCount > 1) {
        carouselRefs.current[index] = setInterval(() => {
          setCarouselIndexes(prev => ({
            ...prev,
            [index]: ((prev[index] || 0) + 1) % itemsCount
          }));
        }, 4000);
      }
    });

    return () => {
      Object.values(carouselRefs.current).forEach(clearInterval);
    };
  }, []);

  const closeFullscreen = () => {
    setFullscreenImage(null);
    const currentIndex = fullscreenImage?.sectionIndex;
    if (currentIndex !== undefined) {
      const section = sections[currentIndex];
      const itemsCount = section.carousel?.length || section.securitySlides?.length || 0;
      if (itemsCount > 1) {
        carouselRefs.current[currentIndex] = setInterval(() => {
          setCarouselIndexes(prev => ({
            ...prev,
            [currentIndex]: ((prev[currentIndex] || 0) + 1) % itemsCount
          }));
        }, 4000);
      }
    }
  };

  const navigateFullscreen = (direction: 'next' | 'prev') => {
    if (!fullscreenImage) return;
    const section = sections[fullscreenImage.sectionIndex];
    
    if (section.carousel) {
      const newIndex = direction === 'next'
        ? ((carouselIndexes[fullscreenImage.sectionIndex] || 0) + 1) % section.carousel.length
        : ((carouselIndexes[fullscreenImage.sectionIndex] || 0) - 1 + section.carousel.length) % section.carousel.length;
      
      setCarouselIndexes(prev => ({
        ...prev,
        [fullscreenImage.sectionIndex]: newIndex
      }));
      
      setFullscreenImage({
        ...fullscreenImage,
        url: section.carousel[newIndex]
      });
    } else if (section.securitySlides) {
      const newIndex = direction === 'next'
        ? ((carouselIndexes[fullscreenImage.sectionIndex] || 0) + 1) % section.securitySlides.length
        : ((carouselIndexes[fullscreenImage.sectionIndex] || 0) - 1 + section.securitySlides.length) % section.securitySlides.length;
      
      setCarouselIndexes(prev => ({
        ...prev,
        [fullscreenImage.sectionIndex]: newIndex
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <WelcomeHeader isLoggedIn={isLoggedIn} />
      
      <div className="max-w-7xl mx-auto px-4">
        <WelcomeHero isLoggedIn={isLoggedIn} />

        <WelcomePromo />

        <WelcomeSections
          sections={sections}
          carouselIndexes={carouselIndexes}
          setCarouselIndexes={setCarouselIndexes}
          setFullscreenImage={setFullscreenImage}
          carouselRefs={carouselRefs}
          trackSectionClick={trackSectionClick}
        />

        <WelcomeFooter openTelegramSupport={openTelegramSupport} />
      </div>

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all z-50"
          >
            <Icon name="X" size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFullscreen('prev');
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all z-50"
          >
            <Icon name="ChevronLeft" size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFullscreen('next');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-all z-50"
          >
            <Icon name="ChevronRight" size={32} />
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 text-center">
              <h3 className="text-2xl font-bold text-white">{fullscreenImage.title}</h3>
            </div>

            {fullscreenImage.url ? (
              <img
                src={fullscreenImage.url}
                alt={fullscreenImage.title}
                className="max-w-full max-h-[calc(90vh-120px)] object-contain mx-auto rounded-lg"
              />
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-lg max-h-[calc(90vh-120px)] overflow-y-auto">
                {(() => {
                  const section = sections[fullscreenImage.sectionIndex];
                  if (!section.securitySlides) return null;
                  const slide = section.securitySlides[carouselIndexes[fullscreenImage.sectionIndex] || 0];
                  return (
                    <div className="space-y-6">
                      <h4 className="text-3xl font-bold text-emerald-900">{slide.title}</h4>
                      <p className="text-xl text-emerald-700">{slide.subtitle}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slide.features.map((feature, fIndex) => (
                          <div key={fIndex} className="flex items-start gap-4 bg-white/80 rounded-lg p-4">
                            <Icon name={feature.icon} size={28} className="text-emerald-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-lg text-gray-900">{feature.title}</p>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mt-4 flex gap-2 justify-center">
              {(() => {
                const section = sections[fullscreenImage.sectionIndex];
                const items = section.carousel || section.securitySlides || [];
                return items.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndexes(prev => ({ ...prev, [fullscreenImage.sectionIndex]: dotIndex }));
                      if (section.carousel) {
                        setFullscreenImage({ ...fullscreenImage, url: section.carousel[dotIndex] });
                      }
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      (carouselIndexes[fullscreenImage.sectionIndex] || 0) === dotIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/50'
                    }`}
                  />
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Import Icon for fullscreen modal
import Icon from '@/components/ui/icon';