import { Address } from './user';

export interface Order {
  id?: string;
  orderId: string;
  userId: string;
  items: OrderItem[];

  // Pricing
  subtotal: number;              // Total before voucher discount
  vouchersApplied: number;       // Number of vouchers used
  voucherDiscount: number;       // vouchersApplied * 30 (RM)
  totalAmount: number;           // subtotal - voucherDiscount + deliveryFee
  discountTotal?: number;        // voucherDiscount + registrationDiscount

  // Delivery
  deliveryArea: string;          // Area ID (e.g., 'kuala-lumpur')
  deliveryAreaName: string;      // Display name (e.g., 'Kuala Lumpur (city center)')
  baseDeliveryFee?: number;      // Delivery fee before free-delivery rule
  deliveryFee: number;           // Delivery fee amount
  isFreeDelivery?: boolean;
  deliveryAddress: Address;

  // Payment
  paymentMethod?: 'touch_n_go' | 'cod';
  paymentAccountName?: string;
  paymentProofUrl?: string;
  paymentProofPath?: string;
  paymentSubmittedAt?: Date;
  deliveryFeePaid?: boolean;
  codRequiredPaymentAmount?: number;

  // Promotion tracking
  promotionType?: 'none' | 'referral' | 'registration';
  registrationDiscount?: number;  // 10% of subtotal when registration voucher used

  // Reporting fields
  recognizedAt?: Date;
  reportingCurrency?: 'MYR';
  reportingTimezone?: 'Asia/Kuala_Lumpur';
  financialVersion?: number;
  cogs?: number;
  deliverySubsidy?: number;
  grossProfit?: number;
  grossLoss?: number;
  costEstimatedItemCount?: number;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  returnedAt?: Date;
  returnReason?: string;
  returnAmount?: number;

  // Notes
  adminNotes?: string;

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;                 // Price per unit at time of order
  category?: string;             // Product category for voucher eligibility
  unitCostAtOrder?: number;
  lineRevenue?: number;
  lineCost?: number;
  lineProfit?: number;
  costEstimated?: boolean;
}

