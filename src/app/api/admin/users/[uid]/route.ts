import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { AdminUserDetail } from '@/types/admin';
import { Address } from '@/types/user';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const toIsoString = (value: unknown): string | undefined => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
};

const mapAddresses = (value: unknown): Address[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const address = item as Record<string, unknown>;
      return {
        id: typeof address.id === 'string' ? address.id : '',
        label: typeof address.label === 'string' ? address.label : '',
        fullName: typeof address.fullName === 'string' ? address.fullName : '',
        phoneNumber: typeof address.phoneNumber === 'string' ? address.phoneNumber : '',
        streetAddress: typeof address.streetAddress === 'string' ? address.streetAddress : '',
        city: typeof address.city === 'string' ? address.city : '',
        state: typeof address.state === 'string' ? address.state : '',
        postalCode: typeof address.postalCode === 'string' ? address.postalCode : '',
        isDefault: Boolean(address.isDefault)
      };
    });
};

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    await requireAdminFromRequest(request);

    const targetUid = params?.uid;
    if (!targetUid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userSnapshot = await getAdminDb().collection('users').doc(targetUid).get();
    if (!userSnapshot.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = userSnapshot.data() || {};

    const payload: AdminUserDetail = {
      uid: userSnapshot.id,
      displayName: typeof data.displayName === 'string' ? data.displayName : '',
      email: typeof data.email === 'string' ? data.email : '',
      phoneNumber: typeof data.phoneNumber === 'string' ? data.phoneNumber : undefined,
      referralCode: typeof data.referralCode === 'string' ? data.referralCode : undefined,
      vouchers: typeof data.vouchers === 'number' ? data.vouchers : 0,
      vouchersUsed: typeof data.vouchersUsed === 'number' ? data.vouchersUsed : 0,
      role: data.role === 'admin' ? 'admin' : 'customer',
      referredBy: typeof data.referredBy === 'string' ? data.referredBy : undefined,
      referralCount: typeof data.referralCount === 'number' ? data.referralCount : 0,
      hasRegistrationVoucher: Boolean(data.hasRegistrationVoucher),
      registrationVoucherUsed: Boolean(data.registrationVoucherUsed),
      addresses: mapAddresses(data.addresses),
      createdAt: toIsoString(data.createdAt),
      updatedAt: toIsoString(data.updatedAt)
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to fetch admin user detail:', error);
    return NextResponse.json({ error: 'Failed to fetch user detail' }, { status: 500 });
  }
}
