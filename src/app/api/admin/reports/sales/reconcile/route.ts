import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { aggregateSalesOrders, formatDateKey, normalizeDateRange, toDate } from '@/lib/server/salesReport';

export async function POST(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const body = (await request.json().catch(() => ({}))) as { from?: string; to?: string };
    const { from, to } = normalizeDateRange(body.from || null, body.to || null);

    const db = getAdminDb();
    const delivered = await db.collection('orders').where('status', '==', 'delivered').get();
    const returned = await db.collection('orders').where('status', '==', 'returned').get();
    const summary = aggregateSalesOrders(
      delivered.docs.map((doc) => ({ orderId: doc.id, ...doc.data() })),
      from,
      to
    );

    const returnsByDate = new Map<string, { count: number; amount: number }>();
    returned.docs.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const returnedAt = toDate(data.returnedAt) || toDate(data.updatedAt) || toDate(data.createdAt);
      if (!returnedAt) return;
      const dateKey = formatDateKey(returnedAt);
      const current = returnsByDate.get(dateKey) || { count: 0, amount: 0 };
      current.count += 1;
      current.amount += Number(data.returnAmount || data.totalAmount || 0);
      returnsByDate.set(dateKey, current);
    });

    const batch = db.batch();
    summary.daily.forEach((row) => {
      const dailyRef = db.collection('sales_daily').doc(row.date);
      batch.set(
        dailyRef,
        {
          dateKey: row.date,
          currency: 'MYR',
          timezone: 'Asia/Kuala_Lumpur',
          totals: {
            orderCount: row.orderCount,
            revenue: row.revenue,
            cogs: row.cogs,
            grossProfit: row.grossProfit,
            grossLoss: row.grossLoss,
            discountTotal: row.discountTotal,
            deliverySubsidy: row.deliverySubsidy,
            estimatedCostOrderCount: 0,
            returnedCount: returnsByDate.get(row.date)?.count || 0,
            returnedAmount: returnsByDate.get(row.date)?.amount || 0
          },
          updatedAt: FieldValue.serverTimestamp(),
          lastReconciledAt: FieldValue.serverTimestamp()
        },
        { merge: true }
      );
    });

    await batch.commit();
    return NextResponse.json({ ok: true, from, to, days: summary.daily.length });
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to reconcile sales report:', error);
    return NextResponse.json({ error: 'Failed to reconcile sales report.' }, { status: 500 });
  }
}
