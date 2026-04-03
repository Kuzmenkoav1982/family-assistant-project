import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { PhotoUpload } from '@/components/leisure/PhotoUpload';
import type { LeisureActivity } from '@/data/leisureTypes';
import { getCategoryInfo, getStatusBadge } from '@/data/leisureTypes';

interface ActivityGridProps {
  activities: LeisureActivity[];
  selectedTagFilter: string | null;
  formatDate: (date?: string) => string | null;
  formatPrice: (price?: number, currency?: string) => string | null;
  onEdit: (activity: LeisureActivity) => void;
  onDelete: (id: number) => void;
  onShare: (activity: LeisureActivity) => void;
  onRevokeShare: (activity: LeisureActivity) => void;
}

export default function ActivityGrid({
  activities, selectedTagFilter, formatDate, formatPrice,
  onEdit, onDelete, onShare, onRevokeShare,
}: ActivityGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {activities
        .filter(activity => !selectedTagFilter || activity.tags?.includes(selectedTagFilter))
        .map((activity) => {
        const categoryInfo = getCategoryInfo(activity.category);
        const statusBadge = getStatusBadge(activity.status);

        return (
          <Card key={activity.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name={categoryInfo.icon} size={20} className="text-purple-600" />
                <span className="text-xs text-gray-500">{categoryInfo.label}</span>
              </div>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>

            <h3 className="font-semibold text-lg mb-2">{activity.title}</h3>

            {activity.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Icon name="MapPin" size={14} />
                {activity.location}
              </div>
            )}

            {activity.date && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Icon name="Calendar" size={14} />
                {formatDate(activity.date)}
                {activity.time && <span className="ml-1">в {activity.time}</span>}
              </div>
            )}

            {activity.price && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <Icon name="Wallet" size={14} />
                {formatPrice(activity.price, activity.currency)}
              </div>
            )}

            {activity.rating && (
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={14}
                    className={i < activity.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  />
                ))}
              </div>
            )}

            {activity.notes && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.notes}</p>
            )}

            {activity.tags && activity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {activity.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Icon name="Tag" size={10} className="mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {activity.participants && activity.participants.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                <Icon name="Users" size={14} />
                <span>{activity.participants.length} участников</span>
              </div>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <PhotoUpload
                activityId={activity.id}
                existingPhotos={[]}
                onPhotosUpdate={(photos) => console.log('Photos updated:', photos)}
              />
              <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
                <Icon name="Pencil" size={14} className="mr-1" />
                Редактировать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => activity.is_public ? onRevokeShare(activity) : onShare(activity)}
                title={activity.is_public ? 'Отозвать публичную ссылку' : 'Поделиться'}
              >
                <Icon
                  name={activity.is_public ? 'Link' : 'Share2'}
                  size={14}
                  className={activity.is_public ? 'text-blue-600' : ''}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(activity.id)}>
                <Icon name="Trash2" size={14} className="text-red-600" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
