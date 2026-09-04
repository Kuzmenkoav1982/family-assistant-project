import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from './types';

interface NetworkFunction {
  key: string;
  name: string;
  category: string;
  purpose: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  affects: string;
  capabilities: string[];
  enabled: boolean;
  updated_at: string | null;
  usage_count: number;
  usage_label: string;
}

const CRITICALITY_META: Record<string, { label: string; color: string; icon: string }> = {
  critical: { label: 'Критичная', color: 'bg-red-100 text-red-700 border-red-200', icon: 'AlertOctagon' },
  high: { label: 'Высокая', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'AlertTriangle' },
  medium: { label: 'Средняя', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: 'CircleAlert' },
  low: { label: 'Низкая', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'Circle' },
};

export default function NetworkFunctionsTab() {
  const { toast } = useToast();
  const [functions, setFunctions] = useState<NetworkFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await apiGet<{ functions: NetworkFunction[] }>('network_functions');
    setFunctions(r?.functions || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (fn: NetworkFunction) => {
    setPendingKey(fn.key);
    const res = await apiPost<{ success?: boolean }>('flags', {
      key: fn.key,
      enabled: !fn.enabled,
    });
    if (res?.success) {
      toast({ title: `${fn.name}: ${!fn.enabled ? 'включена' : 'выключена'}` });
      await load();
    } else {
      toast({ title: 'Не удалось изменить статус', variant: 'destructive' });
    }
    setPendingKey(null);
  };

  const categories = useMemo(() => {
    const set = new Set(functions.map((f) => f.category));
    return ['all', ...Array.from(set)];
  }, [functions]);

  const filtered = useMemo(() => {
    return functions.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.name.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          f.purpose.toLowerCase().includes(q) ||
          f.capabilities.some((c) => c.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [functions, category, search]);

  const stats = useMemo(() => {
    const total = functions.length;
    const enabled = functions.filter((f) => f.enabled).length;
    const critical = functions.filter((f) => f.criticality === 'critical').length;
    const disabled = total - enabled;
    return { total, enabled, disabled, critical };
  }, [functions]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Icon name="Loader2" className="animate-spin" size={30} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Всего функций</div>
            <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Включено</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.enabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Выключено</div>
            <div className="text-xl md:text-2xl font-bold text-gray-400">{stats.disabled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Критичных</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по названию, описанию, возможности..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c === 'all' ? 'Все' : c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((fn) => {
          const crit = CRITICALITY_META[fn.criticality] || CRITICALITY_META.low;
          return (
            <Card key={fn.key} className={!fn.enabled ? 'opacity-70' : ''}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`mt-0.5 w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                        fn.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon name={fn.enabled ? 'Wifi' : 'WifiOff'} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm md:text-base">{fn.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {fn.category}
                        </Badge>
                        <Badge className={`text-[10px] border ${crit.color}`} variant="outline">
                          <Icon name={crit.icon} size={10} className="mr-1" />
                          {crit.label}
                        </Badge>
                      </div>
                      <code className="text-[11px] text-gray-400 font-mono">{fn.key}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {pendingKey === fn.key ? (
                      <Icon name="Loader2" className="animate-spin text-gray-400" size={18} />
                    ) : (
                      <Switch checked={fn.enabled} onCheckedChange={() => toggle(fn)} />
                    )}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-gray-600">{fn.purpose}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-400 mb-1 flex items-center gap-1">
                      <Icon name="Target" size={12} />
                      На что влияет
                    </div>
                    <div className="text-gray-700">{fn.affects}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="text-gray-400 mb-1 flex items-center gap-1">
                      <Icon name="BarChart3" size={12} />
                      Статистика использования
                    </div>
                    <div className="text-gray-700 font-medium">
                      {fn.usage_count.toLocaleString('ru-RU')} — {fn.usage_label}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {fn.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100"
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {fn.updated_at && (
                  <div className="text-[11px] text-gray-400">
                    Изменено: {new Date(fn.updated_at).toLocaleString('ru-RU')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
