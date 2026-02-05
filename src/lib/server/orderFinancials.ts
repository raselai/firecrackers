import { Product } from '@/types/product';

const REPORTING_CURRENCY = 'MYR' as const;
const REPORTING_TIMEZONE = 'Asia/Kuala_Lumpur' as const;
const FINANCIAL_VERSION = 1;

const roundMoney = (value: number) => Math.round(value * 100) / 100;

export type ServerOrderItemInput = {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  category?: string;
};

export type ServerOrderInput = {
  subtotal: number;
  voucherDiscount: number;
  registrationDiscount?: number;
  totalAmount: number;
  deliveryFee?: number;
  baseDeliveryFee?: number;
  items: ServerOrderItemInput[];
};

export type FinancializedOrderItem = ServerOrderItemInput & {
  unitCostAtOrder: number;
  lineRevenue: number;
  lineCost: number;
  lineProfit: number;
  costEstimated: boolean;
};

export type ComputedOrderFinancials = {
  items: FinancializedOrderItem[];
  discountTotal: number;
  cogs: number;
  deliverySubsidy: number;
  grossProfit: number;
  grossLoss: number;
  costEstimatedItemCount: number;
  financialVersion: number;
  reportingCurrency: typeof REPORTING_CURRENCY;
  reportingTimezone: typeof REPORTING_TIMEZONE;
};

export function computeOrderFinancials(
  order: ServerOrderInput,
  productCosts: Map<string, number>
): ComputedOrderFinancials {
  const items = order.items.map((item) => {
    const lookupCost = productCosts.get(item.productId);
    const unitCostAtOrder = typeof lookupCost === 'number' && lookupCost >= 0 ? lookupCost : 0;
    const lineRevenue = roundMoney(item.price * item.quantity);
    const lineCost = roundMoney(unitCostAtOrder * item.quantity);
    const lineProfit = roundMoney(lineRevenue - lineCost);
    const costEstimated = typeof lookupCost !== 'number';

    return {
      ...item,
      unitCostAtOrder,
      lineRevenue,
      lineCost,
      lineProfit,
      costEstimated
    };
  });

  const cogs = roundMoney(items.reduce((sum, item) => sum + item.lineCost, 0));
  const discountTotal = roundMoney(order.voucherDiscount + (order.registrationDiscount || 0));
  const deliverySubsidy = roundMoney(Math.max((order.baseDeliveryFee || 0) - (order.deliveryFee || 0), 0));
  const grossProfitRaw = roundMoney(order.totalAmount - cogs - deliverySubsidy);
  const grossLoss = grossProfitRaw < 0 ? Math.abs(grossProfitRaw) : 0;

  return {
    items,
    discountTotal,
    cogs,
    deliverySubsidy,
    grossProfit: grossProfitRaw,
    grossLoss: roundMoney(grossLoss),
    costEstimatedItemCount: items.filter((item) => item.costEstimated).length,
    financialVersion: FINANCIAL_VERSION,
    reportingCurrency: REPORTING_CURRENCY,
    reportingTimezone: REPORTING_TIMEZONE
  };
}

export function mapProductCosts(
  products: Array<{ id: string; data: () => Record<string, unknown> }>
): Map<string, number> {
  const costMap = new Map<string, number>();
  products.forEach((productDoc) => {
    const product = productDoc.data() as unknown as Product;
    if (typeof product.costPrice === 'number' && Number.isFinite(product.costPrice)) {
      costMap.set(productDoc.id, product.costPrice);
    }
  });
  return costMap;
}
