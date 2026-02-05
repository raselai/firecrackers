export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function minusDaysKey(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function startOfMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function lastMonthRange(): { from: string; to: string } {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const last = new Date(d.getFullYear(), d.getMonth(), 0);
  return { from: first.toISOString().slice(0, 10), to: last.toISOString().slice(0, 10) };
}

export interface DatePreset {
  label: string;
  key: string;
  getRange: () => { from: string; to: string };
}

export const DATE_PRESETS: DatePreset[] = [
  { label: 'Today', key: 'today', getRange: () => ({ from: todayKey(), to: todayKey() }) },
  { label: '7 Days', key: '7d', getRange: () => ({ from: minusDaysKey(6), to: todayKey() }) },
  { label: '30 Days', key: '30d', getRange: () => ({ from: minusDaysKey(29), to: todayKey() }) },
  { label: 'This Month', key: 'month', getRange: () => ({ from: startOfMonth(), to: todayKey() }) },
  { label: 'Last Month', key: 'lastMonth', getRange: () => lastMonthRange() },
];

/** Shift a date range backwards by its own length to get the previous period. */
export function getPreviousPeriodRange(from: string, to: string): { from: string; to: string } {
  const fromDate = new Date(from + 'T00:00:00');
  const toDate = new Date(to + 'T00:00:00');
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const prevTo = new Date(fromDate);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - days + 1);
  return { from: prevFrom.toISOString().slice(0, 10), to: prevTo.toISOString().slice(0, 10) };
}

/** Percentage change, null if previous is 0. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

import { SalesDailyBreakdown, SalesSummaryResponse } from '@/types/salesReport';

/** Get totals filtered by payment method or promotion type. */
export function getFilteredTotals(
  summary: SalesSummaryResponse,
  paymentFilter: string | null,
  promotionFilter: string | null
): SalesDailyBreakdown & { returnedCount: number; returnedAmount: number; estimatedCostOrderCount: number } {
  if (paymentFilter && summary.byPaymentMethod[paymentFilter]) {
    const b = summary.byPaymentMethod[paymentFilter];
    return { ...b, returnedCount: 0, returnedAmount: 0, estimatedCostOrderCount: 0 };
  }
  if (promotionFilter && summary.byPromotionType[promotionFilter]) {
    const b = summary.byPromotionType[promotionFilter];
    return { ...b, returnedCount: 0, returnedAmount: 0, estimatedCostOrderCount: 0 };
  }
  return summary.totals;
}
