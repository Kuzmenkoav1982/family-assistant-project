import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BALANCE_SPHERES } from './frameworks';
import { lifeApi } from './api';
import type { BalanceSnapshot } from './types';

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 30;

function polarToCart(angle: number, r: number): [number, number] {
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

export default function BalanceWheel() {
  const [scores, setScores] = useState<Record<string, number>>(() =>
    Object.fromEntries(BALANCE_SPHERES.map((s) => [s.id, 5])),
  );
  const [history, setHistory] = useState<BalanceSnapshot[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    lifeApi
      .listBalance()
      .then((data) => {
        setHistory(data);
        if (data.length > 0 && data[0].scores) {
          setScores((prev) => ({ ...prev, ...data[0].scores }));
        }
      })
      .catch(() => {});
  }, []);

  const polygonPoints = useMemo(() => {
    return BALANCE_SPHERES.map((s, i) => {
      const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / BALANCE_SPHERES.length;
      const value = scores[s.id] ?? 5;
      const [x, y] = polarToCart(angle, (RADIUS * value) / 10);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [scores]);

  const avg = useMemo(() => {
    const vals = Object.values(scores);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  const weakest = useMemo(() => {
    const sorted = [...BALANCE_SPHERES].sort((a, b) => (scores[a.id] ?? 5) - (scores[b.id] ?? 5));
    return sorted.slice(0, 2);
  }, [scores]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const snap = await lifeApi.saveBalance(scores);
      setHistory((prev) => [snap, ...prev]);
    } catch (e) {
      alert('Не удалось сохранить: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60">
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Icon name="PieChart" size={18} className="text-emerald-600" />
          Колесо баланса
        </h3>
        <p className="text-xs text-gray-500 mb-3">Перетащи ползунки, чтобы оценить каждую сферу от 1 до 10.</p>

        <div className="flex justify-center">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[320px]">
            {/* концентрические круги */}
            {[2, 4, 6, 8, 10].map((v) => (
              <circle
                key={v}
                cx={CENTER}
                cy={CENTER}
                r={(RADIUS * v) / 10}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray={v === 10 ? '0' : '2 3'}
              />
            ))}
            {/* лучи */}
            {BALANCE_SPHERES.map((s, i) => {
              const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / BALANCE_SPHERES.length;
              const [x, y] = polarToCart(angle, RADIUS);
              return (
                <line
                  key={s.id}
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              );
            })}
            {/* область пользователя */}
            <polygon
              points={polygonPoints}
              fill="url(#balanceGradient)"
              fillOpacity={0.4}
              stroke="#8b5cf6"
              strokeWidth={2}
            />
            <defs>
              <radialGradient id="balanceGradient">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#ec4899" />
              </radialGradient>
            </defs>
            {/* подписи */}
            {BALANCE_SPHERES.map((s, i) => {
              const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / BALANCE_SPHERES.length;
              const [x, y] = polarToCart(angle, RADIUS + 18);
              return (
                <g key={s.id}>
                  <circle cx={x} cy={y} r={11} fill={s.color} opacity={0.15} />
                  <text x={x} y={y + 3} fontSize={9} textAnchor="middle" fill="#374151" fontWeight={600}>
                    {scores[s.id] ?? 5}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="text-gray-500">Средний балл:</span>{' '}
            <span className="font-bold text-purple-700">{avg.toFixed(1)}</span>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <Icon name={saving ? 'Loader2' : 'Save'} size={14} className={`mr-1.5 ${saving ? 'animate-spin' : ''}`} />
            Сохранить замер
          </Button>
        </div>

        {weakest.length > 0 && (
          <div className="mt-3 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
              <Icon name="AlertTriangle" size={12} /> Зоны роста
            </div>
            <div className="text-amber-900/90">
              Слабее всего: {weakest.map((s) => s.label).join(' и ')}. Поставь маленькую цель в эти сферы.
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/60 space-y-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Icon name="Sliders" size={18} className="text-purple-600" />
          Оценки по сферам
        </h3>
        {BALANCE_SPHERES.map((s) => (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
              style={{ background: s.color }}
            >
              <Icon name={s.icon} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-gray-700">{s.label}</span>
                <span className="font-bold text-purple-700">{scores[s.id] ?? 5}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={scores[s.id] ?? 5}
                onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>
        ))}
        {history.length > 0 && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Последний замер: {new Date(history[0].createdAt || '').toLocaleString('ru-RU')}
          </div>
        )}
      </div>
    </div>
  );
}