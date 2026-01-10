'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';

export default function GroundEffects() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { t } = useI18n();

  const groundProducts = [
    {
      id: 1,
      name: 'Crystal Palace Chandelier',
      price: 2850,
      category: 'Hanging Lights',
      availability: 'In Stock',
      description: 'Elegant crystal chandelier perfect for dining rooms',
      rating: 4.8,
      reviewCount: 12,
      image: '/images/products/crystal-palace-chandelier.jpg'
    },
    {
      id: 2,
      name: 'Modern Gold Chandelier',
      price: 1950,
      category: 'Hanging Lights',
      availability: 'In Stock',
      description: 'Contemporary gold-finished chandelier',
      rating: 4.6,
      reviewCount: 8,
      image: '/images/products/luxury-wall-sconce.jpg'
    },
    {
      id: 3,
      name: 'LED Flush Mount Ceiling Light',
      price: 385,
      category: 'Spotlight',
      availability: 'In Stock',
      description: 'Energy-efficient LED ceiling light',
      rating: 4.7,
      reviewCount: 15,
      image: '/images/products/led-flush-mount.jpg'
    },
    {
      id: 4,
      name: 'Industrial Pendant Light',
      price: 420,
      category: 'Pendant Lights',
      availability: 'In Stock',
      description: 'Modern industrial-style pendant light',
      rating: 4.5,
      reviewCount: 10,
      image: '/images/products/industrial-pendant.jpg'
    },
    {
      id: 5,
      name: 'Smart Ceiling Light with Fan',
      price: 1250,
      category: 'Office Lights',
      availability: 'In Stock',
      description: 'Smart ceiling fan with integrated LED lighting',
      rating: 4.9,
      reviewCount: 20,
      image: '/images/products/smart-ceiling-fan-light.jpg'
    },
    {
      id: 6,
      name: 'Luxury Wall Sconce',
      price: 485,
      category: 'Mirror Light',
      availability: 'In Stock',
      description: 'Premium wall sconce with fabric shade',
      rating: 4.4,
      reviewCount: 6,
      image: '/images/products/luxury-wall-sconce.jpg'
    },
    {
      id: 7,
      name: 'Magnetic LED Panel',
      price: 320,
      category: 'Magnetic Light',
      availability: 'In Stock',
      description: 'Easy-to-install magnetic LED panel',
      rating: 4.6,
      reviewCount: 14,
      image: '/images/products/led-flush-mount.jpg'
    },
    {
      id: 8,
      name: 'LED Tube Light',
      price: 85,
      category: 'LED Tube',
      availability: 'In Stock',
      description: 'Energy-efficient LED tube replacement',
      rating: 4.3,
      reviewCount: 25,
      image: '/images/products/led-flush-mount.jpg'
    },
    {
      id: 9,
      name: 'Warehouse LED High Bay',
      price: 650,
      category: 'Warehouse Light',
      availability: 'In Stock',
      description: 'High-output LED light for warehouses',
      rating: 4.8,
      reviewCount: 18,
      image: '/images/products/led-flush-mount.jpg'
    },
    {
      id: 10,
      name: 'RGB LED Strip Kit',
      price: 180,
      category: 'LED Strip',
      availability: 'In Stock',
      description: 'Color-changing LED strip with controller',
      rating: 4.7,
      reviewCount: 22,
      image: '/images/products/led-flush-mount.jpg'
    },
    {
      id: 11,
      name: 'Aluminum Profile Kit',
      price: 95,
      category: 'Aluminum Profile',
      availability: 'In Stock',
      description: 'Professional aluminum profile for LED strips',
      rating: 4.5,
      reviewCount: 12,
      image: '/images/products/industrial-pendant.jpg'
    },
    {
      id: 12,
      name: 'LED Track Light Kit',
      price: 280,
      category: 'LED Track Lights',
      availability: 'In Stock',
      description: 'Adjustable track lighting system',
      rating: 4.6,
      reviewCount: 16,
      image: '/images/products/led-flush-mount.jpg'
    }
  ];

  // Filter products based on selected criteria
  const filteredProducts = groundProducts.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const availabilityMatch = availability === 'all' || product.availability === availability;
    
    let priceMatch = true;
    if (priceRange === '0-500') {
      priceMatch = product.price <= 500;
    } else if (priceRange === '500-1000') {
      priceMatch = product.price > 500 && product.price <= 1000;
    } else if (priceRange === '1000+') {
      priceMatch = product.price > 1000;
    }
    
    return categoryMatch && priceMatch && availabilityMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
      default:
        return b.id - a.id;
    }
  });

  const categories = ['all', 'Hanging Lights', 'Spotlight', 'Pendant Lights', 'Magnetic Light', 'LED Tube', 'Office Lights', 'Warehouse Light', 'LED Strip', 'Aluminum Profile', 'Mirror Light', 'LED Track Lights'];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          {t('categoryPages.groundTitle')}
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '3rem' }}>
          {t('categoryPages.groundSubtitle')}
        </p>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('search.filters.category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? t('search.options.allCategories') : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('search.filters.priceRange')}</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">{t('search.options.allPrices')}</option>
              <option value="0-500">{t('search.options.underRm500')}</option>
              <option value="500-1000">{t('search.options.rm500to1000')}</option>
              <option value="1000+">{t('search.options.overRm1000')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('search.filters.availability')}</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              <option value="all">{t('search.options.allAvailability')}</option>
              <option value="In Stock">{t('search.options.inStock')}</option>
              <option value="Out of Stock">{t('search.options.outOfStock')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{t('search.filters.sortBy')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              <option value="newest">{t('search.options.newest')}</option>
              <option value="price-low">{t('search.options.priceLow')}</option>
              <option value="price-high">{t('search.options.priceHigh')}</option>
              <option value="rating">{t('categoryPages.sortHighestRated')}</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
          {t('categoryPages.resultsPrefix')} {filteredProducts.length} {t('categoryPages.resultsOf')}{' '}
          {groundProducts.length} {t('categoryPages.resultsSuffix')}
        </p>

        {/* Products Grid */}
        <div className="product-grid">
          {sortedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div style={{
                height: '200px',
                position: 'relative',
                borderRadius: '8px',
                marginBottom: '1rem',
                overflow: 'hidden'
              }}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
              <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                {product.category}
              </p>
              <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: '#f59e0b' }}>★</span>
                <span style={{ marginLeft: '0.25rem' }}>{product.rating}</span>
                <span style={{ color: '#6b7280', marginLeft: '0.25rem' }}>
                  ({product.reviewCount} {product.reviewCount === 1 ? t('common.reviewSingular') : t('common.reviewPlural')})
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  RM {product.price.toLocaleString()}
                </span>
                <span style={{
                  color: product.availability === 'In Stock' ? '#059669' : '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {product.availability}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>{t('categoryPages.noProductsTitle')}</h3>
            <p>{t('categoryPages.noProductsSubtitle')}</p>
          </div>
        )}
      </div>
    </div>
  );
} 
