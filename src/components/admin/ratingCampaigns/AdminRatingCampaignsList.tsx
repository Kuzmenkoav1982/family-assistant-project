import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Campaign, statusBadge } from './types';

interface Props {
  loading: boolean;
  campaigns: Campaign[];
  onEdit: (c: Campaign) => void;
  onRecalculate: (c: Campaign) => void;
  onPayout: (c: Campaign) => void;
  onDisqualify: (c: Campaign) => void;
}

export default function AdminRatingCampaignsList({
  loading,
  campaigns,
  onEdit,
  onRecalculate,
  onPayout,
  onDisqualify,
}: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Icon name="Loader2" className="animate-spin" size={30} />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-gray-500">
          <Icon name="Trophy" size={40} className="mx-auto mb-2 opacity-40" />
          <p>Кампаний пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {campaigns.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-base">{c.title}</h3>
                  <code className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded">
                    {c.slug}
                  </code>
                  <Badge className={`text-[10px] ${statusBadge(c.status)}`}>{c.status}</Badge>
                  {c.is_payout_done && (
                    <Badge className="text-[10px] bg-green-100 text-green-700">Выплачено</Badge>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-slate-600 mb-1 line-clamp-2">{c.description}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  <Icon name="Calendar" size={11} className="inline mr-1" />
                  {new Date(c.starts_at).toLocaleDateString('ru-RU')} —{' '}
                  {new Date(c.ends_at).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                  <Icon name="Pencil" size={12} className="mr-1" />
                  Изменить
                </Button>
                <Button size="sm" variant="outline" onClick={() => onRecalculate(c)}>
                  <Icon name="Calculator" size={12} className="mr-1" />
                  Пересчитать
                </Button>
                {c.status === 'finished' && !c.is_payout_done && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onPayout(c)}
                  >
                    <Icon name="CircleDollarSign" size={12} className="mr-1" />
                    Выплатить
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDisqualify(c)}>
                  <Icon name="UserX" size={12} className="mr-1 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
