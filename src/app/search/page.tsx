'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductImagePath } from '@/lib/utils';
import { fetchProducts } from '@/lib/productService';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(true);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        console.log('Search: Loading products...');
        const fetchedProducts = await fetchProducts();
        console.log('Search: Products loaded:', fetchedProducts.length);
        console.log('Search: Sample products:', fetchedProducts.slice(0, 3));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Filter products based on search query and filters
  useEffect(() => {
    if (!query.trim()) {
      setFilteredProducts([]);
      return;
    }

    console.log('Search: Processing query:', query);
    console.log('Search: Total products loaded:', products.length);
    console.log('Search: Sample products:', products.slice(0, 3));

    const searchResults = products.filter(product => {
      const searchTerm = query.toLowerCase().trim();
      
      // Ensure all product fields exist before searching
      const productName = (product.name || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      const productSubcategory = (product.subcategory || '').toLowerCase();
      const productDescription = (product.description || '').toLowerCase();
      const productLightType = (product.lightType || '').toLowerCase();
      
      // Split search terms for more flexible matching
      const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
      
      // Check if any search term matches any product field
      const isMatch = searchTerms.some(term => {
        const nameMatch = productName.includes(term);
        const categoryMatch = productCategory.includes(term);
        const subcategoryMatch = productSubcategory.includes(term);
        const descriptionMatch = productDescription.includes(term);
        const lightTypeMatch = productLightType.includes(term);
        
        return nameMatch || categoryMatch || subcategoryMatch || 
               descriptionMatch || lightTypeMatch;
      });
      
      if (isMatch) {
        console.log('Search: Found match:', product.name, 'for query:', query);
      }
      
      return isMatch;
    });

    console.log('Search: Found', searchResults.length, 'matching products');

    // Apply additional filters
    let filtered = searchResults;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    if (availability !== 'all') {
      filtered = filtered.filter(product => product.availability === availability);
    }
    
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        switch (priceRange) {
          case '0-500':
            return price <= 500;
          case '500-1000':
            return price > 500 && price <= 1000;
          case '1000+':
            return price > 1000;
          default:
            return true;
        }
      });
    }

    // Sort results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (b.id || 0) - (a.id || 0);
        case 'relevance':
        default:
          // Prioritize exact name matches, then category matches
          const aNameExact = (a.name || '').toLowerCase() === query.toLowerCase();
          const bNameExact = (b.name || '').toLowerCase() === query.toLowerCase();
          if (aNameExact && !bNameExact) return -1;
          if (!aNameExact && bNameExact) return 1;
          return (b.rating || 0) - (a.rating || 0); // Fallback to rating
      }
    });

    console.log('Search: Final filtered results:', sorted.length);
    setFilteredProducts(sorted);
  }, [query, products, selectedCategory, priceRange, availability, sortBy]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Search Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Search Results
          </h1>
          {query && (
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Showing results for "{query}"
            </p>
          )}
          <p style={{ color: '#6b7280' }}>
            Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          {/* Debug info - remove this after fixing */}
          {process.env.NODE_ENV === 'development' && (
            <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Debug: {products.length} total products loaded
            </p>
          )}
        </div>

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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Category</label>
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
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Price Range</label>
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
              <option value="all">All Prices</option>
              <option value="0-500">Under RM 500</option>
              <option value="500-1000">RM 500 - 1000</option>
              <option value="1000+">Over RM 1000</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Availability</label>
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
              <option value="all">All Availability</option>
              <option value="In Stock">In Stock</option>
              <option value="Limited Stock">Limited Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Sort By</label>
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
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedCategory !== 'all' || priceRange !== 'all' || availability !== 'all') && (
          <div style={{ marginBottom: '2rem' }}>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setPriceRange('all');
                setAvailability('all');
              }}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div>
            {loading ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 0',
                color: '#6b7280'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>Loading products...</h3>
                <p>Please wait while we search for your products</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map((product) => (
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
                      <p style={{ color: '#6b7280', margin: '0 0 1rem 0', fontSize: '0.9rem' }}>
                        {product.description.substring(0, 100)}...
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
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 0',
                color: '#6b7280'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>No products found</h3>
                <p>Try adjusting your search terms or filters</p>
                <Link 
                  href="/"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold'
                  }}
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        )}

        {/* No Search Query */}
        {!query && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 0',
            color: '#6b7280'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Search for products</h3>
            <p>Enter a search term to find lighting products</p>
          </div>
        )}
      </div>
    </div>
  );
} 
