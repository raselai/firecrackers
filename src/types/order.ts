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
  totalAmount: number;           // subtotal - voucherDiscount

  // Delivery
  deliveryAddress: Address;

  // Payment
  paymentMethod?: 'touch_n_go';
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
