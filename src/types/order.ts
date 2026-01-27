import { Address } from './user';

export interface Order {
  id?: string;
  orderId: string;
  userId: string;
  items: OrderItem[];

  // Pricing
  subtotal: number;              // Total before voucher discount
  vouchersApplied: number;       // Number of vouchers used
  voucherDiscount: number;       // vouchersApplied * 20 (RM)
  totalAmount: number;           // subtotal - voucherDiscount + deliveryFee

  // Delivery
  deliveryArea: string;          // Area ID (e.g., 'kuala-lumpur')
  deliveryAreaName: string;      // Display name (e.g., 'Kuala Lumpur (city center)')
  deliveryFee: number;           // Delivery fee amount
  deliveryAddress: Address;

  // Payment
  paymentMethod?: 'touch_n_go';
  paymentAccountName?: string;
  paymentProofUrl?: string;
  paymentProofPath?: string;
  paymentSubmittedAt?: Date;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;

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
}
