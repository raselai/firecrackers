'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/app/components/ProductCard';
import { fetchProducts } from '@/lib/productService';
import { useI18n } from '@/i18n/I18nProvider';

// Category data specifically for Others
const categoryData = {
  'others': {
    name: 'Other Products',
    description: 'Discover our diverse collection of unique lighting solutions that don\'t fit into traditional categories. From custom designs to specialty lighting, find the perfect solution for your specific needs.',
    featureImage: '/images/categories/ceiling-lights.jpg',
    features: [
      'Custom lighting solutions',
      'Specialty and unique designs',
      'One-of-a-kind pieces',
      'Versatile applications'
    ]
  }
};

type CategoryContentProps = {
  categorySlug: string;
};

export default function CategoryContent({ categorySlug }: CategoryContentProps) {
  const { t } = useI18n();
  const categoryInfo = categoryData[categorySlug as keyof typeof categoryData] || {
    name: 'Other Products',
    description: t('category.defaultDescription'),
    featureImage: '/images/categories/ceiling-lights.jpg',
    features: []
  };
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products on component mount
  useEffect(() => {
    console.log('useEffect: Starting to load products for Others category');
    const loadProducts = async () => {
      try {
        console.log('Fetching products for Others category...');
        const fetchedProducts = await fetchProducts();
        console.log('All fetched products for Others:', fetchedProducts);
        console.log('Number of products loaded for Others:', fetchedProducts.length);
        setProducts(fetchedProducts || []);
      } catch (error) {
        console.error('Error loading products for Others category:', error);
        setProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Filter products specifically for Others category
  const otherProducts = products.filter((product: any) => {
    const productCategory = product.category?.toLowerCase() || '';
    
    // Debug logging
    console.log('Others filtering for product:', product.name, {
      categorySlug,
      productCategory,
      productName: product.name
    });
    
    // Check if the product category is "Others" (case-insensitive)
    if (productCategory === 'others') {
      console.log('Match found for Others category');
      return true;
    }
    
    return false;
  });

  console.log('Filtered Others products count:', otherProducts.length);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>{t('categoryOthers.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Products Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            {otherProducts.length > 0
              ? `${otherProducts.length} ${t('categoryOthers.productsAvailable')}`
              : t('categoryOthers.noProductsAvailable')}
          </h2>

          {otherProducts.length > 0 ? (
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
            href={`https://wa.me/0122150334?text=${encodeURIComponent(t('categoryOthers.whatsappMessage'))}`}
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
