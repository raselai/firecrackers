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
  calculateRegistrationDiscount,
  createOrder,
  validateVoucherUsage
} from '@/lib/orderService';
import { generatePaymentProofPath, uploadImage } from '@/lib/storage';
import { Address } from '@/types/user';
import { deliveryAreas, getDeliveryFee, getDeliveryAreaName } from '@/app/data/deliveryAreas';

const WALLET_NAME = 'Low Chee tong';
const WALLET_NUMBER = '160836785359';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export default function CheckoutPage() {
  const { items, loading: cartLoading, subtotal, clearCart } = useCart();
  const { user, firebaseUser, loading: authLoading } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [promotionType, setPromotionType] = useState<'none' | 'referral' | 'registration'>('none');
  const [claimedVouchers, setClaimedVouchers] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentProofPath, setPaymentProofPath] = useState('');
  const [paymentAccountName, setPaymentAccountName] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => `ORD-${nanoid(10).toUpperCase()}`);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsError, setPaymentSettingsError] = useState('');
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<string>('');

  const addresses = user?.addresses || [];
  const deliveryFee = getDeliveryFee(selectedDeliveryArea);
  const deliveryAreaName = getDeliveryAreaName(selectedDeliveryArea);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, firebaseUser, router]);

  // Load delivery area from localStorage
  useEffect(() => {
    const savedArea = localStorage.getItem('selectedDeliveryArea');
    if (savedArea) {
      setSelectedDeliveryArea(savedArea);
    }
  }, []);

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
  const totalAmount = Math.max(subtotal - totalDiscount + deliveryFee, 0);

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

    if (!paymentAccountName.trim()) {
      setError(t('checkout.errors.paymentAccountNameRequired'));
      return;
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
        deliveryFee,
        vouchersToUse: promotionType === 'referral' ? claimedCount : 0,
        promotionType,
        paymentMethod: 'touch_n_go',
        paymentAccountName: paymentAccountName.trim(),
        paymentProofUrl,
        paymentProofPath
      });

      // Clear delivery area from localStorage after successful order
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

  const handleProceedToPayment = () => {
    if (!user) return;

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

    if (promotionType === 'referral') {
      const validation = validateVoucherUsage(items, claimedCount, user.vouchers);
      if (!validation.valid) {
        setError(validation.message || t('checkout.errors.voucherValidationFailed'));
        return;
      }
    }

    setError('');
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    if (uploading) return;
    setPaymentModalOpen(false);
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
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>{t('checkout.title')}</h1>
        <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>v2026-01-28</span>
      </div>

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
            <h2 style={{ marginBottom: '0.5rem' }}>{t('checkout.choosePromotion')}</h2>
            <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>{t('checkout.promotionNote')}</p>

            {/* Promotion Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {/* No Promotion */}
              <label style={{
                padding: '0.75rem',
                border: promotionType === 'none' ? '2px solid #f97316' : '1px solid #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                gap: '0.75rem',
                cursor: 'pointer',
                background: promotionType === 'none' ? '#fff7ed' : '#fff'
              }}>
                <input
                  type="radio"
                  name="promotionType"
                  checked={promotionType === 'none'}
                  onChange={() => {
                    setPromotionType('none');
                    setClaimedVouchers([]);
                  }}
                />
                <span style={{ fontWeight: 600 }}>{t('checkout.noPromotion')}</span>
              </label>

              {/* Promotion 1 - Referral Vouchers */}
              <label style={{
                padding: '0.75rem',
                border: promotionType === 'referral' ? '2px solid #f97316' : '1px solid #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                gap: '0.75rem',
                cursor: user.vouchers === 0 ? 'not-allowed' : 'pointer',
                background: promotionType === 'referral' ? '#fff7ed' : '#fff',
                opacity: user.vouchers === 0 ? 0.5 : 1
              }}>
                <input
                  type="radio"
                  name="promotionType"
                  checked={promotionType === 'referral'}
                  disabled={user.vouchers === 0}
                  onChange={() => {
                    setPromotionType('referral');
                  }}
                />
                <div>
                  <span style={{ fontWeight: 600 }}>{t('checkout.promotion1')}</span>
                  {user.vouchers === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {t('checkout.availableVouchers')}: 0
                    </div>
                  )}
                </div>
              </label>

              {/* Promotion 2 - Registration 10% Discount */}
              <label style={{
                padding: '0.75rem',
                border: promotionType === 'registration' ? '2px solid #f97316' : '1px solid #d1d5db',
                borderRadius: '8px',
                display: 'flex',
                gap: '0.75rem',
                cursor: (!user.hasRegistrationVoucher || user.registrationVoucherUsed) ? 'not-allowed' : 'pointer',
                background: promotionType === 'registration' ? '#fff7ed' : '#fff',
                opacity: (!user.hasRegistrationVoucher || user.registrationVoucherUsed) ? 0.5 : 1
              }}>
                <input
                  type="radio"
                  name="promotionType"
                  checked={promotionType === 'registration'}
                  disabled={!user.hasRegistrationVoucher || user.registrationVoucherUsed}
                  onChange={() => {
                    setPromotionType('registration');
                    setClaimedVouchers([]);
                  }}
                />
                <div>
                  <span style={{ fontWeight: 600 }}>{t('checkout.promotion2')}</span>
                  {(!user.hasRegistrationVoucher || user.registrationVoucherUsed) && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                      {t('checkout.promotion2Disabled')}
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Referral Voucher Cards (shown when Promotion 1 selected) */}
            {promotionType === 'referral' && user.vouchers > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem', color: '#6b7280' }}>
                  {maxVouchers} {t('checkout.voucherMax')} ({t('checkout.availableVouchers')}: {user.vouchers})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem' }}>
                  {Array.from({ length: user.vouchers }, (_, index) => {
                    const voucherNumber = index + 1;
                    const isClaimed = claimedVouchers.includes(voucherNumber);
                    const isDisabled = !isClaimed && claimedCount >= maxVouchers;

                    return (
                      <div
                        key={`voucher-${voucherNumber}`}
                        style={{
                          padding: '0.75rem',
                          border: isClaimed ? '2px solid #16a34a' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          background: isClaimed ? '#ecfdf5' : '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{`Voucher #${voucherNumber}`}</div>
                        <button
                          type="button"
                          onClick={() => {
                            setClaimedVouchers((prev) => {
                              if (prev.includes(voucherNumber)) {
                                return prev.filter((voucher) => voucher !== voucherNumber);
                              }
                              if (prev.length >= maxVouchers) {
                                return prev;
                              }
                              return [...prev, voucherNumber].sort((a, b) => a - b);
                            });
                          }}
                          disabled={isDisabled}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: isClaimed ? '#16a34a' : '#f97316',
                            color: 'white',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            opacity: isDisabled ? 0.6 : 1
                          }}
                        >
                          {isClaimed ? t('checkout.unclaimVoucher') : t('checkout.claimVoucher')}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Referral Voucher Terms & Conditions */}
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                  <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#92400e' }}>
                    {t('checkout.voucherTermsTitle')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#78350f', whiteSpace: 'pre-line' }}>
                    {t('checkout.voucherTerms')}
                  </p>
                </div>
              </div>
            )}

            {/* Registration Discount Preview (shown when Promotion 2 selected) */}
            {promotionType === 'registration' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#ecfdf5', border: '1px solid #86efac', borderRadius: '8px' }}>
                <p style={{ fontWeight: 600, color: '#166534' }}>
                  {t('checkout.registrationDiscountApplied').replace('{amount}', registrationDiscount.toFixed(2))}
                </p>
              </div>
            )}

            {/* Registration Voucher Terms & Conditions */}
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#92400e' }}>
                {t('checkout.registrationVoucherTermsTitle')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#78350f', whiteSpace: 'pre-line' }}>
                {t('checkout.registrationVoucherTerms')}
              </p>
            </div>
          </section>

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
              <span>RM {deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span>{t('checkout.total')}</span>
            <span>RM {totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={
              placingOrder ||
              uploading ||
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
            {placingOrder ? t('checkout.placingOrder') : t('checkout.proceedToPayment')}
          </button>
        </div>
      </div>

      {paymentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 50
          }}
          onClick={() => {
            if (!uploading) {
              handleClosePaymentModal();
            }
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              background: '#fff',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{t('checkout.payment')}</h2>
              <button
                type="button"
                onClick={handleClosePaymentModal}
                disabled={uploading}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.25rem',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  color: '#6b7280'
                }}
                aria-label={t('checkout.close')}
              >
                &times;
              </button>
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handleClosePaymentModal}
                disabled={uploading}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  cursor: uploading ? 'not-allowed' : 'pointer'
                }}
              >
                {t('checkout.cancel')}
              </button>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placingOrder || uploading || !paymentProofUrl || !paymentAccountName.trim()}
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: placingOrder ? '#9ca3af' : '#f97316',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: placingOrder || uploading || !paymentProofUrl ? 'not-allowed' : 'pointer'
                }}
              >
                {placingOrder ? t('checkout.placingOrder') : t('checkout.submitOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
