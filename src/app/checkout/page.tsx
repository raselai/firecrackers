'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { getPaymentSettings } from '@/lib/paymentSettingsService';
import { PaymentSettings } from '@/types/paymentSettings';
import {
  calculateMaxVouchers,
  calculateVoucherDiscount,
  createOrder,
  validateVoucherUsage
} from '@/lib/orderService';
import { generatePaymentProofPath, uploadImage } from '@/lib/storage';
import { Address } from '@/types/user';

const WALLET_NAME = 'Low Chee tong';
const WALLET_NUMBER = '160836785359';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export default function CheckoutPage() {
  const { items, loading: cartLoading, subtotal, clearCart } = useCart();
  const { user, firebaseUser, loading: authLoading } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [voucherCount, setVoucherCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentProofPath, setPaymentProofPath] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => `ORD-${nanoid(10).toUpperCase()}`);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);

  const addresses = user?.addresses || [];

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    let isMounted = true;

    const loadPaymentSettings = async () => {
      try {
        const settings = await getPaymentSettings();
        if (isMounted) {
          setPaymentSettings(settings);
        }
      } catch (error) {
        console.error('Error loading payment settings:', error);
        if (isMounted) {
          setPaymentSettingsError('Failed to load payment settings. Using defaults.');
        }
      } finally {
        if (isMounted) {
          setPaymentSettingsLoading(false);
        }
      }
    };

    loadPaymentSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (addresses.length === 0) {
      setSelectedAddressId('');
      return;
    }

    const defaultAddress = addresses.find(addr => addr.isDefault);
    setSelectedAddressId(defaultAddress?.id || addresses[0].id);
  }, [addresses]);

  const maxVouchers = useMemo(() => {
    if (!user) return 0;
    return Math.min(calculateMaxVouchers(subtotal), user.vouchers);
  }, [subtotal, user]);

  useEffect(() => {
    if (voucherCount > maxVouchers) {
      setVoucherCount(maxVouchers);
    }
  }, [voucherCount, maxVouchers]);

  const voucherDiscount = useMemo(() => {
    return calculateVoucherDiscount(voucherCount);
  }, [voucherCount]);

  const totalAmount = Math.max(subtotal - voucherDiscount, 0);

  const paymentQrUrl = paymentSettings?.qrImageUrl || '/images/ewallet-qr.jpg';
  const paymentWalletName = paymentSettings?.walletName || WALLET_NAME;
  const paymentWalletNumber = paymentSettings?.walletNumber || WALLET_NUMBER;

  const selectedAddress = useMemo<Address | undefined>(() => {
    return addresses.find(addr => addr.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const handleUploadProof = async (file: File) => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!userId) return;

    if (!file.type.startsWith('image/')) {
      setError(t('checkout.errors.imageFileOnly'));
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError(t('checkout.errors.imageTooLarge'));
      return;
    }

    setError('');
    setUploading(true);

    try {
      const path = generatePaymentProofPath(userId, orderId, file.name);
      const url = await uploadImage(file, path);
      setPaymentProofUrl(url);
      setPaymentProofPath(path);
    } catch (uploadError) {
      console.error('Error uploading payment proof:', uploadError);
      setError(t('checkout.errors.uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!userId || !user) return;

    if (items.length === 0) {
      setError(t('checkout.errors.cartEmpty'));
      return;
    }

    if (addresses.length === 0) {
      setError(t('checkout.errors.addressRequired'));
      return;
    }

    if (!selectedAddress) {
      setError(t('checkout.errors.addressSelect'));
      return;
    }

    if (!paymentProofUrl) {
      setError(t('checkout.errors.proofRequired'));
      return;
    }

    const validation = validateVoucherUsage(subtotal, voucherCount, user.vouchers);
    if (!validation.valid) {
      setError(validation.message || t('checkout.errors.voucherValidationFailed'));
      return;
    }

    setError('');
    setPlacingOrder(true);

    try {
      await createOrder({
        orderId,
        userId,
        items,
        deliveryAddress: selectedAddress,
        vouchersToUse: voucherCount,
        paymentMethod: 'touch_n_go',
        paymentProofUrl,
        paymentProofPath
      });

      await clearCart();
      router.push('/account/orders');
    } catch (orderError) {
      console.error('Error placing order:', orderError);
      setError(t('checkout.errors.orderFailed'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading || (firebaseUser && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('checkout.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 style={{ marginBottom: '1rem' }}>{t('checkout.title')}</h1>
        <p style={{ color: '#6b7280' }}>{t('checkout.cartEmpty')}</p>
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          {t('checkout.continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>{t('checkout.title')}</h1>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>{t('checkout.shippingAddress')}</h2>
            {addresses.length === 0 ? (
              <div>
                <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                  {t('checkout.noAddresses')}
                </p>
                <Link href="/account/profile" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  {t('checkout.addAddress')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    style={{
                      padding: '0.75rem',
                      border: selectedAddressId === address.id ? '2px solid #f97316' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      display: 'flex',
                      gap: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />
                    <div>
                      <div style={{ fontWeight: '600' }}>{address.label}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {address.fullName} • {address.phoneNumber}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        {address.streetAddress}, {address.city}, {address.state} {address.postalCode}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>{t('checkout.voucher')}</h2>
            {maxVouchers === 0 ? (
              <p style={{ color: '#6b7280' }}>
                {t('checkout.voucherHint')}
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label htmlFor="voucherCount">{t('checkout.vouchersToApply')}</label>
                <input
                  id="voucherCount"
                  type="number"
                  min={0}
                  max={maxVouchers}
                  value={voucherCount}
                  onChange={(e) => setVoucherCount(Number(e.target.value))}
                  style={{
                    width: '120px',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
                <span style={{ color: '#6b7280' }}>
                  {maxVouchers} {t('checkout.voucherMax')} ({t('checkout.availableVouchers')}: {user.vouchers})
                </span>
              </div>
            )}
          </section>

          <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>{t('checkout.payment')}</h2>
            {paymentSettingsLoading && (
              <p style={{ marginBottom: '0.75rem', color: '#6b7280' }}>Loading payment details...</p>
            )}
            {paymentSettingsError && (
              <p style={{ marginBottom: '0.75rem', color: '#b91c1c' }}>{paymentSettingsError}</p>
            )}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '220px' }}>
                <Image
                  src={paymentQrUrl}
                  alt={t('checkout.paymentMethod')}
                  width={220}
                  height={300}
                  style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{t('checkout.paymentMethod')}</p>
                <p style={{ marginBottom: '0.25rem' }}>{t('checkout.paymentName')}: {paymentWalletName}</p>
                <p style={{ marginBottom: '1rem' }}>{t('checkout.paymentWalletNo')}: {paymentWalletNumber}</p>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  {t('checkout.paymentInstruction')}
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadProof(file);
                    }
                  }}
                />
                {uploading && <p style={{ marginTop: '0.5rem' }}>{t('checkout.uploadingProof')}</p>}
                {paymentProofUrl && !uploading && (
                  <p style={{ marginTop: '0.5rem', color: '#059669' }}>{t('checkout.proofUploaded')}</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem' }}>{t('checkout.orderSummary')}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{t('checkout.subtotal')}</span>
            <span>RM {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{t('checkout.voucherDiscount')}</span>
            <span>- RM {voucherDiscount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span>{t('checkout.total')}</span>
            <span>RM {totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
              placingOrder ||
              uploading ||
              !paymentProofUrl ||
              !selectedAddressId ||
              addresses.length === 0
            }
            style={{
              width: '100%',
              padding: '0.75rem',
              background: placingOrder ? '#9ca3af' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: placingOrder ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {placingOrder ? t('checkout.placingOrder') : t('checkout.placeOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
