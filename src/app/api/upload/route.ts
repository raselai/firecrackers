import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called - uploading to Cloudinary');
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const category = formData.get('category') as string;
    const subcategory = formData.get('subcategory') as string;
    
    console.log('Received data:', {
      filesCount: files.length,
      category,
      subcategory,
      fileNames: files.map(f => f.name)
    });

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!category || !subcategory) {
      return NextResponse.json({ error: 'Category and subcategory are required' }, { status: 400 });
    }

    // Filter valid image files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        console.log(`Skipping non-image file: ${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        console.log(`Skipping large file: ${file.name} (${file.size} bytes)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return NextResponse.json({ error: 'No valid image files provided' }, { status: 400 });
    }

    // Upload files to Cloudinary
    const cloudinaryURLs: string[] = [];
    
    for (const file of validFiles) {
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              public_id: `products/${category.toLowerCase().replace(/\s+/g, '-')}/${subcategory.toLowerCase().replace(/\s+/g, '-')}/${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}`,
              folder: 'lighting-products',
              context: {
                category: category,
                subcategory: subcategory,
                original_filename: file.name
              },
              resource_type: 'auto'
              // No transformations - images are pre-optimized to save credits
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        }) as any;
        
        cloudinaryURLs.push(result.secure_url);
        console.log(`Successfully uploaded ${file.name} to Cloudinary:`, result.secure_url);
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
      }
    }

    if (cloudinaryURLs.length === 0) {
      return NextResponse.json({ error: 'Failed to upload any files' }, { status: 500 });
    }
    
    console.log('Images uploaded to Cloudinary successfully:', cloudinaryURLs);

    return NextResponse.json({ 
      success: true, 
      uploadedPaths: cloudinaryURLs,
      message: `Successfully uploaded ${cloudinaryURLs.length} files to Cloudinary`
    });

  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 