export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
}

export type CheckoutPaymentMethod = 'touch_n_go' | 'cod';

export const FULL_PAYMENT_FREE_DELIVERY_THRESHOLD = 300;
export const COD_MINIMUM_PAYMENT_WHEN_FREE_DELIVERY = 200;

export const deliveryAreas: DeliveryArea[] = [
  { id: 'kuala-lumpur', name: 'Kuala Lumpur (city center)', fee: 100 },
  { id: 'petaling-jaya', name: 'Petaling Jaya', fee: 100 },
  { id: 'shah-alam', name: 'Shah Alam', fee: 150 },
  { id: 'subang-jaya', name: 'Subang Jaya', fee: 100 },
  { id: 'klang', name: 'Klang', fee: 150 },
  { id: 'ampang-jaya', name: 'Ampang Jaya', fee: 100 },
  { id: 'rawang', name: 'Rawang', fee: 150 },
  { id: 'selayang', name: 'Selayang', fee: 140 },
  { id: 'cheras', name: 'Cheras', fee: 100 },
  { id: 'kajang', name: 'Kajang', fee: 120 },
  { id: 'bangi', name: 'Bangi', fee: 120 },
  { id: 'bukit-jalil', name: 'Bukit Jalil', fee: 100 },
  { id: 'puchong', name: 'Puchong', fee: 120 },
  { id: 'kepong', name: 'Kepong', fee: 120 },
  { id: 'sg-buloh', name: 'Sg Buloh', fee: 150 },
  { id: 'serdang', name: 'Serdang', fee: 100 },
];

export function getDeliveryFee(areaId: string): number {
  const area = deliveryAreas.find(a => a.id === areaId);
  return area?.fee ?? 0;
}

export function getDeliveryAreaName(areaId: string): string {
  const area = deliveryAreas.find(a => a.id === areaId);
  return area?.name ?? '';
}

export function calculateEffectiveDeliveryFee(
  areaId: string,
  subtotal: number,
  paymentMethod?: CheckoutPaymentMethod
): { baseFee: number; fee: number; isFreeDelivery: boolean } {
  const baseFee = getDeliveryFee(areaId);
  const isFreeDelivery =
    paymentMethod === 'touch_n_go' && subtotal >= FULL_PAYMENT_FREE_DELIVERY_THRESHOLD;
  const fee = isFreeDelivery ? 0 : baseFee;

  return { baseFee, fee, isFreeDelivery };
}

export function getCodRequiredPaymentAmount(deliveryFee: number): number {
  return deliveryFee === 0 ? COD_MINIMUM_PAYMENT_WHEN_FREE_DELIVERY : deliveryFee;
}

