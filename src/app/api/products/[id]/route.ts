import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct, getProductById } from '@/lib/firestore';
import { deleteImage } from '@/lib/storage';
import { Product } from '@/types/product';

export const revalidate = 300;

// GET - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const product = await getProductById(productId);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json({ error: 'Failed to get product' }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const updatedProduct: Partial<Product> = await request.json();
    
    // Update product in Firestore
    const result = await updateProduct(productId, updatedProduct);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    // Get the product first to delete associated images
    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Delete associated images from Firebase Storage
    try {
      if (product.image && product.image.startsWith('https://firebasestorage.googleapis.com/')) {
        // Extract path from Firebase Storage URL
        const urlParts = product.image.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'o') + 1;
        if (pathIndex < urlParts.length) {
          const imagePath = decodeURIComponent(urlParts[pathIndex].split('?')[0]);
          await deleteImage(imagePath);
        }
      }
      
      // Delete additional images if they exist
      if (product.images) {
        for (const imageUrl of product.images) {
          if (imageUrl.startsWith('https://firebasestorage.googleapis.com/')) {
            const urlParts = imageUrl.split('/');
            const pathIndex = urlParts.findIndex(part => part === 'o') + 1;
            if (pathIndex < urlParts.length) {
              const imagePath = decodeURIComponent(urlParts[pathIndex].split('?')[0]);
              await deleteImage(imagePath);
            }
          }
        }
      }
    } catch (imageError) {
      console.warn('Error deleting images:', imageError);
      // Continue with product deletion even if image deletion fails
    }
    
    // Delete product from Firestore
    const result = await deleteProduct(productId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
} 
