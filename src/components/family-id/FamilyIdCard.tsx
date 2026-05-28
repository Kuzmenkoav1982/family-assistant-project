import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface FamilyIdCardProps {
  familyName?: string;
  familyId?: string;
  logoUrl?: string;
  membersCount?: number;
  foundedYear?: number;
  motto?: string;
  compact?: boolean;
}

// Генерируем красивый ID из строки
function generateFamilyCode(id: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  let code = '';
  let n = Math.abs(hash);
  for (let i = 0; i < 8; i++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length) + (i * 7919);
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

// Мини-QR из ASCII-блоков (декоративный, не настоящий)
function MiniQR({ seed }: { seed: string }) {
  const size = 7;
  const grid: boolean[][] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h) + seed.charCodeAt(i);

  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      // Угловые маркеры QR
      const corner =
        (r < 2 && c < 2) || (r < 2 && c >= size - 2) || (r >= size - 2 && c < 2);
      if (corner) { grid[r][c] = true; continue; }
      const val = Math.abs((h * (r * 13 + c * 7 + 3)) ^ (r + c * 17)) % 3;
      grid[r][c] = val === 0;
    }
  }

  return (
    <div className="grid gap-[1.5px]" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((on, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-[5px] h-[5px] rounded-[1px] ${on ? 'bg-white' : 'bg-white/10'}`}
          />
        ))
      )}
    </div>
  );
}

// Декоративная «ДНК» семьи — мини-полоски как штрих-код
function FamilyDNA({ seed }: { seed: string }) {
  const bars = 20;
  return (
    <div className="flex items-end gap-[2px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.abs((seed.charCodeAt(i % seed.length) * (i + 3) * 7919) % 100);
        const height = 30 + h * 0.7;
        return (
          <div
            key={i}
            className="w-[2px] rounded-full bg-white/60"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

export default function FamilyIdCard({
  familyName = 'Наша Семья',
  familyId = 'demo_family_1',
  logoUrl,
  membersCount = 4,
  foundedYear,
  motto,
  compact = false,
}: FamilyIdCardProps) {
  const [copied, setCopied] = useState(false);
  const code = generateFamilyCode(familyId);
  const year = foundedYear || new Date().getFullYear();
  const shortMotto = motto || 'Вместе — сильнее';

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 transition-all shadow-lg"
        title="Семейный ID — нажмите, чтобы скопировать"
      >
        <Icon name="Fingerprint" size={14} className="text-violet-200" />
        <span className="font-mono text-xs font-bold text-white tracking-widest">{code}</span>
        <Icon
          name={copied ? 'Check' : 'Copy'}
          size={12}
          className={`transition-all ${copied ? 'text-green-300' : 'text-violet-300 group-hover:text-white'}`}
        />
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Тень под карточкой */}
      <div className="absolute inset-x-4 bottom-0 h-4 bg-purple-900/30 blur-xl rounded-full translate-y-2" />

      {/* Основная карточка */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Фон — глубокий градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d1060] to-[#0f0628]" />

        {/* Декоративные орбиты */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full border border-purple-500/20" />
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border border-violet-400/15" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full border border-pink-500/15" />

        {/* Световые блики */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
        <div className="absolute top-0 left-8 w-24 h-24 bg-violet-500/10 blur-2xl rounded-full" />

        {/* Контент */}
        <div className="relative p-5 sm:p-6">
          {/* Хедер: лого + название + значок */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={familyName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/20 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center ring-2 ring-white/20 shadow-lg">
                  <Icon name="Users" size={22} className="text-white" />
                </div>
              )}
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300/70 font-medium mb-0.5">
                  Семейный ID
                </div>
                <div className="text-white font-bold text-lg leading-tight">
                  {familyName}
                </div>
              </div>
            </div>

            {/* Мини QR */}
            <div className="flex flex-col items-center gap-1">
              <MiniQR seed={familyId} />
              <span className="text-[8px] text-violet-300/50 uppercase tracking-widest">scan</span>
            </div>
          </div>

          {/* Основной код — главный элемент */}
          <div className="mb-5">
            <button
              onClick={handleCopy}
              className="group w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/40 rounded-xl px-4 py-3 transition-all"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-violet-300/60 mb-1">
                  Уникальный код семьи
                </div>
                <div className="font-mono text-2xl font-black text-white tracking-[0.15em]">
                  {code}
                </div>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${copied ? 'bg-green-500/20' : 'bg-white/5 group-hover:bg-violet-500/20'}`}>
                <Icon
                  name={copied ? 'Check' : 'Copy'}
                  size={16}
                  className={copied ? 'text-green-400' : 'text-violet-300'}
                />
              </div>
            </button>
            {copied && (
              <p className="text-center text-xs text-green-400 mt-1.5 animate-pulse">
                Скопировано!
              </p>
            )}
          </div>

          {/* Мета-информация */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-violet-300/60 uppercase tracking-wide mb-0.5">Членов</div>
              <div className="text-white font-bold text-lg leading-none">{membersCount}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-violet-300/60 uppercase tracking-wide mb-0.5">С года</div>
              <div className="text-white font-bold text-lg leading-none">{year}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <div className="text-[10px] text-violet-300/60 uppercase tracking-wide mb-0.5">Поколений</div>
              <div className="text-white font-bold text-lg leading-none">3</div>
            </div>
          </div>

          {/* Девиз */}
          {shortMotto && (
            <div className="mb-5 px-3 py-2 border-l-2 border-violet-400/50 bg-white/5 rounded-r-xl">
              <p className="text-sm text-violet-100/80 italic leading-snug">
                «{shortMotto}»
              </p>
            </div>
          )}

          {/* ДНК-штрихкод + нижняя метка */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.15em] text-violet-300/40 mb-1.5">
                DNA семьи
              </div>
              <FamilyDNA seed={familyId} />
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-[0.15em] text-violet-300/40 mb-1">
                Верифицировано
              </div>
              <div className="flex items-center gap-1 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium">Активен</span>
              </div>
              <div className="text-[9px] text-violet-300/30 mt-0.5 font-mono">
                nasha-semiya.ru
              </div>
            </div>
          </div>
        </div>

        {/* Нижняя полоска — голографический эффект */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-pink-500 via-cyan-400 to-violet-600 opacity-80" />
      </div>
    </div>
  );
}
