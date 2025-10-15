import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct, getProductById } from '@/lib/firestore';
import { Product } from '@/types/product';

// GET - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return NextResponse.json({ error: 'Failed to get product' }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    console.log('API: Updating product in Firestore:', id);
    console.log('API: Update data:', updateData);
    
    const updatedProduct = await updateProduct(id, updateData);
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    console.log('API: Product updated successfully in Firestore');
    return NextResponse.json(updatedProduct);
    
  } catch (error) {
    console.error('API: Error updating product in Firestore:', error);
    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('API: Deleting product from Firestore:', id);
    
    // Delete product from Firestore (no need to delete Cloudinary images - they can stay)
    const result = await deleteProduct(id);
    
    console.log('API: Product deleted successfully from Firestore');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API: Error deleting product from Firestore:', error);
    return NextResponse.json({ 
      error: 'Failed to delete product',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
