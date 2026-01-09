'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';
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

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [voucherCount, setVoucherCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [paymentProofPath, setPaymentProofPath] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [orderId] = useState(() => `ORD-${nanoid(10).toUpperCase()}`);

  const addresses = user?.addresses || [];

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, firebaseUser, router]);

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

  const selectedAddress = useMemo<Address | undefined>(() => {
    return addresses.find(addr => addr.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const handleUploadProof = async (file: File) => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!userId) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setError('Image must be smaller than 5MB.');
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
      setError('Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const userId = firebaseUser?.uid || user?.uid;
    if (!userId || !user) return;

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (addresses.length === 0) {
      setError('Please add a shipping address before placing the order.');
      return;
    }

    if (!selectedAddress) {
      setError('Please select a shipping address.');
      return;
    }

    if (!paymentProofUrl) {
      setError('Please upload your payment screenshot.');
      return;
    }

    const validation = validateVoucherUsage(subtotal, voucherCount, user.vouchers);
    if (!validation.valid) {
      setError(validation.message || 'Voucher validation failed.');
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
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading || (firebaseUser && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
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
        <h1 style={{ marginBottom: '1rem' }}>Checkout</h1>
        <p style={{ color: '#6b7280' }}>Your cart is empty.</p>
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Checkout</h1>

      {error && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Shipping Address</h2>
            {addresses.length === 0 ? (
              <div>
                <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
                  You don’t have any saved addresses yet.
                </p>
                <Link href="/account/profile" style={{ color: '#3b82f6', textDecoration: 'none' }}>
                  Add an address
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
            <h2 style={{ marginBottom: '1rem' }}>Voucher</h2>
            {maxVouchers === 0 ? (
              <p style={{ color: '#6b7280' }}>
                Spend at least RM100 to apply a voucher.
              </p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label htmlFor="voucherCount">Vouchers to apply</label>
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
                  {maxVouchers} max (available: {user.vouchers})
                </span>
              </div>
            )}
          </section>

          <section style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
            <h2 style={{ marginBottom: '1rem' }}>Payment</h2>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ width: '220px' }}>
                <Image
                  src="/images/ewallet-qr.jpg"
                  alt="Touch 'n Go eWallet QR"
                  width={220}
                  height={300}
                  style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Touch ’n Go eWallet</p>
                <p style={{ marginBottom: '0.25rem' }}>Name: {WALLET_NAME}</p>
                <p style={{ marginBottom: '1rem' }}>Wallet No: {WALLET_NUMBER}</p>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Transfer the total amount and upload your payment screenshot below.
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
                {uploading && <p style={{ marginTop: '0.5rem' }}>Uploading proof...</p>}
                {paymentProofUrl && !uploading && (
                  <p style={{ marginTop: '0.5rem', color: '#059669' }}>Payment proof uploaded.</p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>RM {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Voucher discount</span>
            <span>- RM {voucherDiscount.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span>Total</span>
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
            {placingOrder ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
