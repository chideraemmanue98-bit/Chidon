export type UserRole = 'buyer' | 'seller';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
}

export interface FreelanceProfile {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  avatarURL: string;
  coverURL: string;
  bio: string;
  skills: string[];
  languages: string[];
  education: string[];
  certifications: string[];
  portfolio: PortfolioProject[];
  role: UserRole;
  isVerified: boolean;
  hasCompletedSetup?: boolean;
  // Seller stats
  totalOrders: number;
  rating: number;
  responseTime: string; // e.g. "1 hour"
  onTimeDelivery: number; // percentage
  earnings: number;
  createdAt: any;
}

export interface PricePackage {
  title: string;
  description: string;
  deliveryTime: number; // in days
  revisions: number; // count, -1 for unlimited
  price: number;
  features: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Gig {
  id: string;
  userId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerRating: number;
  sellerLevel: 'New' | 'Level 1' | 'Level 2' | 'Top Rated';
  title: string;
  description: string;
  category: 'Graphics' | 'Writing' | 'Video' | 'Programming' | 'Marketing';
  tags: string[];
  images: string[];
  packages: {
    basic: PricePackage;
    standard: PricePackage;
    premium: PricePackage;
  };
  faq: FAQItem[];
  requirements: string;
  isPaused: boolean;
  createdAt: any;
}

export type OrderStatus = 
  | 'pending_requirements' // waiting for buyer requirements
  | 'in_progress'          // active order
  | 'delivered'            // seller delivered work, waiting for approval
  | 'revision'             // buyer requested revision
  | 'completed'           // buyer approved, funds released
  | 'disputed'            // dispute raised
  | 'cancelled';          // cancelled and refunded

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  gigId: string;
  gigTitle: string;
  gigImage: string;
  packageType: 'basic' | 'standard' | 'premium';
  packageTitle: string;
  amount: number; // in USD
  status: OrderStatus;
  requirementsSubmitted?: string;
  deliveryFileUrl?: string;
  deliveryNotes?: string;
  revisionNotes?: string;
  paystackReference?: string;
  paystackStatus?: string;
  createdAt: any;
  deliveryDeadline?: any; // date timestamp
}

export interface Message {
  id: string;
  chatId: string; // buyerId_sellerId
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: any;
}

export interface Review {
  id: string;
  orderId: string;
  gigId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  rating: number; // 1-5
  comment: string;
  createdAt: any;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedById: string;
  raisedByName: string;
  reason: string;
  details: string;
  status: 'open' | 'resolved' | 'rejected';
  resolutionNotes?: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'chat' | 'delivery' | 'dispute' | 'system';
  linkId?: string; // e.g. orderId or chatId
  isRead: boolean;
  createdAt: any;
}
