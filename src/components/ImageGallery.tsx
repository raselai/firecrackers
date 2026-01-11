'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getProductImagePath } from '@/lib/utils';

interface ImageGalleryProps {
  product: any;
  className?: string;
}

export default function ImageGallery({ product, className = '' }: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'mpeg', 'mpg'];

  // Get all available images for the product
  const getAllImages = () => {
    const images = [];
    
    // Add main image if available
    if (product.image) {
      images.push(product.image);
    }
    
    // Add mainImage if available
    if (product.mainImage) {
      images.push(product.mainImage);
    }
    
    // Add images array
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    
    // Add galleryImages if available
    if (product.galleryImages && product.galleryImages.length > 0) {
      images.push(...product.galleryImages);
    }
    
    // Remove duplicates and filter out empty strings
    const uniqueImages = [...new Set(images)].filter(img => img && img.trim() !== '');
    
    // If no images found, use fallback
    if (uniqueImages.length === 0) {
      return [getProductImagePath(product, product.category)];
    }
    
    return uniqueImages;
  };

  const images = getAllImages();
  const currentImage = images[currentImageIndex];

  const isVideoUrl = (url: string) => {
    if (url.startsWith('data:video/')) return true;
    const cleanUrl = url.split('?')[0].toLowerCase();
    return videoExtensions.some((ext) => cleanUrl.endsWith(`.${ext}`));
  };

  const isVideoCurrent = isVideoUrl(currentImage);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className={`image-gallery ${className}`}>
      {/* Main Image Display */}
      <div style={{ position: 'relative' }}>
        <div 
          style={{
            width: '100%',
            height: '400px',
            position: 'relative',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            overflow: 'hidden',
            cursor: isVideoCurrent ? 'default' : isZoomed ? 'zoom-out' : 'zoom-in'
          }}
          onClick={isVideoCurrent ? undefined : toggleZoom}
        >
          {isVideoCurrent ? (
            <video
              src={currentImage}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : currentImage.startsWith('data:') ? (
            <img
              src={currentImage}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
            />
          ) : (
            <Image
              src={currentImage}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              priority={currentImageIndex === 0}
            />
          )}
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  zIndex: 10
                }}
                aria-label="Previous image"
              >
                ‹
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  zIndex: 10
                }}
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}
          
          {/* Image Counter */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 10
            }}>
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Zoom Indicator */}
        {!isVideoCurrent && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 10
          }}>
            {isZoomed ? 'Click to zoom out' : 'Click to zoom'}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          padding: '0.5rem 0'
        }}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              style={{
                flex: '0 0 80px',
                height: '60px',
                position: 'relative',
                border: index === currentImageIndex ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'none',
                padding: 0
              }}
            >
              {isVideoUrl(image) ? (
                <video
                  src={image}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : image.startsWith('data:') ? (
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
              ) : (
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      {isZoomed && !isVideoCurrent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out'
          }}
          onClick={toggleZoom}
        >
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}>
            {currentImage.startsWith('data:') ? (
              <img
                src={currentImage}
                alt={`${product.name} - Zoomed view`}
                style={{ 
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            ) : (
              <Image
                src={currentImage}
                alt={`${product.name} - Zoomed view`}
                width={800}
                height={600}
                style={{ 
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            )}
            
            {/* Close button */}
            <button
              onClick={toggleZoom}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
              aria-label="Close zoom"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
