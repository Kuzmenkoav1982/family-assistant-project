import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { PrizeForm } from './types';

interface Props {
  prizes: PrizeForm[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: <K extends keyof PrizeForm>(i: number, field: K, value: PrizeForm[K]) => void;
}

export default function AdminRatingCampaignPrizes({ prizes, onAdd, onRemove, onUpdate }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs uppercase tracking-wider text-slate-500">Призы</Label>
        <Button size="sm" variant="outline" type="button" onClick={onAdd}>
          <Icon name="Plus" size={12} className="mr-1" />
          Добавить место
        </Button>
      </div>
      {prizes.length === 0 && (
        <p className="text-xs text-slate-500 italic">Призы не заданы</p>
      )}
      <div className="space-y-2">
        {prizes.map((p, i) => (
          <div key={i} className="grid grid-cols-12 gap-1.5 items-end p-2 bg-slate-50 rounded-lg">
            <div className="col-span-2">
              <Label className="text-[10px]">с</Label>
              <Input
                type="number"
                value={p.place_from}
                onChange={(e) => onUpdate(i, 'place_from', +e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">по</Label>
              <Input
                type="number"
                value={p.place_to}
                onChange={(e) => onUpdate(i, 'place_to', +e.target.value)}
              />
            </div>
            <div className="col-span-3">
              <Label className="text-[10px]">Сумма ₽</Label>
              <Input
                type="number"
                value={p.amount_rub}
                onChange={(e) => onUpdate(i, 'amount_rub', +e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Тип</Label>
              <select
                value={p.prize_type}
                onChange={(e) => onUpdate(i, 'prize_type', e.target.value)}
                className="w-full h-10 px-2 rounded-md border bg-white text-xs"
              >
                <option value="wallet">Кошелёк</option>
                <option value="badge">Бейдж</option>
                <option value="promo">Промо</option>
              </select>
            </div>
            <div className="col-span-2">
              <Label className="text-[10px]">Описание</Label>
              <Input
                value={p.description}
                onChange={(e) => onUpdate(i, 'description', e.target.value)}
                placeholder="..."
              />
            </div>
            <div className="col-span-1">
              <Button
                size="icon"
                variant="ghost"
                type="button"
                onClick={() => onRemove(i)}
              >
                <Icon name="Trash2" size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
