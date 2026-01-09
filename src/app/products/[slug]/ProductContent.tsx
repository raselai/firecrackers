'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ImageGallery from '@/components/ImageGallery';
import { fetchProducts } from '@/lib/productService';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/AuthContext';

type ProductContentProps = {
  slug: string;
};

export default function ProductContent({ slug }: ProductContentProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();
  const { addItem } = useCart();
  const { firebaseUser } = useUser();

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
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

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

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '3rem',
          marginTop: '2rem'
        }}>
          {/* Product Image Gallery */}
          <div>
            <ImageGallery product={product} />
          </div>

          {/* Product Details */}
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {product.name}
            </h1>
            <div style={{ marginBottom: '2rem' }}>
              {product.isOnSale && product.offerPrice ? (
                <>
                  <p style={{ 
                    fontSize: '2rem', 
                    color: '#dc2626', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    RM {product.offerPrice.toFixed(2)}
                  </p>
                  <p style={{ 
                    fontSize: '1.2rem', 
                    color: '#6b7280', 
                    marginBottom: '0.5rem',
                    textDecoration: 'line-through'
                  }}>
                    RM {product.price.toFixed(2)}
                  </p>
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: '#dc2626', 
                    fontWeight: '600',
                    backgroundColor: '#fef2f2',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    SALE!
                  </span>
                </>
              ) : (
                <p style={{ 
                  fontSize: '2rem', 
                  color: '#1f2937', 
                  marginBottom: '2rem',
                  fontWeight: 'bold'
                }}>
                  {product.price ? `RM ${product.price.toFixed(2)}` : 'Contact for Price'}
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>
            
            <button
              onClick={handleAddToCart}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
