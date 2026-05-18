import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { MONTH_NAMES, getReligionEmoji, getReligionLabel } from '../constants';
import { daysUntil } from '../api';
import type { Holiday } from '../types';

interface Props {
  holidays: Holiday[];
  religion: string;
  onSync: (h: Holiday) => void;
  onAddCustom: (t: string, d: string, desc: string) => void;
  onDeleteCustom: (id: number) => void;
}

export default function HolidaysTab({ holidays, religion, onSync, onAddCustom, onDeleteCustom }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const sortedHolidays = [...holidays].sort((a, b) => a.event_date.localeCompare(b.event_date));
  const grouped: Record<string, Holiday[]> = {};
  sortedHolidays.forEach(h => {
    const monthKey = h.event_date.slice(0, 7);
    if (!grouped[monthKey]) grouped[monthKey] = [];
    grouped[monthKey].push(h);
  });

  const handleAdd = () => {
    if (newTitle.trim() && newDate) {
      onAddCustom(newTitle.trim(), newDate, newDesc.trim());
      setNewTitle('');
      setNewDate('');
      setNewDesc('');
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <Icon name="CalendarDays" size={18} className="text-amber-600" />
          Праздники — {getReligionEmoji(religion)} {getReligionLabel(religion)}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="border-amber-300 text-amber-700">
          <Icon name={showForm ? 'X' : 'Plus'} size={14} className="mr-1" />
          {showForm ? 'Отмена' : 'Своё событие'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 space-y-3">
            <Input placeholder="Название события" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="border-amber-200" />
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="border-amber-200" />
            <Textarea placeholder="Описание (необязательно)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="border-amber-200" rows={2} />
            <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newDate} className="bg-amber-600 hover:bg-amber-700 text-white">
              <Icon name="Plus" size={14} className="mr-1" />
              Добавить
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([monthKey, items]) => {
        const monthIdx = parseInt(monthKey.split('-')[1]) - 1;
        return (
          <div key={monthKey}>
            <div className="flex items-center gap-2 mb-2 mt-3">
              <div className="h-px flex-1 bg-amber-200" />
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">{MONTH_NAMES[monthIdx]}</span>
              <div className="h-px flex-1 bg-amber-200" />
            </div>
            <div className="space-y-2">
              {items.map((h, i) => {
                const days = daysUntil(h.event_date);
                const isPast = days < 0;
                return (
                  <Card key={i} className={`border-amber-100 ${isPast ? 'opacity-50' : ''} ${days === 0 ? 'ring-2 ring-amber-400 shadow-md' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-amber-800 leading-none">
                            {new Date(h.event_date + 'T00:00:00').getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className="text-sm font-medium text-amber-900">{h.title}</p>
                            {h.is_custom && (
                              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px]">своё</Badge>
                            )}
                            {h.is_fasting && (
                              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[9px]">пост</Badge>
                            )}
                          </div>
                          {h.description && <p className="text-xs text-amber-700/70 mt-0.5 line-clamp-2">{h.description}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {!isPast && !h.is_custom && (
                            <button onClick={() => onSync(h)} className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600" title="Добавить в календарь">
                              <Icon name="CalendarPlus" size={14} />
                            </button>
                          )}
                          {h.is_custom && h.id && (
                            <button onClick={() => onDeleteCustom(h.id!)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Удалить">
                              <Icon name="Trash2" size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {sortedHolidays.length === 0 && (
        <Card className="border-dashed border-amber-200">
          <CardContent className="py-10 text-center text-amber-600/60">
            <Icon name="CalendarX" size={36} className="mx-auto mb-2 text-amber-300" />
            <p className="text-sm">Нет праздников для этой конфессии</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
