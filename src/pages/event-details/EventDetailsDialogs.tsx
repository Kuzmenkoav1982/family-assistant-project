import AddGuestDialog from '@/components/events/AddGuestDialog';
import AddTaskDialog from '@/components/events/AddTaskDialog';
import AddExpenseDialog from '@/components/events/AddExpenseDialog';
import AddWishlistItemDialog from '@/components/events/AddWishlistItemDialog';
import AddGuestGiftDialog from '@/components/events/AddGuestGiftDialog';
import ShareEventDialog from '@/components/events/ShareEventDialog';
import AIIdeasDialog from '@/components/events/AIIdeasDialog';
import type { FamilyEvent } from '@/types/events';

interface EventDetailsDialogsProps {
  id: string;
  event: FamilyEvent | null;
  showAddGuest: boolean;
  showAddTask: boolean;
  showAddExpense: boolean;
  showAddWishlist: boolean;
  showAddGuestGift: boolean;
  showShare: boolean;
  showAIIdeas: boolean;
  setShowAddGuest: (open: boolean) => void;
  setShowAddTask: (open: boolean) => void;
  setShowAddExpense: (open: boolean) => void;
  setShowAddWishlist: (open: boolean) => void;
  setShowAddGuestGift: (open: boolean) => void;
  setShowShare: (open: boolean) => void;
  setShowAIIdeas: (open: boolean) => void;
  fetchEvent: () => void;
  fetchGuests: () => void;
  fetchTasks: () => void;
  fetchExpenses: () => void;
  fetchWishlist: () => void;
  fetchGuestGifts: () => void;
}

export default function EventDetailsDialogs({
  id,
  event,
  showAddGuest,
  showAddTask,
  showAddExpense,
  showAddWishlist,
  showAddGuestGift,
  showShare,
  showAIIdeas,
  setShowAddGuest,
  setShowAddTask,
  setShowAddExpense,
  setShowAddWishlist,
  setShowAddGuestGift,
  setShowShare,
  setShowAIIdeas,
  fetchEvent,
  fetchGuests,
  fetchTasks,
  fetchExpenses,
  fetchWishlist,
  fetchGuestGifts,
}: EventDetailsDialogsProps) {
  return (
    <>
      <AddGuestDialog
        open={showAddGuest}
        onOpenChange={setShowAddGuest}
        eventId={id}
        onSuccess={() => { fetchGuests(); fetchEvent(); }}
      />

      <AddTaskDialog
        open={showAddTask}
        onOpenChange={setShowAddTask}
        eventId={id}
        onSuccess={fetchTasks}
      />

      <AddExpenseDialog
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        eventId={id}
        onSuccess={() => { fetchExpenses(); fetchEvent(); }}
      />

      <AddWishlistItemDialog
        open={showAddWishlist}
        onOpenChange={setShowAddWishlist}
        eventId={id}
        onSuccess={fetchWishlist}
      />

      <AddGuestGiftDialog
        open={showAddGuestGift}
        onOpenChange={setShowAddGuestGift}
        eventId={id}
        onSuccess={fetchGuestGifts}
      />

      <ShareEventDialog
        open={showShare}
        onOpenChange={setShowShare}
        eventId={id}
        eventTitle={event?.title || ''}
      />

      <AIIdeasDialog
        open={showAIIdeas}
        onOpenChange={setShowAIIdeas}
        eventType={event?.eventType || 'birthday'}
      />
    </>
  );
}
