'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';

export default function CartPage() {
  const { items, loading, subtotal, updateQuantity, removeItem } = useCart();
  const { firebaseUser, loading: authLoading } = useUser();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      router.push('/login');
      return;
    }
    setCheckingAuth(false);
  }, [firebaseUser, authLoading, router]);

  if (checkingAuth || authLoading || loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 style={{ marginBottom: '1rem' }}>Your Cart</h1>
        <p style={{ color: '#6b7280' }}>Your cart is empty.</p>
        <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {items.map((item) => (
            <div
              key={item.productId}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '1rem',
                alignItems: 'center'
              }}
            >
              <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                {item.productImage ? (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '6px' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: '#f3f4f6',
                      borderRadius: '6px'
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.productName}</h3>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  RM {item.price.toLocaleString()}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor={`qty-${item.productId}`} style={{ fontSize: '0.9rem' }}>
                    Qty
                  </label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                    style={{
                      width: '70px',
                      padding: '0.35rem 0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px'
                    }}
                  />
                  <button
                    onClick={() => removeItem(item.productId)}
                    style={{
                      marginLeft: 'auto',
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 'bold' }}>
                RM {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1rem',
            height: 'fit-content'
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Summary</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>RM {subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span>Total</span>
            <span style={{ fontWeight: 'bold' }}>RM {subtotal.toLocaleString()}</span>
          </div>
          <button
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#1f2937',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => router.push('/checkout')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
