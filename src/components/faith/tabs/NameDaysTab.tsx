import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { MONTH_NAMES, getReligionEmoji, getReligionLabel } from '../constants';
import { apiFetch } from '../api';
import type { NameDay } from '../types';

export default function NameDaysTab({ religion }: { religion: string }) {
  const [searchName, setSearchName] = useState('');
  const [searchMonth, setSearchMonth] = useState<number | null>(null);
  const [results, setResults] = useState<NameDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const doSearch = useCallback(async (name?: string, month?: number | null) => {
    const n = name ?? searchName;
    const m = month !== undefined ? month : searchMonth;
    if (!n.trim() && m === null) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, unknown> = { religion };
      if (n.trim()) params.name = n.trim();
      if (m !== null && m !== undefined) params.month = m + 1;
      const data = await apiFetch('get_name_days', params);
      setResults(data.nameDays || []);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchMonth, religion]);

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      const currentMonth = new Date().getMonth();
      setSearchMonth(currentMonth);
      doSearch('', currentMonth);
    }
  }, [initialLoad, doSearch]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name="Baby" size={18} className="text-violet-600" />
        Дни ангела (именины) — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Введите имя..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              className="border-amber-200 focus:ring-amber-400 flex-1"
            />
            <Button size="sm" onClick={() => doSearch()} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              {loading ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Search" size={16} />}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MONTH_NAMES.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const newMonth = searchMonth === idx ? null : idx;
                  setSearchMonth(newMonth);
                  doSearch(searchName, newMonth);
                }}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                  searchMonth === idx
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-amber-600" />
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-8 text-center text-amber-600/60">
            <Icon name="UserSearch" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Ничего не найдено</p>
            <p className="text-xs mt-1">Попробуйте другое имя или месяц</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-amber-600 px-1">Найдено: {results.length}</p>
          {results.map((nd, i) => (
            <Card key={i} className="border-amber-100 hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-semibold text-rose-700">{nd.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900">{nd.name}</p>
                    {nd.saint_name && <p className="text-xs text-amber-700/70">{nd.saint_name}</p>}
                    <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
                      <Icon name="Calendar" size={10} />
                      {nd.day} {MONTH_NAMES[nd.month - 1]?.toLowerCase()}
                    </p>
                  </div>
                </div>
                {nd.description && (
                  <p className="text-xs text-amber-700/60 mt-2 pl-14">{nd.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
