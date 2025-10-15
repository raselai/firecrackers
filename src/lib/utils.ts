
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Image Management Utilities
export function getProductImagePath(product: any, category?: string): string {
  // Priority order for image sources
  
  // 1. Check for Cloudinary URLs first (new primary source)
  if (product.image && product.image.includes('cloudinary.com')) {
    return product.image;
  }
  
  // 2. Check for existing Firebase URLs (fallback during migration)
  if (product.image) {
    return product.image;
  }
  
  if (product.mainImage) {
    return product.mainImage;
  }
  
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  
  if (product.galleryImages && product.galleryImages.length > 0) {
    return product.galleryImages[0];
  }
  
  // 3. Check for local imagePath
  if (product.imagePath) {
    return `/images/products/${product.imagePath}`;
  }
  
  // 4. Use category images as fallback
  if (category) {
    const categorySlug = category.toLowerCase().replace(/ /g, '-');
    // Map common categories to existing images
    const categoryImageMap: { [key: string]: string } = {
      'others': '/images/categories/ceiling-lights.jpg',
      'hanging-lights': '/images/categories/hanging-light.jpg',
      'spotlight': '/images/categories/Spot-Lights.jpg',
      'pendant-lights': '/images/categories/pandent-light.jpg',
      'magnetic-light': '/images/categories/Megnetic-lights.jpg',
      'led-tube': '/images/categories/Led-tube.jpg',
      'office-lights': '/images/categories/Office-lights.jpg',
      'warehouse-light': '/images/categories/Warehouse-light.jpg',
      'led-strip': '/images/categories/Led-strip.jpg',
      'aluminum-profile': '/images/categories/aluminumProfile-Lights.jpg',
      'mirror-light': '/images/categories/Mirror-lights.jpg',
      'led-track-lights': '/images/categories/Led-track-lights.jpg',
      'wall': '/images/categories/Wall-lights.jpg',
      'stand': '/images/categories/Stand-lights.jpg',
      'garden-light': '/images/categories/garden-lights.jpeg',
      'floodlight': '/images/categories/flood-lights.jpg',
      'solar-light': '/images/categories/Solar-lights.jpg'
    };
    return categoryImageMap[categorySlug] || '/images/categories/ceiling-lights.jpg';
  }
  
  // Final fallback
  return '/images/categories/ceiling-lights.jpg';
}

export function getCategoryImagePath(category: string): string {
  const categorySlug = category.toLowerCase().replace(/ /g, '-');
  return `/images/categories/${categorySlug}-hero.jpg`;
}

export function organizeImagePath(category: string, productName: string, index: number = 1): string {
  const categorySlug = category.toLowerCase().replace(/ /g, '-');
  const productSlug = productName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
  return `${categorySlug}/${productSlug}-${index}.jpg`;
}
