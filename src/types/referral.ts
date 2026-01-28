export interface Referral {
  id: string;
  referrerId: string;            // UID of user who made the referral
  referredUserId: string;        // UID of new user who signed up
  referredUserEmail: string;     // Email of referred user (for display)
  voucherAwarded: boolean;       // Whether RM30 voucher was given to referrer
  createdAt: Date;               // When the referral signup occurred
}

export interface ReferralStats {
  totalReferrals: number;
  availableVouchers: number;
  usedVouchers: number;
  totalSavings: number;          // usedVouchers * 30
  referrals: Referral[];
}
