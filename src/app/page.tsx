'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchProducts } from '@/lib/productService';
import { getLocalizedProductDescription, getLocalizedProductName, getProductImagePath } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';
import { useUser } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { t, locale } = useI18n();
  const { firebaseUser } = useUser();
  const { addItem } = useCart();
  const [showCartToast, setShowCartToast] = useState(false);
  const [cartToastMessage, setCartToastMessage] = useState('');
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'];

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

  const categoryTabs = [
    { key: 'all', value: 'all' },
    { key: 'redCrackersSeries', value: 'Red crackers series' },
    { key: 'kidsSeries', value: 'Kids series' },
    { key: 'handleSeries', value: 'Handle series' },
    { key: 'fountainSeries', value: 'Fountain series' },
    { key: 'firework4InchSeries', value: '4inch & 5inch firework series' },
    { key: 'firework6InchSeries', value: '6inch firework series' },
    { key: 'firework7InchSeries', value: '7inch firework series' },
    { key: 'firework8InchSeries', value: '8inch & 9inch firework series' },
    { key: 'firework10InchSeries', value: '10inch firework series' },
    { key: 'firework11InchSeries', value: '11inch firework series' },
    { key: 'firework12InchSeries', value: '12inch firework series' },
    { key: 'bigHoleFireworkSeries', value: 'Big hole firework series' }
  ];

  // Get featured products from actual product data
  const featuredProducts = products.filter((product: any) => product.isFeatured).slice(0, 6);

  // Get seasonal sale products (products that are on sale)
  const seasonalProducts = products.filter((product: any) => product.isOnSale).slice(0, 6);

  const currentTabProducts = products.filter((product: any) => {
    if (selectedCategory === 'all') return true;
    const category = product.category || '';
    const subcategory = product.subcategory || '';
    return category === selectedCategory || subcategory === selectedCategory;
  });

  const isVideoUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return videoExtensions.some((ext) => cleanUrl.endsWith(`.${ext}`));
  };

  const VideoPreview = ({ src, className }: { src: string; className: string }) => (
    <video
      src={src}
      className={className}
      muted
      playsInline
      preload="metadata"
    />
  );

  const showCartNotification = (message: string) => {
    setCartToastMessage(message);
    setShowCartToast(true);
    setTimeout(() => setShowCartToast(false), 2000);
  };

  const handleAddToCart = async (
    event: React.MouseEvent,
    product: any
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!firebaseUser) return;

    const displayPrice = product.isOnSale && product.offerPrice ? product.offerPrice : product.price;
    const localizedName = getLocalizedProductName(product, locale);

    try {
      await addItem({
        productId: String(product.id),
        productName: localizedName,
        productImage: getProductImagePath(product, product.category),
        quantity: 1,
        price: displayPrice || 0,
        category: product.category
      });
      showCartNotification(t('common.addedToCart'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      showCartNotification(t('common.addToCartFailed'));
    }
  };

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
              {t('home.heroEyebrow')}
            </p>
            <div className="hero-title-slider">
              <div className="hero-title-slide">
                {t('home.heroTitlePrefix')}{' '}
                <span className="hero-highlight">
                  {t('home.heroTitleHighlight')}
                </span>{' '}
                {t('home.heroTitleSuffix')}
              </div>
              <div className="hero-title-slide">
                {t('home.heroSlide2')}
              </div>
              <div className="hero-title-slide">
                {t('home.heroSlide3')}
              </div>
            </div>
            <p className="hero-subtitle">
              {t('home.heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="new-products-section">
        <div className="container">
          <div className="category-tabs">
            {categoryTabs.map((tab) => {
              const isActive = selectedCategory === tab.value;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedCategory(tab.value)}
                  className={`category-tab ${isActive ? 'category-tab-active' : ''}`}
                >
                  {tab.key === 'all' ? 'All' : t(`nav.categorySeries.${tab.key}`)}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('common.loadingProducts')}</p>
              </div>
            ) : currentTabProducts.length > 0 ? (
              currentTabProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="product-card-new"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <div className="product-image-wrapper">
                      {isVideoUrl(getProductImagePath(product, product.category)) ? (
                        <VideoPreview
                          src={getProductImagePath(product, product.category)}
                          className="product-image"
                        />
                      ) : (
                        <Image
                          src={getProductImagePath(product, product.category)}
                          alt={getLocalizedProductName(product, locale)}
                          fill
                          className="product-image"
                        />
                      )}
                      <div className="product-glow"></div>
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{getLocalizedProductName(product, locale)}</h3>
                      <p className="product-category">{product.category}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                        <div className="product-price">
                          {firebaseUser ? `RM ${(product.price || 0).toLocaleString()}` : t('common.loginToSeePrice')}
                        </div>
                        {firebaseUser && (
                          <button
                            type="button"
                            onClick={(event) => handleAddToCart(event, product)}
                            style={{
                              padding: '0.5rem 0.9rem',
                              background: '#0f172a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '999px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {t('common.addToCart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>{`${t('home.noProductsPrefix')} ${t('home.noProductsSuffix')}`}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.featuredTitle')}</h2>
            <p className="section-subtitle">{t('home.featuredSubtitle')}</p>
          </div>
          <div className="featured-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('common.loadingProducts')}</p>
              </div>
            ) : (
              featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="featured-card"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <div className="featured-badge">{t('home.featuredBadge')}</div>
                    <div className="featured-image-wrapper">
                      {isVideoUrl(getProductImagePath(product, product.category)) ? (
                        <VideoPreview
                          src={getProductImagePath(product, product.category)}
                          className="featured-image"
                        />
                      ) : (
                        <Image
                          src={getProductImagePath(product, product.category)}
                          alt={getLocalizedProductName(product, locale)}
                          fill
                          className="featured-image"
                        />
                      )}
                      <div className="featured-overlay"></div>
                    </div>
                    <div className="featured-info">
                      <div className="featured-category">{product.category}</div>
                      <h3 className="featured-name">{getLocalizedProductName(product, locale)}</h3>
                      <p className="featured-description">{getLocalizedProductDescription(product, locale)}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                        <div className="featured-price">
                          {firebaseUser ? `RM ${(product.price || 0).toLocaleString()}` : t('common.loginToSeePrice')}
                        </div>
                        {firebaseUser && (
                          <button
                            type="button"
                            onClick={(event) => handleAddToCart(event, product)}
                            style={{
                              padding: '0.5rem 0.9rem',
                              background: '#0f172a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '999px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {t('common.addToCart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
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
            <h2 className="section-title sales-title">{t('home.limitedTimeTitle')}</h2>
            <p className="section-subtitle">{t('home.limitedTimeSubtitle')}</p>
          </div>
          <div className="sales-grid">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>{t('common.loadingProducts')}</p>
              </div>
            ) : (
              seasonalProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="sale-card"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <div className="sale-badge">
                      <span className="sale-badge-text">{t('common.sale')}</span>
                    </div>
                    <div className="sale-image-wrapper">
                      {isVideoUrl(getProductImagePath(product, product.category)) ? (
                        <VideoPreview
                          src={getProductImagePath(product, product.category)}
                          className="sale-image"
                        />
                      ) : (
                        <Image
                          src={getProductImagePath(product, product.category)}
                          alt={getLocalizedProductName(product, locale)}
                          fill
                          className="sale-image"
                        />
                      )}
                      <div className="sale-image-overlay"></div>
                    </div>
                    <div className="sale-info">
                      <div className="sale-category">{product.category}</div>
                      <h3 className="sale-name">{getLocalizedProductName(product, locale)}</h3>
                      <p className="sale-description">{getLocalizedProductDescription(product, locale)}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
                        <div className="sale-pricing">
                          {firebaseUser ? (
                            <>
                              <span className="sale-price">RM {(product.price || 0).toLocaleString()}</span>
                              <span className="sale-original-price">RM {((product.price || 0) * 1.2).toLocaleString()}</span>
                            </>
                          ) : (
                            <span className="sale-price">{t('common.loginToSeePrice')}</span>
                          )}
                        </div>
                        {firebaseUser && (
                          <button
                            type="button"
                            onClick={(event) => handleAddToCart(event, product)}
                            style={{
                              padding: '0.5rem 0.9rem',
                              background: '#0f172a',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '999px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '0.85rem'
                            }}
                          >
                            {t('common.addToCart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {showCartToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{cartToastMessage}</span>
          </div>
        </div>
      )}

      {/* WhatsApp Float Button */}
      <div
        className="whatsapp-float"
        onClick={() => {
          const message = t('home.whatsappMessage');
          const whatsappUrl = `https://wa.me/0122150334?text=${encodeURIComponent(message)}`;
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

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

