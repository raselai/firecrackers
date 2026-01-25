'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/i18n/I18nProvider';
import { useUser } from '@/contexts/AuthContext';

export default function AerialEffects() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { t } = useI18n();
  const { firebaseUser } = useUser();

  const aerialProducts = [
    {
      id: 1,
      name: 'Solar Garden Path Lights',
      price: 280,
      category: 'Garden Light',
      availability: 'In Stock',
      description: 'Set of 6 solar-powered garden path lights',
      rating: 4.7,
      reviewCount: 32,
      image: '/images/products/solar-garden-lights.jpg'
    },
    {
      id: 2,
      name: 'LED Security Flood Light',
      price: 425,
      category: 'Floodlight',
      availability: 'In Stock',
      description: 'High-power LED flood light with motion sensor',
      rating: 4.8,
      reviewCount: 28,
      image: '/images/products/led-flood-light.jpg'
    },
    {
      id: 3,
      name: 'Outdoor Wall Lantern',
      price: 315,
      category: 'Wall',
      availability: 'In Stock',
      description: 'Traditional outdoor wall lantern',
      rating: 4.6,
      reviewCount: 15,
      image: '/images/products/outdoor-wall-lantern.jpg'
    },
    {
      id: 4,
      name: 'LED Street Lamp Post',
      price: 1850,
      category: 'Stand',
      availability: 'In Stock',
      description: 'Commercial-grade LED street lamp',
      rating: 4.9,
      reviewCount: 42,
      image: '/images/products/led-street-lamp.jpg'
    },
    {
      id: 5,
      name: 'Solar Security Light',
      price: 195,
      category: 'Solar Light',
      availability: 'In Stock',
      description: 'Solar-powered security light with motion sensor',
      rating: 4.5,
      reviewCount: 18,
      image: '/images/products/solar-garden-lights.jpg'
    },
    {
      id: 6,
      name: 'Garden Spot Light',
      price: 145,
      category: 'Garden Light',
      availability: 'In Stock',
      description: 'LED garden spotlight for landscape lighting',
      rating: 4.4,
      reviewCount: 12,
      image: '/images/products/solar-garden-lights.jpg'
    },
    {
      id: 7,
      name: 'Outdoor Wall Sconce',
      price: 265,
      category: 'Wall',
      availability: 'In Stock',
      description: 'Weather-resistant outdoor wall light',
      rating: 4.6,
      reviewCount: 20,
      image: '/images/products/outdoor-wall-lantern.jpg'
    },
    {
      id: 8,
      name: 'Commercial Flood Light',
      price: 650,
      category: 'Floodlight',
      availability: 'In Stock',
      description: 'High-intensity commercial flood light',
      rating: 4.8,
      reviewCount: 35,
      image: '/images/products/led-flood-light.jpg'
    },
    {
      id: 9,
      name: 'Solar Garden Decorative Light',
      price: 120,
      category: 'Solar Light',
      availability: 'In Stock',
      description: 'Decorative solar garden light set',
      rating: 4.3,
      reviewCount: 8,
      image: '/images/products/solar-garden-lights.jpg'
    },
    {
      id: 10,
      name: 'LED Parking Lot Light',
      price: 1250,
      category: 'Stand',
      availability: 'In Stock',
      description: 'High-output LED parking lot lighting',
      rating: 4.9,
      reviewCount: 25,
      image: '/images/products/led-street-lamp.jpg'
    },
    {
      id: 11,
      name: 'Outdoor Step Light',
      price: 85,
      category: 'Wall',
      availability: 'In Stock',
      description: 'LED step light for outdoor stairs',
      rating: 4.5,
      reviewCount: 14,
      image: '/images/products/outdoor-wall-lantern.jpg'
    },
    {
      id: 12,
      name: 'Solar Motion Sensor Light',
      price: 180,
      category: 'Solar Light',
      availability: 'In Stock',
      description: 'Solar-powered motion sensor security light',
      rating: 4.7,
      reviewCount: 22,
      image: '/images/products/solar-garden-lights.jpg'
    }
  ];

  // Filter products based on selected criteria
  const filteredProducts = aerialProducts.filter(product => {
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

  const categories = ['all', 'Wall', 'Stand', 'Garden Light', 'Floodlight', 'Solar Light'];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          {t('categoryPages.aerialTitle')}
        </h1>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '3rem' }}>
          {t('categoryPages.aerialSubtitle')}
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
          {aerialProducts.length} {t('categoryPages.resultsSuffix')}
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
                  {firebaseUser ? `RM ${(product.price || 0).toLocaleString()}` : t('common.loginToSeePrice')}
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
