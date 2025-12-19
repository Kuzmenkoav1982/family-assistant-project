import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface DomovoiTransformProps {
  role: string;
  onComplete: () => void;
  onSkip?: () => void;
}

const ROLE_VIDEOS: Record<string, string> = {
  'cook': 'https://downloader.disk.yandex.ru/disk/b6e66c7e4c3e8f8e22d2e4416dccee2bc7310a1cea82be9bda413491d223e21c/6945efd2/zPAP3mn1NvmlCOU527jdbumfnPa25gD3LBISEA9-DV-3G3wYuNVAGnsSUVUZtEo9zpWPe3RDbWurD1YnJMLf2Q%3D%3D?uid=0&filename=%D0%9F%D0%BE%D0%B2%D0%B0%D1%80.mp4&disposition=attachment',
  'organizer': '',
  'teacher': '',
  'cleaner': '',
  'financier': ''
};

const ROLE_NAMES: Record<string, string> = {
  'cook': 'Повар',
  'organizer': 'Организатор',
  'teacher': 'Воспитатель',
  'cleaner': 'Уборщик',
  'financier': 'Финансист'
};

export function DomovoiTransform({ role, onComplete, onSkip }: DomovoiTransformProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = ROLE_VIDEOS[role.toLowerCase()];
  const roleName = ROLE_NAMES[role.toLowerCase()] || role;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      onComplete();
      return;
    }

    const handleCanPlay = () => {
      video.play().catch(err => {
        console.error('Video playback failed:', err);
        onComplete();
      });
      setIsPlaying(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setTimeout(onComplete, 300);
    };

    const handleError = () => {
      console.error('Video loading failed');
      onComplete();
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [videoUrl, onComplete]);

  if (!videoUrl) {
    return null;
  }

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsPlaying(false);
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {isPlaying && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 space-y-4 text-center">
            <p className="text-white text-2xl font-bold drop-shadow-lg animate-pulse">
              Домовой превращается в {roleName}! ✨
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkip}
              className="bg-white/20 hover:bg-white/30 text-white border-white/40"
            >
              Пропустить
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
