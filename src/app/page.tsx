'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/productService';
import { getProductImagePath } from '@/lib/utils';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'indoor' | 'outdoor' | 'others'>('all');

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Get featured products from actual product data
  const featuredProducts = products.filter((product: any) => product.isFeatured).slice(0, 6);

  // Get seasonal sale products (products that are on sale)
  const seasonalProducts = products.filter((product: any) => product.isOnSale).slice(0, 6);

  // Filter products by category for the new products section
  const indoorProducts = products.filter((product: any) => 
    product.category && product.category.toLowerCase().includes('indoor')
  );

  const outdoorProducts = products.filter((product: any) =>
    product.category && product.category.toLowerCase().includes('outdoor')
  );

  const othersProducts = products.filter((product: any) =>
    product.category && product.category.toLowerCase().includes('others')
  );

  // Get current tab products
  const currentTabProducts = activeTab === 'all'
    ? products
    : activeTab === 'indoor'
    ? indoorProducts
    : activeTab === 'outdoor'
    ? outdoorProducts
    : othersProducts;


  return (
    <div>
      {/* Hero Section with Video Background */}
      <section className="relative overflow-hidden min-h-[60vh] md:min-h-[75vh]">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/images/hero/Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/60 via-red-500/45 to-yellow-400/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6 py-16 pt-24 md:pt-28">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.3em] text-xs md:text-sm text-orange-100/90 mb-4">
              Spark the Celebration
            </p>
            <h1 className="hero-title text-4xl md:text-6xl font-bold text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
              Refer a friend and earn{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 text-transparent bg-clip-text">
                RM20
              </span>{' '}
              in fireworks joy
            </h1>
            <p className="mt-4 text-base md:text-xl text-orange-100/90">
              Share your code, light up their first order, and celebrate together.
            </p>
          </div>
        </div>
        <style jsx>{`
          @keyframes hero-rise {
            0% {
              opacity: 0;
              transform: translateY(18px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .hero-title {
            animation: hero-rise 0.9s ease-out both;
          }
        `}</style>
      </section>

      {/* New Products Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f9fafb' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>
            New Products
            </h2>
          
          {/* Tabs */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
            gap: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.75rem 2rem',
                background: activeTab === 'all' ? '#f97316' : 'white',
                color: activeTab === 'all' ? 'white' : '#374151',
                border: '2px solid #f97316',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'all') {
                  e.currentTarget.style.background = '#fff1e6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'all') {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('indoor')}
              style={{
                padding: '0.75rem 2rem',
                background: activeTab === 'indoor' ? '#f97316' : 'white',
                color: activeTab === 'indoor' ? 'white' : '#374151',
                border: '2px solid #f97316',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'indoor') {
                  e.currentTarget.style.background = '#fff1e6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'indoor') {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              Ground Effects
            </button>
            <button
              onClick={() => setActiveTab('outdoor')}
                style={{
                padding: '0.75rem 2rem',
                background: activeTab === 'outdoor' ? '#f97316' : 'white',
                color: activeTab === 'outdoor' ? 'white' : '#374151',
                border: '2px solid #f97316',
                  borderRadius: '8px',
                  cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                  transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => {
                if (activeTab !== 'outdoor') {
                  e.currentTarget.style.background = '#fff1e6';
                }
                }}
                onMouseLeave={(e) => {
                if (activeTab !== 'outdoor') {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              Aerial Effects
            </button>
            <button
              onClick={() => setActiveTab('others')}
              style={{
                padding: '0.75rem 2rem',
                background: activeTab === 'others' ? '#f97316' : 'white',
                color: activeTab === 'others' ? 'white' : '#374151',
                border: '2px solid #f97316',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'others') {
                  e.currentTarget.style.background = '#fff1e6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'others') {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              Others
            </button>
          </div>

          {/* Products Grid */}
          <div className="new-products-grid" style={{
            marginTop: '2rem'
          }}>
            {loading ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '2rem' 
              }}>
                <p>Loading products...</p>
              </div>
            ) : currentTabProducts.length > 0 ? (
              currentTabProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <Link
                    href={`/products/${product.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block'
                }}
              >
                <div style={{ 
                      height: '140px', 
                      width: '100%',
                      aspectRatio: '1 / 1', // Square aspect ratio
                  position: 'relative', 
                      borderRadius: '8px',
                  marginBottom: '1rem',
                  overflow: 'hidden'
                }}>
                  <Image
                        src={getProductImagePath(product, product.category)}
                        alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ color: '#6b7280', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                      {product.category}
                    </p>
              </Link>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      RM {product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '2rem',
                color: '#6b7280'
              }}>
                <p>No {activeTab} products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
              Featured Products
          </h2>
          <div className="product-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading products...</p>
              </div>
            ) : (
              featuredProducts.map((product) => (
              <div key={product.id} className="product-card">
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
                    <Image
                      src={getProductImagePath(product, product.category)}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                  <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                    {product.category}
                  </p>
                  <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
                    {product.description}
                  </p>
                </Link>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    RM {product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* Seasonal Sales */}
      <section style={{ padding: '4rem 0', backgroundColor: '#fef3c7' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#d97706' }}>
              🎉 Seasonal Sales
            </h2>
            <p style={{ color: '#92400e', fontSize: '1.1rem' }}>
              Limited time offers on premium lighting products
            </p>
          </div>
          <div className="product-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading products...</p>
              </div>
            ) : (
              seasonalProducts.map((product) => (
              <div key={product.id} className="product-card" style={{ 
                position: 'relative',
                border: '2px solid #f59e0b'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#dc2626',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  zIndex: 10
                }}>
                  SALE
                </div>
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
                    <Image
                      src={getProductImagePath(product, product.category)}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                  <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                    {product.category}
                  </p>
                  <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
                    {product.description}
                  </p>
                </Link>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold', 
                      color: '#dc2626' 
                    }}>
                      RM {product.price.toLocaleString()}
                    </span>
                    <span style={{ 
                      fontSize: '0.9rem', 
                      color: '#6b7280', 
                      textDecoration: 'line-through',
                      marginLeft: '0.5rem'
                    }}>
                      RM {(product.price * 1.2).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <div 
        className="whatsapp-float"
        onClick={() => {
          const message = "Hi! I'm interested in your lighting products. Can you help me?";
          const whatsappUrl = `https://wa.me/971506970154?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>💬</span>
      </div>
    </div>
  );
}

