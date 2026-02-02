'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import {
  calculateMaxVouchers,
  calculateVoucherDiscount,
  calculateRegistrationDiscount,
  validateVoucherUsage
} from '@/lib/orderService';
import { Address } from '@/types/user';
import {
  calculateEffectiveDeliveryFee,
  getCodRequiredPaymentAmount,
  getDeliveryAreaName
} from '@/app/data/deliveryAreas';

const CHECKOUT_DRAFT_KEY = 'checkoutDraft';

export default function CheckoutPage() {
  const { items, loading: cartLoading, subtotal, clearCart } = useCart();
  const { user, firebaseUser, loading: authLoading } = useUser();
  const router = useRouter();
  const { t } = useI18n();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [promotionType, setPromotionType] = useState<'none' | 'referral' | 'registration'>('none');
  const [claimedVouchers, setClaimedVouchers] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'touch_n_go' | 'cod'>('touch_n_go');
  const [error, setError] = useState('');
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<string>('');
  const [addressAlertOpen, setAddressAlertOpen] = useState(false);
  const [codInfoOpen, setCodInfoOpen] = useState(false);

  const addresses = user?.addresses || [];
  const { fee: deliveryFee, isFreeDelivery } = calculateEffectiveDeliveryFee(selectedDeliveryArea, subtotal);
  const deliveryAreaName = getDeliveryAreaName(selectedDeliveryArea);
  const codRequiredPaymentAmount = getCodRequiredPaymentAmount(deliveryFee);

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

  const selectedAddress = useMemo<Address | undefined>(() => {
    return addresses.find(addr => addr.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

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
    try {
      sessionStorage.setItem(
        CHECKOUT_DRAFT_KEY,
        JSON.stringify({
          selectedAddressId,
          promotionType,
          claimedVouchers,
          paymentMethod,
          selectedDeliveryArea
        })
      );
    } catch (storageError) {
      console.error('Failed to store checkout draft:', storageError);
    }
    router.push('/checkout/payment');
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

            {/* Payment Method Selection */}
            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{t('checkout.paymentMethodLabel')}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('touch_n_go');
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
              <span>{isFreeDelivery ? t('cart.free') : `RM ${deliveryFee.toLocaleString()}`}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span>{t('checkout.total')}</span>
            <span>RM {totalAmount.toLocaleString()}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            disabled={
              false
            }
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#f97316',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {t('checkout.proceedToPayment')}
          </button>
        </div>
      </div>

      {addressAlertOpen && (
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
          onClick={() => setAddressAlertOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: '#fff',
              borderRadius: '12px',
              padding: '1.5rem 1.5rem calc(1.5rem + 140px)',
              textAlign: 'center'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{t('checkout.shippingAddress')}</h3>
            <p style={{ marginBottom: '1.25rem', color: '#6b7280' }}>
              {addresses.length === 0
                ? t('checkout.errors.addressRequired')
                : t('checkout.errors.addressSelect')}
            </p>
            <button
              type="button"
              onClick={() => setAddressAlertOpen(false)}
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
              {t('checkout.paymentInstructionCod').replace('{amount}', codRequiredPaymentAmount.toFixed(2))}
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

