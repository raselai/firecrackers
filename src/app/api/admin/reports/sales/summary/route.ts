import { NextResponse } from 'next/server';
import { FieldPath } from 'firebase-admin/firestore';
import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { aggregateSalesOrders, buildDateKeys, formatDateKey, normalizeDateRange, toDate } from '@/lib/server/salesReport';
import { SalesDailyBreakdown, SalesSummaryResponse } from '@/types/salesReport';

function emptyBreakdown(): SalesDailyBreakdown {
  return {
    orderCount: 0,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    grossLoss: 0,
    discountTotal: 0,
    deliverySubsidy: 0
  };
}

function parseDailySummaryDocs(
  docs: Array<{ id: string; data: () => Record<string, unknown> }>,
  from: string,
  to: string
): SalesSummaryResponse {
  const dateKeys = buildDateKeys(from, to);
  const dailyMap = new Map<string, SalesDailyBreakdown>(
    dateKeys.map((key) => [key, emptyBreakdown()])
  );
  const byPaymentMethod: Record<string, SalesDailyBreakdown> = {};
  const byPromotionType: Record<string, SalesDailyBreakdown> = {};
  let estimatedCostOrderCount = 0;
  let returnedCount = 0;
  let returnedAmount = 0;

  docs.forEach((doc) => {
    const data = doc.data();
    const totals = (data.totals || {}) as Record<string, number>;
    if (!dailyMap.has(doc.id)) {
      return;
    }
    dailyMap.set(doc.id, {
      orderCount: Number(totals.orderCount || 0),
      revenue: Number(totals.revenue || 0),
      cogs: Number(totals.cogs || 0),
      grossProfit: Number(totals.grossProfit || 0),
      grossLoss: Number(totals.grossLoss || 0),
      discountTotal: Number(totals.discountTotal || 0),
      deliverySubsidy: Number(totals.deliverySubsidy || 0)
    });
    estimatedCostOrderCount += Number(totals.estimatedCostOrderCount || 0);
    returnedCount += Number(totals.returnedCount || 0);
    returnedAmount += Number(totals.returnedAmount || 0);

    const paymentMap = (data.byPaymentMethod || {}) as Record<string, SalesDailyBreakdown>;
    Object.entries(paymentMap).forEach(([key, slice]) => {
      if (!byPaymentMethod[key]) byPaymentMethod[key] = emptyBreakdown();
      byPaymentMethod[key].orderCount += Number(slice.orderCount || 0);
      byPaymentMethod[key].revenue += Number(slice.revenue || 0);
      byPaymentMethod[key].cogs += Number(slice.cogs || 0);
      byPaymentMethod[key].grossProfit += Number(slice.grossProfit || 0);
      byPaymentMethod[key].grossLoss += Number(slice.grossLoss || 0);
      byPaymentMethod[key].discountTotal += Number(slice.discountTotal || 0);
      byPaymentMethod[key].deliverySubsidy += Number(slice.deliverySubsidy || 0);
    });

    const promotionMap = (data.byPromotionType || {}) as Record<string, SalesDailyBreakdown>;
    Object.entries(promotionMap).forEach(([key, slice]) => {
      if (!byPromotionType[key]) byPromotionType[key] = emptyBreakdown();
      byPromotionType[key].orderCount += Number(slice.orderCount || 0);
      byPromotionType[key].revenue += Number(slice.revenue || 0);
      byPromotionType[key].cogs += Number(slice.cogs || 0);
      byPromotionType[key].grossProfit += Number(slice.grossProfit || 0);
      byPromotionType[key].grossLoss += Number(slice.grossLoss || 0);
      byPromotionType[key].discountTotal += Number(slice.discountTotal || 0);
      byPromotionType[key].deliverySubsidy += Number(slice.deliverySubsidy || 0);
    });
  });

  const daily = dateKeys.map((date) => ({ date, ...dailyMap.get(date)! }));
  const totals = daily.reduce(
    (acc, row) => {
      acc.orderCount += row.orderCount;
      acc.revenue += row.revenue;
      acc.cogs += row.cogs;
      acc.grossProfit += row.grossProfit;
      acc.grossLoss += row.grossLoss;
      acc.discountTotal += row.discountTotal;
      acc.deliverySubsidy += row.deliverySubsidy;
      return acc;
    },
    { ...emptyBreakdown(), estimatedCostOrderCount, returnedCount, returnedAmount }
  );

  return {
    from,
    to,
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    totals,
    daily,
    byPaymentMethod,
    byPromotionType
  };
}

async function computeFromOrders(from: string, to: string): Promise<SalesSummaryResponse> {
  const db = getAdminDb();
  const snapshot = await db.collection('orders').where('status', '==', 'delivered').get();
  const orders = snapshot.docs.map((doc) => ({ orderId: doc.id, ...doc.data() }));
  const summary = aggregateSalesOrders(orders, from, to);

  const returnedSnapshot = await db.collection('orders').where('status', '==', 'returned').get();
  const validDateKeys = new Set(buildDateKeys(from, to));
  const returnedOrders = returnedSnapshot.docs
    .map((doc) => doc.data() as Record<string, unknown>)
    .filter((order) => {
      const returnedAt = toDate(order.returnedAt) || toDate(order.updatedAt) || toDate(order.createdAt);
      if (!returnedAt) return false;
      return validDateKeys.has(formatDateKey(returnedAt));
    });

  const returnedCount = returnedOrders.length;
  const returnedAmount = returnedOrders.reduce(
    (sum, order) => sum + Number(order.returnAmount || order.totalAmount || 0),
    0
  );

  summary.totals.returnedCount = returnedCount;
  summary.totals.returnedAmount = returnedAmount;
  return summary;
}

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const url = new URL(request.url);
    const { from, to } = normalizeDateRange(url.searchParams.get('from'), url.searchParams.get('to'));
    const raw = url.searchParams.get('raw') === '1';

    if (raw) {
      const response = await computeFromOrders(from, to);
      return NextResponse.json(response);
    }

    const db = getAdminDb();
    const summarySnapshot = await db
      .collection('sales_daily')
      .where(FieldPath.documentId(), '>=', from)
      .where(FieldPath.documentId(), '<=', to)
      .get();

    if (summarySnapshot.empty) {
      const fallback = await computeFromOrders(from, to);
      return NextResponse.json(fallback);
    }

    const parsed = parseDailySummaryDocs(
      summarySnapshot.docs.map((doc) => ({ id: doc.id, data: () => doc.data() as Record<string, unknown> })),
      from,
      to
    );
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to fetch sales summary:', error);
    return NextResponse.json({ error: 'Failed to fetch sales summary.' }, { status: 500 });
  }
}
