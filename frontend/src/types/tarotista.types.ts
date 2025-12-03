/**
 * Tarotista Types (Marketplace)
 */

export interface Tarotista {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  specialties: string[];
  pricePerSession: number;
  currency: string;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TarotistaReview {
  id: string;
  tarotistaId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface TarotistaFilters {
  specialty?: string;
  minRating?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  search?: string;
}

export interface BookingSlot {
  id: string;
  tarotistaId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}
