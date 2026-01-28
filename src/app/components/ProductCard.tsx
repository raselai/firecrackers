
'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { getLocalizedProductName, getProductImagePath } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { firebaseUser } = useUser();
  const { t, locale } = useI18n();
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'];

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    const displayPrice = product.isOnSale && product.offerPrice ? product.offerPrice : product.price;

    const localizedName = getLocalizedProductName(product, locale);

    await addItem({
      productId: String(product.id),
      productName: localizedName,
      productImage: getProductImagePath(product, product.category),
      quantity: 1,
      price: displayPrice || 0,
      category: product.category
    });
  };

  const imagePath = getProductImagePath(product, product.category);
  const isVideoUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return videoExtensions.some((ext) => cleanUrl.endsWith(`.${ext}`));
  };
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isVideoUrl(imagePath)) return;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl.play().catch(() => undefined);
        } else {
          videoEl.pause();
          videoEl.currentTime = 0;
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, [imagePath]);

  // Add error handling for missing product data
  const localizedName = getLocalizedProductName(product, locale);

  if (!product || !localizedName) {
    return (
      <div className="product-card">
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p>{t('common.productInfoUnavailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card">
      <Link
        href={`/products/${product.id}`}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'block'
        }}
      >
        <div style={{ 
          height: '200px', 
          position: 'relative',
          borderRadius: '8px',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          {isVideoUrl(imagePath) ? (
            <video
              ref={videoRef}
              src={imagePath}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : imagePath.startsWith('data:') ? (
            // For base64 data URLs, use regular img tag
            <img
              src={imagePath}
              alt={localizedName}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            // For regular URLs, use Next.js Image component
            <Image
              src={imagePath}
              alt={localizedName}
              fill
              style={{ objectFit: 'cover' }}
              priority={false}
              onError={(e) => {
                console.error('Image failed to load:', imagePath);
                // You could set a fallback image here
              }}
            />
          )}
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{localizedName}</h3>
        <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
          {product.category}
        </p>
      </Link>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {firebaseUser ? (
            product.isOnSale && product.offerPrice ? (
              <>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#dc2626'
                }}>
                  RM {(product.offerPrice || 0).toLocaleString()}
                </span>
                <span style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  textDecoration: 'line-through'
                }}>
                  RM {(product.price || 0).toLocaleString()}
                </span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: '#dc2626', 
                  fontWeight: '600',
                  backgroundColor: '#fef2f2',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  alignSelf: 'flex-start'
                }}>
                  {t('common.sale')}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                {product.price ? `RM ${product.price.toLocaleString()}` : t('common.contactForPrice')}
              </span>
            )
          ) : (
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280' }}>
              {t('common.loginToSeePrice')}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            padding: '0.5rem 0.75rem',
            background: '#1f2937',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {t('common.addToCart')}
        </button>
      </div>
    </div>
  );
}
