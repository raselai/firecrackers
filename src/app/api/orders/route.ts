import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import { Address } from '@/types/user';
import { OrderItem } from '@/types/order';
import {
  calculateEffectiveDeliveryFee,
  getCodRequiredPaymentAmount,
  getDeliveryAreaName
} from '@/app/data/deliveryAreas';
import { computeOrderFinancials, mapProductCosts } from '@/lib/server/orderFinancials';

type CreateOrderPayload = {
  orderId?: string;
  userId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  deliveryArea: string;
  deliveryAreaName?: string;
  vouchersToUse?: number;
  promotionType?: 'none' | 'referral' | 'registration';
  paymentProofUrl?: string;
  paymentProofPath?: string;
  paymentMethod?: 'touch_n_go' | 'cod';
  paymentAccountName?: string;
};

const VOUCHER_VALUE = 30;
const REGISTRATION_VOUCHER_PERCENT = 0.1;
const VOUCHER_ELIGIBLE_CATEGORIES = [
  '6inch firework series',
  '7inch firework series',
  '8inch & 9inch firework series',
  '10inch firework series',
  '11inch firework series',
  '12inch firework series',
  'Big hole firework series'
];

const roundMoney = (value: number) => Math.round(value * 100) / 100;

function isVoucherEligible(category?: string): boolean {
  if (!category) return false;
  return VOUCHER_ELIGIBLE_CATEGORIES.some((entry) => entry.toLowerCase() === category.toLowerCase());
}

function countEligibleItems(items: Array<{ category?: string; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (isVoucherEligible(item.category) ? item.quantity : 0), 0);
}

async function verifyRequestUser(request: Request): Promise<string> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.slice(7).trim();
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}

export async function POST(request: Request) {
  try {
    const uid = await verifyRequestUser(request);
    const payload = (await request.json()) as CreateOrderPayload;

    if (!payload.userId || payload.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized user mismatch.' }, { status: 403 });
    }

    if (!payload.items || payload.items.length === 0) {
      return NextResponse.json({ error: 'Order items are required.' }, { status: 400 });
    }

    if (!payload.deliveryAddress || !payload.deliveryArea) {
      return NextResponse.json({ error: 'Delivery details are required.' }, { status: 400 });
    }

    const db = getAdminDb();
    const userRef = db.collection('users').doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const user = userSnapshot.data() as {
      vouchers?: number;
      vouchersUsed?: number;
      hasRegistrationVoucher?: boolean;
      registrationVoucherUsed?: boolean;
    };

    const subtotal = roundMoney(payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
    const promotionType = payload.promotionType || 'none';
    const vouchersToUse = payload.vouchersToUse || 0;

    const { baseFee: baseDeliveryFee, fee: deliveryFee, isFreeDelivery } = calculateEffectiveDeliveryFee(
      payload.deliveryArea,
      subtotal,
      payload.paymentMethod
    );
    const deliveryAreaName = getDeliveryAreaName(payload.deliveryArea) || payload.deliveryAreaName || payload.deliveryArea;
    const codRequiredPaymentAmount = payload.paymentMethod === 'cod'
      ? getCodRequiredPaymentAmount(deliveryFee)
      : undefined;

    let voucherDiscount = 0;
    let registrationDiscount = 0;
    let appliedVouchers = 0;

    if (promotionType === 'referral' && vouchersToUse > 0) {
      const availableVouchers = user.vouchers || 0;
      if (vouchersToUse > availableVouchers) {
        return NextResponse.json({ error: `You only have ${availableVouchers} voucher(s) available.` }, { status: 400 });
      }

      const maxVouchers = countEligibleItems(payload.items);
      if (vouchersToUse > maxVouchers) {
        return NextResponse.json({ error: `You can only use ${maxVouchers} voucher(s) for this cart.` }, { status: 400 });
      }

      voucherDiscount = vouchersToUse * VOUCHER_VALUE;
      appliedVouchers = vouchersToUse;
    } else if (promotionType === 'registration') {
      if (!user.hasRegistrationVoucher || user.registrationVoucherUsed) {
        return NextResponse.json({ error: 'Registration voucher is not available.' }, { status: 400 });
      }
      registrationDiscount = roundMoney(subtotal * REGISTRATION_VOUCHER_PERCENT);
    }

    const totalAmount = roundMoney(Math.max(subtotal - voucherDiscount - registrationDiscount + deliveryFee, 0));
    const orderId = payload.orderId || `ORD-${nanoid(10).toUpperCase()}`;

    const productIds = [...new Set(payload.items.map((item) => item.productId).filter(Boolean))];
    const productDocs = productIds.length > 0
      ? await Promise.all(productIds.map((productId) => db.collection('products').doc(productId).get()))
      : [];
    const productCosts = mapProductCosts(
      productDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({ id: doc.id, data: () => doc.data() || {} }))
    );

    const computed = computeOrderFinancials(
      {
        subtotal,
        voucherDiscount,
        registrationDiscount,
        totalAmount,
        deliveryFee,
        baseDeliveryFee,
        items: payload.items
      },
      productCosts
    );

    const orderData = {
      orderId,
      userId: uid,
      items: computed.items,
      subtotal,
      vouchersApplied: appliedVouchers,
      voucherDiscount,
      discountTotal: computed.discountTotal,
      totalAmount,
      promotionType,
      registrationDiscount: registrationDiscount > 0 ? registrationDiscount : undefined,
      deliveryArea: payload.deliveryArea,
      deliveryAreaName,
      baseDeliveryFee,
      deliveryFee,
      isFreeDelivery,
      deliveryAddress: payload.deliveryAddress,
      status: 'pending',
      paymentMethod: payload.paymentMethod,
      paymentAccountName: payload.paymentAccountName,
      deliveryFeePaid: payload.paymentMethod === 'cod' ? Boolean(payload.paymentProofUrl) : undefined,
      codRequiredPaymentAmount,
      paymentProofUrl: payload.paymentProofUrl,
      paymentProofPath: payload.paymentProofPath,
      paymentSubmittedAt: payload.paymentProofUrl ? new Date() : undefined,
      reportingCurrency: computed.reportingCurrency,
      reportingTimezone: computed.reportingTimezone,
      financialVersion: computed.financialVersion,
      cogs: computed.cogs,
      deliverySubsidy: computed.deliverySubsidy,
      grossProfit: computed.grossProfit,
      grossLoss: computed.grossLoss,
      costEstimatedItemCount: computed.costEstimatedItemCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const sanitizedOrderData = Object.fromEntries(
      Object.entries(orderData).filter(([, value]) => value !== undefined)
    );

    await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc();
      transaction.set(orderRef, sanitizedOrderData);

      if (promotionType === 'referral' && appliedVouchers > 0) {
        transaction.update(userRef, {
          vouchers: Math.max((user.vouchers || 0) - appliedVouchers, 0),
          vouchersUsed: (user.vouchersUsed || 0) + appliedVouchers,
          updatedAt: FieldValue.serverTimestamp()
        });
      }

      if (promotionType === 'registration') {
        transaction.update(userRef, {
          registrationVoucherUsed: true,
          updatedAt: FieldValue.serverTimestamp()
        });
      }
    });

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order via API:', error);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}
