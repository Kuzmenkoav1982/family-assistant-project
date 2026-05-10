import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { slides } from '@/components/investor-deck/slidesData';
import DeckNavigation from '@/components/investor-deck/DeckNavigation';
import SlideRenderer from '@/components/investor-deck/SlideRenderer';

export default function InvestorDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <DeckNavigation
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onPrev={prevSlide}
          onNext={nextSlide}
        />

        {/* Slide Content */}
        <Card className="max-w-5xl mx-auto min-h-[400px] sm:min-h-[600px] bg-white/95 backdrop-blur">
          <CardContent className="p-4 sm:p-8 md:p-12">
            <SlideRenderer slide={slide} />
          </CardContent>
        </Card>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
