import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from './types';

interface NetworkFunction {
  key: string;
  category: string;
  description: string;
  lang: 'python' | 'typescript';
  deployed: boolean;
  flag_key: string | null;
  toggleable: boolean;
  enabled: boolean;
  updated_at: string | null;
  usage_count: number | null;
  usage_label: string | null;
}

interface NetworkFunctionsResponse {
  functions: NetworkFunction[];
  total: number;
  deployed_count: number;
  toggleable_count: number;
  categories: Record<string, number>;
}

export default function NetworkFunctionsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<NetworkFunctionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [onlyToggleable, setOnlyToggleable] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await apiGet<NetworkFunctionsResponse>('network_functions');
    setData(r);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (fn: NetworkFunction) => {
    if (!fn.flag_key) return;
    setPendingKey(fn.key);
    const res = await apiPost<{ success?: boolean }>('flags', {
      key: fn.flag_key,
      enabled: !fn.enabled,
    });
    if (res?.success) {
      toast({ title: `${fn.key}: ${!fn.enabled ? 'включена' : 'выключена'}` });
      await load();
    } else {
      toast({ title: 'Не удалось изменить статус', variant: 'destructive' });
    }
    setPendingKey(null);
  };

  const functions = data?.functions || [];

  const categories = useMemo(() => {
    const set = new Set(functions.map((f) => f.category));
    return ['all', ...Array.from(set).sort()];
  }, [functions]);

  const filtered = useMemo(() => {
    return functions.filter((f) => {
      if (category !== 'all' && f.category !== category) return false;
      if (onlyToggleable && !f.toggleable) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.key.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [functions, category, search, onlyToggleable]);

  const grouped = useMemo(() => {
    const map = new Map<string, NetworkFunction[]>();
    filtered.forEach((f) => {
      if (!map.has(f.category)) map.set(f.category, []);
      map.get(f.category)!.push(f);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

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
            <div className="text-xs text-gray-500 mb-1">Всего функций платформы</div>
            <div className="text-xl md:text-2xl font-bold">{data?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Развёрнуто (активны)</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">{data?.deployed_count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">Категорий</div>
            <div className="text-xl md:text-2xl font-bold text-indigo-600">
              {data ? Object.keys(data.categories).length : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="text-xs text-gray-500 mb-1">С тумблером вкл/выкл</div>
            <div className="text-xl md:text-2xl font-bold text-amber-600">{data?.toggleable_count ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs md:text-sm text-blue-800 flex gap-2">
        <Icon name="Info" size={16} className="shrink-0 mt-0.5" />
        <div>
          Это полный реестр всех backend-функций платформы «Наша Семья» (не одной конкретной семьи, а всей системы для всех пользователей).
          Тумблер доступен только там, где функция управляется фич-флагом — остальные всегда включены, так как это часть основного ядра приложения.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск по названию или описанию функции..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setOnlyToggleable((v) => !v)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
            onlyToggleable
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Только с тумблером
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
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
            {c === 'all' ? `Все (${functions.length})` : `${c} (${data?.categories[c] ?? 0})`}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {grouped.map(([cat, items]) => (
          <div key={cat}>
            {category === 'all' && (
              <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-2">
                <Icon name="Folder" size={14} />
                {cat}
                <span className="text-gray-400 font-normal">({items.length})</span>
              </h3>
            )}
            <div className="space-y-2">
              {items.map((fn) => (
                <Card key={fn.key} className={!fn.enabled ? 'opacity-60' : ''}>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${
                            fn.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon name={fn.enabled ? 'Wifi' : 'WifiOff'} size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <code className="text-xs font-mono font-semibold">{fn.key}</code>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-normal">
                              {fn.lang === 'python' ? 'Python' : 'TS'}
                            </Badge>
                            {!fn.deployed && (
                              <Badge className="text-[9px] px-1 py-0 h-4 bg-gray-200 text-gray-500" variant="outline">
                                не задеплоена
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mt-0.5">{fn.description}</p>
                          {fn.usage_count !== null && (
                            <div className="text-[11px] text-gray-400 mt-1">
                              📊 {fn.usage_count.toLocaleString('ru-RU')} {fn.usage_label}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {fn.toggleable ? (
                          pendingKey === fn.key ? (
                            <Icon name="Loader2" className="animate-spin text-gray-400" size={16} />
                          ) : (
                            <Switch checked={fn.enabled} onCheckedChange={() => toggle(fn)} />
                          )
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-gray-400 border-gray-200">
                            ядро
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}
