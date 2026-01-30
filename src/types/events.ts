export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  eventType: 'birthday' | 'anniversary' | 'holiday' | 'custom';
  eventDate: string;
  eventTime?: string;
  memberId?: string;
  description?: string;
  location?: string;
  budget?: number;
  spent: number;
  guestsCount: number;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  theme?: string;
  cateringType?: 'catering' | 'restaurant' | 'none';
  cateringDetails?: string;
  invitationImageUrl?: string;
  invitationText?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventTask {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface EventGuest {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'invited' | 'confirmed' | 'declined' | 'maybe';
  adultsCount: number;
  childrenCount: number;
  dietaryRestrictions?: string;
  notes?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  link?: string;
  price?: number;
  priority: 'low' | 'medium' | 'high';
  reservedBy?: string;
  reservedByName?: string;
  reserved: boolean;
  purchased: boolean;
  imageUrl?: string;
  createdAt: string;
}

export interface GuestGift {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  link?: string;
  pricePerItem?: number;
  quantityNeeded: number;
  quantityPurchased: number;
  category: 'kids' | 'adults' | 'all';
  purchasedBy?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface EventExpense {
  id: string;
  eventId: string;
  category: 'venue' | 'food' | 'decorations' | 'entertainment' | 'gifts' | 'other';
  title: string;
  amount: number;
  paidBy: string;
  receiptUrl?: string;
  paidAt: string;
  createdAt: string;
}

export interface EventIdea {
  id: string;
  eventId: string;
  category: 'venue' | 'menu' | 'decor' | 'activities' | 'theme';
  title: string;
  description?: string;
  link?: string;
  imageUrl?: string;
  votes: number;
  createdBy: string;
  createdAt: string;
}

export interface NearbyPlace {
  name: string;
  address: string;
  rating?: number;
  phone?: string;
  distance?: number;
  type: 'restaurant' | 'cafe' | 'catering';
}