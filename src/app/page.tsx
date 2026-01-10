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
  const [mounted, setMounted] = useState(false);

  // Load products on component mount
  useEffect(() => {
    setMounted(true);
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
    <div className="homepage-wrapper">
      {/* Hero Section with Video Background */}
      <section className="hero-section">
        <div className="hero-video-container">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/images/hero/Video.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
          <div className="hero-radial-glow" />
        </div>
        <div className={`hero-content ${mounted ? 'hero-content-animate' : ''}`}>
          <div className="hero-inner">
            <p className="hero-eyebrow">
              Spark the Celebration
            </p>
            <h1 className="hero-title">
              Refer a friend and earn{' '}
              <span className="hero-highlight">
                RM20
              </span>{' '}
              in fireworks joy
            </h1>
            <p className="hero-subtitle">
              Share your code, light up their first order, and celebrate together.
            </p>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="new-products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Discover our latest explosive selections</p>
          </div>

          {/* Tabs */}
          <div className="category-tabs">
            <button
              onClick={() => setActiveTab('all')}
              className={`category-tab ${activeTab === 'all' ? 'category-tab-active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('indoor')}
              className={`category-tab ${activeTab === 'indoor' ? 'category-tab-active' : ''}`}
            >
              Ground Effects
            </button>
            <button
              onClick={() => setActiveTab('outdoor')}
              className={`category-tab ${activeTab === 'outdoor' ? 'category-tab-active' : ''}`}
            >
              Aerial Effects
            </button>
            <button
              onClick={() => setActiveTab('others')}
              className={`category-tab ${activeTab === 'others' ? 'category-tab-active' : ''}`}
            >
              Others
            </button>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : currentTabProducts.length > 0 ? (
              currentTabProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="product-card-new"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="product-image-wrapper">
                    <Image
                      src={getProductImagePath(product, product.category)}
                      alt={product.name}
                      fill
                      className="product-image"
                    />
                    <div className="product-glow"></div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <div className="product-price">RM {product.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <p>No {activeTab} products available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Selections</h2>
            <p className="section-subtitle">Handpicked for maximum impact</p>
          </div>
          <div className="featured-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="featured-card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="featured-badge">Featured</div>
                  <div className="featured-image-wrapper">
                    <Image
                      src={getProductImagePath(product, product.category)}
                      alt={product.name}
                      fill
                      className="featured-image"
                    />
                    <div className="featured-overlay"></div>
                  </div>
                  <div className="featured-info">
                    <div className="featured-category">{product.category}</div>
                    <h3 className="featured-name">{product.name}</h3>
                    <p className="featured-description">{product.description}</p>
                    <div className="featured-price">RM {product.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Seasonal Sales */}
      <section className="sales-section">
        <div className="sales-background-glow"></div>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title sales-title">Limited Time Offers</h2>
            <p className="section-subtitle">Explosive deals for the season</p>
          </div>
          <div className="sales-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              seasonalProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="sale-card"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="sale-badge">
                    <span className="sale-badge-text">SALE</span>
                  </div>
                  <div className="sale-image-wrapper">
                    <Image
                      src={getProductImagePath(product, product.category)}
                      alt={product.name}
                      fill
                      className="sale-image"
                    />
                    <div className="sale-image-overlay"></div>
                  </div>
                  <div className="sale-info">
                    <div className="sale-category">{product.category}</div>
                    <h3 className="sale-name">{product.name}</h3>
                    <p className="sale-description">{product.description}</p>
                    <div className="sale-pricing">
                      <span className="sale-price">RM {product.price.toLocaleString()}</span>
                      <span className="sale-original-price">RM {(product.price * 1.2).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* WhatsApp Float Button */}
      <div
        className="whatsapp-float"
        onClick={() => {
          const message = "Hi! I'm interested in your fireworks products. Can you help me?";
          const whatsappUrl = `https://wa.me/971506970154?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}

