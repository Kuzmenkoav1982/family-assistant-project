import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { MoodDiary } from './MoodDiary';
import { AchievementsBadges } from './AchievementsBadges';
import { RewardsShop } from './RewardsShop';
import { RealMoneyPiggyBank } from './RealMoneyPiggyBank';
import { ChildCalendar } from './ChildCalendar';
import ChildMasterScreen from './ChildMasterScreen';
import GrowthScreen from './GrowthScreen';
import AchievementsScreen from './AchievementsScreen';
import ActivitiesScreen from './ActivitiesScreen';
import FamilyRootsScreen from './FamilyRootsScreen';

interface ChildProfileProps {
  child: {
    id: string;
    name: string;
    avatar: string;
    piggyBank?: number;
    [key: string]: unknown;
  };
  /** D.1: deep-link из портфолио — стартовая вкладка (home/diary/...). */
  initialTab?: string | null;
  /** D.1: deep-link из портфолио — действие, например 'add-mood-entry'. */
  initialAction?: string | null;
  /** D.1: коллбэк, когда action отработал — Children.tsx чистит ?action из URL. */
  onActionHandled?: () => void;
}

export function ChildProfile({ child, initialTab, initialAction, onActionHandled }: ChildProfileProps) {
  const piggyBank = child.piggyBank || 0;
  const navigate = useNavigate();

  const CHILD_VALID_TABS = ['home', 'diary', 'achievements', 'shop', 'money', 'calendar', 'growth', 'activities', 'family'];
  const resolveTab = (t: string | null | undefined) =>
    t && CHILD_VALID_TABS.includes(t) ? t : 'home';
  const [tabValue, setTabValue] = useState<string>(() => resolveTab(initialTab));
  const [moodDiaryOpen, setMoodDiaryOpen] = useState(false);

  useEffect(() => {
    setTabValue(resolveTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    if (initialAction === 'add-mood-entry') {
      setTabValue('diary');
      setMoodDiaryOpen(true);
      onActionHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-3">
      <TabsList className="grid grid-cols-6 h-auto w-full gap-0 bg-white/80 border border-slate-100 p-1 rounded-2xl shadow-sm">
        <TabsTrigger value="home" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
          <Icon name="Home" size={16} />
          Главная
        </TabsTrigger>
        <TabsTrigger value="diary" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-violet-50 data-[state=active]:text-violet-700 data-[state=active]:shadow-none">
          <Icon name="BookOpen" size={16} />
          Дневник
        </TabsTrigger>
        <TabsTrigger value="achievements" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-none">
          <Icon name="Award" size={16} />
          Награды
        </TabsTrigger>
        <TabsTrigger value="shop" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-none">
          <Icon name="ShoppingBag" size={16} />
          Магазин
        </TabsTrigger>
        <TabsTrigger value="money" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none">
          <Icon name="Wallet" size={16} />
          Копилка
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex-col gap-0.5 rounded-xl py-2 text-[10px] font-medium data-[state=active]:bg-rose-50 data-[state=active]:text-rose-700 data-[state=active]:shadow-none">
          <Icon name="Calendar" size={16} />
          Дни
        </TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="mt-0">
        <ChildMasterScreen
          child={child as Parameters<typeof ChildMasterScreen>[0]['child']}
          onTabChange={setTabValue}
          onGrowthOpen={() => setTabValue('growth')}
          onAchievementsOpen={() => setTabValue('achievements')}
          onActivitiesOpen={() => setTabValue('activities')}
          onFamilyOpen={() => setTabValue('family')}
        />
      </TabsContent>

      <TabsContent value="family" className="mt-0">
        <FamilyRootsScreen
          child={child as Parameters<typeof FamilyRootsScreen>[0]['child']}
          onBack={() => setTabValue('home')}
          onNavigateToMemory={() => navigate('/memory')}
        />
      </TabsContent>

      <TabsContent value="growth" className="mt-0">
        <GrowthScreen
          child={child as Parameters<typeof GrowthScreen>[0]['child']}
          onBack={() => setTabValue('home')}
        />
      </TabsContent>

      <TabsContent value="activities" className="mt-0">
        <ActivitiesScreen
          child={child as Parameters<typeof ActivitiesScreen>[0]['child']}
          onBack={() => setTabValue('home')}
        />
      </TabsContent>

      <TabsContent value="diary">
        <MoodDiary
          childId={child.id}
          openDialog={moodDiaryOpen}
          onOpenDialogChange={setMoodDiaryOpen}
        />
      </TabsContent>

      <TabsContent value="achievements" className="mt-0">
        <AchievementsScreen
          child={child as Parameters<typeof AchievementsScreen>[0]['child']}
          onBack={() => setTabValue('home')}
        />
      </TabsContent>

      <TabsContent value="shop">
        <RewardsShop childId={child.id} balance={piggyBank} />
      </TabsContent>

      <TabsContent value="money" className="space-y-6">
        <RealMoneyPiggyBank childId={child.id} />
      </TabsContent>

      <TabsContent value="calendar" className="space-y-6">
        <ChildCalendar child={child} />
      </TabsContent>
    </Tabs>
  );
}