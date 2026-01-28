import {
  collection,
  addDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderItem } from '@/types/order';
import { getUserById, useVouchers, useRegistrationVoucher } from './userService';
import { Address } from '@/types/user';
import { nanoid } from 'nanoid';
import { createOrderStatusNotification } from './notificationService';

/**
 * Voucher validation result
 */
export interface VoucherValidation {
  valid: boolean;
  maxVouchers?: number;
  discount?: number;
  finalTotal?: number;
  message?: string;
}

const VOUCHER_VALUE = 30;
const REGISTRATION_VOUCHER_PERCENT = 0.10;

/**
 * Calculate registration discount (10% of subtotal)
 */
export function calculateRegistrationDiscount(subtotal: number): number {
  return Math.round(subtotal * REGISTRATION_VOUCHER_PERCENT * 100) / 100;
}

/**
 * Validate registration voucher availability
 */
export function validateRegistrationVoucher(
  hasVoucher: boolean,
  alreadyUsed: boolean
): { valid: boolean; message?: string } {
  if (alreadyUsed) {
    return { valid: false, message: 'Registration voucher has already been used.' };
  }
  if (!hasVoucher) {
    return { valid: false, message: 'Registration voucher is not available.' };
  }
  return { valid: true };
}

const VOUCHER_ELIGIBLE_CATEGORIES = [
  '6inch firework series',
  '7inch firework series',
  '8inch & 9inch firework series',
  '10inch firework series',
  '11inch firework series',
  '12inch firework series',
  'Big hole firework series',
];

/**
 * Check if an item's category is eligible for voucher usage
 */
