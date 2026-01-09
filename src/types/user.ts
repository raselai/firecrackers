import { CartItem } from './cart';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin';

  // Referral System
  referralCode: string;        // e.g., "FW-ABC123"
  referredBy?: string;          // UID of user who referred them
  referralCount: number;        // Number of successful referrals

  // Voucher System (RM20 per voucher)
  vouchers: number;             // Available vouchers
  vouchersUsed: number;         // Total vouchers used

  // Features
  wishlist: string[];           // Product IDs
  cart: CartItem[];
  addresses: Address[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
}

export interface Address {
  id: string;
  label: string;               // e.g., "Home", "Office"
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}
