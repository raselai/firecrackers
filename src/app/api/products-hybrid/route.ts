import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, addProduct, Product as FirestoreProduct } from '@/lib/firestore';
import { Product } from '@/types/product';

// GET - Fetch all products from Firestore
export async function GET() {
  try {
    console.log('API: Fetching products from Firestore (database only)');
    const products = await getAllProducts();
    console.log(`API: Found ${products.length} products in Firestore`);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error reading products from Firestore:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST - Add a new product to Firestore
export async function POST(request: NextRequest) {
  try {
    console.log('API: Adding new product to Firestore');
    const newProduct: Omit<Product, 'id'> = await request.json();
    console.log('API: Received product data:', newProduct);
    
    // Validate required fields
    if (!newProduct.name?.trim()) {
      return NextResponse.json({ 
        error: 'Product name is required' 
      }, { status: 400 });
    }
    
    if (!newProduct.category?.trim()) {
      return NextResponse.json({ 
        error: 'Category is required' 
      }, { status: 400 });
    }
    
    if (!newProduct.subcategory?.trim()) {
      return NextResponse.json({ 
        error: 'Subcategory is required' 
      }, { status: 400 });
    }
    
    // Convert to Firestore Product format
    const firestoreProduct: Omit<FirestoreProduct, 'id'> = {
      name: newProduct.name,
      nameZh: newProduct.nameZh || undefined,
      price: newProduct.price || 0,
      description: newProduct.description || '',
      descriptionZh: newProduct.descriptionZh || undefined,
      category: newProduct.category,
      subcategory: newProduct.subcategory,
      image: newProduct.image || newProduct.images?.[0] || '', // Cloudinary URL
      images: newProduct.images || [], // Main Cloudinary URLs array
      galleryImages: newProduct.galleryImages || [], // Additional gallery Cloudinary URLs
      effectType: newProduct.effectType || '',
      duration: newProduct.duration || '',
      noiseLevel: newProduct.noiseLevel || '',
      shotCount: newProduct.shotCount,
      safetyDistance: newProduct.safetyDistance || '',
      inStock: newProduct.inStock ?? true,
      featured: newProduct.isFeatured ?? false,
      seasonal: newProduct.isOnSale ?? false,
      isOnSale: newProduct.isOnSale || false
    };

    // Add offerPrice if provided
    if (newProduct.offerPrice && newProduct.offerPrice > 0) {
      (firestoreProduct as any).offerPrice = newProduct.offerPrice;
    }

    console.log('API: Saving product to Firestore:', firestoreProduct);
    console.log('API: Main images array:', firestoreProduct.images);
    console.log('API: Gallery images array:', firestoreProduct.galleryImages);
    
    // Add product to Firestore
    const addedProduct = await addProduct(firestoreProduct);
    console.log('API: Product added successfully to Firestore:', addedProduct);
    console.log('API: Added product images:', addedProduct.images);
    console.log('API: Added product galleryImages:', (addedProduct as any).galleryImages);
    
    return NextResponse.json(addedProduct, { status: 201 });
    
  } catch (error) {
    console.error('API: Error adding product to Firestore:', error);
    return NextResponse.json({ 
      error: 'Failed to add product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
