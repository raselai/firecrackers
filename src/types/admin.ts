import { Address } from './user';

export interface AdminUserListItem {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  referralCode?: string;
  vouchers: number;
  vouchersUsed: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  role: 'customer' | 'admin';
  referredBy?: string;
  referralCount: number;
  hasRegistrationVoucher: boolean;
  registrationVoucherUsed: boolean;
  addresses: Address[];
}

export interface AdminUsersListResponse {
  users: AdminUserListItem[];
  nextCursor?: string;
  hasMore: boolean;
}
