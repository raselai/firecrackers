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
import { getUserById, useVouchers } from './userService';
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
 * Validate voucher usage based on cart total
 * Rule: Must spend RM100 to use 1 voucher (worth RM20)
 *
 * Examples:
 * - RM80 cart → max 0 vouchers
 * - RM150 cart → max 1 voucher (RM20 discount)
 * - RM350 cart → max 3 vouchers (RM60 discount)
 */
export function validateVoucherUsage(
  subtotal: number,
  vouchersToUse: number,
  availableVouchers: number
): VoucherValidation {
  // Calculate maximum vouchers allowed based on cart total
  // floor(subtotal / 100) = max vouchers
  const maxVouchers = Math.floor(subtotal / 100);

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
      message: `You can only use ${maxVouchers} voucher(s) for RM${subtotal.toFixed(2)}. You must spend at least RM100 per voucher.`
    };
  }

  // Validation passed
  const discount = vouchersToUse * 20; // Each voucher worth RM20
  const finalTotal = subtotal - discount;

  return {
    valid: true,
    maxVouchers,
    discount,
    finalTotal,
    message: `${vouchersToUse} voucher(s) applied. You save RM${discount}!`
  };
}

/**
 * Calculate maximum vouchers that can be used for a given subtotal
 */
export function calculateMaxVouchers(subtotal: number): number {
  return Math.floor(subtotal / 100);
}

/**
 * Calculate discount amount for given number of vouchers
 */
export function calculateVoucherDiscount(voucherCount: number): number {
  return voucherCount * 20;
}

/**
 * Create a new order
 */
export async function createOrder(params: {
  userId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  vouchersToUse?: number;
  paymentProofUrl?: string;
  paymentProofPath?: string;
  paymentMethod?: 'touch_n_go';
  orderId?: string;
}): Promise<Order> {
  try {
    const {
      userId,
      items,
      deliveryAddress,
      vouchersToUse = 0,
      paymentProofUrl,
      paymentProofPath,
      paymentMethod,
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

    // Validate voucher usage
    const validation = validateVoucherUsage(subtotal, vouchersToUse, user.vouchers);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    // Calculate pricing
    const voucherDiscount = calculateVoucherDiscount(vouchersToUse);
    const totalAmount = subtotal - voucherDiscount;

    // Generate order ID
    const orderId = providedOrderId || `ORD-${nanoid(10).toUpperCase()}`;

    // Create order object
    const order: Order = {
      orderId,
      userId,
      items,
      subtotal,
      vouchersApplied: vouchersToUse,
      voucherDiscount,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      paymentMethod,
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

    // Deduct vouchers from user account
    if (vouchersToUse > 0) {
      await useVouchers(userId, vouchersToUse);
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
