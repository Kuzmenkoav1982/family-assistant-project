import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

interface LimitsCardProps {
  familyId: string | null;
}

export default function LimitsCard({ familyId }: LimitsCardProps) {
  const navigate = useNavigate();
  const { limits, loading, isPremium } = useSubscriptionLimits(familyId);

  if (loading || !limits) {
    return null;
  }

  if (isPremium) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-600/10 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Crown" className="text-yellow-500" />
            Premium подписка активна
          </CardTitle>
          <CardDescription>
            У вас безлимитный доступ ко всем функциям
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" className="text-purple-500" size={20} />
            <span className="text-sm">Безлимитные AI-запросы</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Image" className="text-purple-500" size={20} />
            <span className="text-sm">Безлимитные фото</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Users" className="text-purple-500" size={20} />
            <span className="text-sm">Безлимитные члены семьи</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const aiLimit = limits.limits.ai_requests;
  const photoLimit = limits.limits.photos;
  const membersLimit = limits.limits.family_members;

  const aiProgress = aiLimit.limit ? (aiLimit.used / aiLimit.limit) * 100 : 0;
  const photoProgress = photoLimit.limit ? (photoLimit.used / photoLimit.limit) * 100 : 0;
  const membersProgress = membersLimit.limit ? (membersLimit.used / membersLimit.limit) * 100 : 0;

  return (
    <Card className="border-orange-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Zap" className="text-orange-500" />
          Лимиты бесплатного плана
        </CardTitle>
        <CardDescription>
          Обновитесь до Premium для безлимитного доступа
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Sparkles" size={18} />
              <span className="text-sm font-medium">AI-запросы</span>
            </div>
            <Badge variant={aiLimit.allowed ? 'default' : 'destructive'}>
              {aiLimit.used} / {aiLimit.limit}
            </Badge>
          </div>
          <Progress value={aiProgress} className="h-2" />
          {aiLimit.reset_date && (
            <p className="text-xs text-muted-foreground">
              Сброс: {new Date(aiLimit.reset_date + 'T00:00:00').toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Image" size={18} />
              <span className="text-sm font-medium">Фотографии</span>
            </div>
            <Badge variant={photoLimit.allowed ? 'default' : 'destructive'}>
              {photoLimit.used} / {photoLimit.limit}
            </Badge>
          </div>
          <Progress value={photoProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={18} />
              <span className="text-sm font-medium">Члены семьи</span>
            </div>
            <Badge variant={membersLimit.allowed ? 'default' : 'destructive'}>
              {membersLimit.used} / {membersLimit.limit}
            </Badge>
          </div>
          <Progress value={membersProgress} className="h-2" />
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          onClick={() => navigate('/pricing')}
        >
          <Icon name="Crown" size={18} className="mr-2" />
          Перейти на Premium
        </Button>
      </CardContent>
    </Card>
  );
}
