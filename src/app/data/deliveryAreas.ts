export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
}

export type CheckoutPaymentMethod = 'touch_n_go' | 'cod';

export const FIXED_DELIVERY_FEE = 80;
export const FIXED_DELIVERY_AREA_ID = 'all-areas';
export const FIXED_DELIVERY_AREA_NAME = 'All Areas';
export const COD_REQUIRED_DEPOSIT = 200;

export const deliveryAreas: DeliveryArea[] = [
  { id: FIXED_DELIVERY_AREA_ID, name: FIXED_DELIVERY_AREA_NAME, fee: FIXED_DELIVERY_FEE },
];

export function getDeliveryFee(areaId: string): number {
  const area = deliveryAreas.find(a => a.id === areaId);
  return area?.fee ?? FIXED_DELIVERY_FEE;
}

export function getDeliveryAreaName(areaId: string): string {
  const area = deliveryAreas.find(a => a.id === areaId);
  return area?.name ?? FIXED_DELIVERY_AREA_NAME;
}

export function calculateEffectiveDeliveryFee(
  areaId: string,
  subtotal: number,
  paymentMethod?: CheckoutPaymentMethod
): { baseFee: number; fee: number; isFreeDelivery: boolean } {
  const baseFee = getDeliveryFee(areaId);
  void subtotal;
  const isFreeDelivery = paymentMethod === 'touch_n_go';
  const fee = isFreeDelivery ? 0 : baseFee;
  return { baseFee, fee, isFreeDelivery };
}

export function getCodRequiredPaymentAmount(deliveryFee: number): number {
  void deliveryFee;
  return COD_REQUIRED_DEPOSIT;
}

