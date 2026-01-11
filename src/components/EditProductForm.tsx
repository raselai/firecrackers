'use client';

import { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';

interface EditProductFormProps {
  product: any;
  onClose: () => void;
  onSave: (product: any) => void;
}

export default function EditProductForm({ product, onClose, onSave }: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    offerPrice: '',
    description: '',
    category: '',
    subcategory: '',
    // Firecracker-specific fields
    effectType: '',
    duration: '',
    noiseLevel: '',
    shotCount: '',
    safetyDistance: '',
    availability: 'In Stock',
    isFeatured: false,
    isOnSale: false,
    rating: '4.5',
    reviewCount: '0',
    images: [] as string[],
    galleryImages: [] as string[],
    image: '',
    mainImage: '',
    imagePath: ''
  });

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        offerPrice: product.offerPrice?.toString() || '',
        description: product.description || '',
        category: product.category || '',
        subcategory: product.subcategory || product.category || '',
        // Firecracker-specific fields
        effectType: product.effectType || '',
        duration: product.duration || '',
        noiseLevel: product.noiseLevel || '',
        shotCount: product.shotCount?.toString() || '',
        safetyDistance: product.safetyDistance || '',
        availability: product.availability || 'In Stock',
        isFeatured: product.isFeatured || false,
        isOnSale: product.isOnSale || false,
        rating: product.rating?.toString() || '4.5',
        reviewCount: product.reviewCount?.toString() || '0',
        images: product.images || [],
        galleryImages: product.galleryImages || [],
        image: product.image || '',
        mainImage: product.mainImage || '',
        imagePath: product.imagePath || ''
      });
    }
  }, [product]);

  const categories = [
    'Red crackers series',
    'Kids series',
    'Handle series',
    'Fountain series',
    '4inch firework series',
    '6inch firework series',
    '7inch firework series',
    '8inch firework series',
    '10inch firework series',
    '11inch firework series',
    '12inch firework series',
    'Big hole firework series',
    'Gift basket'
  ];

  const availabilityOptions = ['In Stock', 'Out of Stock', 'Limited Stock'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImagesUploaded = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: images,
      image: images[0] || '',
      mainImage: images[0] || '',
      imagePath: images[0] || ''
    }));
  };

  const handleGalleryImagesUploaded = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: images
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('EditProductForm: Form data before processing:', formData);
    console.log('EditProductForm: Original product images:', product.images);
    console.log('EditProductForm: Original product galleryImages:', product.galleryImages);
    
    const updatedProduct = {
      ...product, // Keep original ID and other fields
      ...formData,
      price: parseFloat(formData.price),
      offerPrice: formData.isOnSale && formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
      shotCount: formData.shotCount ? parseInt(formData.shotCount) : undefined,
      rating: parseFloat(formData.rating),
      reviewCount: parseInt(formData.reviewCount),
      subcategory: formData.category,
      images: formData.images.filter(img => img.trim() !== ''),
      galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
      image: formData.image || formData.images[0] || '',
      mainImage: formData.mainImage || formData.images[0] || ''
    };

    console.log('EditProductForm: Updated product images:', updatedProduct.images);
    console.log('EditProductForm: Updated product galleryImages:', updatedProduct.galleryImages);
    console.log('EditProductForm: Final updated product:', updatedProduct);

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Edit Product: {product?.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Basic Information */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Price (MYR) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            {/* Offer Price - Only show when On Sale is checked */}
            {formData.isOnSale && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                  Offer Price (MYR) (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.offerPrice}
                  onChange={(e) => handleInputChange('offerPrice', e.target.value)}
                  placeholder="Enter sale price (optional - must be less than original price)"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #dc2626',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    backgroundColor: '#fef2f2'
                  }}
                />
                <small style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                  Must be less than the original price
                </small>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                  handleInputChange('subcategory', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Effect Type
              </label>
              <select
                value={formData.effectType}
                onChange={(e) => handleInputChange('effectType', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Effect Type</option>
                <option value="Sparkle">Sparkle</option>
                <option value="Bang">Bang</option>
                <option value="Aerial">Aerial</option>
                <option value="Fountain">Fountain</option>
                <option value="Crackle">Crackle</option>
                <option value="Whistle">Whistle</option>
                <option value="Mixed Effects">Mixed Effects</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 30 seconds, 2 minutes"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Noise Level
              </label>
              <select
                value={formData.noiseLevel}
                onChange={(e) => handleInputChange('noiseLevel', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Noise Level</option>
                <option value="Silent">Silent</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Shot Count
              </label>
              <input
                type="number"
                value={formData.shotCount}
                onChange={(e) => handleInputChange('shotCount', e.target.value)}
                placeholder="e.g., 25, 100"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Safety Distance
              </label>
              <input
                type="text"
                value={formData.safetyDistance}
                onChange={(e) => handleInputChange('safetyDistance', e.target.value)}
                placeholder="e.g., 5 meters, 10 meters"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Rating
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Review Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.reviewCount}
                onChange={(e) => handleInputChange('reviewCount', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          {/* Description - Full Width */}
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Product Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the product features, benefits, and specifications..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Image Upload - Full Width */}
          {formData.category && (
            <ImageUpload
              category={formData.category}
              subcategory={formData.category}
              onImagesUploaded={handleImagesUploaded}
              existingImages={formData.images}
            />
          )}

          {/* Gallery Images Upload */}
          {formData.category && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Gallery Images (Additional Images)
              </label>
              <ImageUpload
                category={formData.category}
                subcategory={formData.category}
                onImagesUploaded={handleGalleryImagesUploaded}
                existingImages={formData.galleryImages}
              />
            </div>
          )}

          {/* Checkboxes */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
              />
              Featured Product
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.isOnSale}
                onChange={(e) => {
                  handleInputChange('isOnSale', e.target.checked);
                  // Clear offer price when unchecking On Sale
                  if (!e.target.checked) {
                    handleInputChange('offerPrice', '');
                  }
                }}
              />
              On Sale
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
