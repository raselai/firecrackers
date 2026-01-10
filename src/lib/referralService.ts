import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Referral, ReferralStats } from '@/types/referral';
import { getUserById, getUserByReferralCode, awardVoucher, updateUserProfile } from './userService';
import QRCode from 'qrcode';

/**
 * Generate QR code for referral link
 * Returns base64 data URL that can be used in img src
 */
export async function generateReferralQR(referralCode: string): Promise<string> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const referralUrl = `${siteUrl}/signup?ref=${referralCode}`;

    const qrDataUrl = await QRCode.toDataURL(referralUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

/**
 * Validate if a referral code exists and is valid
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return false;
    const user = await getUserByReferralCode(normalizedCode);
    return user !== null;
  } catch (error) {
    console.error('Error validating referral code:', error);
    return false;
  }
}

/**
 * Process a referral - create referral record and award voucher to referrer
 * Called when a new user signs up with a referral code
 */
export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
  try {
    const normalizedCode = referralCode.trim().toUpperCase();
    if (!normalizedCode) {
      throw new Error('Invalid referral code');
    }

    // Get the referrer by referral code
    const referrer = await getUserByReferralCode(normalizedCode);

    if (!referrer) {
      throw new Error('Invalid referral code');
    }

    // Prevent self-referral
    if (referrer.uid === newUserId) {
      throw new Error('Cannot refer yourself');
    }

    // Get the new user's email
    const newUser = await getUserById(newUserId);
    if (!newUser) {
      throw new Error('New user not found');
    }

    // Check if this user was already referred
    if (newUser.referredBy) {
      console.warn('User already has a referrer, skipping referral processing');
      return;
    }

    await updateUserProfile(newUserId, { referredBy: referrer.uid });

    // Create referral record
    const referralData: Omit<Referral, 'id'> = {
      referrerId: referrer.uid,
      referredUserId: newUserId,
      referredUserEmail: newUser.email,
      voucherAwarded: true,
      createdAt: new Date()
    };

    await addDoc(collection(db, 'referrals'), referralData);

    // Award RM20 voucher to referrer
    await awardVoucher(referrer.uid);

    console.log(`Referral processed: ${referrer.email} referred ${newUser.email}`);
  } catch (error) {
    console.error('Error processing referral:', error);
    throw error;
  }
}

/**
 * Get all referrals made by a user
 */
export async function getUserReferrals(userId: string): Promise<Referral[]> {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    })) as Referral[];
  } catch (error) {
    console.error('Error getting user referrals:', error);
    throw error;
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string): Promise<ReferralStats> {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const referrals = await getUserReferrals(userId);

    return {
      totalReferrals: user.referralCount,
      availableVouchers: user.vouchers,
      usedVouchers: user.vouchersUsed,
      totalSavings: user.vouchersUsed * 20, // RM20 per voucher
      referrals
    };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    throw error;
  }
}

/**
 * Get referral link for a user
 */
export function getReferralLink(referralCode: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}/signup?ref=${referralCode}`;
}

/**
 * Generate shareable text for referral
 */
export function generateReferralMessage(referralCode: string, userName?: string): string {
  const referralLink = getReferralLink(referralCode);

  const message = userName
    ? `${userName} invited you to join FireWorks ML! Sign up with my referral code ${referralCode} and I'll get RM20 off my next purchase! ${referralLink}`
    : `Join FireWorks ML with my referral code ${referralCode} and I'll get RM20 off! ${referralLink}`;

  return message;
}

/**
 * Get WhatsApp share link for referral
 */
export function getWhatsAppShareLink(referralCode: string, userName?: string): string {
  const message = generateReferralMessage(referralCode, userName);
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Get email share link for referral
 */
export function getEmailShareLink(referralCode: string, userName?: string): string {
  const subject = 'Join FireWorks ML!';
  const body = generateReferralMessage(referralCode, userName);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}



