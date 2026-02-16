import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SectionHeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  backPath?: string;
  rightAction?: React.ReactNode;
}

export default function SectionHero({ title, subtitle, imageUrl, backPath = '/', rightAction }: SectionHeroProps) {
  const navigate = useNavigate();

  return (
    <div className="relative -mx-4 -mt-4 mb-2 rounded-b-2xl overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-44 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <div className="flex items-end gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(backPath)}
            className="text-white hover:bg-white/20 mb-1"
          >
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {title}
            </h1>
            <p className="text-sm text-white/80">
              {subtitle}
            </p>
          </div>
        </div>
        {rightAction && (
          <div className="mb-1">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}
