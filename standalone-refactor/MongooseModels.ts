import { Schema, model, Document } from 'mongoose';

// =========================================================================
// 1. USER PROFILE MODEL
// =========================================================================
export interface IUser extends Document {
  uid: string;
  email: string;
  username: string;
  fullName: string;
  avatarURL?: string;
  coverURL?: string;
  bio?: string;
  skills: string[];
  languages: string[];
  role: 'buyer' | 'seller';
  isVerified: boolean;
  totalOrders: number;
  rating: number;
  earnings: number;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  avatarURL: { type: String, default: '' },
  coverURL: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  languages: [{ type: String }],
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  isVerified: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = model<IUser>('User', UserSchema);

// =========================================================================
// 2. GIG LISTING MODEL
// =========================================================================
export interface IPackage {
  title: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
}

export interface IGig extends Document {
  userId: string;
  sellerName: string;
  title: string;
  description: string;
  category: string;
  gallery: string[];
  packages: {
    basic: IPackage;
    standard: IPackage;
    premium: IPackage;
  };
  rating: number;
  reviewsCount: number;
  createdAt: Date;
}

const PackageSchema = new Schema<IPackage>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  revisions: { type: Number, required: true }
});

const GigSchema = new Schema<IGig>({
  userId: { type: String, required: true, ref: 'User' },
  sellerName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  gallery: [{ type: String }],
  packages: {
    basic: { type: PackageSchema, required: true },
    standard: { type: PackageSchema, required: true },
    premium: { type: PackageSchema, required: true }
  },
  rating: { type: Number, default: 5.0 },
  reviewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const GigModel = model<IGig>('Gig', GigSchema);

// =========================================================================
// 3. ORDER ESCROW MODEL
// =========================================================================
export interface IOrder extends Document {
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  gigId: string;
  gigTitle: string;
  packageType: 'basic' | 'standard' | 'premium';
  amount: number;
  reference: string;
  paymentStatus: 'pending' | 'success' | 'simulated_success' | 'failed';
  escrowState: 'escrowed' | 'delivered' | 'completed' | 'disputed' | 'refunded';
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  gigId: { type: String, required: true, ref: 'Gig' },
  gigTitle: { type: String, required: true },
  packageType: { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  amount: { type: Number, required: true },
  reference: { type: String, required: true, unique: true },
  paymentStatus: { type: String, enum: ['pending', 'success', 'simulated_success', 'failed'], default: 'pending' },
  escrowState: { type: String, enum: ['escrowed', 'delivered', 'completed', 'disputed', 'refunded'], default: 'escrowed' },
  createdAt: { type: Date, default: Date.now }
});

export const OrderModel = model<IOrder>('Order', OrderSchema);

// =========================================================================
// 4. MESSAGE CHAT MODEL
// =========================================================================
export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachmentURL?: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  attachmentURL: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const MessageModel = model<IMessage>('Message', MessageSchema);

// =========================================================================
// 5. REVIEW STAR MODEL
// =========================================================================
export interface IReview extends Document {
  gigId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  gigId: { type: String, required: true, ref: 'Gig' },
  buyerId: { type: String, required: true },
  buyerName: { type: String, required: true },
  buyerAvatar: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ReviewModel = model<IReview>('Review', ReviewSchema);
