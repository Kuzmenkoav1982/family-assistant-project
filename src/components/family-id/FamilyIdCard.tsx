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
  animated?: boolean;
}

export function generateFamilyCode(id: string): string {
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

// Декоративный узор — уникальный для каждой семьи, НЕ QR
function FamilyCrest({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h) + seed.charCodeAt(i);
  const size = 6;
  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      // Зеркальная симметрия — выглядит как герб/паттерн
      const col = c < size / 2 ? c : size - 1 - c;
      const val = Math.abs((h * (r * 11 + col * 7 + 5)) ^ (r * 3 + col * 13)) % 4;
      grid[r][c] = val;
    }
  }
  const colors = ['bg-transparent', 'bg-white/70', 'bg-violet-300/60', 'bg-white/30'];
  return (
    <div className="flex flex-col gap-[2px]">
      {grid.map((row, r) => (
        <div key={r} className="flex gap-[2px]">
          {row.map((val, c) => (
            <div key={c} className={`w-[5px] h-[5px] rounded-[1px] ${colors[val]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ДНК-штрихкод семьи
function FamilyDNA({ seed }: { seed: string }) {
  const bars = 22;
  return (
    <div className="flex items-end gap-[2px] h-7">
      {Array.from({ length: bars }).map((_, i) => {
        const h = Math.abs((seed.charCodeAt(i % seed.length) * (i + 3) * 7919) % 100);
        const height = 25 + h * 0.75;
        const opacity = 0.4 + (h / 100) * 0.5;
        return (
          <div
            key={i}
            className="w-[2px] rounded-full bg-white"
            style={{ height: `${height}%`, opacity }}
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

  // Компактная версия для хедера
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
      {/* Свечение под карточкой */}
      <div className="absolute inset-x-6 bottom-0 h-8 bg-violet-600/40 blur-2xl rounded-full translate-y-3" />

      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        {/* Фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#12022a] via-[#1e0845] to-[#0a0220]" />

        {/* Световые пятна */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        <div className="absolute -top-10 left-1/4 w-32 h-32 bg-violet-500/15 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 right-1/4 w-24 h-24 bg-fuchsia-500/10 blur-3xl rounded-full" />

        {/* Тонкие орбиты */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full border border-violet-500/15" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full border border-fuchsia-500/10" />

        <div className="relative p-5 sm:p-6">

          {/* ── Верх: бейдж типа + герб ── */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 mb-2">
                <Icon name="Fingerprint" size={10} className="text-violet-300" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-violet-200/80 font-semibold">
                  Цифровой паспорт рода
                </span>
              </div>
              <div className="text-white font-bold text-xl leading-tight">{familyName}</div>
              <div className="text-[11px] text-violet-300/60 mt-0.5">Семейный ID · nasha-semiya.ru</div>
            </div>

            {/* Декоративный герб семьи (уникальный паттерн) */}
            <div className="flex flex-col items-center gap-1.5 opacity-80">
              <FamilyCrest seed={familyId} />
              <span className="text-[8px] text-violet-300/40 uppercase tracking-wider font-medium">герб рода</span>
            </div>
          </div>

          {/* ── Лого + код ── */}
          <div className="flex items-center gap-4 mb-5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={familyName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/15 shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/40 to-purple-700/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Users" size={24} className="text-violet-200" />
              </div>
            )}

            <button
              onClick={handleCopy}
              className="group flex-1 flex items-center justify-between bg-white/6 hover:bg-white/10 border border-white/10 hover:border-violet-400/40 rounded-xl px-3.5 py-3 transition-all"
            >
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-violet-300/50 mb-1">
                  Идентификатор семьи
                </div>
                <div className="font-mono text-[22px] font-black text-white tracking-[0.12em] leading-none">
                  {code}
                </div>
              </div>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-2 flex-shrink-0 ${
                copied ? 'bg-green-500/25' : 'bg-white/5 group-hover:bg-violet-500/20'
              }`}>
                <Icon
                  name={copied ? 'Check' : 'Copy'}
                  size={14}
                  className={copied ? 'text-green-400' : 'text-violet-300'}
                />
              </div>
            </button>
          </div>

          {copied && (
            <p className="text-center text-xs text-green-400 -mt-3 mb-3 animate-pulse">
              Скопировано!
            </p>
          )}

          {/* ── Параметры рода ── */}
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            {[
              { label: 'Членов', value: membersCount },
              { label: 'Основана', value: year },
              { label: 'Поколений', value: 3 },
              { label: 'Статус', value: '●', active: true },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-[9px] text-violet-300/50 uppercase tracking-wide mb-0.5 leading-tight">{item.label}</div>
                <div className={`font-bold text-sm leading-none ${item.active ? 'text-green-400' : 'text-white'}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Девиз ── */}
          <div className="mb-5 flex items-start gap-2">
            <div className="w-0.5 h-full min-h-[32px] bg-gradient-to-b from-violet-400/60 to-violet-400/10 rounded-full flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-violet-100/70 italic leading-relaxed">
              «{shortMotto}»
            </p>
          </div>

          {/* ── ДНК-штрихкод + метка ── */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[8px] uppercase tracking-[0.15em] text-violet-300/35 mb-1.5">
                Геном семьи
              </div>
              <FamilyDNA seed={familyId} />
            </div>
            <div className="text-right">
              <div className="text-[8px] uppercase tracking-[0.15em] text-violet-300/35 mb-1">
                Верифицирован
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-[10px] text-green-400 font-semibold">Активен</span>
              </div>
            </div>
          </div>
        </div>

        {/* Голографическая полоска */}
        <div className="h-1 bg-gradient-to-r from-violet-600 via-fuchsia-400 via-cyan-300 via-fuchsia-400 to-violet-600" />
      </div>
    </div>
  );
}