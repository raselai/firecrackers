import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PaymentSettings } from '@/types/paymentSettings';

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  try {
    const snapshot = await getDoc(doc(db, 'settings', 'payment'));
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as PaymentSettings;
  } catch (error) {
    console.error('Error loading payment settings:', error);
    throw error;
  }
}

export async function updatePaymentSettings(settings: PaymentSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'settings', 'payment'), {
      ...settings,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    throw error;
  }
}

