import type { CompatibilityScore } from '@/types/family-code.types';

interface CompatibilityGaugeProps {
  score: CompatibilityScore;
  name1: string;
  name2: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}

function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-400 to-teal-500';
  if (score >= 60) return 'from-blue-400 to-indigo-500';
  if (score >= 40) return 'from-amber-400 to-orange-500';
  return 'from-red-400 to-rose-500';
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Идеальная пара';
  if (score >= 75) return 'Отличная совместимость';
  if (score >= 65) return 'Хорошая совместимость';
  if (score >= 50) return 'Средняя совместимость';
  if (score >= 35) return 'Есть над чем работать';
  return 'Сложная совместимость';
}

function CircleProgress({ value, size = 160 }: { value: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="currentColor" strokeWidth="8"
        className="text-gray-100"
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none" strokeWidth="8" strokeLinecap="round"
        stroke="url(#gaugeGradient)"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={value >= 60 ? '#34d399' : value >= 40 ? '#fbbf24' : '#f87171'} />
          <stop offset="100%" stopColor={value >= 60 ? '#06b6d4' : value >= 40 ? '#f97316' : '#e11d48'} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MiniBar({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 flex items-center gap-1">
          <span>{emoji}</span> {label}
        </span>
        <span className={`font-bold ${getScoreColor(value)}`}>{value}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getScoreGradient(value)} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function CompatibilityGauge({ score, name1, name2 }: CompatibilityGaugeProps) {
  return (
    <div className="text-center space-y-4">
      <div className="relative inline-block">
        <CircleProgress value={score.overall} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}%
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">{getScoreLabel(score.overall)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        <span className="font-medium text-purple-700">{name1}</span>
        {' '}и{' '}
        <span className="font-medium text-purple-700">{name2}</span>
      </p>

      <div className="space-y-2.5 text-left max-w-xs mx-auto">
        <MiniBar label="Нумерология" value={score.numerology} emoji="🔢" />
        <MiniBar label="Астрология" value={score.astrology} emoji="⭐" />
        <MiniBar label="Арканы" value={score.elements} emoji="🃏" />
        <MiniBar label="Психология" value={score.psychology} emoji="💜" />
      </div>
    </div>
  );
}
