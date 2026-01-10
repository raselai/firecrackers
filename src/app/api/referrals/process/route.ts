import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const referralCode = typeof body?.referralCode === 'string' ? body.referralCode : '';
    const normalizedCode = referralCode.trim().toUpperCase();
    if (!normalizedCode) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const newUserId = decoded.uid;
    const db = getAdminDb();

    let alreadyReferred = false;

    await db.runTransaction(async (tx) => {
      const newUserRef = db.collection('users').doc(newUserId);
      const newUserSnap = await tx.get(newUserRef);
      if (!newUserSnap.exists) {
        throw new Error('New user not found');
      }

      const newUserData = newUserSnap.data() || {};
      if (newUserData.referredBy) {
        alreadyReferred = true;
        return;
      }

      const referrerQuery = db
        .collection('users')
        .where('referralCode', '==', normalizedCode)
        .limit(1);
      const referrerSnap = await tx.get(referrerQuery);
      if (referrerSnap.empty) {
        throw new Error('Invalid referral code');
      }

      const referrerDoc = referrerSnap.docs[0];
      if (referrerDoc.id === newUserId) {
        throw new Error('Cannot refer yourself');
      }

      const referralRef = db.collection('referrals').doc();
      tx.set(referralRef, {
        referrerId: referrerDoc.id,
        referredUserId: newUserId,
        referredUserEmail: newUserData.email || '',
        voucherAwarded: true,
        createdAt: FieldValue.serverTimestamp()
      });

      tx.update(newUserRef, {
        referredBy: referrerDoc.id,
        updatedAt: FieldValue.serverTimestamp()
      });

      tx.update(referrerDoc.ref, {
        vouchers: FieldValue.increment(1),
        referralCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
    });

    return NextResponse.json({ ok: true, alreadyReferred });
  } catch (error: any) {
    const message = error?.message || 'Failed to process referral';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
