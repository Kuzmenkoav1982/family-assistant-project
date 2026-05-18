import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import CateringSection from '@/components/events/CateringSection';
import ThemeSection from '@/components/events/ThemeSection';
import InvitationSection from '@/components/events/InvitationSection';
import GuestsTab from './tabs/GuestsTab';
import TasksTab from './tabs/TasksTab';
import WishlistTab from './tabs/WishlistTab';
import ExpensesTab from './tabs/ExpensesTab';
import IdeasTab from './tabs/IdeasTab';
import type { FamilyEvent, EventGuest, EventTask, EventExpense, WishlistItem, GuestGift } from '@/types/events';

interface EventDetailsTabsProps {
  event: FamilyEvent;
  guests: EventGuest[];
  tasks: EventTask[];
  expenses: EventExpense[];
  wishlist: WishlistItem[];
  guestGifts: GuestGift[];
  guestsLoading: boolean;
  tasksLoading: boolean;
  expensesLoading: boolean;
  wishlistLoading: boolean;
  guestGiftsLoading: boolean;
  onShowAddGuest: () => void;
  onShowAddTask: () => void;
  onShowAddExpense: () => void;
  onShowAddWishlist: () => void;
  onShowAddGuestGift: () => void;
  onShowAIIdeas: () => void;
  fetchEvent: () => void;
  fetchGuests: () => void;
  fetchTasks: () => void;
  fetchExpenses: () => void;
  fetchWishlist: () => void;
  fetchGuestGifts: () => void;
  handleTaskStatusChange: (taskId: string, currentStatus: string) => void;
}

const TABS = [
  { value: 'guests', icon: 'Users', label: 'Гости' },
  { value: 'theme', icon: 'Palette', label: 'Тематика' },
  { value: 'catering', icon: 'MapPin', label: 'Ресторан' },
  { value: 'invitation', icon: 'Mail', label: 'Приглашение' },
  { value: 'wishlist', icon: 'Gift', label: 'Подарки' },
  { value: 'expenses', icon: 'Wallet', label: 'Расходы' },
  { value: 'ideas', icon: 'Lightbulb', label: 'Идеи' },
];

export default function EventDetailsTabs({
  event,
  guests, tasks, expenses, wishlist, guestGifts,
  guestsLoading, tasksLoading, expensesLoading, wishlistLoading, guestGiftsLoading,
  onShowAddGuest, onShowAddTask, onShowAddExpense, onShowAddWishlist, onShowAddGuestGift,
  onShowAIIdeas,
  fetchEvent, fetchGuests, fetchTasks, fetchExpenses, fetchWishlist, fetchGuestGifts,
  handleTaskStatusChange,
}: EventDetailsTabsProps) {
  return (
    <Tabs defaultValue="guests" className="w-full">
      <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-1 h-auto p-1">
        {TABS.map(t => (
          <TabsTrigger key={t.value} value={t.value} className="flex-col md:flex-row gap-1 py-2 text-xs md:text-sm">
            <Icon name={t.icon} size={14} className="md:hidden" />
            <span>{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="guests" className="mt-4">
        <GuestsTab guests={guests} guestsLoading={guestsLoading} onShowAddGuest={onShowAddGuest} fetchGuests={fetchGuests} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <TasksTab
          tasks={tasks}
          tasksLoading={tasksLoading}
          onShowAddTask={onShowAddTask}
          fetchTasks={fetchTasks}
          handleTaskStatusChange={handleTaskStatusChange}
        />
      </TabsContent>

      <TabsContent value="wishlist" className="mt-4">
        <WishlistTab
          wishlist={wishlist}
          guestGifts={guestGifts}
          wishlistLoading={wishlistLoading}
          guestGiftsLoading={guestGiftsLoading}
          onShowAddWishlist={onShowAddWishlist}
          onShowAddGuestGift={onShowAddGuestGift}
          fetchWishlist={fetchWishlist}
          fetchGuestGifts={fetchGuestGifts}
        />
      </TabsContent>

      <TabsContent value="expenses" className="mt-4">
        <ExpensesTab
          expenses={expenses}
          expensesLoading={expensesLoading}
          onShowAddExpense={onShowAddExpense}
          fetchExpenses={fetchExpenses}
        />
      </TabsContent>

      <TabsContent value="theme" className="mt-4">
        <ThemeSection event={event} onUpdate={fetchEvent} />
      </TabsContent>

      <TabsContent value="catering" className="mt-4">
        <CateringSection event={event} onUpdate={fetchEvent} />
      </TabsContent>

      <TabsContent value="invitation" className="mt-4">
        <InvitationSection event={event} onUpdate={fetchEvent} />
      </TabsContent>

      <TabsContent value="ideas" className="mt-4">
        <IdeasTab onShowAIIdeas={onShowAIIdeas} />
      </TabsContent>
    </Tabs>
  );
}