export function isItemVoucherEligible(category?: string): boolean {
  if (!category) return false;
  return VOUCHER_ELIGIBLE_CATEGORIES.some(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Count total quantity of voucher-eligible items
 */
export function countEligibleItems(items: { category?: string; quantity: number }[]): number {
  return items.reduce((sum, item) => {
    if (isItemVoucherEligible(item.category)) {
      return sum + item.quantity;
    }
    return sum;
  }, 0);
}

const toDateValue = (value?: { toDate?: () => Date } | Date) => {
  if (!value) return undefined;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return value as Date;
};

const mapOrderSnapshot = (orderDoc: { id: string; data: () => Record<string, any> }): Order => {
  const data = orderDoc.data();
  return {
    ...data,
    id: orderDoc.id,
    createdAt: toDateValue(data.createdAt) || new Date(),
    updatedAt: toDateValue(data.updatedAt),
    reviewedAt: toDateValue(data.reviewedAt),
    paymentSubmittedAt: toDateValue(data.paymentSubmittedAt)
  } as Order;
};

/**
 * Validate voucher usage based on eligible items in cart
 * Rule: 1 voucher (worth RM30) per eligible firework item (6-inch series and above)
 */
export function validateVoucherUsage(
  items: { category?: string; quantity: number }[],
  vouchersToUse: number,
  availableVouchers: number
): VoucherValidation {
  // Calculate maximum vouchers allowed based on eligible item count
  const maxVouchers = countEligibleItems(items);

  // Check if user has enough vouchers
  if (vouchersToUse > availableVouchers) {
    return {
      valid: false,
      message: `You only have ${availableVouchers} voucher(s) available.`
    };
  }

  // Check if user is trying to use more vouchers than allowed
  if (vouchersToUse > maxVouchers) {
    return {
      valid: false,
      maxVouchers,
      message: `You can only use ${maxVouchers} voucher(s) based on eligible firework items in your cart.`
    };
  }

  // Validation passed
  const discount = vouchersToUse * VOUCHER_VALUE;
  const finalTotal = items.reduce((sum, item) => sum + ((item as OrderItem).price || 0) * item.quantity, 0) - discount;

  return {
    valid: true,
    maxVouchers,
    discount,
    finalTotal: Math.max(finalTotal, 0),
    message: `${vouchersToUse} voucher(s) applied. You save RM${discount}!`
  };
}

/**
 * Calculate maximum vouchers that can be used based on eligible items
 */
export function calculateMaxVouchers(items: { category?: string; quantity: number }[]): number {
  return countEligibleItems(items);
}

/**
 * Calculate discount amount for given number of vouchers
 */
export function calculateVoucherDiscount(voucherCount: number): number {
  return voucherCount * VOUCHER_VALUE;
}

/**
 * Create a new order
 */
export async function createOrder(params: {
  userId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryArea: string;
  deliveryAreaName: string;
  deliveryFee: number;
  vouchersToUse?: number;
  promotionType?: 'none' | 'referral' | 'registration';
  paymentProofUrl?: string;
  paymentProofPath?: string;
  paymentMethod?: 'touch_n_go' | 'cod';
  paymentAccountName?: string;
  orderId?: string;
}): Promise<Order> {
  try {
    const {
      userId,
      items,
      deliveryAddress,
      deliveryArea,
      deliveryAreaName,
      deliveryFee,
      vouchersToUse = 0,
      promotionType = 'none',
      paymentProofUrl,
      paymentProofPath,
      paymentMethod,
      paymentAccountName,
      orderId: providedOrderId
    } = params;

    if (!userId) {
      throw new Error('User ID is required to place an order.');
    }

    // Get user to verify voucher availability
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let voucherDiscount = 0;
    let registrationDiscount = 0;
    let appliedVouchers = 0;

    if (promotionType === 'referral' && vouchersToUse > 0) {
      // Validate referral voucher usage
      const validation = validateVoucherUsage(items, vouchersToUse, user.vouchers);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      voucherDiscount = calculateVoucherDiscount(vouchersToUse);
      appliedVouchers = vouchersToUse;
    } else if (promotionType === 'registration') {
      // Validate registration voucher
      const regValidation = validateRegistrationVoucher(
        user.hasRegistrationVoucher,
        user.registrationVoucherUsed
      );
      if (!regValidation.valid) {
        throw new Error(regValidation.message);
      }
      registrationDiscount = calculateRegistrationDiscount(subtotal);
    }

    // Calculate pricing
    const totalDiscount = voucherDiscount + registrationDiscount;
    const totalAmount = Math.max(subtotal - totalDiscount + deliveryFee, 0);

    // Generate order ID
    const orderId = providedOrderId || `ORD-${nanoid(10).toUpperCase()}`;

    // Create order object
    const order: Order = {
      orderId,
      userId,
      items,
      subtotal,
      vouchersApplied: appliedVouchers,
      voucherDiscount,
      totalAmount,
      promotionType,
      registrationDiscount: registrationDiscount > 0 ? registrationDiscount : undefined,
      deliveryArea,
      deliveryAreaName,
      deliveryFee,
      deliveryAddress,
      status: 'pending',
      paymentMethod,
      paymentAccountName,
      paymentProofUrl,
      paymentProofPath,
      paymentSubmittedAt: paymentProofUrl ? new Date() : undefined,
      createdAt: new Date()
    };

    const orderData = Object.fromEntries(
      Object.entries(order).filter(([, value]) => value !== undefined)
    );

    // Save order to Firestore
    await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: order.createdAt
    });

    // Deduct vouchers or consume registration voucher
    if (promotionType === 'referral' && appliedVouchers > 0) {
      await useVouchers(userId, appliedVouchers);
    } else if (promotionType === 'registration') {
      await useRegistrationVoucher(userId);
    }

    console.log(`Order created: ${orderId} for user ${userId}`);

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Get order document reference by orderId field
 */
async function getOrderDocByOrderId(orderId: string) {
  const q = query(
    collection(db, 'orders'),
    where('orderId', '==', orderId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0];
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getOrderDocByOrderId(orderId);

    if (!orderDoc) {
      return null;
    }

    return mapOrderSnapshot(orderDoc);
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    if (!userId) {
      return [];
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    const orders = querySnapshot.docs.map(mapOrderSnapshot);
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}

/**
 * Get orders by status for a user
 */
export async function getUserOrdersByStatus(
  userId: string,
  status: Order['status']
): Promise<Order[]> {
  try {
    if (!userId) {
      return [];
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      where('status', '==', status)
    );

    const querySnapshot = await getDocs(q);

    const orders = querySnapshot.docs.map(mapOrderSnapshot);
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting user orders by status:', error);
    throw error;
  }
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders(): Promise<Order[]> {
  try {
    const q = query(collection(db, 'orders'));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(mapOrderSnapshot);
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
}

/**
 * Get orders by status (admin)
 */
export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(mapOrderSnapshot);
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error getting orders by status:', error);
    throw error;
  }
}

/**
 * Update order status (admin)
 */
export async function updateOrderStatus(params: {
  orderId: string;
  status: Order['status'];
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}): Promise<void> {
  try {
    if (!params.orderId) {
      throw new Error('Order ID is required');
    }

    const orderDoc = await getOrderDocByOrderId(params.orderId);
    if (!orderDoc) {
      throw new Error('Order not found');
    }

    const updatePayload: Partial<Order> = {
      status: params.status,
      updatedAt: new Date()
    };

    if (params.reviewedBy) {
      updatePayload.reviewedBy = params.reviewedBy;
    }

    if (params.adminNotes) {
      updatePayload.adminNotes = params.adminNotes;
    }

    if (params.rejectionReason) {
      updatePayload.rejectionReason = params.rejectionReason;
    }

    if (params.status === 'approved' || params.status === 'rejected') {
      updatePayload.reviewedAt = new Date();
    }

    await updateDoc(doc(db, 'orders', orderDoc.id), updatePayload);

    try {
      const orderData = orderDoc.data() as { userId?: string; orderId?: string };
      if (orderData?.userId) {
        await createOrderStatusNotification({
          userId: orderData.userId,
          orderId: orderData.orderId || params.orderId,
          status: params.status,
          rejectionReason: params.rejectionReason
        });
      }
    } catch (notificationError) {
      console.error('Error creating order status notification:', notificationError);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Get order statistics for a user
 */
export async function getUserOrderStats(userId: string) {
  try {
    const orders = await getUserOrders(userId);

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: orders.filter(o => o.status === 'delivered').length,
      totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      totalSaved: orders.reduce((sum, order) => sum + order.voucherDiscount, 0)
    };

    return stats;
  } catch (error) {
    console.error('Error getting user order stats:', error);
    throw error;
  }
}
