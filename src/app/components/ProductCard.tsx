
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { getProductImagePath } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { firebaseUser } = useUser();

  const handleAddToCart = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    const displayPrice = product.isOnSale && product.offerPrice ? product.offerPrice : product.price;

    await addItem({
      productId: String(product.id),
      productName: product.name,
      productImage: product.image || product.images?.[0] || '',
      quantity: 1,
      price: displayPrice || 0
    });
  };

  const imagePath = getProductImagePath(product, product.category);

  // Add error handling for missing product data
  if (!product || !product.name) {
    return (
      <div className="product-card">
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p>Product information unavailable</p>
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
          {imagePath.startsWith('data:') ? (
            // For base64 data URLs, use regular img tag
            <img
              src={imagePath}
              alt={product.name}
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
              alt={product.name}
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
        <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
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
          {product.isOnSale && product.offerPrice ? (
            <>
              <span style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: '#dc2626' 
              }}>
                RM {product.offerPrice.toLocaleString()}
              </span>
              <span style={{ 
                fontSize: '0.9rem', 
                color: '#6b7280', 
                textDecoration: 'line-through' 
              }}>
                RM {product.price.toLocaleString()}
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
                SALE!
              </span>
            </>
          ) : (
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {product.price ? `RM ${product.price.toLocaleString()}` : 'Contact for Price'}
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
          Add to Cart
        </button>
      </div>
    </div>
  );
}
