export interface UserProfile {
  id: string;
  role: 'buyer' | 'seller';
  fullName: string;
  bio: string;
  avatarURL: string;
  skills: string[];
  experienceYears?: number;
  platforms?: string[]; // e.g. ["Instagram", "TikTok", "YouTube", "Twitter"]
  isVerified?: boolean;
  rating?: number;
  credits?: number;
  createdAt?: any;
}

export interface PortfolioItem {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  mediaURL: string;
  link: string;
  createdAt?: any;
}

export interface FreelanceGig {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  description: string;
  price: number;
  category: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Design' | 'Dev' | 'Video' | 'Marketing' | 'Writing' | 'AI';
  deliveryTime: string; // e.g., "3 days"
  mediaURL: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  createdAt?: any;
}

export interface JobPost {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  description: string;
  budget: number;
  category: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Design' | 'Dev' | 'Video' | 'Marketing' | 'Writing' | 'AI';
  deliveryTime: string;
  createdAt?: any;
  proposalsCount?: number;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  gigId: string;
  gigTitle: string;
  gigCategory: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Design' | 'Dev' | 'Video' | 'Marketing' | 'Writing' | 'AI';
  price: number;
  status: 'pending' | 'in_escrow' | 'delivered' | 'completed' | 'cancelled' | 'revision_requested' | 'disputed';
  deliveryDate: string;
  deliverableText?: string;
  reviewId?: string;
  createdAt?: any;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: any;
}

export interface GigReview {
  id: string;
  gigId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  text: string;
  createdAt?: any;
}
