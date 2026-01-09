export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number; // Unit price at time added
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  vouchersApplied: number;
  voucherDiscount: number;
  totalAmount: number;
}
