'use client';

import ProductCard from '@/app/components/ProductCard';
import Image from 'next/image';
import { fetchProducts } from '@/lib/productService';
import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nProvider';

export default function OthersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

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

  // Filter products that don't have a specific category or are marked as "others"
  const otherProducts = products.filter((product: any) => 
    !product.category || 
    product.category === 'others' || 
    product.category === 'other' ||
    product.category === 'miscellaneous'
  );

  const pageData = {
    name: 'Other Products',
    description: t('category.defaultDescription'),
    featureImage: '/images/categories/ceiling-lights.jpg', // Using a generic image
    features: [
      'Custom lighting solutions',
      'Specialty and unique designs',
      'One-of-a-kind pieces',
      'Versatile applications'
    ]
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="category-hero" style={{
        position: 'relative',
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${pageData.featureImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#1f2937',
        textAlign: 'center'
      }}>
        <div className="category-hero-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '2rem'
        }}>
          <h1 className="category-hero-title" style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8)'
          }}>
            {pageData.name}
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            maxWidth: '600px',
            margin: '0 auto',
            textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)'
          }}>
            {pageData.description}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '3rem 0', 
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {pageData.features.map((feature, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '1rem'
                }}>
                  ✨
                </div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  {feature}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              {t('categoryOthers.availableProductsTitle')}
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {t('categoryOthers.availableProductsSubtitle')}
            </p>
          </div>

                                {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                          <p>{t('category.loadingProducts')}</p>
                        </div>
                      ) : otherProducts.length > 0 ? (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '2rem',
                          marginTop: '2rem'
                        }}>
                          {otherProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#374151'
              }}>
                {t('categoryOthers.noProductsAvailable')}
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '1rem'
              }}>
                {t('categoryOthers.noProductsBody')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '4rem 0',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            {t('categoryOthers.contactTitle')}
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            {t('categoryOthers.contactBody')}
          </p>
          <a
                            href={`https://wa.me/971506970154?text=${encodeURIComponent(t('categoryOthers.whatsappMessage'))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#25d366',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            💬 {t('categoryOthers.contactWhatsApp')}
          </a>
        </div>
      </section>
    </div>
  );
} 
