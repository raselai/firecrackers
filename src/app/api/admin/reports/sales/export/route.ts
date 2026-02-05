import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { normalizeDateRange } from '@/lib/server/salesReport';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { aggregateSalesOrders, buildDateKeys, formatDateKey, toDate } from '@/lib/server/salesReport';

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);
    const url = new URL(request.url);
    const { from, to } = normalizeDateRange(url.searchParams.get('from'), url.searchParams.get('to'));

    const db = getAdminDb();
    const delivered = await db.collection('orders').where('status', '==', 'delivered').get();
    const summary = aggregateSalesOrders(
      delivered.docs.map((doc) => ({ orderId: doc.id, ...doc.data() })),
      from,
      to
    );
    const returned = await db.collection('orders').where('status', '==', 'returned').get();
    const validDateKeys = new Set(buildDateKeys(from, to));
    const returnedRows = returned.docs.filter((doc) => {
      const data = doc.data() as Record<string, unknown>;
      const returnedAt = toDate(data.returnedAt) || toDate(data.updatedAt) || toDate(data.createdAt);
      return returnedAt ? validDateKeys.has(formatDateKey(returnedAt)) : false;
    });
    summary.totals.returnedCount = returnedRows.length;
    summary.totals.returnedAmount = returnedRows.reduce(
      (sum, doc) => sum + Number((doc.data() as Record<string, unknown>).returnAmount || (doc.data() as Record<string, unknown>).totalAmount || 0),
      0
    );

    const header = [
      'date',
      'orders',
      'revenue_myr',
      'cogs_myr',
      'gross_profit_myr',
      'gross_loss_myr',
      'discount_total_myr',
      'delivery_subsidy_myr',
      'returned_count',
      'returned_amount_myr'
    ];

    const rows = summary.daily.map((row) => [
      row.date,
      row.orderCount,
      row.revenue.toFixed(2),
      row.cogs.toFixed(2),
      row.grossProfit.toFixed(2),
      row.grossLoss.toFixed(2),
      row.discountTotal.toFixed(2),
      row.deliverySubsidy.toFixed(2),
      0,
      '0.00'
    ]);

    rows.push([
      'TOTAL',
      summary.totals.orderCount,
      summary.totals.revenue.toFixed(2),
      summary.totals.cogs.toFixed(2),
      summary.totals.grossProfit.toFixed(2),
      summary.totals.grossLoss.toFixed(2),
      summary.totals.discountTotal.toFixed(2),
      summary.totals.deliverySubsidy.toFixed(2),
      summary.totals.returnedCount,
      summary.totals.returnedAmount.toFixed(2)
    ]);

    const csv = [header, ...rows].map((row) => row.map((value) => csvEscape(value)).join(',')).join('\n');
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sales-report-${from}-to-${to}.csv"`
      }
    });
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    console.error('Failed to export sales report:', error);
    return new Response(JSON.stringify({ error: 'Failed to export report.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
