import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Uploading image to Cloudinary');
    
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
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: `products/${productName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          folder: 'lighting-products',
          context: {
            product_name: productName,
            category: category || '',
            subcategory: subcategory || ''
          },
          resource_type: 'auto'
          // No transformations - images are pre-optimized to save credits
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    
    console.log('API: Image uploaded successfully:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('API: Error uploading image:', error);
    return NextResponse.json({ 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
