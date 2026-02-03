'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  calculateRegistrationDiscount,
  createOrder,
  validateVoucherUsage
} from '@/lib/orderService';
import { generatePaymentProofPath, uploadImage } from '@/lib/storage';
import { Address } from '@/types/user';
import {
  calculateEffectiveDeliveryFee,
  getDeliveryAreaName
} from '@/app/data/deliveryAreas';

const WALLET_NAME = 'Low Chee tong';
const WALLET_NUMBER = '160836785359';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const CHECKOUT_DRAFT_KEY = 'checkoutDraft';

type CheckoutDraft = {
  selectedAddressId: string;
  promotionType: 'none' | 'referral' | 'registration';
  claimedVouchers: number[];
  paymentMethod: 'touch_n_go' | 'cod';
  selectedDeliveryArea: string;
};

export default function CheckoutPaymentPage() {
  const { items, loading: cartLoading, subtotal, clearCart } = useCart();
  const { user, firebaseUser, loading: authLoading } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(true);
  const [promotionType, setPromotionType] = useState<'none' | 'referral' | 'registration'>('none');
  const [claimedVouchers, setClaimedVouchers] = useState<number[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'touch_n_go' | 'cod'>('touch_n_go');
  const [codInfoOpen, setCodInfoOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentProofPath, setPaymentProofPath] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState('');
  const [walletCopied, setWalletCopied] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => `ORD-${nanoid(10).toUpperCase()}`);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);
  const paymentProofInputRef = useRef<HTMLInputElement | null>(null);

  const addresses = user?.addresses || [];

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login?redirect=/checkout/payment');
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
      } catch (settingsError) {
        console.error('Error loading payment settings:', settingsError);
        if (isMounted) {
          setPaymentSettingsError(t('checkout.paymentSettingsLoadFailed'));
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
  }, [t]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!stored) {
        router.replace('/checkout');
        return;
      }
      const parsed = JSON.parse(stored) as CheckoutDraft;
      setDraft(parsed);
      setPromotionType(parsed.promotionType);
      setClaimedVouchers(parsed.claimedVouchers || []);
      setSelectedAddressId(parsed.selectedAddressId || '');
      setSelectedDeliveryArea(parsed.selectedDeliveryArea || localStorage.getItem('selectedDeliveryArea') || '');
      setPaymentMethod(parsed.paymentMethod || 'touch_n_go');
    } catch (storageError) {
      console.error('Failed to read checkout draft:', storageError);
      router.replace('/checkout');
    } finally {
      setDraftLoading(false);
    }
  }, [router]);

  const maxVouchers = useMemo(() => {
    if (!user) return 0;
    return Math.min(calculateMaxVouchers(items), user.vouchers);
  }, [items, user]);

  useEffect(() => {
    if (!user) {
      setClaimedVouchers([]);
      return;
    }

    setClaimedVouchers((prev) => {
      const bounded = prev.filter((voucher) => voucher >= 1 && voucher <= user.vouchers);
      if (bounded.length <= maxVouchers) {
        return bounded;
      }
      return bounded.slice(0, maxVouchers);
    });
  }, [maxVouchers, user]);

  const claimedCount = useMemo(() => claimedVouchers.length, [claimedVouchers]);
  const voucherDiscount = useMemo(() => {
    if (promotionType !== 'referral') return 0;
    return calculateVoucherDiscount(claimedCount);
  }, [claimedCount, promotionType]);
  const registrationDiscount = useMemo(() => {
    if (promotionType !== 'registration') return 0;
    return calculateRegistrationDiscount(subtotal);
  }, [promotionType, subtotal]);
  const totalDiscount = voucherDiscount + registrationDiscount;
  const { fee: deliveryFee, isFreeDelivery } = calculateEffectiveDeliveryFee(selectedDeliveryArea, subtotal);
  const deliveryAreaName = getDeliveryAreaName(selectedDeliveryArea);
  const totalAmount = Math.max(subtotal - totalDiscount + deliveryFee, 0);

  const selectedAddress = useMemo<Address | undefined>(() => {
    return addresses.find(addr => addr.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const paymentQrUrl = paymentSettings?.qrImageUrl || '/images/ewallet-qr.jpg';
  const paymentWalletName = paymentSettings?.walletName || WALLET_NAME;
  const paymentWalletNumber = paymentSettings?.walletNumber || WALLET_NUMBER;

  const handleCopyWalletNumber = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(paymentWalletNumber);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = paymentWalletNumber;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 1500);
    } catch (copyError) {
      console.error('Failed to copy wallet number:', copyError);
    }
  };

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

    if (addresses.length === 0 || !selectedAddress) {
      setError(t('checkout.errors.addressSelect'));
      return;
    }

    if (paymentMethod === 'touch_n_go' || paymentMethod === 'cod') {
      if (!paymentProofUrl) {
        setError(t('checkout.errors.proofRequired'));
        return;
      }

      if (!paymentAccountName.trim()) {
        setError(t('checkout.errors.paymentAccountNameRequired'));
        return;
      }
    }

    if (promotionType === 'referral') {
      const validation = validateVoucherUsage(items, claimedCount, user.vouchers);
      if (!validation.valid) {
        setError(validation.message || t('checkout.errors.voucherValidationFailed'));
        return;
      }
    }

    setError('');
    setPlacingOrder(true);

    try {
      await createOrder({
        orderId,
        userId,
        items,
        deliveryAddress: selectedAddress,
        deliveryArea: selectedDeliveryArea,
        deliveryAreaName,
        vouchersToUse: promotionType === 'referral' ? claimedCount : 0,
        promotionType,
        paymentMethod,
        paymentAccountName: paymentAccountName.trim() ? paymentAccountName.trim() : undefined,
        paymentProofUrl: paymentProofUrl || undefined,
        paymentProofPath: paymentProofPath || undefined
      });

      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      localStorage.removeItem('selectedDeliveryArea');
      await clearCart();
      router.push('/account/orders');
    } catch (orderError) {
      console.error('Error placing order:', orderError);
      setError(t('checkout.errors.orderFailed'));
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading || draftLoading || (firebaseUser && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('checkout.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user || !draft) {
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>{t('checkout.payment')}</h1>
        <Link href="/checkout" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          {t('checkout.back')}
        </Link>
      </div>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('checkout.paymentMethodLabel')}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('touch_n_go');
                  setCodInfoOpen(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  border: paymentMethod === 'touch_n_go' ? '2px solid #f97316' : '1px solid #d1d5db',
                  background: paymentMethod === 'touch_n_go' ? '#fff7ed' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('checkout.paymentMethodTng')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cod');
                  setCodInfoOpen(true);
                  setPaymentAccountName('');
                  setPaymentProofUrl('');
                  setPaymentProofPath('');
                  setPaymentProofFileName('');
                  if (paymentProofInputRef.current) {
                    paymentProofInputRef.current.value = '';
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '999px',
                  border: paymentMethod === 'cod' ? '2px solid #f97316' : '1px solid #d1d5db',
                  background: paymentMethod === 'cod' ? '#fff7ed' : '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t('checkout.paymentMethodCod')}
              </button>
            </div>
          </div>

          {(paymentMethod === 'touch_n_go' || paymentMethod === 'cod') && paymentSettingsLoading && (
            <p style={{ marginBottom: '0.75rem', color: '#6b7280' }}>{t('checkout.loadingPaymentDetails')}</p>
          )}
          {(paymentMethod === 'touch_n_go' || paymentMethod === 'cod') && paymentSettingsError && (
            <p style={{ marginBottom: '0.75rem', color: '#b91c1c' }}>{paymentSettingsError}</p>
          )}

          {paymentMethod === 'cod' && (
            <div style={{ padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.35rem', color: '#92400e', fontWeight: 600 }}>
                {t('checkout.codPaymentNotice')}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: '220px' }}>
              <Image
                src={paymentQrUrl}
                alt={t('checkout.paymentMethod')}
                width={220}
                height={300}
                style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                quality={75}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{t('checkout.bankTitle')}</p>
              <p style={{ marginBottom: '0.25rem' }}>{t('checkout.paymentName')}: {paymentWalletName}</p>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <p style={{ margin: 0 }}>
                  {t('checkout.paymentWalletNo')}: {paymentWalletNumber}
                </p>
                <button
                  type="button"
                  onClick={handleCopyWalletNumber}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '999px',
                    background: '#fff',
                    color: '#111827',
                    padding: '0.3rem 0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {walletCopied ? t('checkout.walletNoCopied') : t('checkout.copyWalletNo')}
                </button>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
                {t('checkout.paymentAccountMismatchNotice')}
              </p>

              <label
                htmlFor="paymentAccountName"
                style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}
              >
                {t('checkout.paymentAccountName')}
              </label>
              <input
                id="paymentAccountName"
                type="text"
                value={paymentAccountName}
                onChange={(e) => setPaymentAccountName(e.target.value)}
                placeholder={t('checkout.paymentAccountNamePlaceholder')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => paymentProofInputRef.current?.click()}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '999px',
                    background: '#fff',
                    color: '#111827',
                    padding: '0.35rem 0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t('checkout.choosePaymentProof')}
                </button>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  {paymentProofFileName || t('checkout.noFileChosen')}
                </span>
              </div>
              <input
                ref={paymentProofInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPaymentProofFileName(file.name);
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
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem' }}>{t('checkout.orderSummary')}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>{t('checkout.subtotal')}</span>
            <span>RM {subtotal.toLocaleString()}</span>
          </div>
          {voucherDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{t('checkout.voucherDiscount')}</span>
              <span>- RM {voucherDiscount.toLocaleString()}</span>
            </div>
          )}
          {registrationDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{t('checkout.registrationDiscountLabel')}</span>
              <span>- RM {registrationDiscount.toFixed(2)}</span>
            </div>
          )}
          {selectedDeliveryArea && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{t('checkout.deliveryFee')} ({deliveryAreaName})</span>
              <span>{isFreeDelivery ? t('cart.free') : `RM ${deliveryFee.toLocaleString()}`}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span>{t('checkout.total')}</span>
            <span>RM {totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
              placingOrder ||
              uploading ||
              ((paymentMethod === 'touch_n_go' || paymentMethod === 'cod') && (!paymentProofUrl || !paymentAccountName.trim()))
            }
            style={{
              width: '100%',
              padding: '0.75rem',
              background: placingOrder ? '#9ca3af' : '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: placingOrder || uploading || ((paymentMethod === 'touch_n_go' || paymentMethod === 'cod') && !paymentProofUrl) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {placingOrder ? t('checkout.placingOrder') : t('checkout.submitOrder')}
          </button>
        </div>
      </div>

      {codInfoOpen && (
        <div
          role="alertdialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 60
          }}
          onClick={() => setCodInfoOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{t('checkout.codPaymentNoticeTitle')}</h3>
            <p style={{ marginBottom: '1.25rem', color: '#6b7280' }}>
              {t('checkout.codPaymentNotice')}
            </p>
            <button
              type="button"
              onClick={() => setCodInfoOpen(false)}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '6px',
                border: 'none',
                background: '#f97316',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('checkout.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

