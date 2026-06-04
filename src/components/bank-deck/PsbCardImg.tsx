import { useState } from 'react';
import { PSB_CARD_IMG } from '@/lib/assets';

interface PsbCardImgProps {
  className?: string;
  alt?: string;
}

// Карта ПСБ с fallback-плашкой при ошибке загрузки.
// Fallback воспроизводит минимальную банковскую карту чтобы не ломать layout.
export default function PsbCardImg({ className = 'w-14 h-9', alt = 'Карта ПСБ' }: PsbCardImgProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`${className} rounded-lg shrink-0 flex items-center justify-center text-[9px] font-bold text-white leading-tight text-center`}
        style={{ background: 'linear-gradient(135deg, #1a3fa8 0%, #2252c9 100%)' }}
        aria-label={alt}
      >
        ПСБ
      </div>
    );
  }

  return (
    <img
      src={PSB_CARD_IMG}
      alt={alt}
      className={`${className} rounded-lg object-cover shrink-0`}
      onError={() => setError(true)}
    />
  );
}
