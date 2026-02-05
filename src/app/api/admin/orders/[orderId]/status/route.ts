import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { formatDateKey, toDate } from '@/lib/server/salesReport';

type StatusPayload = {
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  reviewedBy?: string;
  rejectionReason?: string;
  returnReason?: string;
  returnAmount?: number;
  adminNotes?: string;
};

type FinancialSnapshot = {
  totalAmount: number;
  cogs: number;
  grossProfit: number;
  grossLoss: number;
  discountTotal: number;
  deliverySubsidy: number;
  paymentMethod: string;
  promotionType: string;
  costEstimatedItemCount: number;
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const STATUS_TRANSITIONS: Record<StatusPayload['status'], StatusPayload['status'][]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['confirmed', 'cancelled'],
  rejected: [],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['returned'],
  returned: [],
  cancelled: []
};

function toFinancialSnapshot(data: Record<string, unknown>): FinancialSnapshot {
  const grossProfit = Number(data.grossProfit || 0);
  return {
    totalAmount: Number(data.totalAmount || 0),
    cogs: Number(data.cogs || 0),
    grossProfit,
    grossLoss: Number(data.grossLoss || (grossProfit < 0 ? Math.abs(grossProfit) : 0)),
    discountTotal: Number(data.discountTotal || 0),
    deliverySubsidy: Number(data.deliverySubsidy || 0),
    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod : 'unknown',
    promotionType: typeof data.promotionType === 'string' ? data.promotionType : 'none',
    costEstimatedItemCount: Number(data.costEstimatedItemCount || 0)
  };
}

function incrementPayload(snapshot: FinancialSnapshot, sign: 1 | -1) {
  const amountSign = sign === 1 ? 1 : -1;
  const paymentMethod = snapshot.paymentMethod || 'unknown';
  const promotionType = snapshot.promotionType || 'none';

  return {
    orderCount: amountSign,
    revenue: roundMoney(snapshot.totalAmount * amountSign),
    cogs: roundMoney(snapshot.cogs * amountSign),
    grossProfit: roundMoney(snapshot.grossProfit * amountSign),
    grossLoss: roundMoney(snapshot.grossLoss * amountSign),
    discountTotal: roundMoney(snapshot.discountTotal * amountSign),
    deliverySubsidy: roundMoney(snapshot.deliverySubsidy * amountSign),
    estimatedCostOrderCount: snapshot.costEstimatedItemCount > 0 ? amountSign : 0,
    paymentMethod,
    promotionType
  };
}

