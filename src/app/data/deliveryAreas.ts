export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
}

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
