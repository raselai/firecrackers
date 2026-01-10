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
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="cart-page">
          {/* Animated Background */}
          <div className="animated-bg">
            <div className="gradient-blob blob-1"></div>
            <div className="gradient-blob blob-2"></div>
            <div className="gradient-blob blob-3"></div>
            <div className="gradient-blob blob-4"></div>
            <div className="gradient-blob blob-5"></div>

            {/* Floating Shapes */}
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="floating-shape"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${10 + Math.random() * 10}s`,
                  width: `${20 + Math.random() * 40}px`,
                  height: `${20 + Math.random() * 40}px`,
                }}
              />
            ))}
          </div>

          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h1 className="empty-cart-title">Your Cart is Empty</h1>
            <p className="empty-cart-text">Start adding items to your cart!</p>
            <Link href="/" className="continue-shopping-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

          .cart-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            font-family: 'Poppins', sans-serif;
          }

          .animated-bg {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
            z-index: 0;
          }

          .gradient-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            opacity: 0.6;
            animation: float-blob 20s ease-in-out infinite;
          }

          .blob-1 {
            width: 400px;
            height: 400px;
            background: linear-gradient(45deg, #ff6b9d, #c44569);
            top: -100px;
            left: -100px;
            animation-delay: 0s;
          }

          .blob-2 {
            width: 350px;
            height: 350px;
            background: linear-gradient(45deg, #feca57, #ff9ff3);
            top: 50%;
            right: -100px;
            animation-delay: 4s;
          }

          .blob-3 {
            width: 450px;
            height: 450px;
            background: linear-gradient(45deg, #48dbfb, #0abde3);
            bottom: -150px;
            left: 30%;
            animation-delay: 8s;
          }

          .blob-4 {
            width: 300px;
            height: 300px;
            background: linear-gradient(45deg, #ff9ff3, #54a0ff);
            top: 20%;
            left: 40%;
            animation-delay: 12s;
          }

          .blob-5 {
            width: 380px;
            height: 380px;
            background: linear-gradient(45deg, #5f27cd, #00d2d3);
            bottom: 10%;
            right: 20%;
            animation-delay: 16s;
          }

          .floating-shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float-shape linear infinite;
            backdrop-filter: blur(2px);
          }

          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            font-family: 'Poppins', sans-serif;
          }

          .loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
          }

          .spinner-ring {
            position: absolute;
            inset: 0;
            border: 4px solid transparent;
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 1.2s linear infinite;
          }

          .spinner-ring:nth-child(2) {
            border-top-color: #ffd700;
            animation-delay: 0.15s;
          }

          .spinner-ring:nth-child(3) {
            border-top-color: #ff6b9d;
            animation-delay: 0.3s;
          }

          .loading-text {
            color: white;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .empty-cart {
            position: relative;
            z-index: 10;
            text-align: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            padding: 4rem 3rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slide-up 0.6s ease-out;
          }

          .empty-cart-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: bounce-icon 2s ease-in-out infinite;
          }

          .empty-cart-title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
          }

          .empty-cart-text {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .continue-shopping-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 1rem;
            font-weight: 700;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .continue-shopping-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
          }

          .continue-shopping-btn svg {
            width: 20px;
            height: 20px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes float-blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 30px) scale(0.9);
            }
          }

          @keyframes float-shape {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce-icon {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="cart-page">
        {/* Animated Background */}
        <div className="animated-bg">
          <div className="gradient-blob blob-1"></div>
          <div className="gradient-blob blob-2"></div>
          <div className="gradient-blob blob-3"></div>
          <div className="gradient-blob blob-4"></div>
          <div className="gradient-blob blob-5"></div>

          {/* Floating Shapes */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="floating-shape"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
              }}
            />
          ))}
        </div>

        <div className="cart-container">
          <div className="cart-header">
            <h1 className="cart-title">Shopping Cart</h1>
            <p className="cart-subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} in your cart</p>
          </div>

          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-items">
              {items.map((item, index) => (
                <div
                  key={item.productId}
                  className="cart-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="item-image">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productName}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="image-placeholder">📦</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.productName}</h3>
                    <p className="item-price">RM {item.price.toLocaleString()}</p>

                    <div className="item-actions">
                      <div className="quantity-control">
                        <label htmlFor={`qty-${item.productId}`} className="qty-label">Qty</label>
                        <input
                          id={`qty-${item.productId}`}
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                          className="qty-input"
                        />
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="remove-btn"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="item-total">
                    RM {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>RM {subtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-tag">FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total-row">
                <span>Total</span>
                <span>RM {subtotal.toLocaleString()}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="checkout-btn"
              >
                Proceed to Checkout
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <Link href="/" className="continue-link">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .cart-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          padding: 2rem 1rem;
        }

        .animated-bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
          z-index: 0;
        }

        .gradient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.6;
          animation: float-blob 20s ease-in-out infinite;
        }

        .blob-1 {
          width: 400px;
          height: 400px;
          background: linear-gradient(45deg, #ff6b9d, #c44569);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 350px;
          height: 350px;
          background: linear-gradient(45deg, #feca57, #ff9ff3);
          top: 50%;
          right: -100px;
          animation-delay: 4s;
        }

        .blob-3 {
          width: 450px;
          height: 450px;
          background: linear-gradient(45deg, #48dbfb, #0abde3);
          bottom: -150px;
          left: 30%;
          animation-delay: 8s;
        }

        .blob-4 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #ff9ff3, #54a0ff);
          top: 20%;
          left: 40%;
          animation-delay: 12s;
        }

        .blob-5 {
          width: 380px;
          height: 380px;
          background: linear-gradient(45deg, #5f27cd, #00d2d3);
          bottom: 10%;
          right: 20%;
          animation-delay: 16s;
        }

        .floating-shape {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float-shape linear infinite;
          backdrop-filter: blur(2px);
        }

        .cart-container {
          position: relative;
          z-index: 10;
          max-width: 1200px;
          margin: 0 auto;
        }

        .cart-header {
          text-align: center;
          margin-bottom: 3rem;
          animation: slide-up 0.6s ease-out;
        }

        .cart-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .cart-subtitle {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .cart-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .cart-content {
            grid-template-columns: 2fr 1fr;
          }
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .cart-item {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          gap: 1.5rem;
          align-items: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          animation: slide-up 0.6s ease-out backwards;
        }

        .cart-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
        }

        .item-image {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 16px;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .item-price {
          font-size: 1.125rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .quantity-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qty-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .qty-input {
          width: 70px;
          padding: 0.5rem 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
          transition: all 0.3s ease;
        }

        .qty-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
        }

        .remove-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
        }

        .remove-btn svg {
          width: 18px;
          height: 18px;
        }

        .item-total {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
          text-align: right;
          min-width: 120px;
        }

        .cart-summary {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          height: fit-content;
          position: sticky;
          top: 2rem;
          animation: slide-up 0.6s ease-out 0.2s backwards;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .summary-row span:last-child {
          font-weight: 600;
          color: #1f2937;
        }

        .free-tag {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .summary-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 1.5rem 0;
        }

        .total-row {
          font-size: 1.25rem;
          margin-bottom: 2rem;
        }

        .total-row span {
          font-weight: 800;
          color: #1f2937;
        }

        .total-row span:last-child {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.75rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 1.25rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.125rem;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          margin-bottom: 1rem;
        }

        .checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
        }

        .checkout-btn svg {
          width: 20px;
          height: 20px;
        }

        .continue-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #667eea;
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .continue-link:hover {
          color: #764ba2;
        }

        .continue-link svg {
          width: 16px;
          height: 16px;
        }

        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          font-family: 'Poppins', sans-serif;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 4px solid transparent;
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          border-top-color: #ffd700;
          animation-delay: 0.15s;
        }

        .spinner-ring:nth-child(3) {
          border-top-color: #ff6b9d;
          animation-delay: 0.3s;
        }

        .loading-text {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        @keyframes float-shape {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-icon {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .cart-title {
            font-size: 2rem;
          }

          .cart-item {
            flex-direction: column;
            text-align: center;
          }

          .item-image {
            width: 100%;
            height: 200px;
          }

          .item-total {
            text-align: center;
            width: 100%;
          }

          .item-actions {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
