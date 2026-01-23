'use client';

import { useState } from 'react';
import ImageUpload from './ImageUpload';

interface AddProductFormProps {
  onClose: () => void;
  onSave: (product: any) => void;
}

export default function AddProductForm({ onClose, onSave }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    nameZh: '',
    price: '',
    offerPrice: '',
    description: '',
    descriptionZh: '',
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
    
    // Validate only required fields (4 mandatory fields)
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    // Price is now optional - only validate if provided
    if (formData.price && parseFloat(formData.price) <= 0) {
      alert('Price must be greater than 0 if provided');
      return;
    }
    
    // Validate offer price if on sale AND offer price is provided
    if (formData.isOnSale && formData.offerPrice && formData.offerPrice.trim() !== '') {
      if (parseFloat(formData.offerPrice) <= 0) {
        alert('Offer price must be greater than 0');
        return;
      }
      if (formData.price && parseFloat(formData.offerPrice) >= parseFloat(formData.price)) {
        alert('Offer price must be less than the original price');
        return;
      }
    }
    
    if (!formData.category) {
      alert('Category is required');
      return;
    }
    
    // Check if at least one image is provided
    const hasImage = formData.image || 
                    (formData.images && formData.images.length > 0) ||
                    (formData.galleryImages && formData.galleryImages.length > 0);
    
    if (!hasImage) {
      alert('At least one media file is required');
      return;
    }
    
    // Create product object WITHOUT id (API will generate it)
    const newProduct = {
      name: formData.name,
      nameZh: formData.nameZh || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      offerPrice: formData.isOnSale && formData.offerPrice ? parseFloat(formData.offerPrice) : undefined,
      description: formData.description || '',
      descriptionZh: formData.descriptionZh || undefined,
      category: formData.category,
      subcategory: formData.category,
      // Firecracker-specific fields
      effectType: formData.effectType || '',
      duration: formData.duration || '',
      noiseLevel: formData.noiseLevel || '',
      shotCount: formData.shotCount ? parseInt(formData.shotCount) : undefined,
      safetyDistance: formData.safetyDistance || '',
      availability: formData.availability || 'In Stock',
      isFeatured: formData.isFeatured || false,
      isOnSale: formData.isOnSale || false,
      rating: formData.rating ? parseFloat(formData.rating) : 4.5,
      reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : 0,
      images: formData.images.filter(img => img.trim() !== ''),
      galleryImages: formData.galleryImages.filter(img => img.trim() !== ''),
      image: formData.image || formData.images[0] || '',
      mainImage: formData.mainImage || formData.images[0] || '',
      imagePath: formData.image || formData.images[0] || ''
    };

    console.log('Submitting product:', newProduct);
    onSave(newProduct);
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
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '6rem 2rem 2rem'
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
          <h2 style={{ margin: 0, color: '#1f2937' }}>Add New Product</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
                Product Name (Chinese)
              </label>
              <input
                type="text"
                value={formData.nameZh}
                onChange={(e) => handleInputChange('nameZh', e.target.value)}
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
                Price (MYR)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Optional - Enter price in MYR"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
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

          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Product Description (Chinese)
            </label>
            <textarea
              value={formData.descriptionZh}
              onChange={(e) => handleInputChange('descriptionZh', e.target.value)}
              placeholder="Optional Chinese description..."
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
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
