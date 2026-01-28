'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ImageGallery from '@/components/ImageGallery';
import ProductCard from '@/app/components/ProductCard';
import { fetchProducts } from '@/lib/productService';
import { getLocalizedProductDescription, getLocalizedProductName, getProductImagePath } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

type ProductContentProps = {
  slug: string;
};

export default function ProductContent({ slug }: ProductContentProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { firebaseUser } = useUser();
  const { t, locale } = useI18n();

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        const foundProduct = fetchedProducts.find((p: any) => p.id.toString() === slug);
        setProduct(foundProduct);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">{t('product.loading')}</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const productName = getLocalizedProductName(product, locale);
  const productDescription = getLocalizedProductDescription(product, locale);
  const suggestedProducts = products
    .filter((item: any) => item.id !== product.id && item.category === product.category)
    .slice(0, 4);

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    setAddingToCart(true);
    const displayPrice = product.isOnSale && product.offerPrice ? product.offerPrice : product.price;

    try {
      await addItem({
        productId: String(product.id),
        productName,
        productImage: getProductImagePath(product, product.category),
        quantity: 1,
        price: displayPrice || 0,
        category: product.category
      });
    } finally {
      setTimeout(() => setAddingToCart(false), 1000);
    }
  };

  const specs = [
    { label: t('product.specs.effectType'), value: product.effectType, icon: '✨' },
    { label: t('product.specs.duration'), value: product.duration, icon: '⏱️' },
    { label: t('product.specs.noiseLevel'), value: product.noiseLevel, icon: '🔊' },
    { label: t('product.specs.shotCount'), value: product.shotCount, icon: '🎯' },
    { label: t('product.specs.safetyDistance'), value: product.safetyDistance, icon: '⚠️' },
    { label: t('product.specs.availability'), value: product.availability, icon: '📦' }
  ].filter((spec) => spec.value !== undefined && spec.value !== '');

  return (
    <>
      <div className="product-page">
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

        <div className="product-container">
          <div className="product-content">
            {/* Product Image Gallery */}
            <div className="gallery-section">
              <div className="gallery-card">
                <ImageGallery product={product} />
              </div>
            </div>

            {/* Product Details */}
            <div className="details-section">
              {/* Product Title Card */}
              <div className="detail-card title-card">
                <h1 className="product-title">{productName}</h1>

                <div className="title-card-row">
                  {/* Price Section */}
                  <div className="price-section">
                    {firebaseUser ? (
                      product.isOnSale && product.offerPrice ? (
                        <>
                          <div className="price-row">
                            <span className="sale-price">RM {product.offerPrice.toFixed(2)}</span>
                            <span className="sale-badge">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                              {t('common.sale')}
                            </span>
                          </div>
                          <span className="original-price">RM {product.price.toFixed(2)}</span>
                          <div className="savings-badge">
                            {t('product.savePrefix')} RM {(product.price - product.offerPrice).toFixed(2)}{t('product.saveSuffix')}
                          </div>
                        </>
                      ) : (
                        <span className="regular-price">
                          {product.price ? `RM ${product.price.toFixed(2)}` : t('common.contactForPrice')}
                        </span>
                      )
                    ) : (
                      <span className="regular-price">{t('common.loginToSeePrice')}</span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="add-to-cart-btn add-to-cart-compact"
                  >
                    {addingToCart ? (
                      <>
                        <svg className="btn-spinner" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="none" strokeWidth="3" />
                        </svg>
                        {t('product.adding')}
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {t('common.addToCart')}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Description Card */}
              {productDescription && (
                <div className="detail-card description-card">
                  <h2 className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('product.description')}
                  </h2>
                  <p className="description-text">{productDescription}</p>
                </div>
              )}

              {/* Specifications Card */}
              {specs.length > 0 && (
                <div className="detail-card specs-card">
                  <h2 className="card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {t('product.specifications')}
                  </h2>
                  <div className="specs-grid">
                    {specs.map((spec) => (
                      <div key={spec.label} className="spec-item">
                        <div className="spec-icon">{spec.icon}</div>
                        <div className="spec-content">
                          <div className="spec-label">{spec.label}</div>
                          <div className="spec-value">{spec.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {suggestedProducts.length > 0 && (
          <div className="suggested-section">
            <div className="suggested-header">
              <h2>{t('product.suggestedTitle')}</h2>
            </div>
            <div className="suggested-grid">
              {suggestedProducts.map((suggested) => (
                <ProductCard key={suggested.id} product={suggested} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        .product-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          font-family: 'Poppins', sans-serif;
          padding: 2rem 1rem;
          padding-top: 4rem;
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

        .product-container {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
        }

        .product-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .product-content {
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
          }
        }

        .gallery-section {
          animation: slide-up 0.6s ease-out;
        }

        .gallery-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 2rem;
        }

        .details-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          animation: slide-up 0.6s ease-out backwards;
        }

        .title-card {
          animation-delay: 0.1s;
        }

        .description-card {
          animation-delay: 0.2s;
        }

        .specs-card {
          animation-delay: 0.3s;
        }

        .product-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .price-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          flex: 1 1 auto;
        }

        .title-card-row {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          justify-content: space-between;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .sale-price {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .regular-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
        }

        .original-price {
          font-size: 1.25rem;
          color: #9ca3af;
          text-decoration: line-through;
        }

        .sale-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sale-badge svg {
          width: 16px;
          height: 16px;
        }

        .savings-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 8px;
          align-self: flex-start;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .card-title svg {
          width: 24px;
          height: 24px;
          color: #667eea;
        }

        .description-text {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #4b5563;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .spec-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .spec-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        .spec-icon {
          font-size: 2rem;
          line-height: 1;
        }

        .spec-content {
          flex: 1;
          min-width: 0;
        }

        .spec-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7280;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .spec-value {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
        }

        .suggested-section {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 2.5rem auto 0;
          padding: 0 1rem 2rem;
        }

        .suggested-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .suggested-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          text-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .suggested-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 1.5rem;
        }

        @media (min-width: 640px) {
          .suggested-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .suggested-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 1.25rem 2rem;
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
          animation: slide-up 0.6s ease-out 0.4s backwards;
        }

        .add-to-cart-compact {
          width: auto;
          min-width: 200px;
          align-self: flex-start;
          animation: none;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6);
        }

        .add-to-cart-btn:active:not(:disabled) {
          transform: translateY(-2px);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .add-to-cart-btn svg {
          width: 24px;
          height: 24px;
        }

        .btn-spinner {
          animation: spin 1s linear infinite;
        }

        .btn-spinner circle {
          stroke: currentColor;
          stroke-dasharray: 50;
          stroke-dashoffset: 25;
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

        /* Responsive */
        @media (max-width: 768px) {
          .product-page {
            padding: 1rem;
            padding-top: 2rem;
          }

          .product-title {
            font-size: 2rem;
          }

          .sale-price,
          .regular-price {
            font-size: 2rem;
          }

          .gallery-card {
            position: static;
          }

          .specs-grid {
            grid-template-columns: 1fr;
          }

          .title-card-row {
            flex-direction: column;
          }

          .add-to-cart-compact {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
