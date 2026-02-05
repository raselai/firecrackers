import { Timestamp } from 'firebase-admin/firestore';
import { SalesDailyBreakdown, SalesDailyRow, SalesSummaryResponse, SalesSummaryTotals } from '@/types/salesReport';

const TIMEZONE = 'Asia/Kuala_Lumpur';

type SalesOrderLike = {
  orderId?: string;
  status?: string;
  totalAmount?: number;
  cogs?: number;
  grossProfit?: number;
  grossLoss?: number;
  discountTotal?: number;
  deliverySubsidy?: number;
  paymentMethod?: string;
  promotionType?: string;
  recognizedAt?: Date | Timestamp;
  createdAt?: Date | Timestamp;
  costEstimatedItemCount?: number;
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'object' && value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function normalizeDateRange(from?: string | null, to?: string | null): { from: string; to: string } {
  if (from && to) {
    return { from, to };
  }

  const now = new Date();
  const end = formatDateKey(now);
  const start = new Date(now);
  start.setDate(start.getDate() - 29);
  return { from: from || formatDateKey(start), to: to || end };
}

export function buildDateKeys(from: string, to: string): string[] {
  const keys: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);

  while (cursor.getTime() <= end.getTime()) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return keys;
}

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

function addBreakdown(target: SalesDailyBreakdown, next: SalesDailyBreakdown) {
  target.orderCount += next.orderCount;
  target.revenue = roundMoney(target.revenue + next.revenue);
  target.cogs = roundMoney(target.cogs + next.cogs);
  target.grossProfit = roundMoney(target.grossProfit + next.grossProfit);
  target.grossLoss = roundMoney(target.grossLoss + next.grossLoss);
  target.discountTotal = roundMoney(target.discountTotal + next.discountTotal);
  target.deliverySubsidy = roundMoney(target.deliverySubsidy + next.deliverySubsidy);
}

function orderToBreakdown(order: SalesOrderLike): SalesDailyBreakdown {
  const revenue = Number(order.totalAmount || 0);
  const cogs = Number(order.cogs || 0);
  const discountTotal = Number(order.discountTotal || 0);
  const deliverySubsidy = Number(order.deliverySubsidy || 0);
  const grossProfit = Number(order.grossProfit || 0);
  const grossLoss = Number(order.grossLoss || (grossProfit < 0 ? Math.abs(grossProfit) : 0));

  return {
    orderCount: 1,
    revenue: roundMoney(revenue),
    cogs: roundMoney(cogs),
    grossProfit: roundMoney(grossProfit),
    grossLoss: roundMoney(grossLoss),
    discountTotal: roundMoney(discountTotal),
    deliverySubsidy: roundMoney(deliverySubsidy)
  };
}

export function aggregateSalesOrders(
  orders: SalesOrderLike[],
  from: string,
  to: string
): SalesSummaryResponse {
  const dayKeys = buildDateKeys(from, to);
  const dailyMap = new Map<string, SalesDailyBreakdown>();
  dayKeys.forEach((dateKey) => dailyMap.set(dateKey, emptyBreakdown()));

  const totals: SalesSummaryTotals = {
    ...emptyBreakdown(),
    estimatedCostOrderCount: 0,
    returnedCount: 0,
    returnedAmount: 0
  };

  const byPaymentMethod: Record<string, SalesDailyBreakdown> = {};
  const byPromotionType: Record<string, SalesDailyBreakdown> = {};

  orders.forEach((order) => {
    const recognizedAt = toDate(order.recognizedAt) || toDate(order.createdAt);
    if (!recognizedAt) {
      return;
    }
    const dateKey = formatDateKey(recognizedAt);
    if (!dailyMap.has(dateKey)) {
      return;
    }

    const slice = orderToBreakdown(order);
    addBreakdown(dailyMap.get(dateKey)!, slice);
    addBreakdown(totals, slice);

    totals.estimatedCostOrderCount += order.costEstimatedItemCount && order.costEstimatedItemCount > 0 ? 1 : 0;

    const paymentKey = order.paymentMethod || 'unknown';
    if (!byPaymentMethod[paymentKey]) byPaymentMethod[paymentKey] = emptyBreakdown();
    addBreakdown(byPaymentMethod[paymentKey], slice);

    const promotionKey = order.promotionType || 'none';
    if (!byPromotionType[promotionKey]) byPromotionType[promotionKey] = emptyBreakdown();
    addBreakdown(byPromotionType[promotionKey], slice);
  });

  const daily: SalesDailyRow[] = dayKeys.map((date) => ({
    date,
    ...dailyMap.get(date)!
  }));

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

export function mergeSummary(
  base: SalesSummaryResponse,
  override: SalesSummaryResponse
): SalesSummaryResponse {
  const dailyMap = new Map(override.daily.map((row) => [row.date, row]));
  const daily = base.daily.map((row) => dailyMap.get(row.date) || row);
  return {
    ...override,
    daily
  };
}
