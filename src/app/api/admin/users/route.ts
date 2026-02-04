import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { AdminRouteError, requireAdminFromRequest } from '@/lib/adminAuth';
import { getAdminDb } from '@/lib/firebaseAdmin';
import { AdminUserListItem, AdminUsersListResponse } from '@/types/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const toIsoString = (value: unknown): string | undefined => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
};

const mapUserListItem = (
  id: string,
  data: FirebaseFirestore.DocumentData
): AdminUserListItem => ({
  uid: id,
  displayName: typeof data.displayName === 'string' ? data.displayName : '',
  email: typeof data.email === 'string' ? data.email : '',
  phoneNumber: typeof data.phoneNumber === 'string' ? data.phoneNumber : undefined,
  referralCode: typeof data.referralCode === 'string' ? data.referralCode : undefined,
  vouchers: typeof data.vouchers === 'number' ? data.vouchers : 0,
  vouchersUsed: typeof data.vouchersUsed === 'number' ? data.vouchersUsed : 0,
  createdAt: toIsoString(data.createdAt),
  updatedAt: toIsoString(data.updatedAt)
});

const parseLimit = (rawLimit: string | null) => {
  if (!rawLimit) return DEFAULT_LIMIT;
  const parsed = Number(rawLimit);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(Math.floor(parsed), MAX_LIMIT);
};

async function listUsersWithSearch(
  search: string,
  limit: number
): Promise<AdminUsersListResponse> {
  const db = getAdminDb();
  const usersById = new Map<string, AdminUserListItem>();

  // Direct lookup by UID.
  const directUser = await db.collection('users').doc(search).get();
  if (directUser.exists) {
    usersById.set(directUser.id, mapUserListItem(directUser.id, directUser.data() || {}));
  }

  // Prefix lookup by email.
  const emailPrefixSnapshot = await db
    .collection('users')
    .orderBy('email')
    .startAt(search)
    .endAt(`${search}\uf8ff`)
    .limit(limit)
    .get();

  emailPrefixSnapshot.docs.forEach((userDoc) => {
    usersById.set(userDoc.id, mapUserListItem(userDoc.id, userDoc.data()));
  });

  // Prefix lookup by referral code.
  const referralPrefixSnapshot = await db
    .collection('users')
    .orderBy('referralCode')
    .startAt(search.toUpperCase())
    .endAt(`${search.toUpperCase()}\uf8ff`)
    .limit(limit)
    .get();

  referralPrefixSnapshot.docs.forEach((userDoc) => {
    usersById.set(userDoc.id, mapUserListItem(userDoc.id, userDoc.data()));
  });

  const users = Array.from(usersById.values())
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, limit);

  return { users, hasMore: false };
}

async function listUsersByCursor(
  cursor: string | undefined,
  limit: number
): Promise<AdminUsersListResponse> {
  const db = getAdminDb();
  let usersQuery: FirebaseFirestore.Query = db
    .collection('users')
    .orderBy('createdAt', 'desc')
    .limit(limit + 1);

  if (cursor) {
    const cursorSnapshot = await db.collection('users').doc(cursor).get();
    if (cursorSnapshot.exists) {
      usersQuery = usersQuery.startAfter(cursorSnapshot);
    }
  }

  const usersSnapshot = await usersQuery.get();
  const hasMore = usersSnapshot.docs.length > limit;
  const pageDocs = hasMore ? usersSnapshot.docs.slice(0, limit) : usersSnapshot.docs;
  const users = pageDocs.map((userDoc) => mapUserListItem(userDoc.id, userDoc.data()));
  const nextCursor = hasMore && pageDocs.length > 0 ? pageDocs[pageDocs.length - 1].id : undefined;

  return { users, nextCursor, hasMore };
}

export async function GET(request: Request) {
  try {
    await requireAdminFromRequest(request);

    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get('limit'));
    const cursor = url.searchParams.get('cursor') || undefined;
    const search = url.searchParams.get('search')?.trim();

    const payload = search
      ? await listUsersWithSearch(search, limit)
      : await listUsersByCursor(cursor, limit);

    return NextResponse.json(payload);
  } catch (error: unknown) {
    if (error instanceof AdminRouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Failed to fetch admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
