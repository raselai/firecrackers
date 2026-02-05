export interface SalesDailyBreakdown {
  orderCount: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossLoss: number;
  discountTotal: number;
  deliverySubsidy: number;
}

export interface SalesDailyRow extends SalesDailyBreakdown {
  date: string;
}

export interface SalesSummaryTotals extends SalesDailyBreakdown {
  estimatedCostOrderCount: number;
  returnedCount: number;
  returnedAmount: number;
}

export interface SalesSummaryResponse {
  from: string;
  to: string;
  currency: 'MYR';
  timezone: 'Asia/Kuala_Lumpur';
  totals: SalesSummaryTotals;
  daily: SalesDailyRow[];
  byPaymentMethod: Record<string, SalesDailyBreakdown>;
  byPromotionType: Record<string, SalesDailyBreakdown>;
}
