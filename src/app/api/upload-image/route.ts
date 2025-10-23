import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, generateProductImagePath } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Uploading image to Firebase Storage');
    
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const productName = formData.get('productName') as string;
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No image file provided' 
      }, { status: 400 });
    }
    
    if (!productName) {
      return NextResponse.json({ 
        error: 'Product name is required' 
      }, { status: 400 });
    }
    
    // Generate path for Firebase Storage
    const fileName = `${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${file.name.split('.').pop()}`;
    const path = generateProductImagePath(category || 'Others', subcategory || 'General', fileName);
    
    // Upload to Firebase Storage
    const downloadURL = await uploadImage(file, path);
    
    console.log('API: Image uploaded successfully to Firebase Storage:', downloadURL);
    return NextResponse.json({ 
      secure_url: downloadURL,
      public_id: path,
      url: downloadURL
    });
    
  } catch (error) {
    console.error('API: Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
