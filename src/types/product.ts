export interface Product {
  id: string;
  name: string;
  productCode?: string; // Internal product code (admin only)
  nameZh?: string;
  price: number;
  offerPrice?: number; // Sale price when isOnSale is true
  images: string[];
  image?: string; // Single image for display
  mainImage?: string; // Primary product image
  galleryImages?: string[]; // Additional product images
  imagePath?: string; // Organized path like 'hanging-lights/crystal-chandelier-1.jpg'
  description?: string;
  descriptionZh?: string;
  category: string;
  subcategory: string;
  // Firecracker-specific fields
  effectType?: string; // E.g., "Sparkle", "Bang", "Aerial", "Fountain", "Crackle"
  duration?: string; // E.g., "30 seconds", "2 minutes"
  noiseLevel?: string; // E.g., "Low", "Medium", "High", "Silent"
  shotCount?: number; // Number of shots/bursts
  safetyDistance?: string; // E.g., "5 meters", "10 meters"
  availability?: 'In Stock' | 'Out of Stock' | 'Limited Stock';
  inStock: boolean; // Required for Firestore
  isFeatured?: boolean;
  isOnSale?: boolean;
  featured?: boolean; // For Firestore compatibility
  seasonal?: boolean; // For Firestore compatibility
  rating?: number;
  reviewCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