async function applySalesDailyDelta(dateKey: string, snapshot: FinancialSnapshot, sign: 1 | -1): Promise<void> {
  const db = getAdminDb();
  const delta = incrementPayload(snapshot, sign);
  const dailyRef = db.collection('sales_daily').doc(dateKey);

  await dailyRef.set(
    {
      dateKey,
      currency: 'MYR',
      timezone: 'Asia/Kuala_Lumpur',
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const paymentRoot = `byPaymentMethod.${delta.paymentMethod}`;
  const promotionRoot = `byPromotionType.${delta.promotionType}`;

  await dailyRef.update({
    updatedAt: FieldValue.serverTimestamp(),
    'totals.orderCount': FieldValue.increment(delta.orderCount),
    'totals.revenue': FieldValue.increment(delta.revenue),
    'totals.cogs': FieldValue.increment(delta.cogs),
    'totals.grossProfit': FieldValue.increment(delta.grossProfit),
    'totals.grossLoss': FieldValue.increment(delta.grossLoss),
    'totals.discountTotal': FieldValue.increment(delta.discountTotal),
    'totals.deliverySubsidy': FieldValue.increment(delta.deliverySubsidy),
    'totals.estimatedCostOrderCount': FieldValue.increment(delta.estimatedCostOrderCount),
    [`${paymentRoot}.orderCount`]: FieldValue.increment(delta.orderCount),
    [`${paymentRoot}.revenue`]: FieldValue.increment(delta.revenue),
    [`${paymentRoot}.cogs`]: FieldValue.increment(delta.cogs),
    [`${paymentRoot}.grossProfit`]: FieldValue.increment(delta.grossProfit),
    [`${paymentRoot}.grossLoss`]: FieldValue.increment(delta.grossLoss),
    [`${paymentRoot}.discountTotal`]: FieldValue.increment(delta.discountTotal),
    [`${paymentRoot}.deliverySubsidy`]: FieldValue.increment(delta.deliverySubsidy),
    [`${promotionRoot}.orderCount`]: FieldValue.increment(delta.orderCount),
    [`${promotionRoot}.revenue`]: FieldValue.increment(delta.revenue),
    [`${promotionRoot}.cogs`]: FieldValue.increment(delta.cogs),
    [`${promotionRoot}.grossProfit`]: FieldValue.increment(delta.grossProfit),
    [`${promotionRoot}.grossLoss`]: FieldValue.increment(delta.grossLoss),
    [`${promotionRoot}.discountTotal`]: FieldValue.increment(delta.discountTotal),
    [`${promotionRoot}.deliverySubsidy`]: FieldValue.increment(delta.deliverySubsidy)
  });
}

async function applyReturnDelta(dateKey: string, returnAmount: number, sign: 1 | -1): Promise<void> {
  const db = getAdminDb();
  const dailyRef = db.collection('sales_daily').doc(dateKey);

  await dailyRef.set(
    {
      dateKey,
      currency: 'MYR',
      timezone: 'Asia/Kuala_Lumpur',
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const amountSign = sign === 1 ? 1 : -1;
  await dailyRef.update({
    updatedAt: FieldValue.serverTimestamp(),
    'totals.returnedCount': FieldValue.increment(amountSign),
    'totals.returnedAmount': FieldValue.increment(roundMoney(returnAmount * amountSign))
  });
}

async function writeStatusNotification(params: {
  userId?: string;
  orderId: string;
  status: StatusPayload['status'];
  rejectionReason?: string;
  returnReason?: string;
}) {
  if (!params.userId) return;

  const statusTitleMap: Record<StatusPayload['status'], string> = {
    pending: 'Order pending',
    approved: 'Order approved',
    rejected: 'Order rejected',
    confirmed: 'Order confirmed',
    shipped: 'Order shipped',
    delivered: 'Order delivered',
    returned: 'Order returned',
    cancelled: 'Order cancelled'
  };

  const defaultMessageMap: Record<StatusPayload['status'], string> = {
    pending: 'We have received your order and will review your payment proof shortly.',
    approved: 'Your payment has been approved. We are preparing your order.',
    rejected: 'Your payment could not be verified. Please contact support if needed.',
    confirmed: 'Your order is confirmed and will be packed soon.',
    shipped: 'Your order is on the way.',
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    returned: 'Your order has been marked as returned.',
    cancelled: 'Your order has been cancelled.'
  };

  let message = `Order ${params.orderId}: ${defaultMessageMap[params.status]}`;
  if (params.status === 'rejected' && params.rejectionReason) {
    message = `Order ${params.orderId} was rejected. Reason: ${params.rejectionReason}`;
  }
  if (params.status === 'returned' && params.returnReason) {
    message = `Order ${params.orderId} was returned. Reason: ${params.returnReason}`;
  }

  await getAdminDb().collection('notifications').add({
    userId: params.userId,
    type: 'order_status',
    title: statusTitleMap[params.status],
    message,
    orderId: params.orderId,
    read: false,
    createdAt: FieldValue.serverTimestamp()
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    await requireAdminFromRequest(request);
    const payload = (await request.json()) as StatusPayload;

    if (!payload.status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const orderSnapshot = await db
      .collection('orders')
      .where('orderId', '==', params.orderId)
      .limit(1)
      .get();

    if (orderSnapshot.empty) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const orderDoc = orderSnapshot.docs[0];
    const current = orderDoc.data() as Record<string, unknown>;
    const previousStatus = typeof current.status === 'string' ? current.status : 'pending';
    const nextStatus = payload.status;
    const now = new Date();

    const allowedNextStatuses = STATUS_TRANSITIONS[previousStatus as StatusPayload['status']] || [];
    if (previousStatus !== nextStatus && !allowedNextStatuses.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition: ${previousStatus} -> ${nextStatus}` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      status: nextStatus,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (payload.reviewedBy) updatePayload.reviewedBy = payload.reviewedBy;
    if (payload.adminNotes) updatePayload.adminNotes = payload.adminNotes;
    if (payload.rejectionReason) updatePayload.rejectionReason = payload.rejectionReason;
    if (payload.returnReason) updatePayload.returnReason = payload.returnReason;

    if (nextStatus === 'approved' || nextStatus === 'rejected') {
      updatePayload.reviewedAt = FieldValue.serverTimestamp();
    }

    if (nextStatus === 'returned') {
      updatePayload.returnedAt = FieldValue.serverTimestamp();
      updatePayload.returnAmount = typeof payload.returnAmount === 'number'
        ? payload.returnAmount
        : Number(current.totalAmount || 0);
    }

    if (previousStatus !== 'delivered' && nextStatus === 'delivered') {
      updatePayload.recognizedAt = FieldValue.serverTimestamp();
    }
    if (previousStatus === 'delivered' && nextStatus !== 'delivered') {
      updatePayload.recognizedAt = null;
    }

    await orderDoc.ref.update(updatePayload);

    const snapshot = toFinancialSnapshot(current);
    if (previousStatus !== 'delivered' && nextStatus === 'delivered') {
      const dateKey = formatDateKey(now);
      await applySalesDailyDelta(dateKey, snapshot, 1);
    } else if (previousStatus === 'delivered' && nextStatus !== 'delivered') {
      const recognizedAtDate = toDate(current.recognizedAt) || toDate(current.createdAt) || now;
      const dateKey = formatDateKey(recognizedAtDate);
      await applySalesDailyDelta(dateKey, snapshot, -1);
    }

    const previousWasReturned = previousStatus === 'returned';
    const nextIsReturned = nextStatus === 'returned';
    const returnAmount = typeof payload.returnAmount === 'number'
      ? payload.returnAmount
      : Number(current.returnAmount || current.totalAmount || 0);
    if (!previousWasReturned && nextIsReturned) {
      await applyReturnDelta(formatDateKey(now), returnAmount, 1);
    } else if (previousWasReturned && !nextIsReturned) {
      const returnedAtDate = toDate(current.returnedAt) || now;
      await applyReturnDelta(formatDateKey(returnedAtDate), returnAmount, -1);
    }

    await writeStatusNotification({
      userId: typeof current.userId === 'string' ? current.userId : undefined,
      orderId: params.orderId,
      status: nextStatus,
      rejectionReason: payload.rejectionReason,
      returnReason: payload.returnReason
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to update admin order status via API:', error);
    return NextResponse.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}
