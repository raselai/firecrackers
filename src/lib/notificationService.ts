import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from '@/types/notification';
import { Order } from '@/types/order';

const toDateValue = (value?: { toDate?: () => Date } | Date) => {
  if (!value) return undefined;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return value as Date;
};

const mapNotificationSnapshot = (notificationDoc: { id: string; data: () => Record<string, any> }): Notification => {
  const data = notificationDoc.data();
  return {
    ...data,
    id: notificationDoc.id,
    createdAt: toDateValue(data.createdAt) || new Date()
  } as Notification;
};

const statusCopy: Record<Order['status'], { title: string; message: string }> = {
  pending: {
    title: 'Order pending',
    message: 'We have received your order and will review your payment proof shortly.'
  },
  approved: {
    title: 'Order approved',
    message: 'Your payment has been approved. We are preparing your order.'
  },
  rejected: {
    title: 'Order rejected',
    message: 'Your payment could not be verified. Please contact support if needed.'
  },
  confirmed: {
    title: 'Order confirmed',
    message: 'Your order is confirmed and will be packed soon.'
  },
  shipped: {
    title: 'Order shipped',
    message: 'Your order is on the way.'
  },
  delivered: {
    title: 'Order delivered',
    message: 'Your order has been delivered. Thank you for shopping with us!'
  },
  cancelled: {
    title: 'Order cancelled',
    message: 'Your order has been cancelled.'
  }
};

export async function createOrderStatusNotification(params: {
  userId: string;
  orderId: string;
  status: Order['status'];
  rejectionReason?: string;
}): Promise<void> {
  if (!params.userId) {
    return;
  }

  const copy = statusCopy[params.status];
  const orderLabel = params.orderId ? `Order ${params.orderId}` : 'Your order';
  let message = `${orderLabel}: ${copy.message}`;

  if (params.status === 'rejected' && params.rejectionReason) {
    message = `${orderLabel} was rejected. Reason: ${params.rejectionReason}`;
  }

  await addDoc(collection(db, 'notifications'), {
    userId: params.userId,
    type: 'order_status',
    title: copy.title,
    message,
    orderId: params.orderId,
    read: false,
    createdAt: new Date()
  });
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapNotificationSnapshot);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  if (!notificationId) {
    return;
  }
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (!userId) {
    return;
  }

  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((notification) => {
    batch.update(notification.ref, { read: true });
  });
  await batch.commit();
}
