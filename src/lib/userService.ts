import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Address } from '@/types/user';
import { nanoid } from 'nanoid';

/**
 * Generate a unique referral code in format: FW-XXXXXX
 * Ensures uniqueness by checking against existing codes in Firestore
 */
export async function generateReferralCode(): Promise<string> {
  // Generate a code without querying Firestore to avoid permission issues.
  const randomPart = nanoid(6).toUpperCase();
  return `FW-${randomPart}`;
}

/**
 * Create a new user document in Firestore
 * Called after Firebase Auth user creation
 */
export async function createUserDocument(
  uid: string,
  email: string,
  displayName: string,
  referredBy?: string
): Promise<User> {
  const referralCode = await generateReferralCode();

  const newUser: User = {
    uid,
    email,
    displayName,
    role: 'customer',
    referralCode,
    referralCount: 0,
    vouchers: 0,
    vouchersUsed: 0,
    wishlist: [],
    cart: [],
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerified: false
  };

  if (referredBy) {
    newUser.referredBy = referredBy;
  }

  await setDoc(doc(db, 'users', uid), {
    ...newUser,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  });

  return newUser;
}

/**
 * Get user by UID
 */
export async function getUserById(uid: string): Promise<User | null> {
  try {
    if (!uid) {
      throw new Error('User ID is required');
    }

    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      ...data,
      uid: data.uid || userDoc.id,
      cart: data.cart || [],
      addresses: data.addresses || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Get user by referral code
 */
export async function getUserByReferralCode(code: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('referralCode', '==', code)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const data = querySnapshot.docs[0].data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as User;
  } catch (error) {
    console.error('Error getting user by referral code:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Add product to user's wishlist
 */
export async function addToWishlist(
  uid: string,
  productId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      wishlist: arrayUnion(productId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

/**
 * Remove product from user's wishlist
 */
export async function removeFromWishlist(
  uid: string,
  productId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      wishlist: arrayRemove(productId),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

/**
 * Add address to user profile
 */
export async function addAddress(
  uid: string,
  address: Omit<Address, 'id'>
): Promise<void> {
  try {
    const user = await getUserById(uid);
    if (!user) throw new Error('User not found');

    const newAddress: Address = {
      ...address,
      id: nanoid()
    };

    // If this is the first address or marked as default, make it default
    if (user.addresses.length === 0 || address.isDefault) {
      // Remove default from other addresses
      const updatedAddresses = user.addresses.map(addr => ({
        ...addr,
        isDefault: false
      }));

      await updateDoc(doc(db, 'users', uid), {
        addresses: [...updatedAddresses, newAddress],
        updatedAt: new Date()
      });
    } else {
      await updateDoc(doc(db, 'users', uid), {
        addresses: arrayUnion(newAddress),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
}

/**
 * Update existing address
 */
export async function updateAddress(
  uid: string,
  addressId: string,
  updates: Partial<Address>
): Promise<void> {
  try {
    const user = await getUserById(uid);
    if (!user) throw new Error('User not found');

    const updatedAddresses = user.addresses.map(addr => {
      if (addr.id === addressId) {
        return { ...addr, ...updates };
      }
      // If new address is being set as default, remove default from others
      if (updates.isDefault && addr.id !== addressId) {
        return { ...addr, isDefault: false };
      }
      return addr;
    });

    await updateDoc(doc(db, 'users', uid), {
      addresses: updatedAddresses,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

/**
 * Delete address
 */
export async function deleteAddress(
  uid: string,
  addressId: string
): Promise<void> {
  try {
    const user = await getUserById(uid);
    if (!user) throw new Error('User not found');

    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);

    await updateDoc(doc(db, 'users', uid), {
      addresses: updatedAddresses,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

/**
 * Award voucher to user (called when successful referral occurs)
 */
export async function awardVoucher(uid: string): Promise<void> {
  try {
    const user = await getUserById(uid);
    if (!user) throw new Error('User not found');

    await updateDoc(doc(db, 'users', uid), {
      vouchers: user.vouchers + 1,
      referralCount: user.referralCount + 1,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error awarding voucher:', error);
    throw error;
  }
}

/**
 * Deduct vouchers from user (called when vouchers are used in order)
 */
export async function useVouchers(
  uid: string,
  voucherCount: number
): Promise<void> {
  try {
    const user = await getUserById(uid);
    if (!user) throw new Error('User not found');

    if (user.vouchers < voucherCount) {
      throw new Error('Insufficient vouchers');
    }

    await updateDoc(doc(db, 'users', uid), {
      vouchers: user.vouchers - voucherCount,
      vouchersUsed: user.vouchersUsed + voucherCount,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error using vouchers:', error);
    throw error;
  }
}
