import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { PaymentSettings } from '@/types/paymentSettings';

const PAYMENT_SETTINGS_DOC = doc(db, 'settings', 'payment');

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  try {
    const snapshot = await getDoc(PAYMENT_SETTINGS_DOC);
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
    await setDoc(PAYMENT_SETTINGS_DOC, {
      ...settings,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    throw error;
  }
}
