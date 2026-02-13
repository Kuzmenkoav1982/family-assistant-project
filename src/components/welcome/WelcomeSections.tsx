import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface SecuritySlide {
  title: string;
  subtitle: string;
  features: Feature[];
}

interface Section {
  title: string;
  description: string;
  icon: string;
  color: string;
  securitySlides?: SecuritySlide[];
  carousel?: string[];
}

interface SectionProps {
  sections: Section[];
  carouselIndexes: Record<number, number>;
  setCarouselIndexes: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setFullscreenImage: (image: { url: string; title: string; sectionIndex: number }) => void;
  carouselRefs: React.MutableRefObject<Record<number, NodeJS.Timeout>>;
  trackSectionClick: (index: number, title: string) => void;
}

export default function WelcomeSections({
  sections,
  carouselIndexes,
  setCarouselIndexes,
  setFullscreenImage,
  carouselRefs,
  trackSectionClick
}: SectionProps) {
  return (
    <div className="mb-16">
      <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Основные разделы платформы
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <Card
            key={index}
            onClick={() => trackSectionClick(index, section.title)}
            className="overflow-hidden border-2 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 animate-fade-in group cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative h-64 overflow-hidden">
              {section.securitySlides ? (
                <div className="relative w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 p-4 flex flex-col justify-center">
                  {(() => {
                    const slide = section.securitySlides![carouselIndexes[index] || 0];
                    return (
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-emerald-900 leading-tight mb-0.5">{slide.title}</h4>
                        <p className="text-xs text-emerald-700 leading-snug mb-2">{slide.subtitle}</p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {slide.features.map((feature: Feature, fIndex: number) => (
                            <div key={fIndex} className="flex items-start gap-1.5 bg-white/60 rounded-lg p-1.5">
                              <Icon name={feature.icon} size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="font-semibold text-xs text-gray-900 leading-snug">{feature.title}</p>
                                <p className="text-[10px] text-gray-600 leading-snug">{feature.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage({
                        url: '',
                        title: section.title,
                        sectionIndex: index
                      });
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                    title="Развернуть"
                  >
                    <Icon name="Maximize2" size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndexes(prev => ({
                        ...prev,
                        [index]: ((prev[index] || 0) - 1 + section.securitySlides!.length) % section.securitySlides!.length
                      }));
                      if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndexes(prev => ({
                        ...prev,
                        [index]: ((prev[index] || 0) + 1) % section.securitySlides!.length
                      }));
                      if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {section.securitySlides!.map((_: SecuritySlide, dotIndex: number) => (
                      <button
                        key={dotIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndexes(prev => ({ ...prev, [index]: dotIndex }));
                          if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          (carouselIndexes[index] || 0) === dotIndex ? 'bg-gray-800 scale-125' : 'bg-gray-400/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : section.carousel ? (
                <div className="relative w-full h-full bg-white">
                  <img
                    src={section.carousel[carouselIndexes[index] || 0]}
                    alt={`${section.title} - Слайд ${(carouselIndexes[index] || 0) + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullscreenImage({
                        url: section.carousel![carouselIndexes[index] || 0],
                        title: section.title,
                        sectionIndex: index
                      });
                    }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all z-10"
                    title="Развернуть"
                  >
                    <Icon name="Maximize2" size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndexes(prev => ({
                        ...prev,
                        [index]: ((prev[index] || 0) - 1 + section.carousel!.length) % section.carousel!.length
                      }));
                      if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCarouselIndexes(prev => ({
                        ...prev,
                        [index]: ((prev[index] || 0) + 1) % section.carousel!.length
                      }));
                      if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
                  >
                    <Icon name="ChevronRight" size={20} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {section.carousel.map((_: string, dotIndex: number) => (
                      <button
                        key={dotIndex}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCarouselIndexes(prev => ({ ...prev, [index]: dotIndex }));
                          if (carouselRefs.current[index]) clearInterval(carouselRefs.current[index]);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          (carouselIndexes[index] || 0) === dotIndex ? 'bg-gray-800 scale-125' : 'bg-gray-400/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
                  <Icon name={section.icon} className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl mb-1 text-gray-800">{section.title}</h4>
                  <p className="text-sm text-gray-600">{section.description}</p>
                </div>
              </div>
              <Badge className={`bg-gradient-to-r ${section.color} text-white`}>
                {section.carousel ? `${section.carousel.length} скриншота` : section.securitySlides ? `${section.securitySlides.length} слайдов` : 'Доступно'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}